export type ActionType = 'overcome' | 'advantage' | 'attack' | 'defend';

export interface SkillDefinition {
  id: string;
  nameRu: string;
  nameEn: string;
  category: 'physical' | 'mental' | 'social';
  description: string;
  witcherContext?: string;
}

export interface SkillSlot {
  level: number; // 4, 3, 2, 1
  levelNameRu: string; // Отлично, Хорошо, Сносно, Посредственно
  skillId: string | null;
}

export type AspectType = 'high_concept' | 'trouble' | 'aspect_3' | 'aspect_4' | 'aspect_5';

export interface CharacterAspect {
  id: AspectType;
  label: string;
  description: string;
  value: string;
}

export type StuntTemplate = 'bonus' | 'swap' | 'special';

export interface CharacterStunt {
  id: string;
  name: string;
  template: StuntTemplate;
  description: string;
}

export interface StressBox {
  index: number;
  value: number; // 1, 2, 3, 4
  checked: boolean;
}

export interface ConsequenceSlot {
  severity: 'mild' | 'moderate' | 'severe';
  value: number; // -2, -4, -6
  label: string;
  aspect: string;
}
