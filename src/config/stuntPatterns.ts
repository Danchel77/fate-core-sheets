import { StuntTemplate } from '../types/fate';

export type { StuntTemplate };

export interface StuntPatternDefinition {
  id: StuntTemplate;
  label: string; // короткое название для карточки
  caption: string; // уточнение одной строкой
  formula: string; // формула паттерна
  example: string; // пример в сеттинге «Ведьмака»
}

export const STUNT_PATTERNS: StuntPatternDefinition[] = [
  {
    id: 'bonus',
    label: 'Бонус +2',
    caption: 'В узкой ситуации',
    formula: '+2 к [действие] навыком [навык], когда [узкая ситуация]',
    example: '+2 к Атаке Ближним боем, когда я сражаюсь серебряным мечом против трупоедов в темноте.',
  },
  {
    id: 'swap',
    label: 'Замена навыка',
    caption: 'В узких условиях',
    formula: 'Использовать [навык A] вместо [навык B], когда [условие]',
    example: 'Использовать Алхимию вместо Расследования, когда изучаю следы ядов и когтей на трупе.',
  },
  {
    id: 'special',
    label: 'Особое правило',
    caption: 'Раз за сцену',
    formula: 'Раз за сцену: когда [триггер], [эффект]',
    example: 'Раз за сцену: когда здоровье падает до тяжелого последствия, мгновенно применить Знак Квен без траты действия.',
  },
];

export function getStuntPattern(id: StuntTemplate): StuntPatternDefinition {
  const pattern = STUNT_PATTERNS.find((item) => item.id === id);
  if (!pattern) {
    throw new Error(`Unknown stunt pattern: ${id}`);
  }
  return pattern;
}
