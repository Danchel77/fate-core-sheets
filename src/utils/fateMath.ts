import { Character, SettingType } from '../types/character';
import { StressBox } from '../types/fate';

export function getSkillRating(character: Character, skillId: string): number {
  if (character.skills[4]?.includes(skillId)) return 4;
  if (character.skills[3]?.includes(skillId)) return 3;
  if (character.skills[2]?.includes(skillId)) return 2;
  if (character.skills[1]?.includes(skillId)) return 1;
  return 0;
}

export function calculateStressBoxes(rating: number, existingBoxes?: StressBox[]): StressBox[] {
  let boxCount = 2; // Base 2 boxes
  if (rating >= 1 && rating <= 2) {
    boxCount = 3;
  } else if (rating >= 3) {
    boxCount = 4;
  }

  const boxes: StressBox[] = [];
  for (let i = 1; i <= boxCount; i++) {
    const existing = existingBoxes?.find(b => b.index === i);
    boxes.push({
      index: i,
      value: i,
      checked: existing ? existing.checked : false,
    });
  }
  return boxes;
}

export function calculateRefresh(stuntCount: number): number {
  const freeStunts = 3;
  const extraStunts = Math.max(0, stuntCount - freeStunts);
  return Math.max(1, 3 - extraStunts);
}

export function createNewCharacter(setting: SettingType = 'witcher', name = 'Новый персонаж'): Character {
  const now = Date.now();
  return {
    id: `char_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    setting,
    avatar: null,
    description: '',
    refresh: 3,
    currentFatePoints: 3,
    aspects: {
      high_concept: '',
      trouble: '',
      aspect_3: '',
      aspect_4: '',
      aspect_5: '',
    },
    skills: {
      4: [],
      3: [],
      2: [],
      1: [],
    },
    stunts: [
      {
        id: `stunt_1_${now}`,
        name: '',
        template: 'bonus',
        description: '',
      },
    ],
    physicalStress: [
      { index: 1, value: 1, checked: false },
      { index: 2, value: 2, checked: false },
    ],
    mentalStress: [
      { index: 1, value: 1, checked: false },
      { index: 2, value: 2, checked: false },
    ],
    consequences: {
      mild: { severity: 'mild', value: 2, label: 'Легкое (-2)', aspect: '' },
      moderate: { severity: 'moderate', value: 4, label: 'Среднее (-4)', aspect: '' },
      severe: { severity: 'severe', value: 6, label: 'Тяжелое (-6)', aspect: '' },
    },
    createdAt: now,
    updatedAt: now,
  };
}
