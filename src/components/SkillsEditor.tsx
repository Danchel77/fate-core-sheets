import { useState } from 'react';
import { BlockHeader } from './BlockHeader';
import '../styles/skills-editor.css';

/** 18 навыков сеттинга «Ведьмак» (список зафиксирован в fate_core_rules.md). */
export const SKILL_POOL = [
  'Атлетика',
  'Внимательность',
  'Верховая езда',
  'Воля',
  'Воровство',
  'Драка',
  'Знания',
  'Контакты',
  'Хитрость',
  'Ремесло',
  'Ресурсы',
  'Скрытность',
  'Стрельба',
  'Телосложение',
  'Убеждение',
  'Эмпатия',
  'Монстрология',
  'Магия',
] as const;

export type InitRow = { value: number; skills: string[] };
export type SkillsEditorVariant = 1 | 2 | 3;

type SlotRow = { value: number; slots: (string | null)[] };
type MenuTarget = { rank: number; index: number };

type Props = {
  variant?: SkillsEditorVariant;
  initial: InitRow[];
  initialLevel?: number;
};

const MAX_RANK = 8;
const BASE_POINTS = 20;

/** Ёмкость стартовой ступени: +1 — четыре слота, +4 — один. */
const baseCap = (value: number) => (value >= 1 && value <= 4 ? 5 - value : 0);

function buildRows(initial: InitRow[]): SlotRow[] {
  const byValue = new Map(initial.map((row) => [row.value, row.skills]));
  const values = new Set<number>([1, 2, 3, 4, ...initial.map((row) => row.value)]);
  return [...values]
    .sort((a, b) => b - a)
    .map((value) => {
      const skills = byValue.get(value) ?? [];
      const cap = baseCap(value);
      const slots: (string | null)[] = [];
      for (let i = 0; i < cap; i += 1) slots.push(skills[i] ?? null);
      for (let i = cap; i < skills.length; i += 1) slots.push(skills[i]);
      return { value, slots };
    });
}

const filledCount = (row: SlotRow) => row.slots.filter(Boolean).length;

/** «1 очко», «2 очка», «5 очков». */
function pointsLabel(points: number): string {
  const abs = Math.abs(points) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 'очков';
  if (last === 1) return 'очко';
  if (last >= 2 && last <= 4) return 'очка';
  return 'очков';
}

/** Интерактивная пирамида навыков: слоты стартовой пирамиды, уровень и свободные очки. */
export function SkillsEditor({ variant = 1, initial, initialLevel = 4 }: Props) {
  const [rows, setRows] = useState<SlotRow[]>(() => buildRows(initial));
  const [level, setLevel] = useState(initialLevel);
  const [menu, setMenu] = useState<MenuTarget | null>(null);

  const spent = rows.reduce((sum, row) => sum + row.value * filledCount(row), 0);
  const free = BASE_POINTS + (level - 1) - spent;

  const counts = new Map(rows.map((row) => [row.value, filledCount(row)]));
  const hasRow = (rank: number) => counts.has(rank);

  const canRaise = (rank: number) => {
    const above = counts.get(rank + 1) ?? 0;
    const here = counts.get(rank) ?? 0;
    return free > 0 && hasRow(rank + 1) && above + 1 <= here - 1;
  };

  const raise = (rank: number, index: number) => {
    setRows((prev) => {
      const source = prev.find((row) => row.value === rank);
      if (!source) return prev;
      const name = source.slots[index];
      if (!name) return prev;

      return prev.map((row) => {
        if (row.value === rank) {
          const slots = [...row.slots];
          if (index >= baseCap(rank)) slots.splice(index, 1);
          else slots[index] = null;
          return { ...row, slots };
        }
        if (row.value === rank + 1) {
          const slots = [...row.slots];
          const hole = slots.findIndex((slot) => slot === null);
          if (hole >= 0) slots[hole] = name;
          else slots.push(name);
          return { ...row, slots };
        }
        return row;
      });
    });
  };

  const remove = (rank: number, index: number) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.value !== rank) return row;
        const slots = [...row.slots];
        if (index >= baseCap(rank)) slots.splice(index, 1);
        else slots[index] = null;
        return { ...row, slots };
      }),
    );
  };

  const fill = (rank: number, index: number, name: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.value !== rank) return row;
        const slots = [...row.slots];
        slots[index] = name;
        return { ...row, slots };
      }),
    );
    setMenu(null);
  };

  const addNewSkill = (name: string) => {
    setRows((prev) =>
      prev.map((row) => (row.value === 1 ? { ...row, slots: [...row.slots, name] } : row)),
    );
    setMenu(null);
  };

  const addRank = () => {
    setRows((prev) => {
      const top = prev[0]?.value ?? 0;
      if (top >= MAX_RANK) return prev;
      return [{ value: top + 1, slots: [] }, ...prev];
    });
  };

  const removeRank = () => {
    setRows((prev) => {
      const top = prev[0];
      if (!top || prev.length <= 1 || filledCount(top) > 0) return prev;
      return prev.slice(1);
    });
  };

  const used = new Set(rows.flatMap((row) => row.slots.filter((slot): slot is string => Boolean(slot))));
  const available = SKILL_POOL.filter((name) => !used.has(name));

  const canRemoveRank = rows.length > 1 && filledCount(rows[0]) === 0;
  const freeLine = free > 0 ? `Доступно очков ${free}` : free < 0 ? `Не хватает очков ${-free}` : '';

  const levelBlock = (
    <div className="ske__lvc" aria-label={`Уровень ${level}, свободных очков ${free}`}>
      <span className="ske__lv-line">
        <span className="ske__lv-label">Уровень</span>
        <span className="ske__lvnum">{level}</span>
        <span className="ske__lvstep">
          <button
            type="button"
            className="ske__step"
            aria-label="Повысить уровень"
            disabled={level >= MAX_RANK}
            onClick={() => setLevel((l) => Math.min(MAX_RANK, l + 1))}
          >
            ↑
          </button>
          <button
            type="button"
            className="ske__step"
            aria-label="Понизить уровень"
            disabled={level <= 1}
            onClick={() => setLevel((l) => Math.max(1, l - 1))}
          >
            ↓
          </button>
        </span>
      </span>
      <span className={`ske__lv-free${free < 0 ? ' ske__lv-free--debt' : ''}`}>{freeLine}</span>
    </div>
  );

  return (
    <section className={`ske ske--v${variant}`}>
      <BlockHeader variant="lozenge" title="Навыки" />

      <div className="ske__body">
        {rows.map((row, rowIndex) => {
          const hasHole = row.slots.some((slot) => slot === null);
          const showExtra = row.value === 1 && free > 0 && !hasHole;

          return (
            <div className={`ske__row${rowIndex === 0 ? ' ske__row--top' : ''}`} key={row.value}>
              {rowIndex === 0 && (
                <span className="ske__rankctl">
                  <button
                    type="button"
                    className="ske__rankbtn ske__rankbtn--minus"
                    aria-label="Убрать верхнюю ступень"
                    title="Убрать пустую верхнюю ступень"
                    onClick={removeRank}
                    disabled={!canRemoveRank}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="ske__rankbtn ske__rankbtn--plus"
                    aria-label="Добавить ступень"
                    title="Добавить ступень (после крупной вехи)"
                    onClick={addRank}
                    disabled={row.value >= MAX_RANK}
                  >
                    +
                  </button>
                </span>
              )}

              <span className="ske__rank">+{row.value}</span>

              <div className="ske__grid">
                {row.slots.map((name, index) => {
                  if (name) {
                    const raisable = canRaise(row.value);
                    return (
                      <span className="ske__block" key={`${row.value}-${index}-${name}`}>
                        <span className="ske__name">{name}</span>
                        <button
                          type="button"
                          className="ske__del"
                          aria-label={`Убрать ${name}`}
                          title="Убрать навык"
                          onClick={() => remove(row.value, index)}
                        >
                          ×
                        </button>
                        {raisable && (
                          <button
                            type="button"
                            className="ske__up"
                            aria-label={`Поднять ${name}`}
                            title="Поднять на ступень (1 очко)"
                            onClick={() => raise(row.value, index)}
                          >
                            ↑
                          </button>
                        )}
                      </span>
                    );
                  }
                  const affordable = free >= row.value;
                  return (
                    <button
                      type="button"
                      className={`ske__slot${affordable ? ' ske__slot--ready' : ''}`}
                      key={`${row.value}-hole-${index}`}
                      title={
                        affordable
                          ? `Занять слот: ${row.value} ${pointsLabel(row.value)}`
                          : `Не хватает очков: нужно ${row.value} ${pointsLabel(row.value)}`
                      }
                      onClick={() => affordable && setMenu({ rank: row.value, index })}
                    >
                      + навык
                    </button>
                  );
                })}

                {showExtra && (
                  <button
                    type="button"
                    className="ske__slot ske__slot--ready ske__slot--new"
                    onClick={() => setMenu({ rank: 1, index: rows.find((r) => r.value === 1)?.slots.length ?? 0 })}
                  >
                    + навык
                  </button>
                )}
              </div>

              {rowIndex === 0 && levelBlock}
            </div>
          );
        })}
      </div>

      {menu && (
        <>
          <button
            type="button"
            className="ske__scrim"
            aria-label="Закрыть список навыков"
            onClick={() => setMenu(null)}
          />
          <div className="ske__menu" role="menu">
            <span className="ske__menu-cap">
              Стоимость: {menu.rank} {pointsLabel(menu.rank)}
            </span>
            {available.length === 0 && <span className="ske__menu-empty">Все навыки уже в пирамиде</span>}
            {available.map((name) => (
              <button
                type="button"
                className="ske__menu-item"
                key={name}
                onClick={() =>
                  menu.index >= (rows.find((row) => row.value === menu.rank)?.slots.length ?? 0)
                    ? addNewSkill(name)
                    : fill(menu.rank, menu.index, name)
                }
              >
                {name}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
