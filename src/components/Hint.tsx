import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

const BASE = import.meta.env.BASE_URL;
const TEXTURE = `${BASE}assets/textures/parchment-soft.jpg`;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

const cornerMask = {
  maskImage: `url(${CORNER})`,
  WebkitMaskImage: `url(${CORNER})`,
};

const MARGIN = 10;
const GAP = 10;
const POINTER_SIZE = 5.5;

export type HintVariant = 'pointer' | 'float' | 'side';

type Placement = 'top' | 'bottom' | 'left' | 'right';

type Pos = {
  top: number;
  left: number;
  placement: Placement;
  /** Смещение ромба-указателя в координатах плашки. */
  offset: number;
};

type Props = {
  variant: HintVariant;
  title: string;
  text: string;
  children: ReactNode;
};

/**
 * Слово-подсказка: затухающее подчёркивание, по наведению или клику всплывает
 * плашка с тем же видом, что у заголовков листа. Плашка рендерится в портал
 * поверх страницы, поэтому не ломает вёрстку и не обрезается блоками.
 */
export function Hint({ variant, title, text, children }: Props) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const pinned = useRef(false);
  const canHover = useRef(false);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);

  useEffect(() => {
    canHover.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const close = useCallback(() => {
    clearTimer();
    pinned.current = false;
    setOpen(false);
    setPos(null);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const pop = popRef.current;
    if (!trigger || !pop) return;

    const t = trigger.getBoundingClientRect();
    const p = pop.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let placement: Placement = variant === 'side' ? 'right' : 'top';
    let top = 0;
    let left = 0;
    let offset = 0;

    if (placement === 'top') {
      top = t.top - p.height - GAP;
      if (top < MARGIN) {
        placement = 'bottom';
        top = t.bottom + GAP;
      }
      const centered = t.left + t.width / 2 - p.width / 2;
      const fitsLeft = t.left - 12 >= MARGIN;
      const fitsRight = t.right - p.width + 12 <= vw - MARGIN;
      if (centered >= MARGIN && centered + p.width <= vw - MARGIN) {
        left = centered;
      } else if (fitsLeft) {
        left = t.left - 12;
      } else if (fitsRight) {
        left = t.right - p.width + 12;
      } else {
        left = centered;
      }
    } else {
      left = t.right + GAP;
      if (left + p.width > vw - MARGIN) {
        placement = 'left';
        left = t.left - p.width - GAP;
      }
      top = t.top + t.height / 2 - p.height / 2;
    }

    left = Math.min(Math.max(MARGIN, left), vw - p.width - MARGIN);
    top = Math.min(Math.max(MARGIN, top), vh - p.height - MARGIN);

    if (placement === 'top' || placement === 'bottom') {
      offset = Math.min(
        Math.max(16, t.left + t.width / 2 - left),
        p.width - 16,
      );
    } else {
      offset = Math.min(Math.max(16, t.top + t.height / 2 - top), p.height - 16);
    }

    setPos({
      top: top + window.scrollY,
      left: left + window.scrollX,
      placement,
      offset,
    });
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onResize = () => close();

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const show = () => {
    clearTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    if (pinned.current) return;
    clearTimer();
    timer.current = window.setTimeout(() => {
      setOpen(false);
      setPos(null);
    }, 160);
  };

  const handleClick = () => {
    if (open && pinned.current) {
      close();
      return;
    }
    pinned.current = true;
    show();
  };

  const pointerStyle = pos
    ? pos.placement === 'top' || pos.placement === 'bottom'
      ? { left: pos.offset - POINTER_SIZE }
      : { top: pos.offset - POINTER_SIZE }
    : undefined;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="hint__word"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={handleClick}
        onPointerEnter={() => {
          if (canHover.current) show();
        }}
        onPointerLeave={scheduleClose}
        onFocus={show}
        onBlur={scheduleClose}
      >
        {children}
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            id={id}
            role="tooltip"
            className={`hint-pop hint-pop--${variant} hint-pop--${pos?.placement ?? 'top'}`}
            style={{
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              visibility: pos ? 'visible' : 'hidden',
            }}
            onPointerEnter={clearTimer}
            onPointerLeave={scheduleClose}
          >
            <span
              className="hint-pop__texture"
              aria-hidden="true"
              style={{ backgroundImage: `url(${TEXTURE})` }}
            />
            {CORNERS.map((corner) => (
              <i
                key={corner}
                className={`hint-pop__corner hint-pop__corner--${corner}`}
                aria-hidden="true"
                style={cornerMask}
              />
            ))}
            <span className="hint-pop__title">{title}</span>
            <span className="hint-pop__text">{text}</span>
            <span className="hint-pop__pointer" aria-hidden="true" style={pointerStyle} />
          </div>,
          document.body,
        )}
    </>
  );
}
