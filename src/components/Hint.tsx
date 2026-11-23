import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
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

/* Наведение открывает плашку не сразу: если мышь просто прошла по слову,
   подсказка не выскакивает. Фокус с клавиатуры и клик работают сразу. */
const OPEN_DELAY = 200;

const MARGIN = 10;
const GAP = 10;
const POINTER_SIZE = 5.5;

export type Side = 'right' | 'left' | 'top' | 'bottom';

export type HintPos = {
  top: number;
  left: number;
  side: Side;
  /** Смещение ромба-указателя по вертикали в координатах плашки (плашки слева/справа). */
  offset: number;
  /** Смещение ромба-указателя по горизонтали (плашки сверху/снизу). */
  offsetX: number;
};

type Props = {
  title: string;
  text: string;
  children: ReactNode;
};

/** Плашка подсказки. Вынесена отдельно, чтобы её могли показывать и другие элементы листа. */
export function HintPopover({
  id,
  title,
  text,
  pos,
  popRef,
  onPointerEnter,
  onPointerLeave,
  passive = false,
}: {
  id: string;
  title: string;
  text: string;
  pos: HintPos | null;
  popRef: RefObject<HTMLDivElement | null>;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  passive?: boolean;
}) {
  return createPortal(
    <div
      ref={popRef}
      id={id}
      role="tooltip"
      className={`hint-pop hint-pop--${pos?.side ?? 'right'}`}
      style={{
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        visibility: pos ? 'visible' : 'hidden',
        pointerEvents: passive ? 'none' : undefined,
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
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
      <span
        className="hint-pop__pointer"
        aria-hidden="true"
        style={
          pos
            ? pos.side === 'top' || pos.side === 'bottom'
              ? { left: pos.offsetX - POINTER_SIZE }
              : { top: pos.offset - POINTER_SIZE }
            : undefined
        }
      />
    </div>,
    document.body,
  );
}

/**
 * Слово-подсказка: затухающее подчёркивание, по наведению или клику справа
 * всплывает плашка в духе листа. Плашка рендерится в портал поверх страницы,
 * поэтому не ломает вёрстку и не обрезается блоками.
 */
export function Hint({ title, text, children }: Props) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const pinned = useRef(false);
  const canHover = useRef(false);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<HintPos | null>(null);

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

    /* На телефоне места слева и справа нет — плашка встаёт над словом или под ним. */
    const compact = window.matchMedia('(max-width: 760px)').matches;

    if (compact) {
      let side: Side = 'bottom';
      let top = t.bottom + GAP;
      if (top + p.height > vh - MARGIN) {
        side = 'top';
        top = t.top - p.height - GAP;
      }
      let left = t.left + t.width / 2 - p.width / 2;

      top = Math.min(Math.max(MARGIN, top), vh - p.height - MARGIN);
      left = Math.min(Math.max(MARGIN, left), vw - p.width - MARGIN);

      const offsetX = Math.min(
        Math.max(16, t.left + t.width / 2 - left),
        p.width - 16,
      );

      setPos({
        top: top + window.scrollY,
        left: left + window.scrollX,
        side,
        offset: 0,
        offsetX,
      });
      return;
    }

    let side: Side = 'right';
    let left = t.right + GAP;
    if (left + p.width > vw - MARGIN) {
      side = 'left';
      left = t.left - p.width - GAP;
    }
    let top = t.top + t.height / 2 - p.height / 2;

    left = Math.min(Math.max(MARGIN, left), vw - p.width - MARGIN);
    top = Math.min(Math.max(MARGIN, top), vh - p.height - MARGIN);

    const offset = Math.min(
      Math.max(16, t.top + t.height / 2 - top),
      p.height - 16,
    );

    setPos({
      top: top + window.scrollY,
      left: left + window.scrollX,
      side,
      offset,
      offsetX: 0,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        /* Подсказка поверх окна: Esc закрывает её, а не окно под ней. */
        event.stopPropagation();
        close();
      }
    };
    const onResize = () => close();

    document.addEventListener('pointerdown', onPointerDown);
    /* Фаза перехвата: иначе окно, открытое раньше подсказки, закроется первым. */
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const show = () => {
    clearTimer();
    setOpen(true);
  };

  const scheduleOpen = () => {
    if (open) return;
    clearTimer();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      pinned.current = false;
      setOpen(true);
    }, OPEN_DELAY);
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
          if (canHover.current) scheduleOpen();
        }}
        onPointerLeave={scheduleClose}
        onFocus={show}
        onBlur={scheduleClose}
      >
        {children}
      </button>

      {open && (
        <HintPopover
          id={id}
          title={title}
          text={text}
          pos={pos}
          popRef={popRef}
          onPointerEnter={clearTimer}
          onPointerLeave={scheduleClose}
        />
      )}
    </>
  );
}
