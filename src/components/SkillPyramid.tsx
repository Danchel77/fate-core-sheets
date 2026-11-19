import { type ReactNode, useId, useLayoutEffect, useRef } from 'react';

export type PyramidRow = { value: number; skills: string[] };

type Props = {
  rows: PyramidRow[];
  /** Сколько карточек помещается на ступени. */
  cap: (value: number) => number;
  /** Клик по пустому слоту; вызывается только если `isReady` не запрещает. */
  onSlot: (value: number) => void;
  onRemove: (value: number, name: string) => void;
  onRaise?: (value: number, name: string) => void;
  canRaise?: (value: number) => boolean;
  isReady?: (value: number) => boolean;
  extraSlot?: boolean;
  /** Подписи ступеней словами: «+4 — Отлично» и т. п. */
  rankWords?: Record<number, string>;
  /** Правая колонка первой строки: уровень и свободные очки на листе. */
  topAside?: ReactNode;
  slotTitle?: (value: number) => string;
  /** Крупный вариант для конструктора: карточки выше, ступень шире. */
  big?: boolean;
};

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

/** Название навыка: ужимается по ширине карточки, но не переносится на вторую строку. */
function SkillName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      el.style.fontSize = '';
      const base = parseFloat(getComputedStyle(el).fontSize);
      const card = el.parentElement;
      if (!card) return;
      const style = getComputedStyle(el);
      const pad = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 6;
      const available = card.clientWidth - pad;

      const textWidth = () => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().width;
      };

      let size = base;
      el.style.fontSize = `${size}px`;
      while (size > 11 && textWidth() > available) {
        size = Math.max(11, size - 0.25);
        el.style.fontSize = `${size}px`;
      }
    };

    fit();
    window.addEventListener('resize', fit);
    const observer = new ResizeObserver(fit);
    if (el.parentElement) observer.observe(el.parentElement);
    return () => {
      window.removeEventListener('resize', fit);
      observer.disconnect();
    };
  }, [name]);

  return (
    <span ref={ref} className="ske__name">
      {name}
    </span>
  );
}

/**
 * Пирамида навыков: ступени, карточки, крестики и пустые слоты.
 * Один и тот же вид на листе и в конструкторе — разница только в размере.
 */
export function SkillPyramid({
  rows,
  cap,
  onSlot,
  onRemove,
  onRaise,
  canRaise,
  isReady,
  extraSlot = false,
  rankWords,
  topAside,
  slotTitle,
  big = false,
}: Props) {
  return (
    <div className={`ske__body${big ? ' ske__body--big' : ''}`}>
      {rows.map((row, rowIndex) => {
        const capacity = cap(row.value);
        const filled = row.skills.length;
        const empties = Math.max(0, capacity - filled);
        const affordable = isReady ? isReady(row.value) : true;

        return (
          <div className={`ske__row${rowIndex === 0 ? ' ske__row--top' : ''}`} key={row.value}>
            <span className="ske__rankcell">
              <span className="ske__rank">+{row.value}</span>
              {rankWords?.[row.value] && (
                <span className="ske__rankword">{rankWords[row.value]}</span>
              )}
            </span>

            <div className="ske__grid">
              {row.skills.map((name) => (
                <span className="ske__block" key={`${row.value}-${name}`}>
                  <SkillName name={name} />
                  <button
                    type="button"
                    className="ske__del"
                    aria-label={`Убрать ${name}`}
                    title="Убрать навык"
                    onClick={() => onRemove(row.value, name)}
                  >
                    ×
                  </button>
                  {canRaise?.(row.value) && onRaise && (
                    <button
                      type="button"
                      className="ske__up"
                      aria-label={`Поднять ${name}`}
                      title="Поднять на ступень (1 очко)"
                      onClick={() => onRaise(row.value, name)}
                    >
                      <UpArrow />
                    </button>
                  )}
                </span>
              ))}

              {Array.from({ length: empties }, (_, index) => (
                <button
                  type="button"
                  className={`ske__slot${affordable ? ' ske__slot--ready' : ''}`}
                  key={`${row.value}-empty-${index}`}
                  title={slotTitle?.(row.value) ?? `Занять слот: +${row.value}`}
                  onClick={() => affordable && onSlot(row.value)}
                >
                  <span className="ske__slot-plus" aria-hidden="true">+</span>
                </button>
              ))}

              {extraSlot && row.value === 1 && (
                <button
                  type="button"
                  className="ske__slot ske__slot--ready ske__slot--new"
                  onClick={() => onSlot(1)}
                  title="Добавить навык на +1"
                >
                  <span className="ske__slot-plus" aria-hidden="true">+</span>
                </button>
              )}
            </div>

            {rowIndex === 0 && topAside}
          </div>
        );
      })}
    </div>
  );
}
