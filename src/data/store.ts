import { useSyncExternalStore } from 'react';
import { initAuth, onAuthChange } from '../firebase/authStore';
import { deleteCloud, publishShare, subscribeCloud, unpublishShare, writeCloud } from './cloud';
import { newId, readAll, removeOne, writeOne } from './storage';
import type { Character, CharacterPatch, CharacterRecord, SettingId } from './types';

/**
 * Герои на странице. Без входа живут в браузере, со входом — в аккаунте:
 * облако становится главным, а браузер хранит только героев без входа.
 */
type StoreMode = 'local' | 'cloud';
export type CharactersState = {
  ready: boolean;
  mode: StoreMode;
  uid: string | null;
  records: CharacterRecord[];
  notice: string | null;
};

let state: CharactersState = { ready: false, mode: 'local', uid: null, records: [], notice: null };
const listeners = new Set<() => void>();
let localRecords: CharacterRecord[] = [];
let localReady: Promise<void> | null = null;
let cloudUnsub: (() => void) | null = null;
let pendingUid: string | null = null;
let initialized = false;

function publish(next: CharactersState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function useCharacters(): CharactersState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function sortByNewest(records: CharacterRecord[]) {
  return [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function loadLocal(): Promise<void> {
  if (!localReady) {
    localReady = readAll().then((records) => {
      localRecords = records;
    });
  }
  return localReady;
}

function publishLocal(notice: string | null = null) {
  publish({ ready: true, mode: 'local', uid: null, records: sortByNewest(localRecords), notice });
}

function setNotice(notice: string | null) {
  if (notice === state.notice) return;
  publish({ ...state, notice });
}

/* --- отложенная запись в облако: правка на каждый ввод не должна бить по сети --- */

const pending = new Map<string, { uid: string; record: CharacterRecord; timer: number }>();

function scheduleCloudWrite(uid: string, record: CharacterRecord) {
  const previous = pending.get(record.id);
  if (previous) window.clearTimeout(previous.timer);
  const timer = window.setTimeout(() => {
    pending.delete(record.id);
    void writeCloud(uid, record)
      .then(() => (record.share ? publishShare(uid, record.share, record) : undefined))
      .catch(() => setNotice('Не удалось сохранить в облако. Попробуем ещё раз.'));
  }, 700);
  pending.set(record.id, { uid, record, timer });
}

function flushPending() {
  pending.forEach(({ uid, record, timer }) => {
    window.clearTimeout(timer);
    void writeCloud(uid, record)
      .then(() => (record.share ? publishShare(uid, record.share, record) : undefined))
      .catch(() => undefined);
  });
  pending.clear();
}

/* --- вход и выход --- */

async function transferLocalHeroes(uid: string) {
  await loadLocal();
  if (!localRecords.length) return;
  const failed: CharacterRecord[] = [];
  for (const record of localRecords) {
    try {
      await writeCloud(uid, record);
      await removeOne(record.id);
    } catch {
      failed.push(record);
    }
  }
  localRecords = failed;
  if (failed.length) {
    setNotice('Часть героев не удалось перенести в аккаунт — они остались в этом браузере.');
  }
}

async function switchUser(user: { uid: string } | null) {
  if (cloudUnsub) {
    cloudUnsub();
    cloudUnsub = null;
  }
  flushPending();

  if (!user) {
    await loadLocal();
    pendingUid = null;
    publishLocal();
    return;
  }

  const uid = user.uid;
  pendingUid = uid;
  /* Пока не пришёл первый снимок облака, список пуст — не показываем
     «Пока никого нет», а держим заставку загрузки. */
  publish({ ready: false, mode: 'cloud', uid, records: [], notice: null });
  await loadLocal();
  await transferLocalHeroes(uid);
  if (pendingUid !== uid) return;
  cloudUnsub = subscribeCloud(
    uid,
    (records) => {
      if (pendingUid !== uid) return;
      publish({ ready: true, mode: 'cloud', uid, records: sortByNewest(records), notice: null });
    },
    () => {
      if (pendingUid !== uid) return;
      publish({
        ...state,
        ready: true,
        notice: 'Облако пока не принимает героев: проверьте правила доступа в Firebase.',
      });
    },
  );
}

/** Однократная подготовка: браузер, вход, облако. */
export function initStore(): void {
  if (initialized) return;
  initialized = true;
  initAuth();
  /* Список показываем только после ответа Firebase о входе: иначе герои
     из браузера мелькнут перед облаком. Тишину до ответа занимает
     страница загрузки. */
  onAuthChange((user) => {
    void switchUser(user);
  });
  window.addEventListener('pagehide', flushPending);
}

export function findCharacter(id: string): CharacterRecord | undefined {
  return state.records.find((record) => record.id === id);
}

export async function createCharacter(
  setting: SettingId,
  sheet: Character,
): Promise<CharacterRecord> {
  const now = new Date().toISOString();
  const record: CharacterRecord = { id: newId(), setting, createdAt: now, updatedAt: now, sheet };

  if (state.mode === 'cloud' && state.uid) {
    const uid = state.uid;
    publish({ ...state, records: sortByNewest([record, ...state.records]) });
    try {
      await writeCloud(uid, record);
    } catch {
      setNotice('Не удалось сохранить героя в облако. Проверьте связь.');
    }
    return record;
  }

  localRecords = [record, ...localRecords];
  publishLocal();
  await writeOne(record);
  return record;
}

/** Правка листа: сразу на экране, затем в браузере или в облаке. */
export async function updateCharacter(id: string, patch: CharacterPatch): Promise<void> {
  const current = state.records.find((record) => record.id === id);
  if (!current) return;
  const record: CharacterRecord = {
    ...current,
    updatedAt: new Date().toISOString(),
    sheet: { ...current.sheet, ...patch },
  };
  publish({
    ...state,
    records: state.records.map((item) => (item.id === id ? record : item)),
  });

  if (state.mode === 'cloud' && state.uid) {
    scheduleCloudWrite(state.uid, record);
    return;
  }

  localRecords = localRecords.map((item) => (item.id === id ? record : item));
  await writeOne(record);
}

/** Публичная ссылка: только у героя в аккаунте. Возвращает код для #/s/<код>. */
export async function shareCharacter(id: string): Promise<string> {
  const current = state.records.find((record) => record.id === id);
  if (!current) throw new Error('Герой не найден');
  if (current.share) return current.share;
  if (state.mode !== 'cloud' || !state.uid) throw new Error('share-needs-auth');
  const uid = state.uid;
  const token = newShareToken();
  const record: CharacterRecord = { ...current, share: token, updatedAt: new Date().toISOString() };
  publish({ ...state, records: state.records.map((item) => (item.id === id ? record : item)) });
  try {
    await writeCloud(uid, record);
    await publishShare(uid, token, record);
  } catch (error) {
    publish({ ...state, records: state.records.map((item) => (item.id === id ? current : item)) });
    throw error;
  }
  return token;
}

/** Новая ссылка: старая копия удаляется, у героя появляется новый код. */
export async function reShareCharacter(id: string): Promise<string> {
  const current = state.records.find((record) => record.id === id);
  if (!current) throw new Error('Герой не найден');
  if (current.share) {
    try {
      await unpublishShare(current.share);
    } catch {
      /* старую ссылку уже могли отозвать */
    }
    const cleared: CharacterRecord = {
      id: current.id,
      setting: current.setting,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
      sheet: current.sheet,
    };
    publish({ ...state, records: state.records.map((item) => (item.id === id ? cleared : item)) });
    if (state.mode === 'cloud' && state.uid) {
      await writeCloud(state.uid, cleared).catch(() => undefined);
    }
  }
  return shareCharacter(id);
}

/** Отзыв: ссылка перестаёт открываться, публичная копия удаляется. */
export async function revokeShare(id: string): Promise<void> {
  const current = state.records.find((record) => record.id === id);
  if (!current?.share) return;
  const token = current.share;
  const next: CharacterRecord = {
    id: current.id,
    setting: current.setting,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
    sheet: current.sheet,
  };
  publish({ ...state, records: state.records.map((item) => (item.id === id ? next : item)) });
  try {
    await unpublishShare(token);
    if (state.mode === 'cloud' && state.uid) await writeCloud(state.uid, next);
  } catch {
    setNotice('Не удалось отозвать ссылку. Проверьте связь.');
  }
}

function newShareToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('');
}

export async function deleteCharacter(id: string): Promise<void> {
  const target = state.records.find((record) => record.id === id);
  const pendingWrite = pending.get(id);
  if (pendingWrite) {
    window.clearTimeout(pendingWrite.timer);
    pending.delete(id);
  }
  publish({ ...state, records: state.records.filter((record) => record.id !== id) });

  if (state.mode === 'cloud' && state.uid) {
    if (target?.share) {
      try {
        await unpublishShare(target.share);
      } catch {
        /* без сети публичная копия останется до следующего отзыва */
      }
    }
    try {
      await deleteCloud(state.uid, id);
    } catch {
      setNotice('Не удалось удалить героя из облака. Проверьте связь.');
    }
    return;
  }

  localRecords = localRecords.filter((record) => record.id !== id);
  await removeOne(id);
}
