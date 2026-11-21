import type { Character, LadderRow, SettingId } from './types';
import { SETTINGS } from './settings';

/** Навыки сеттинга: из них собирается пирамида нового героя. */
export const SKILLS: Record<SettingId, string[]> = {
  fate: SETTINGS.fate.skills,
  witcher: SETTINGS.witcher.skills,
};

/** Имя героя для карточек и подписей: без имени он всё равно должен быть узнаваем. */
export function heroDisplayName(name: string): string {
  return name.trim() || 'Безымянный герой';
}

/** Числа из правил: стартовое обновление, бесплатные трюки и предел. */
export const STARTING_REFRESH = 3;
const FREE_STUNTS = 3;
export const MAX_STUNTS = 5;
const STARTING_FATE_POINTS = 3;

/** Сколько ячеек стресса даёт навык: 0 → 2, +1/+2 → 3, +3 и выше → 4. */
function stressCells(skill: number): number {
  if (skill >= 3) return 4;
  if (skill >= 1) return 3;
  return 2;
}

function skillValue(ladder: LadderRow[], name: string): number {
  return ladder.find((row) => row.skills.includes(name))?.value ?? 0;
}

/** Физический стресс считается по Телосложению. */
export function physicalStress(character: Character): number {
  return stressCells(skillValue(character.ladder, 'Телосложение'));
}

/** Ментальный стресс считается по Воле. */
export function mentalStress(character: Character): number {
  return stressCells(skillValue(character.ladder, 'Воля'));
}

/** Обновление при заданном числе трюков: каждый сверх трёх снимает жетон, ниже единицы — нет. */
export function refreshWithStunts(baseRefresh: number, stuntCount: number): number {
  return Math.max(1, baseRefresh - Math.max(0, stuntCount - FREE_STUNTS));
}

/** Обновление героя с учётом записанных трюков. */
export function effectiveRefresh(character: Character): number {
  return refreshWithStunts(character.refresh, character.stunts.length);
}

/** Пирамида из выбранных навыков: строки +4/+3/+2/+1 всегда на месте. */
export function ladderFromPicks(picks: { name: string; value: number }[]): LadderRow[] {
  /* Обычные ступени есть всегда, а поднятые вехами (+5, +6) добавляются сверху. */
  const values = new Set([4, 3, 2, 1, ...picks.map((pick) => pick.value)]);
  return [...values]
    .sort((left, right) => right - left)
    .map((value) => ({
      value,
      skills: picks.filter((pick) => pick.value === value).map((pick) => pick.name),
    }));
}

/** Пустой лист нового героя: пирамида без навыков, аспекты и трюки пустые. */
export function createEmptyCharacter(): Character {
  return {
    name: '',
    description: '',
    portrait: '',
    level: 1,
    refresh: STARTING_REFRESH,
    fatePoints: STARTING_FATE_POINTS,
    aspects: [
      { label: 'Концепция', text: '' },
      { label: 'Проблема', text: '' },
      { label: 'Первое приключение', text: '' },
      { label: 'Переплетение судеб', text: '' },
      { label: 'Переплетение судеб', text: '' },
    ],
    ladder: [
      { value: 4, skills: [] },
      { value: 3, skills: [] },
      { value: 2, skills: [] },
      { value: 1, skills: [] },
    ],
    stunts: [],
    extras: ['', ''],
    extraTitles: ['Заметки I', 'Заметки II'],
    marks: { physical: [], mental: [] },
    consequences: [
      { value: 2, kind: 'лёгкое', text: '' },
      { value: 4, kind: 'среднее', text: '' },
      { value: 6, kind: 'серьёзное', text: '' },
    ],
  };
}
