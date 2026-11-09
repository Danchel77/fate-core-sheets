import { Character } from '../types/character';
import { db, collection, doc, setDoc, getDocs, deleteDoc, query, where } from './firebase';

const LOCAL_STORAGE_KEY = 'fate_characters_pool';
const ACTIVE_CHAR_KEY = 'fate_active_character_id';
const GEMINI_KEY_STORAGE = 'fate_gemini_user_api_key';

export function getLocalGeminiApiKey(): string {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function setLocalGeminiApiKey(key: string): void {
  if (key) {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  }
}

export function loadLocalCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load characters from localStorage', err);
    return [];
  }
}

export function saveLocalCharacters(characters: Character[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characters));
  } catch (err) {
    console.error('Failed to save characters to localStorage', err);
  }
}

export async function fetchCharacters(userId?: string): Promise<Character[]> {
  const localList = loadLocalCharacters();

  if (!userId) {
    return localList;
  }

  try {
    const q = query(collection(db, 'characters'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const remoteList: Character[] = [];
    snapshot.forEach(docSnap => {
      remoteList.push(docSnap.data() as Character);
    });

    // Merge remote and local (avoiding duplicates by id, favoring remote if newer)
    const map = new Map<string, Character>();
    localList.forEach(c => map.set(c.id, c));
    remoteList.forEach(c => {
      const existing = map.get(c.id);
      if (!existing || c.updatedAt >= existing.updatedAt) {
        map.set(c.id, c);
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    saveLocalCharacters(merged);
    return merged;
  } catch (err) {
    console.warn('Firestore fetch failed, falling back to local storage', err);
    return localList;
  }
}

export async function saveCharacter(character: Character, userId?: string): Promise<void> {
  // Always update local storage first
  const current = loadLocalCharacters();
  const index = current.findIndex(c => c.id === character.id);
  const updatedChar = { ...character, updatedAt: Date.now() };

  let nextList: Character[];
  if (index >= 0) {
    nextList = [...current];
    nextList[index] = updatedChar;
  } else {
    nextList = [updatedChar, ...current];
  }
  saveLocalCharacters(nextList);

  // Sync to Firestore if user is authenticated
  if (userId) {
    try {
      const charRef = doc(db, 'characters', character.id);
      await setDoc(charRef, { ...updatedChar, userId }, { merge: true });
    } catch (err) {
      console.warn('Failed to sync character to Firestore, saved locally', err);
    }
  }
}

export async function deleteCharacter(characterId: string, userId?: string): Promise<void> {
  const current = loadLocalCharacters().filter(c => c.id !== characterId);
  saveLocalCharacters(current);

  if (userId) {
    try {
      const charRef = doc(db, 'characters', characterId);
      await deleteDoc(charRef);
    } catch (err) {
      console.warn('Failed to delete character from Firestore', err);
    }
  }
}

export function getActiveCharacterId(): string | null {
  return localStorage.getItem(ACTIVE_CHAR_KEY);
}

export function setActiveCharacterId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_CHAR_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_CHAR_KEY);
  }
}
