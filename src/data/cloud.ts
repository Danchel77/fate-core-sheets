import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/app';
import type { CharacterRecord, SettingId } from './types';

/** Герои аккаунта: users/{uid}/heroes/{id}. Читать и писать может только владелец. */
function heroRef(uid: string, id: string) {
  if (!db) throw new Error('Firebase не настроен');
  return doc(db, 'users', uid, 'heroes', id);
}

function toRecord(id: string, data: Record<string, unknown>): CharacterRecord | null {
  const setting = data.setting as SettingId | undefined;
  const sheet = data.sheet as CharacterRecord['sheet'] | undefined;
  if (!sheet || typeof sheet !== 'object') return null;
  if (setting !== 'fate' && setting !== 'witcher') return null;
  return {
    id,
    setting,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date(0).toISOString(),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date(0).toISOString(),
    sheet,
  };
}

export function subscribeCloud(
  uid: string,
  next: (records: CharacterRecord[]) => void,
  onError?: () => void,
): () => void {
  if (!db) return () => {};
  return onSnapshot(
    collection(db, 'users', uid, 'heroes'),
    (snapshot) => {
      const records = snapshot.docs
        .map((item) => toRecord(item.id, item.data()))
        .filter((record): record is CharacterRecord => record !== null);
      next(records);
    },
    () => {
      /* без сети показываем кэш; сообщаем только о запрете доступа */
      onError?.();
    },
  );
}

export async function writeCloud(uid: string, record: CharacterRecord): Promise<void> {
  await setDoc(heroRef(uid, record.id), {
    setting: record.setting,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    sheet: record.sheet,
  });
}

export async function deleteCloud(uid: string, id: string): Promise<void> {
  await deleteDoc(heroRef(uid, id));
}
