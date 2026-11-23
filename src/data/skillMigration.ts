import type { Character, LadderRow, SettingId } from './types';

/**
 * Старые имена навыков «Ведьмака». Хранимые листы не переписываются задним
 * числом: при чтении имя приводится к новому, чтобы старые герои открывались.
 */
const WITCHER_ALIASES: Record<string, string> = {
  'Атлетика': 'Ловкость',
  'Драка': 'Ближний бой',
  'Хитрость': 'Обман',
  'Воровство': 'Скрытность',
};

export type SkillMigration = {
  sheet: Character;
  changed: boolean;
  merged: boolean;
};

/**
 * Приводит пирамиду к текущему набору навыков сеттинга.
 *
 * В «Ведьмаке» «Воровство» и «Скрытность» стали одним навыком. Если у героя
 * были оба, оставляем большее значение: разница сама превратится в свободные
 * очки, потому что стоимость навыков считается из пирамиды. Меньшее значение
 * терять не нужно — оно остаётся в кошельке очков.
 */
export function migrateCharacter(setting: SettingId, sheet: Character): SkillMigration {
  if (setting !== 'witcher') return { sheet, changed: false, merged: false };

  const bySkill = new Map<string, number>();
  let renamed = false;
  let merged = false;

  for (const row of sheet.ladder) {
    for (const name of row.skills) {
      const target = WITCHER_ALIASES[name] ?? name;
      if (target !== name) renamed = true;
      const previous = bySkill.get(target);
      if (previous === undefined) {
        bySkill.set(target, row.value);
      } else {
        merged = true;
        if (row.value > previous) bySkill.set(target, row.value);
      }
    }
  }

  if (!renamed && !merged) return { sheet, changed: false, merged: false };

  const rows: LadderRow[] = sheet.ladder.map((row) => ({ value: row.value, skills: [] }));
  for (const [name, value] of bySkill) {
    const row = rows.find((item) => item.value === value);
    if (row) row.skills.push(name);
    else rows.push({ value, skills: [name] });
  }
  rows.sort((left, right) => right.value - left.value);

  return {
    sheet: { ...sheet, ladder: rows },
    changed: true,
    merged,
  };
}
