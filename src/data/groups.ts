import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/app';
import { newId } from './storage';
import { heroDisplayName } from './characters';
import { newToken } from './token';
import type { Character, CharacterRecord, SettingId } from './types';

/**
 * Группы за столом. Человек может состоять в нескольких группах.
 * users/{uid} — указатель: список { id, name, heroId }.
 * groups/{id} — название, мастер, токен приглашения.
 * groups/{id}/members/{uid} — имя, герой и карточка-снимок для стола.
 * groupLinks/{token} — публичная ссылка-приглашение.
 */

export type GroupRef = { id: string; name: string; heroId: string | null };

export type Group = {
  id: string;
  name: string;
  masterId: string;
  inviteToken: string;
  createdAt: number;
};

type GroupCard = {
  name: string;
  setting: SettingId;
  concept: string;
  level: number;
};

export type GroupMember = {
  uid: string;
  playerName: string;
  heroId: string | null;
  card: GroupCard | null;
  /** Снимок листа для чтения за столом: без портрета, он лежит в portrait. */
  sheet: Character | null;
  setting: SettingId | null;
  portrait: string | null;
  joinedAt: number;
  /** Карточка «Мастер игры»: мастер за столом без листа героя. */
  gameMaster: boolean;
};

/** Блоки листа, к которым можно оставить заметку. */
export type BlockId = 'character' | 'aspects' | 'skills' | 'stunts' | 'stress' | 'extras';

/** Заметка на блок чужого листа: groups/{id}/notes/{noteId}. */
export type GroupNote = {
  id: string;
  heroId: string;
  blockId: BlockId;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};

export type GroupLink = { groupId: string; name: string; masterId: string };

export type GroupFeed = {
  status: 'loading' | 'ready';
  group: Group | null;
  members: GroupMember[];
};

/** Сколько групп может быть у одного аккаунта. */
export const MAX_GROUPS = 12;

type UserLike = { uid: string; displayName?: string | null; email?: string | null };

function database() {
  if (!db) throw new Error('Firebase не настроен');
  return db;
}

const pointerRef = (uid: string) => doc(database(), 'users', uid);
const groupRef = (id: string) => doc(database(), 'groups', id);
const membersCol = (id: string) => collection(database(), 'groups', id, 'members');
const memberRef = (groupId: string, uid: string) =>
  doc(database(), 'groups', groupId, 'members', uid);
const linkRef = (token: string) => doc(database(), 'groupLinks', token);

const TOKEN_RE = /^[A-Za-z0-9_-]{6,64}$/;

/** Имя за столом: из аккаунта, иначе — часть почты до «@». */
export function playerName(user: UserLike): string {
  const name = user.displayName?.trim();
  if (name) return name;
  const email = user.email ?? '';
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : 'Игрок';
}

/** Ссылка-приглашение: её копирует «Пригласить» и открывает JoinGroupScreen. */
export function inviteLink(token: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/g/${token}`;
}

/** Токен из вставленной ссылки: принимаем и голый код, и адрес с параметром. */
export function parseInviteToken(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  if (TOKEN_RE.test(text)) return text;
  try {
    const url = new URL(text.includes('://') ? text : `https://x/${text}`);
    const fromQuery = url.searchParams.get('invite') ?? url.searchParams.get('code');
    const hash = url.hash.match(/#\/g\/([^/?#]+)/)?.[1];
    const tail = url.pathname.split('/').filter(Boolean).pop();
    const token = hash ?? fromQuery ?? tail ?? '';
    return TOKEN_RE.test(token) ? token : null;
  } catch {
    return null;
  }
}

/* ---------- чтение ---------- */

function readRefs(data: unknown): GroupRef[] {
  const raw = (data as { groups?: unknown } | null)?.groups;
  if (!Array.isArray(raw)) return [];
  const refs: GroupRef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const value = item as { id?: unknown; name?: unknown; heroId?: unknown };
    if (typeof value.id !== 'string' || !value.id) continue;
    refs.push({
      id: value.id,
      name: typeof value.name === 'string' ? value.name : 'Группа',
      heroId: typeof value.heroId === 'string' ? value.heroId : null,
    });
  }
  return refs;
}

function memberFrom(uid: string, data: Record<string, unknown> | undefined): GroupMember {
  const card = data?.card as Record<string, unknown> | null | undefined;
  const validCard =
    card && typeof card.name === 'string'
      ? {
          name: card.name,
          setting: (card.setting === 'fate' ? 'fate' : 'witcher') as SettingId,
          concept: typeof card.concept === 'string' ? card.concept : '',
          level: typeof card.level === 'number' ? card.level : 1,
        }
      : null;
  const sheet = data?.sheet as Record<string, unknown> | null | undefined;
  const validSheet =
    sheet && typeof sheet === 'object' && Array.isArray(sheet.aspects)
      ? (sheet as unknown as Character)
      : null;
  return {
    uid,
    playerName: typeof data?.playerName === 'string' ? data.playerName : 'Игрок',
    heroId: typeof data?.heroId === 'string' ? data.heroId : null,
    card: validCard,
    sheet: validSheet,
    setting: data?.setting === 'fate' || data?.setting === 'witcher' ? data.setting : null,
    portrait: typeof data?.portrait === 'string' ? data.portrait : null,
    joinedAt: typeof data?.joinedAt === 'number' ? data.joinedAt : 0,
    gameMaster: data?.gameMaster === true,
  };
}

/** Старый указатель хранил одну группу: переносим её в список при чтении. */
async function migrateLegacy(uid: string, groupId: string, heroId: string | null): Promise<GroupRef[]> {
  let name = 'Группа';
  try {
    const snapshot = await getDoc(groupRef(groupId));
    if (snapshot.exists() && typeof snapshot.data().name === 'string') {
      name = snapshot.data().name;
    }
  } catch {
    /* без сети останется имя по умолчанию */
  }
  const refs: GroupRef[] = [{ id: groupId, name, heroId }];
  await writeRefs(uid, refs).catch(() => undefined);
  return refs;
}

/** Список моих групп: указатель users/{uid}. */
export function subscribeMyGroups(
  uid: string,
  next: (refs: GroupRef[]) => void,
  onError: () => void,
): () => void {
  return onSnapshot(
    pointerRef(uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        next([]);
        return;
      }
      const data = snapshot.data();
      if (Array.isArray(data.groups)) {
        next(readRefs(data));
        return;
      }
      const legacyId = typeof data.groupId === 'string' ? data.groupId : '';
      if (!legacyId) {
        next([]);
        return;
      }
      void migrateLegacy(
        uid,
        legacyId,
        typeof data.heroId === 'string' ? data.heroId : null,
      ).then(next);
    },
    () => onError(),
  );
}

/** Одна группа со столом; если группу закрыли — onGone. */
export function subscribeGroup(
  groupId: string,
  next: (feed: GroupFeed) => void,
  onGone: () => void,
): () => void {
  let group: Group | null = null;
  let members: GroupMember[] = [];
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    onGone();
  };
  const emit = () => {
    if (stopped || !group) return;
    next({
      status: 'ready',
      group,
      members: [...members].sort(
        (a, b) => Number(b.uid === group?.masterId) - Number(a.uid === group?.masterId),
      ),
    });
  };

  const unsubscribeGroup = onSnapshot(
    groupRef(groupId),
    (snapshot) => {
      if (stopped) return;
      if (!snapshot.exists()) {
        stop();
        return;
      }
      const data = snapshot.data();
      group = {
        id: groupId,
        name: typeof data.name === 'string' ? data.name : 'Группа',
        masterId: typeof data.masterId === 'string' ? data.masterId : '',
        inviteToken: typeof data.inviteToken === 'string' ? data.inviteToken : '',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
      };
      emit();
    },
    (error) => {
      if (error.code === 'permission-denied') stop();
    },
  );

  const unsubscribeMembers = onSnapshot(
    membersCol(groupId),
    (snapshot) => {
      if (stopped) return;
      members = snapshot.docs.map((item) => memberFrom(item.id, item.data()));
      emit();
    },
    (error) => {
      if (error.code === 'permission-denied') stop();
    },
  );

  return () => {
    stopped = true;
    unsubscribeGroup();
    unsubscribeMembers();
  };
}

/** Публичная ссылка-приглашение: id, имя и мастер. */
export async function readGroupLink(token: string): Promise<GroupLink | null> {
  try {
    const snapshot = await getDoc(linkRef(token));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    if (typeof data.groupId !== 'string' || !data.groupId) return null;
    return {
      groupId: data.groupId,
      name: typeof data.name === 'string' ? data.name : 'Группа',
      masterId: typeof data.masterId === 'string' ? data.masterId : '',
    };
  } catch {
    return null;
  }
}

/* ---------- запись ---------- */

async function myRefs(uid: string): Promise<GroupRef[]> {
  const snapshot = await getDoc(pointerRef(uid));
  return snapshot.exists() ? readRefs(snapshot.data()) : [];
}

function writeRefs(uid: string, refs: GroupRef[]) {
  return setDoc(pointerRef(uid), { uid, groups: refs }, { merge: true });
}

/** Новая группа; мастер сразу садится за стол без героя. */
export async function createGroup(user: UserLike, name: string): Promise<string> {
  const refs = await myRefs(user.uid);
  if (refs.length >= MAX_GROUPS) throw new Error('GROUP_LIMIT');

  const groupId = newId();
  const token = newToken();
  const createdAt = Date.now();
  const batch = writeBatch(database());
  batch.set(groupRef(groupId), { name, masterId: user.uid, inviteToken: token, createdAt });
  batch.set(linkRef(token), { groupId, name, masterId: user.uid, createdAt });
  batch.set(memberRef(groupId, user.uid), {
    uid: user.uid,
    playerName: playerName(user),
    heroId: null,
    card: null,
    portrait: null,
    gameMaster: false,
    joinedAt: createdAt,
  });
  batch.set(
    pointerRef(user.uid),
    { uid: user.uid, groups: [...refs, { id: groupId, name, heroId: null }] },
    { merge: true },
  );
  await batch.commit();
  return groupId;
}

/** Вступить в чужую группу по ссылке. */
export async function joinGroup(user: UserLike, link: GroupLink): Promise<void> {
  const refs = await myRefs(user.uid);
  if (refs.some((item) => item.id === link.groupId)) return;
  if (refs.length >= MAX_GROUPS) throw new Error('GROUP_LIMIT');

  const batch = writeBatch(database());
  batch.set(memberRef(link.groupId, user.uid), {
    uid: user.uid,
    playerName: playerName(user),
    heroId: null,
    card: null,
    portrait: null,
    gameMaster: false,
    joinedAt: Date.now(),
  });
  batch.set(
    pointerRef(user.uid),
    { uid: user.uid, groups: [...refs, { id: link.groupId, name: link.name, heroId: null }] },
    { merge: true },
  );
  await batch.commit();
}

/** Покинуть группу: место за столом и запись в указателе. */
export async function leaveGroup(uid: string, groupId: string): Promise<void> {
  const refs = await myRefs(uid);
  const batch = writeBatch(database());
  batch.delete(memberRef(groupId, uid));
  batch.set(
    pointerRef(uid),
    { uid, groups: refs.filter((item) => item.id !== groupId) },
    { merge: true },
  );
  await batch.commit();
}

/** Мастер убирает игрока; его клиент сам выкинет группу из указателя. */
export async function removeMember(groupId: string, memberUid: string): Promise<void> {
  await deleteDoc(memberRef(groupId, memberUid));
}

/** Забыть группу в своём указателе (закрыли или убрали). */
export async function forgetGroup(uid: string, groupId: string): Promise<void> {
  try {
    const refs = await myRefs(uid);
    await writeRefs(uid, refs.filter((item) => item.id !== groupId));
  } catch {
    /* без сети указатель догонит в следующий раз */
  }
}

/** Мастер закрывает группу: стол, места, приглашение, своя запись. */
export async function closeGroup(group: Group): Promise<void> {
  const snapshot = await getDocs(membersCol(group.id));
  const notes = await getDocs(notesCol(group.id)).catch(() => null);
  const masterSnap = await getDoc(pointerRef(group.masterId)).catch(() => null);
  const refs = masterSnap?.exists() ? readRefs(masterSnap.data()) : [];
  const batch = writeBatch(database());
  snapshot.docs.forEach((item) => batch.delete(item.ref));
  notes?.docs.forEach((item) => batch.delete(item.ref));
  batch.delete(groupRef(group.id));
  if (group.inviteToken) batch.delete(linkRef(group.inviteToken));
  if (masterSnap?.exists()) {
    batch.set(
      pointerRef(group.masterId),
      { uid: group.masterId, groups: refs.filter((item) => item.id !== group.id) },
      { merge: true },
    );
  }
  await batch.commit();
}

/** Привязать или сменить своего героя; «Мастер игры» — карточка без листа. */
export async function setMyHero(
  uid: string,
  groupId: string,
  record: CharacterRecord | null,
  gameMaster = false,
): Promise<void> {
  const portrait = record ? await makePortraitThumb(record.sheet.portrait) : null;
  const snapshot = await getDoc(pointerRef(uid)).catch(() => null);
  const refs = snapshot?.exists() ? readRefs(snapshot.data()) : [];
  const batch = writeBatch(database());
  batch.set(
    memberRef(groupId, uid),
    {
      heroId: record?.id ?? null,
      card: record ? cardFrom(record) : null,
      sheet: record ? { ...record.sheet, portrait: '' } : null,
      setting: record?.setting ?? null,
      portrait,
      gameMaster: !record && gameMaster,
    },
    { merge: true },
  );
  if (snapshot?.exists()) {
    batch.set(
      pointerRef(uid),
      {
        uid,
        groups: refs.map((item) =>
          item.id === groupId ? { ...item, heroId: record?.id ?? null } : item,
        ),
      },
      { merge: true },
    );
  }
  await batch.commit();
}

/* Карточка за столом подтягивается, пока лист правят: в облако пишется
   только текст, портрет — при привязке героя. */
export async function syncGroupCard(uid: string, record: CharacterRecord): Promise<void> {
  try {
    const refs = await myRefs(uid);
    const attached = refs.filter((item) => item.heroId === record.id);
    if (!attached.length) return;
    const batch = writeBatch(database());
    attached.forEach((item) =>
      batch.update(memberRef(item.id, uid), {
        card: cardFrom(record),
        sheet: { ...record.sheet, portrait: '' },
        setting: record.setting,
      }),
    );
    await batch.commit();
  } catch {
    /* без сети карточка догонит в следующий раз */
  }
}

/** Удалённого героя отвязываем от всех групп, где он стоял за столом. */
export async function clearAttachedHero(uid: string, heroId: string): Promise<void> {
  try {
    const refs = await myRefs(uid);
    for (const item of refs.filter((ref) => ref.heroId === heroId)) {
      await setMyHero(uid, item.id, null);
    }
  } catch {
    /* без сети отвяжется при следующем сохранении */
  }
}

/** Карточка для стола: миниатюра портрета, чтобы чужие листы не читать целиком. */
async function makePortraitThumb(portrait: string): Promise<string | null> {
  if (!portrait || typeof document === 'undefined') return null;
  try {
    const image = new Image();
    image.src = portrait;
    await image.decode();
    const width = 192;
    const height = 236;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(
      image,
      (image.naturalWidth - sourceWidth) / 2,
      (image.naturalHeight - sourceHeight) / 2,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height,
    );
    const url = canvas.toDataURL('image/jpeg', 0.82);
    return url.length <= 60000 ? url : null;
  } catch {
    return null;
  }
}

function cardFrom(record: CharacterRecord): GroupCard {
  return {
    name: heroDisplayName(record.sheet.name),
    setting: record.setting,
    concept: record.sheet.aspects[0]?.text ?? '',
    level: record.sheet.level,
  };
}

/* ── Заметки на блоки ──────────────────────────────────────────── */

const notesCol = (groupId: string) => collection(database(), 'groups', groupId, 'notes');

/** Заметки к листу героя: подписка на всю коллекцию, фильтр по heroId. */
export function subscribeNotes(
  groupId: string,
  heroId: string,
  next: (notes: GroupNote[]) => void,
  onError?: (error: unknown) => void,
) {
  try {
    const request = query(notesCol(groupId), where('heroId', '==', heroId));
    return onSnapshot(
      request,
      (snap) => {
        next(
          snap.docs.map((item) => {
            const v = item.data();
            return {
              id: item.id,
              heroId: String(v.heroId ?? ''),
              blockId: v.blockId as BlockId,
              authorId: String(v.authorId ?? ''),
              authorName: String(v.authorName ?? 'Игрок'),
              text: String(v.text ?? ''),
              createdAt: Number(v.createdAt ?? 0),
              updatedAt: Number(v.updatedAt ?? 0),
            };
          }),
        );
      },
      (error) => onError?.(error),
    );
  } catch {
    return () => {};
  }
}

export async function addNote(
  groupId: string,
  note: Omit<GroupNote, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = doc(notesCol(groupId));
  const now = Date.now();
  await setDoc(ref, { ...note, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateNote(groupId: string, noteId: string, text: string): Promise<void> {
  await updateDoc(doc(notesCol(groupId), noteId), { text, updatedAt: Date.now() });
}

export async function deleteNote(groupId: string, noteId: string): Promise<void> {
  await deleteDoc(doc(notesCol(groupId), noteId));
}
