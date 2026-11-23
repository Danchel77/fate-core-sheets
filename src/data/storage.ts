import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { migrateCharacter } from './skillMigration';
import type { CharacterRecord } from './types';

/** Хранилище героев: база в браузере, таблица characters, ключ — id героя. */
const DB_NAME = 'fate-core-sheets';
const STORE = 'characters';
const VERSION = 1;

interface SheetDB extends DBSchema {
  characters: { key: string; value: CharacterRecord };
}

/** Запасной склад: если браузер не даёт базу (приватный режим), герои живут до перезагрузки. */
const memory = new Map<string, CharacterRecord>();
let connection: Promise<IDBPDatabase<SheetDB>> | null = null;
let broken = false;
const brokenListeners = new Set<() => void>();

/** Сообщить, что браузер перестал сохранять героев на диск. */
export function onStorageBroken(listener: () => void): () => void {
  if (broken) {
    listener();
    return () => undefined;
  }
  brokenListeners.add(listener);
  return () => brokenListeners.delete(listener);
}

function markBroken() {
  if (broken) return;
  broken = true;
  brokenListeners.forEach((listener) => listener());
  brokenListeners.clear();
}

function connect(): Promise<IDBPDatabase<SheetDB>> {
  if (!connection) {
    connection = openDB<SheetDB>(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      },
    });
  }
  return connection;
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `hero-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function readAll(): Promise<CharacterRecord[]> {
  if (broken) return [...memory.values()];
  try {
    const db = await connect();
    const records = (await db.getAll(STORE)).map((record) => {
      const sheet = migrateCharacter(record.setting, record.sheet).sheet;
      return sheet === record.sheet ? record : { ...record, sheet };
    });
    records.forEach((record) => memory.set(record.id, record));
    return records;
  } catch {
    markBroken();
    return [...memory.values()];
  }
}

export async function writeOne(record: CharacterRecord): Promise<void> {
  memory.set(record.id, record);
  if (broken) return;
  try {
    const db = await connect();
    await db.put(STORE, record);
  } catch {
    markBroken();
  }
}

export async function removeOne(id: string): Promise<void> {
  memory.delete(id);
  if (broken) return;
  try {
    const db = await connect();
    await db.delete(STORE, id);
  } catch {
    markBroken();
  }
}
