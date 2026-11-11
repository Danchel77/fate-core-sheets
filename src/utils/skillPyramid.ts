import type { Character } from '../types/character';

export type PyramidLevel = 1 | 2 | 3 | 4;

export const BASE_PYRAMID_CAPACITY: Record<PyramidLevel, number> = {
  1: 4,
  2: 3,
  3: 2,
  4: 1,
};

export const BASE_SKILL_COUNT = 10;

const PYRAMID_LEVELS: PyramidLevel[] = [1, 2, 3, 4];
const ALL_LEVELS = [6, 5, 4, 3, 2, 1] as const;

export interface PyramidLevelState {
  level: PyramidLevel;
  capacity: number; // для уровня 1 = 4 + extraSlots
  filled: number;
  locked: boolean; // пока база не собрана — ступени выше активной заблокированы
  active: boolean; // активная (нижняя незаполненная)
  full: boolean;
}

function countAtLevel(skills: Character['skills'], level: PyramidLevel): number {
  return skills[level]?.length ?? 0;
}

/**
 * Копия пирамиды без ссылок на исходные массивы. Уровни 5/6 сохраняются,
 * только если они были в объекте: старые листы не должны терять данные.
 */
function cloneSkills(skills: Character['skills']): Character['skills'] {
  return {
    4: [...(skills[4] ?? [])],
    3: [...(skills[3] ?? [])],
    2: [...(skills[2] ?? [])],
    1: [...(skills[1] ?? [])],
    ...(skills[5] !== undefined ? { 5: [...skills[5]] } : {}),
    ...(skills[6] !== undefined ? { 6: [...skills[6]] } : {}),
  };
}

export function getPyramidLevels(
  skills: Character['skills'],
  extraSlots: number
): PyramidLevelState[] {
  const safeExtraSlots = Math.max(0, Math.floor(extraSlots));
  const baseComplete = isBasePyramidComplete(skills);

  const capacityFor = (level: PyramidLevel): number =>
    level === 1 ? BASE_PYRAMID_CAPACITY[1] + safeExtraSlots : BASE_PYRAMID_CAPACITY[level];

  // Активная ступень — самая нижняя незаполненная. Доп. слоты +1 открываются
  // только после полной базы, поэтому при неполной базе уровень 1 не должен
  // перехватывать активность у недостающих верхних ступеней.
  let active: PyramidLevel | null = null;
  for (const level of PYRAMID_LEVELS) {
    const capacity = capacityFor(level);
    const gateCapacity =
      level === 1 && !baseComplete ? BASE_PYRAMID_CAPACITY[1] : capacity;

    if (countAtLevel(skills, level) < gateCapacity) {
      active = level;
      break;
    }
  }

  return PYRAMID_LEVELS.map((level) => {
    const capacity = capacityFor(level);
    const filled = countAtLevel(skills, level);

    return {
      level,
      capacity,
      filled,
      locked: !baseComplete && active !== null && level > active,
      active: level === active,
      full: filled >= capacity,
    };
  });
}

export function getActiveLevel(levels: PyramidLevelState[]): PyramidLevel | null {
  return levels.find((level) => level.active)?.level ?? null;
}

/**
 * Возвращает только базовую ступень (+1…+4): доп. слоты живут на уровне 1,
 * поэтому отдельного значения для них не требуется.
 */
export function getPlacedLevel(
  skills: Character['skills'],
  skillId: string
): PyramidLevel | null {
  for (const level of [4, 3, 2, 1] as PyramidLevel[]) {
    if (skills[level]?.includes(skillId)) return level;
  }
  return null;
}

export function isBasePyramidComplete(skills: Character['skills']): boolean {
  return (
    countAtLevel(skills, 1) >= BASE_PYRAMID_CAPACITY[1] &&
    countAtLevel(skills, 2) === BASE_PYRAMID_CAPACITY[2] &&
    countAtLevel(skills, 3) === BASE_PYRAMID_CAPACITY[3] &&
    countAtLevel(skills, 4) === BASE_PYRAMID_CAPACITY[4]
  );
}

/**
 * Иммутабельно ставит навык на ступень. Навык сначала убирается со всех
 * уровней (включая 5/6), поэтому дублей в пирамиде не появляется.
 */
export function placeSkill(
  skills: Character['skills'],
  skillId: string,
  level: PyramidLevel
): Character['skills'] {
  const next = cloneSkills(skills);

  for (const existingLevel of ALL_LEVELS) {
    const list = next[existingLevel];
    if (list) next[existingLevel] = list.filter((id) => id !== skillId);
  }

  next[level] = [...next[level], skillId];
  return next;
}

/**
 * Снимает навык со всех уровней, не трогая остальные. Уровни 5/6, если были,
 * остаются в объекте.
 */
export function removeSkill(
  skills: Character['skills'],
  skillId: string
): Character['skills'] {
  const next = cloneSkills(skills);

  for (const level of ALL_LEVELS) {
    const list = next[level];
    if (list) next[level] = list.filter((id) => id !== skillId);
  }

  return next;
}

export function countSkills(skills: Character['skills']): number {
  return ALL_LEVELS.reduce((total, level) => total + (skills[level]?.length ?? 0), 0);
}
