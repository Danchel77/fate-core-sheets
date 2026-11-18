import { useId, useState } from 'react';
import { BlockHeader } from './BlockHeader';
import { BlockMenu } from './BlockMenu';
import { Hint } from './Hint';
import { SkillPicker } from './SkillPicker';
import { SkillPyramid, type PyramidRow } from './SkillPyramid';
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

type Row = PyramidRow;

type Props = {
  initial: InitRow[];
  initialLevel?: number;
  /** Пирамида и уровень: лист сохраняет правку сразу. */
  onChange?: (patch: { ladder: InitRow[]; level: number }) => void;
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

/** Стрелка уровня: крупнее карточной, с гранёным «пером» в основании. */
function LevelArrow({ direction }: { direction: 'up' | 'down' }) {
  const gid = `ske-lvl-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg
      className={`ske__lvarrow${direction === 'down' ? ' ske__lvarrow--down' : ''}`}
      viewBox="0 0 18 18"
      width="11"
      height="11"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--arrow-gold-hi)' }} />
          <stop offset="0.46" style={{ stopColor: 'var(--arrow-gold-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--arrow-gold-lo)' }} />
        </linearGradient>
      </defs>
      <path
        d="M9 1.4 16.2 8.8h-3.9v4.6L9 16.6l-3.3-3.2V8.8H1.8Z"
        fill={`url(#${gid})`}
        stroke="var(--arrow-edge)"
        strokeWidth="0.65"
        strokeLinejoin="round"
      />
      <path
        d="M9 5.1v7.1"
        fill="none"
        stroke="var(--arrow-gold-hi)"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/** Интерактивная пирамида навыков: слоты стартовой пирамиды, уровень и свободные очки. */
export function SkillsEditor({ initial, initialLevel = 4, onChange }: Props) {
  const [rows, setRows] = useState<Row[]>(() => buildRows(initial));
  const [level, setLevel] = useState(initialLevel);
  const [menuRank, setMenuRank] = useState<number | null>(null);

  const publish = (nextRows: Row[], nextLevel: number) => {
    onChange?.({
      ladder: nextRows.map(({ value, skills }) => ({ value, skills: [...skills] })),
      level: nextLevel,
    });
  };

  const changeLevel = (next: number) => {
    const clamped = Math.min(MAX_LEVEL, Math.max(1, next));
    if (clamped === level) return;
    setLevel(clamped);
    publish(rows, clamped);
  };

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
    const next = rows.map((row) => {
      if (row.value === rank) {
        return { ...row, skills: row.skills.filter((skill) => skill !== name) };
      }
      if (row.value === rank + 1) {
        return { ...row, skills: [...row.skills, name] };
      }
      return row;
    });
    setRows(next);
    publish(next, level);
  };

  const remove = (rank: number, name: string) => {
    const next = rows.map((row) =>
      row.value === rank ? { ...row, skills: row.skills.filter((skill) => skill !== name) } : row,
    );
    setRows(next);
    publish(next, level);
  };

  const addSkill = (rank: number, name: string) => {
    const next = rows.map((row) =>
      row.value === rank ? { ...row, skills: [...row.skills, name] } : row,
    );
    setRows(next);
    setMenuRank(null);
    publish(next, level);
  };

  const addRank = () => {
    const top = rows[0]?.value ?? 0;
    if (top >= MAX_SKILL_RANK) return;
    const next = [{ value: top + 1, skills: [] }, ...rows];
    setRows(next);
    publish(next, level);
  };

  const removeRank = () => {
    const top = rows[0];
    if (!top || rows.length <= 1 || top.skills.length > 0) return;
    const next = rows.slice(1);
    setRows(next);
    publish(next, level);
  };

  const used = new Set(rows.flatMap((row) => row.skills));
  const available = SKILL_POOL.filter((name) => !used.has(name));

  const top = rows[0];
  const canAddRank = (top?.value ?? 0) < MAX_SKILL_RANK;
  const canRemoveRank = top !== undefined && top.value > 4 && top.skills.length === 0;
  const debtWord = Math.abs(free) === 1 ? 'очка' : 'очков';
  const extraSlot = free > 0 && rows.some((row) => row.value === 1 && row.skills.length >= baseCap(1));

  const levelBlock = (
    <div className="ske__lvc" aria-label={`Уровень ${level}, свободных очков ${free}`}>
      <span className="ske__lv-line">
        <span className="ske__lv-label">
          <Hint
            title="Уровень"
            text="Условное значение мастерства персонажа. Чем выше уровень, тем больше очков можно потратить на навыки и тем больше навыков доступно."
          >
            Уровень
          </Hint>
        </span>
        <span className="ske__lv-controls">
          <span className="ske__lvsteps">
            <button
              type="button"
              className="ske__step"
              aria-label="Повысить уровень"
              title="Повысить уровень"
              disabled={level >= MAX_LEVEL}
              onClick={() => changeLevel(level + 1)}
            >
              <LevelArrow direction="up" />
            </button>
            <button
              type="button"
              className="ske__step"
              aria-label="Понизить уровень"
              title="Понизить уровень"
              disabled={level <= 1}
              onClick={() => changeLevel(level - 1)}
            >
              <LevelArrow direction="down" />
            </button>
          </span>
          <span className="ske__lvnum">{level}</span>
        </span>
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
  );

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

      <SkillPyramid
        rows={rows}
        cap={baseCap}
        isReady={(value) => free >= value}
        canRaise={canRaise}
        onSlot={setMenuRank}
        onRemove={remove}
        onRaise={raise}
        extraSlot={extraSlot}
        slotTitle={(value) =>
          free >= value
            ? `Занять слот: ${value} ${pointsWord(value)}`
            : `Не хватает очков: нужно ${value} ${pointsWord(value)}`
        }
        topAside={levelBlock}
      />

      {menuRank !== null && (
        <SkillPicker
          rank={menuRank}
          skills={[...available]}
          note={`Стоимость: ${menuRank} ${pointsWord(menuRank)}`}
          onPick={(name) => addSkill(menuRank, name)}
          onClose={() => setMenuRank(null)}
        />
      )}
    </section>
  );
}
