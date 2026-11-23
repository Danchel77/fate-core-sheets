import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { HintPopover, type HintPos } from './Hint';

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
  /** Описание навыка для плашки при наведении. */
  describe?: (name: string) => string | undefined;
  /** Открыть замену стоящего навыка. Если не передан, карточка не редактируется. */
  onEdit?: (value: number, name: string) => void;
};

const TIP_DELAY = 800;
const TIP_GAP = 10;
const TIP_MARGIN = 10;

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
  describe,
  onEdit,
}: Props) {
  /* На тач-экране карточка сама раскрывает свой крестик; на десктопе — наведение. */
  const [touch, setTouch] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [tip, setTip] = useState<{ name: string; text: string; rect: DOMRect } | null>(null);
  const [tipPos, setTipPos] = useState<HintPos | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipTimer = useRef<number | null>(null);
  const tipCloseTimer = useRef<number | null>(null);
  const tipId = useId();

  const clearTipTimers = () => {
    if (tipTimer.current !== null) window.clearTimeout(tipTimer.current);
    if (tipCloseTimer.current !== null) window.clearTimeout(tipCloseTimer.current);
    tipTimer.current = null;
    tipCloseTimer.current = null;
  };

  const closeTip = () => {
    clearTipTimers();
    setTip(null);
    setTipPos(null);
  };

  const showTip = (name: string, text: string, element: HTMLElement) => {
    clearTipTimers();
    setTip({ name, text, rect: element.getBoundingClientRect() });
  };

  const scheduleTip = (name: string, text: string, element: HTMLElement) => {
    clearTipTimers();
    // Старая плашка не должна висеть, пока ждём новую: иначе при быстром
    // переводе мыши с навыка на навык остаётся описание предыдущего.
    setTip(null);
    setTipPos(null);
    if (!text) return;
    tipTimer.current = window.setTimeout(() => {
      tipTimer.current = null;
      setTip({ name, text, rect: element.getBoundingClientRect() });
    }, TIP_DELAY);
  };

  const scheduleTipClose = () => {
    // Отложенное открытие могло ещё не сработать; без отмены плашка
    // появится уже после того, как мышь ушла с навыка.
    clearTipTimers();
    tipCloseTimer.current = window.setTimeout(() => {
      tipCloseTimer.current = null;
      setTip(null);
      setTipPos(null);
    }, 140);
  };

  useLayoutEffect(() => {
    if (!tip) {
      setTipPos(null);
      return;
    }
    const pop = tipRef.current;
    if (!pop) return;
    const p = pop.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let side: HintPos['side'] = 'bottom';
    let top = tip.rect.bottom + TIP_GAP;
    if (top + p.height > vh - TIP_MARGIN) {
      if (tip.rect.top - TIP_GAP - p.height > TIP_MARGIN) {
        side = 'top';
        top = tip.rect.top - TIP_GAP - p.height;
      } else {
        top = Math.max(TIP_MARGIN, vh - p.height - TIP_MARGIN);
      }
    }
    let left = tip.rect.left + tip.rect.width / 2 - p.width / 2;
    left = Math.min(Math.max(TIP_MARGIN, left), vw - p.width - TIP_MARGIN);
    const offsetX = Math.min(
      Math.max(16, tip.rect.left + tip.rect.width / 2 - left),
      p.width - 16,
    );
    setTipPos({
      top: top + window.scrollY,
      left: left + window.scrollX,
      side,
      offset: 0,
      offsetX,
    });
  }, [tip]);

  useEffect(() => {
    if (!tip) return;
    const onMove = () => closeTip();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [tip]);

  useEffect(() => {
    const query = window.matchMedia('(hover: none)');
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const clear = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('.ske__grid')) {
        setRevealed(null);
        closeTip();
      }
    };
    document.addEventListener('pointerdown', clear);
    return () => document.removeEventListener('pointerdown', clear);
  }, []);

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
                <span
                  className={`ske__block${revealed === name ? ' ske__block--revealed' : ''}${
                    onEdit ? ' ske__block--editable' : ''
                  }`}
                  key={`${row.value}-${name}`}
                  role={onEdit ? 'button' : undefined}
                  tabIndex={onEdit ? 0 : undefined}
                  aria-label={onEdit ? `Навык ${name}. Открыть замену` : undefined}
                  onPointerEnter={(event) => {
                    if (!touch) scheduleTip(name, describe?.(name) ?? '', event.currentTarget);
                  }}
                  onPointerLeave={() => {
                    if (!touch) scheduleTipClose();
                  }}
                  onFocus={(event) => {
                    if (!touch && event.target === event.currentTarget) {
                      showTip(name, describe?.(name) ?? '', event.currentTarget);
                    }
                  }}
                  onBlur={(event) => {
                    if (event.target === event.currentTarget) closeTip();
                  }}
                  onKeyDown={(event) => {
                    if (!onEdit || event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      closeTip();
                      setRevealed(null);
                      onEdit(row.value, name);
                    }
                  }}
                  onClick={(event) => {
                    if (touch) {
                      if (tip?.name === name) {
                        closeTip();
                        setRevealed(null);
                        onEdit?.(row.value, name);
                        return;
                      }
                      setRevealed(name);
                      showTip(name, describe?.(name) ?? '', event.currentTarget);
                      return;
                    }
                    if (onEdit) {
                      closeTip();
                      setRevealed(null);
                      onEdit(row.value, name);
                    }
                  }}
                >
                  <span className="ske__name">{name}</span>
                  <button
                    type="button"
                    className="ske__del"
                    aria-label={`Убрать ${name}`}
                    title="Убрать навык"
                    onClick={(event) => {
                      event.stopPropagation();
                      // На сенсорном листе удаляем только когда крестик уже показан:
                      // иначе случайное касание угла плашки стирает навык.
                      if (touch && !big && revealed !== name) return;
                      closeTip();
                      setRevealed(null);
                      onRemove(row.value, name);
                    }}
                  >
                    ×
                  </button>
                  {canRaise?.(row.value) && onRaise && (
                    <button
                      type="button"
                      className="ske__up"
                      aria-label={`Поднять ${name}`}
                      title="Поднять на ступень (1 очко)"
                      onClick={(event) => {
                        event.stopPropagation();
                        closeTip();
                        setRevealed(null);
                        onRaise(row.value, name);
                      }}
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
      {tip && (
        <HintPopover
          id={tipId}
          title={tip.name}
          text={tip.text}
          pos={tipPos}
          popRef={tipRef}
          passive
        />
      )}
    </div>
  );
}
