import { useSyncExternalStore } from 'react';
import type { Character, CharacterPatch, CharacterRecord, SettingId } from './types';
import { newId, readAll, removeOne, writeOne } from './storage';

/**
 * Список героев в памяти страницы. Экран читает его подпиской,
 * а каждая правка сразу уходит в браузерное хранилище.
 */
export type CharactersState = { ready: boolean; records: CharacterRecord[] };

let state: CharactersState = { ready: false, records: [] };
const listeners = new Set<() => void>();

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

let loading: Promise<void> | null = null;

/** Первое чтение из хранилища; повторные вызовы ждут то же самое чтение. */
export function loadCharacters(): Promise<void> {
  if (!loading) {
    loading = readAll().then(
      (records) => publish({ ready: true, records: sortByNewest(records) }),
      () => publish({ ready: true, records: [] }),
    );
  }
  return loading;
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
  publish({ ready: true, records: sortByNewest([record, ...state.records]) });
  await writeOne(record);
  return record;
}

/** Правка листа: сразу в памяти и сразу в хранилище. */
export async function updateCharacter(id: string, patch: CharacterPatch): Promise<void> {
  const current = state.records.find((record) => record.id === id);
  if (!current) return;
  const record: CharacterRecord = {
    ...current,
    updatedAt: new Date().toISOString(),
    sheet: { ...current.sheet, ...patch },
  };
  publish({
    ready: true,
    records: state.records.map((item) => (item.id === id ? record : item)),
  });
  await writeOne(record);
}

export async function deleteCharacter(id: string): Promise<void> {
  publish({ ready: true, records: state.records.filter((record) => record.id !== id) });
  await removeOne(id);
}
