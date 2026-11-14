import { useMemo, useState } from 'react';
import { BlockHeader } from './BlockHeader';

/** Пул навыков сеттинга «Ведьмак» — 18 штук. */
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
];

export type EditorSkill = { name: string; paid: number };
export type EditorRow = { value: number; skills: EditorSkill[] };

export type SkillsEditorVariant = 1 | 2 | 3;

type Props = {
  variant: SkillsEditorVariant;
  initial: EditorRow[];
  initialLevel?: number;
  initialFree?: number;
};

function plural(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'очко';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'очка';
  return 'очков';
}

/**
 * Интерактивная пирамида навыков: уровень, свободные очки, повышение/добавление/удаление.
 * Прототип — состояние живёт в компоненте и никуда не сохраняется.
 */
export function SkillsEditor({
  variant,
  initial,
  initialLevel = 2,
  initialFree = 1,
}: Props) {
  const [rows, setRows] = useState<EditorRow[]>(initial);
  const [level, setLevel] = useState(initialLevel);
  const [free, setFree] = useState(initialFree);
  const [menuOpen, setMenuOpen] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<number, number>();
    rows.forEach((r) => map.set(r.value, r.skills.length));
    return map;
  }, [rows]);

  const freeSkills = SKILL_POOL.filter(
    (name) => !rows.some((r) => r.skills.some((s) => s.name === name)),
  );

  const addRank = () => {
    const top = rows[0]?.value ?? 0;
    if (top >= 8) return;
    setRows([{ value: top + 1, skills: [] }, ...rows]);
  };

  const canRaise = (rank: number) => {
    const above = counts.get(rank + 1) ?? 0;
    const here = counts.get(rank) ?? 0;
    const hasRow = rows.some((r) => r.value === rank + 1);
    return free > 0 && hasRow && above + 1 <= here - 1;
  };

  const raise = (rank: number, name: string) => {
    if (!canRaise(rank)) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.value === rank) {
          return { value: r.value, skills: r.skills.filter((s) => s.name !== name) };
        }
        if (r.value === rank + 1) {
          const skill = prev.find((x) => x.value === rank)?.skills.find((s) => s.name === name);
          if (!skill) return r;
          return { value: r.value, skills: [...r.skills, { ...skill, paid: skill.paid + 1 }] };
        }
        return r;
      }),
    );
    setFree((f) => f - 1);
  };

  const remove = (rank: number, name: string) => {
    const skill = rows.find((r) => r.value === rank)?.skills.find((s) => s.name === name);
    if (!skill) return;
    setRows((prev) =>
      prev.map((r) =>
        r.value === rank ? { value: r.value, skills: r.skills.filter((s) => s.name !== name) } : r,
      ),
    );
    setFree((f) => f + skill.paid);
  };

  const addSkill = (name: string) => {
    if (free < 1) return;
    setRows((prev) =>
      prev.map((r) =>
        r.value === 1 ? { value: r.value, skills: [...r.skills, { name, paid: 1 }] } : r,
      ),
    );
    setFree((f) => f - 1);
    setMenuOpen(false);
  };

  const levelUp = () => {
    setLevel((l) => l + 1);
    setFree((f) => f + 1);
  };

  const levelDown = () => {
    if (free < 1) return;
    setLevel((l) => Math.max(1, l - 1));
    setFree((f) => f - 1);
  };

  return (
    <section className={`skblock ske ske--v${variant}`}>
      <BlockHeader variant="lozenge" title="Навыки" />

      <div className="ske__top">
        <div className="ske__top-left">
          <button
            className="ske__addrank"
            type="button"
            onClick={addRank}
            title="Добавить ступень — после крупной вехи"
            aria-label="Добавить ступень"
          >
            +
          </button>
        </div>
        <div className="ske__top-right">
          <div className="ske__level" data-free={free > 0 ? 'yes' : 'no'}>
            <button
              className="ske__lv-btn ske__lv-btn--minus"
              type="button"
              onClick={levelDown}
              disabled={free < 1}
              aria-label="Понизить уровень"
            >
              −
            </button>
            <span className="ske__lv-num">{level}</span>
            <button
              className="ske__lv-btn"
              type="button"
              onClick={levelUp}
              aria-label="Повысить уровень"
            >
              +
            </button>
            <span className="ske__lv-label">Уровень</span>
          </div>
          {free > 0 && (
            <span className="ske__free">
              свободно {free} {plural(free)}
            </span>
          )}
        </div>
      </div>

      <div className="ske__body">
        {rows.map((row) => (
          <div className="ske__row" key={row.value}>
            <span className="ske__rank">+{row.value}</span>
            <div className="ske__grid">
              {row.skills.map((skill) => {
                const can = canRaise(row.value);
                return (
                  <div className="ske__block" key={skill.name}>
                    <span className="ske__name">{skill.name}</span>
                    <span className="ske__tools">
                      <button
                        className="ske__icon ske__up"
                        type="button"
                        onClick={() => raise(row.value, skill.name)}
                        disabled={!can}
                        title={
                          can
                            ? 'Поднять на ступень — 1 очко'
                            : 'Нельзя поднять: не хватает опоры на нижней ступени или очков'
                        }
                        aria-label={`Поднять ${skill.name}`}
                      >
                        ↑
                      </button>
                      <button
                        className="ske__icon ske__del"
                        type="button"
                        onClick={() => remove(row.value, skill.name)}
                        title="Убрать навык"
                        aria-label={`Убрать ${skill.name}`}
                      >
                        ×
                      </button>
                    </span>
                  </div>
                );
              })}

              {free > 0 && row.value === 1 && (
                <button
                  className="ske__add"
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                >
                  + навык
                </button>
              )}
            </div>

            {menuOpen && row.value === 1 && free > 0 && (
              <div className="ske__menu" role="listbox">
                {freeSkills.length === 0 && <span className="ske__menu-empty">Все навыки уже в пирамиде</span>}
                {freeSkills.map((name) => (
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
          </div>
        ))}
      </div>
    </section>
  );
}
