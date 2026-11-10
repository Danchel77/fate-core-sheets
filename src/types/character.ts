import { CharacterAspect, CharacterStunt, ConsequenceSlot, StressBox } from './fate';

export type SettingType = 'witcher' | 'universal';

export interface Character {
  id: string;
  userId?: string;
  name: string;
  setting: SettingType;
  avatar: string | null; // Data URL or Image URL
  description: string;
  refresh: number; // Starting fate points each session
  currentFatePoints: number;
  // Campaign power preset (homebrew, not a Fate Core level)
  baseRefresh?: number; // default 3
  freeStunts?: number; // default 3
  skillCap?: number; // default 4
  skillPoints?: number; // unspent advancement points
  milestones?: {
    minor: number;
    significant: number;
    major: number;
  };

  // 5 Aspects
  aspects: Record<string, string>;

  // Skill pyramid: mapping of level -> array of skillIds
  // level 4: 1 skill
  // level 3: 2 skills
  // level 2: 3 skills
  // level 1: 4 skills
  skills: {
    6?: string[];
    5?: string[];
    4: string[];
    3: string[];
    2: string[];
    1: string[];
  };

  // Stunts (3 free, up to 5)
  stunts: CharacterStunt[];

  // Stress
  physicalStress: StressBox[];
  mentalStress: StressBox[];

  // Consequences
  consequences: {
    mild: ConsequenceSlot; // -2
    moderate: ConsequenceSlot; // -4
    severe: ConsequenceSlot; // -6
  };

  // Extras / Notes (Дополнения)
  notes?: string;

  createdAt: number;
  updatedAt: number;
}
