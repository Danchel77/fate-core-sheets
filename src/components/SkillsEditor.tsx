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

export type EditorSkill = { name: string };
export type EditorRow = { value: number; skills: EditorSkill[] };

export type SkillsEditorVariant = 1 | 2 | 3;

type Props = {
  variant?: SkillsEditorVariant;
  initial: EditorRow[];
  initialLevel?: number;
};

const MAX_RANK = 8;

function sumSpent(rows: EditorRow[]): number {
  return rows.reduce((sum, row) => sum + row.value * row.skills.length, 0);
}

function totalEarned(level: number, base = 20): number {
  return base + (level - 1);
}

/** Интерактивная пирамида навыков: уровень, кошелёк свободных очков, подъём и удаление. */
export function SkillsEditor({ variant = 1, initial, initialLevel = 4 }: Props) {
  const [rows, setRows] = useState<EditorRow[]>(initial);
  const [level, setLevel] = useState(initialLevel);
  const [menuOpen, setMenuOpen] = useState(false);

  const free = totalEarned(level) - sumSpent(rows);
  const counts = new Map(rows.map((row) => [row.value, row.skills.length]));

  const hasRow = (rank: number) => counts.has(rank);

  const canRaise = (rank: number) => {
    const above = counts.get(rank + 1) ?? 0;
    const here = counts.get(rank) ?? 0;
    return free > 0 && hasRow(rank + 1) && above + 1 <= here - 1;
  };

  const raise = (rank: number, name: string) => {
    setRows((prev) => {
      const next = prev.map((row) => ({
        value: row.value,
        skills: row.skills.filter((skill) => !(row.value === rank && skill.name === name)),
      }));
      return next.map((row) =>
        row.value === rank + 1 ? { ...row, skills: [...row.skills, { name }] } : row,
      );
    });
  };

  const remove = (rank: number, name: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.value === rank
          ? { ...row, skills: row.skills.filter((skill) => skill.name !== name) }
          : row,
      ),
    );
  };

  const addSkill = (name: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.value === 1 ? { ...row, skills: [...row.skills, { name }] } : row,
      ),
    );
    setMenuOpen(false);
  };

  const addRank = () => {
    setRows((prev) => {
      const top = prev[0]?.value ?? 0;
      if (top >= MAX_RANK) return prev;
      return [{ value: top + 1, skills: [] }, ...prev];
    });
  };

  const removeRank = () => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      if (prev[0].skills.length > 0) return prev;
      return prev.slice(1);
    });
  };

  const currentNames = new Set(rows.flatMap((row) => row.skills.map((skill) => skill.name)));
  const available = SKILL_POOL.filter((name) => !currentNames.has(name));

  const topCount = rows[0]?.skills.length ?? 0;
  const canRemoveRank = rows.length > 1 && topCount === 0;

  const levelCluster = (
    <div className={`ske__lvc ske__lvc--v${variant}`}>
      <span className="ske__lv-label">Уровень</span>
      <span className="ske__lvn">
        <span className="ske__lv-num">{level}</span>
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
      <span
        className={`ske__wallet${free < 0 ? ' ske__wallet--debt' : ''}`}
        aria-label={`Свободных очков: ${free}`}
        title={`Свободных очков: ${free}`}
      >
        {free !== 0 ? free : ''}
      </span>
    </div>
  );

  return (
    <section className={`ske ske--v${variant}`}>
      <BlockHeader
        variant="lozenge"
        title="Навыки"
        aside={variant === 2 ? levelCluster : undefined}
      />

      <div className="ske__body">
        {rows.map((row, index) => (
          <div className={`ske__row${index === 0 ? ' ske__row--top' : ''}`} key={row.value}>
            {index === 0 && (
              <span className="ske__rankctl">
                <button
                  type="button"
                  className="ske__rankbtn"
                  aria-label="Добавить ступень"
                  title="Добавить ступень (после крупной вехи)"
                  onClick={addRank}
                  disabled={(rows[0]?.value ?? 0) >= MAX_RANK}
                >
                  +
                </button>
                <button
                  type="button"
                  className="ske__rankbtn"
                  aria-label="Убрать верхнюю ступень"
                  title="Убрать верхнюю ступень"
                  onClick={removeRank}
                  disabled={!canRemoveRank}
                >
                  −
                </button>
              </span>
            )}

            <span className="ske__rank">+{row.value}</span>

            <div className="ske__grid">
              {row.skills.map((skill) => {
                const raisable = canRaise(row.value);
                return (
                  <span className="ske__block" key={skill.name}>
                    <span className="ske__name">{skill.name}</span>
                    <button
                      type="button"
                      className="ske__del"
                      aria-label={`Убрать ${skill.name}`}
                      title="Убрать навык"
                      onClick={() => remove(row.value, skill.name)}
                    >
                      ×
                    </button>
                    {raisable && (
                      <button
                        type="button"
                        className="ske__up"
                        aria-label={`Поднять ${skill.name}`}
                        title="Поднять на ступень (1 очко)"
                        onClick={() => raise(row.value, skill.name)}
                      >
                        ↑
                      </button>
                    )}
                  </span>
                );
              })}

              {row.value === 1 && free > 0 && (
                <button
                  type="button"
                  className="ske__add"
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  + навык
                </button>
              )}
            </div>

            {index === 0 && variant !== 2 && levelCluster}
          </div>
        ))}
      </div>

      {menuOpen && (
        <div className="ske__menu" role="menu">
          {available.length === 0 && <span className="ske__menu-empty">Все навыки уже в пирамиде</span>}
          {available.map((name) => (
            <button
              type="button"
              className="ske__menu-item"
              key={name}
              onClick={() => addSkill(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
