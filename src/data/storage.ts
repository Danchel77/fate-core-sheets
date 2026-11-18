import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
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
    const records = await db.getAll(STORE);
    records.forEach((record) => memory.set(record.id, record));
    return records;
  } catch {
    broken = true;
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
    broken = true;
  }
}

export async function removeOne(id: string): Promise<void> {
  memory.delete(id);
  if (broken) return;
  try {
    const db = await connect();
    await db.delete(STORE, id);
  } catch {
    broken = true;
  }
}
