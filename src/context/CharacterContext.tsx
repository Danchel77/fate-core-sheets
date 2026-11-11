import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Character, SettingType } from '../types/character';
import { fetchCharacters, saveCharacter, deleteCharacter, getActiveCharacterId, setActiveCharacterId, saveLocalCharacters } from '../services/storage';
import { createNewCharacter, calculateStressBoxes, calculateRefresh, countRealStunts, getSkillRating } from '../utils/fateMath';
import { PowerPresetKey } from '../config/presets';
import { SAMPLE_CHARACTERS } from '../config/sampleCharacters';
import { useAuth } from './AuthContext';

interface CharacterContextType {
  characters: Character[];
  activeCharacter: Character | null;
  loading: boolean;
  createChar: (setting?: SettingType, name?: string, power?: PowerPresetKey) => Promise<Character>;
  createCharFromDraft: (draft: Character) => Promise<Character>;
  selectChar: (id: string | null) => void;
  updateChar: (updated: Character) => void;
  deleteChar: (id: string) => Promise<void>;
  duplicateChar: (id: string) => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType>({
  characters: [],
  activeCharacter: null,
  loading: true,
  createChar: async () => createNewCharacter(),
  createCharFromDraft: async (draft) => draft,
  selectChar: () => {},
  updateChar: () => {},
  deleteChar: async () => {},
  duplicateChar: async () => {},
});

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      let list = await fetchCharacters(user?.uid);
      
      const isMockMode = typeof window !== 'undefined' && window.location.search.includes('mock=1');
      if (list.length === 0 || isMockMode) {
        list = SAMPLE_CHARACTERS;
        saveLocalCharacters(list);
      }

      if (!isMounted) return;
      
      setCharacters(list);

      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const requestedView = params?.get('view');

      if (requestedView === 'sheet' && list.length > 0) {
        setActiveCharacter(list[0]);
      } else {
        const activeId = getActiveCharacterId();
        if (activeId) {
          const found = list.find(c => c.id === activeId);
          if (found) {
            setActiveCharacter(found);
          }
        }
      }

      setLoading(false);
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const selectChar = useCallback((id: string | null) => {
    setActiveCharacterId(id);
    if (!id) {
      setActiveCharacter(null);
      return;
    }
    const found = characters.find(c => c.id === id);
    if (found) {
      setActiveCharacter(found);
    }
  }, [characters]);

  const updateChar = useCallback((updated: Character) => {
    // Recalculate stress tracks based on skills
    const physiqueRating = getSkillRating(updated, 'physique');
    const willRating = getSkillRating(updated, 'will');
    
    const recalculatedPhysical = calculateStressBoxes(physiqueRating, updated.physicalStress);
    const recalculatedMental = calculateStressBoxes(willRating, updated.mentalStress);
    const recalculatedRefresh = calculateRefresh(
      countRealStunts(updated.stunts),
      updated.freeStunts ?? 3,
      updated.baseRefresh ?? 3
    );

    const fullUpdated: Character = {
      ...updated,
      physicalStress: recalculatedPhysical,
      mentalStress: recalculatedMental,
      refresh: recalculatedRefresh,
      updatedAt: Date.now(),
    };

    setActiveCharacter(fullUpdated);
    setCharacters(prev => prev.map(c => c.id === fullUpdated.id ? fullUpdated : c));
    saveCharacter(fullUpdated, user?.uid);
  }, [user]);

  const createChar = useCallback(async (setting: SettingType = 'witcher', name?: string, power?: PowerPresetKey) => {
    const newChar = createNewCharacter(setting, name, power);
    if (user?.uid) {
      newChar.userId = user.uid;
    }
    await saveCharacter(newChar, user?.uid);
    setCharacters(prev => [newChar, ...prev]);
    setActiveCharacter(newChar);
    setActiveCharacterId(newChar.id);
    return newChar;
  }, [user]);

  /** Сохранение персонажа, собранного в конструкторе: берём черновик как есть. */
  const createCharFromDraft = useCallback(async (draft: Character) => {
    const now = Date.now();
    // Навыки и трюки собраны в конструкторе: пересчитываем производные значения.
    const refresh = calculateRefresh(
      countRealStunts(draft.stunts),
      draft.freeStunts ?? 3,
      draft.baseRefresh ?? 3
    );
    const newChar: Character = {
      ...draft,
      id: `char_${now}_${Math.random().toString(36).substring(2, 7)}`,
      physicalStress: calculateStressBoxes(
        getSkillRating(draft, 'physique'),
        draft.physicalStress
      ),
      mentalStress: calculateStressBoxes(getSkillRating(draft, 'will'), draft.mentalStress),
      refresh,
      currentFatePoints: refresh,
      createdAt: now,
      updatedAt: now,
    };
    if (user?.uid) {
      newChar.userId = user.uid;
    }
    await saveCharacter(newChar, user?.uid);
    setCharacters(prev => [newChar, ...prev]);
    setActiveCharacter(newChar);
    setActiveCharacterId(newChar.id);
    return newChar;
  }, [user]);

  const deleteChar = useCallback(async (id: string) => {
    await deleteCharacter(id, user?.uid);
    setCharacters(prev => prev.filter(c => c.id !== id));
    if (activeCharacter?.id === id) {
      setActiveCharacter(null);
      setActiveCharacterId(null);
    }
  }, [user, activeCharacter]);

  const duplicateChar = useCallback(async (id: string) => {
    const source = characters.find(c => c.id === id);
    if (!source) return;

    const copy: Character = {
      ...source,
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${source.name} (Копия)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveCharacter(copy, user?.uid);
    setCharacters(prev => [copy, ...prev]);
  }, [characters, user]);

  return (
    <CharacterContext.Provider value={{
      characters,
      activeCharacter,
      loading,
      createChar,
      createCharFromDraft,
      selectChar,
      updateChar,
      deleteChar,
      duplicateChar,
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacters = () => useContext(CharacterContext);
