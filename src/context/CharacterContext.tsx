import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Character, SettingType } from '../types/character';
import { fetchCharacters, saveCharacter, deleteCharacter, getActiveCharacterId, setActiveCharacterId } from '../services/storage';
import { createNewCharacter, calculateStressBoxes, calculateRefresh, getSkillRating } from '../utils/fateMath';
import { useAuth } from './AuthContext';

interface CharacterContextType {
  characters: Character[];
  activeCharacter: Character | null;
  loading: boolean;
  createChar: (setting?: SettingType, name?: string) => Promise<Character>;
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
      const list = await fetchCharacters(user?.uid);
      if (!isMounted) return;
      
      setCharacters(list);
      const activeId = getActiveCharacterId();
      if (activeId) {
        const found = list.find(c => c.id === activeId);
        if (found) {
          setActiveCharacter(found);
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
    const recalculatedRefresh = calculateRefresh(updated.stunts.length);

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

  const createChar = useCallback(async (setting: SettingType = 'witcher', name?: string) => {
    const newChar = createNewCharacter(setting, name);
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
