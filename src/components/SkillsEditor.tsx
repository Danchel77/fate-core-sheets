import { useId, useState } from 'react';
import { BlockHeader } from './BlockHeader';
import { BlockMenu } from './BlockMenu';
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

type Row = { value: number; skills: string[] };

type Props = {
  initial: InitRow[];
  initialLevel?: number;
};

const MAX_SKILL_RANK = 6;
const MAX_LEVEL = 99;
const BASE_POINTS = 20;

/** Ёмкость стартовой ступени: +1 — четыре слота, +4 — один. */
const baseCap = (value: number) => (value >= 1 && value <= 4 ? 5 - value : 0);

/** «1 очко», «2 очка», «5 очков». */
function pointsWord(points: number): string {
  const abs = Math.abs(points) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 'очков';
  if (last === 1) return 'очко';
  if (last >= 2 && last <= 4) return 'очка';
  return 'очков';
}

function buildRows(initial: InitRow[]): Row[] {
  const byValue = new Map(initial.map((row) => [row.value, row.skills]));
  const values = new Set<number>([1, 2, 3, 4, ...initial.map((row) => row.value)]);
  return [...values]
    .sort((a, b) => b - a)
    .map((value) => ({ value, skills: [...(byValue.get(value) ?? [])] }));
}

/** Стрелка «поднять навык»: простое древко и треугольник, золото с тиснением. */
function UpArrow() {
  const gid = `ske-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className="ske__upico" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--arrow-gold-hi)' }} />
          <stop offset="0.45" style={{ stopColor: 'var(--arrow-gold-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--arrow-gold-lo)' }} />
        </linearGradient>
      </defs>
      <path
        d="M6.2 14.35q0 .55.6.55h2.4q.6 0 .6-.55V8.55h2.6L8 2.75 3.6 8.55h2.6Z"
        fill={`url(#${gid})`}
        stroke="var(--arrow-edge)"
        strokeWidth="0.55"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Интерактивная пирамида навыков: слоты стартовой пирамиды, уровень и свободные очки. */
export function SkillsEditor({ initial, initialLevel = 4 }: Props) {
  const [rows, setRows] = useState<Row[]>(() => buildRows(initial));
  const [level, setLevel] = useState(initialLevel);
  const [menuRank, setMenuRank] = useState<number | null>(null);

  const spent = rows.reduce((sum, row) => sum + row.value * row.skills.length, 0);
  const free = BASE_POINTS + (level - 1) - spent;

  const counts = new Map(rows.map((row) => [row.value, row.skills.length]));
  const hasRow = (rank: number) => counts.has(rank);

  const canRaise = (rank: number) => {
    const above = counts.get(rank + 1) ?? 0;
    const here = counts.get(rank) ?? 0;
    return free > 0 && hasRow(rank + 1) && above + 1 <= here - 1;
  };

  const raise = (rank: number, name: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.value === rank) {
          return { ...row, skills: row.skills.filter((skill) => skill !== name) };
        }
        if (row.value === rank + 1) {
          return { ...row, skills: [...row.skills, name] };
        }
        return row;
      }),
    );
  };

  const remove = (rank: number, name: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.value === rank ? { ...row, skills: row.skills.filter((skill) => skill !== name) } : row,
      ),
    );
  };

  const addSkill = (rank: number, name: string) => {
    setRows((prev) =>
      prev.map((row) => (row.value === rank ? { ...row, skills: [...row.skills, name] } : row)),
    );
    setMenuRank(null);
  };

  const addRank = () => {
    setRows((prev) => {
      const top = prev[0]?.value ?? 0;
      if (top >= MAX_SKILL_RANK) return prev;
      return [{ value: top + 1, skills: [] }, ...prev];
    });
  };

  const removeRank = () => {
    setRows((prev) => {
      const top = prev[0];
      if (!top || prev.length <= 1 || top.skills.length > 0) return prev;
      return prev.slice(1);
    });
  };

  const used = new Set(rows.flatMap((row) => row.skills));
  const available = SKILL_POOL.filter((name) => !used.has(name));

  const top = rows[0];
  const canAddRank = (top?.value ?? 0) < MAX_SKILL_RANK;
  const canRemoveRank =
    top !== undefined && top.value > 4 && top.skills.length === 0;
  const debtWord = Math.abs(free) === 1 ? 'очка' : 'очков';

  return (
    <section className="ske">
      <BlockHeader
        title="Навыки"
        aside={
          <BlockMenu
            label="Ступени: добавить или убрать"
            items={[
              { label: 'Добавить ступень', onSelect: addRank, disabled: !canAddRank },
              ...(canRemoveRank
                ? [{ label: 'Убрать ступень', onSelect: removeRank, danger: true }]
                : []),
            ]}
          />
        }
      />

      <div className="ske__body">
        {rows.map((row, rowIndex) => {
          const cap = baseCap(row.value);
          const filled = row.skills.length;
          const empties = Math.max(0, cap - filled);
          const extra = row.value === 1 && filled >= cap && free > 0;

          return (
            <div className={`ske__row${rowIndex === 0 ? ' ske__row--top' : ''}`} key={row.value}>
              <span className="ske__rankcell">
                <span className="ske__rank">+{row.value}</span>
              </span>

              <div className="ske__grid">
                {row.skills.map((name) => (
                  <span className="ske__block" key={`${row.value}-${name}`}>
                    <span className="ske__name">{name}</span>
                    <button
                      type="button"
                      className="ske__del"
                      aria-label={`Убрать ${name}`}
                      title="Убрать навык"
                      onClick={() => remove(row.value, name)}
                    >
                      ×
                    </button>
                    {canRaise(row.value) && (
                      <button
                        type="button"
                        className="ske__up"
                        aria-label={`Поднять ${name}`}
                        title="Поднять на ступень (1 очко)"
                        onClick={() => raise(row.value, name)}
                      >
                        <UpArrow />
                      </button>
                    )}
                  </span>
                ))}

                {Array.from({ length: empties }, (_, index) => {
                  const affordable = free >= row.value;
                  return (
                    <button
                      type="button"
                      className={`ske__slot${affordable ? ' ske__slot--ready' : ''}`}
                      key={`${row.value}-empty-${index}`}
                      title={
                        affordable
                          ? `Занять слот: ${row.value} ${pointsWord(row.value)}`
                          : `Не хватает очков: нужно ${row.value} ${pointsWord(row.value)}`
                      }
                      onClick={() => affordable && setMenuRank(row.value)}
                    >
                      <span className="ske__slot-plus" aria-hidden="true">+</span>
                    </button>
                  );
                })}

                {extra && (
                  <button
                    type="button"
                    className="ske__slot ske__slot--ready ske__slot--new"
                    onClick={() => setMenuRank(1)}
                    title="Добавить навык на +1"
                  >
                    <span className="ske__slot-plus" aria-hidden="true">+</span>
                  </button>
                )}
              </div>

              {rowIndex === 0 && (
                <div className="ske__lvc" aria-label={`Уровень ${level}, свободных очков ${free}`}>
                  <span className="ske__lv-line">
                    <span className="ske__lv-label">Уровень</span>
                    <span className="ske__lvstep">
                    <button
                      type="button"
                      className="ske__step"
                      aria-label="Повысить уровень"
                      title="Повысить уровень"
                      disabled={level >= MAX_LEVEL}
                      onClick={() => setLevel((l) => Math.min(MAX_LEVEL, l + 1))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="ske__step"
                      aria-label="Понизить уровень"
                      title="Понизить уровень"
                      disabled={level <= 1}
                      onClick={() => setLevel((l) => Math.max(1, l - 1))}
                    >
                      ↓
                    </button>
                    </span>
                    <span className="ske__lvnum">{level}</span>
                  </span>
                  <span className={`ske__lv-free${free < 0 ? ' ske__lv-free--debt' : ''}`}>
                    {free > 0 && (
                      <>
                        Доступно очков <b className="ske__lv-free-num">{free}</b>
                      </>
                    )}
                    {free < 0 && (
                      <>
                        Не хватает <b className="ske__lv-free-num">{Math.abs(free)}</b> {debtWord}
                      </>
                    )}
                  </span>
                  
                </div>
              )}
            </div>
          );
        })}
      </div>

      {menuRank !== null && (
        <>
          <button
            type="button"
            className="ske__scrim"
            aria-label="Закрыть список навыков"
            onClick={() => setMenuRank(null)}
          />
          <div className="ske__menu" role="menu">
            <span className="ske__menu-cap">
              Стоимость: {menuRank} {pointsWord(menuRank)}
            </span>
            {available.length === 0 && (
              <span className="ske__menu-empty">Все навыки уже в пирамиде</span>
            )}
            {available.map((name) => (
              <button
                type="button"
                className="ske__menu-item"
                key={name}
                onClick={() => addSkill(menuRank, name)}
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
