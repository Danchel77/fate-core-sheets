import { Character, SettingType } from '../types/character';
import { CharacterStunt, StressBox } from '../types/fate';
import { POWER_PRESETS, PowerPresetKey } from '../config/presets';

export function getSkillRating(character: Character, skillId: string): number {
  if (character.skills[6]?.includes(skillId)) return 6;
  if (character.skills[5]?.includes(skillId)) return 5;
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

export function countRealStunts(stunts: CharacterStunt[]): number {
  return stunts.filter(s => s.name.trim() || s.description.trim()).length;
}

export function calculateRefresh(
  stuntCount: number,
  freeStunts = 3,
  baseRefresh = 3
): number {
  const extraStunts = Math.max(0, stuntCount - freeStunts);
  return Math.max(1, baseRefresh - extraStunts);
}

export function getFatePointCircles(refresh: number): {
  total: number;
  solid: number;
  dashed: number;
} {
  const solid = Math.max(0, refresh);
  const total = Math.max(5, solid + 1);
  return { total, solid, dashed: total - solid };
}

export function createNewCharacter(
  setting: SettingType = 'witcher',
  name = 'Новый персонаж',
  power: PowerPresetKey = 'start'
): Character {
  const now = Date.now();
  const powerPreset = POWER_PRESETS[power] || POWER_PRESETS.start;

  return {
    id: `char_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    setting,
    avatar: null,
    description: '',
    refresh: powerPreset.refresh,
    currentFatePoints: powerPreset.refresh,
    baseRefresh: powerPreset.refresh,
    freeStunts: 3,
    skillCap: powerPreset.skillCap,
    skillPoints: 0,
    milestones: { minor: 0, significant: 0, major: 0 },
    aspects: {
      high_concept: '',
      trouble: '',
      aspect_3: '',
      aspect_4: '',
      aspect_5: '',
    },
    skills: {
      6: [],
      5: [],
      4: [],
      3: [],
      2: [],
      1: [],
    },
    stunts: [
      { id: `stunt_1_${now}`, name: '', template: 'bonus', description: '' },
      { id: `stunt_2_${now}`, name: '', template: 'bonus', description: '' },
      { id: `stunt_3_${now}`, name: '', template: 'bonus', description: '' },
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
