import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';

interface RefreshControlProps {
  baseRefresh: number;
  refresh: number;
  stuntCount: number;
  freeStunts: number;
  onChangeBase: (value: number) => void;
}

const MIN_BASE = 3;
const MAX_BASE = 10;

/**
 * Итоговое восстановление — это вычисляемое число.
 * Клик по нему открывает небольшую панель, где меняется только база.
 */
export const RefreshControl: React.FC<RefreshControlProps> = ({
  baseRefresh,
  refresh,
  stuntCount,
  freeStunts,
  onChangeBase,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  const base = Math.min(MAX_BASE, Math.max(MIN_BASE, baseRefresh || MIN_BASE));
  const extraStunts = Math.max(0, stuntCount - freeStunts);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const changeBase = (next: number) => {
    onChangeBase(Math.min(MAX_BASE, Math.max(MIN_BASE, next)));
  };

  return (
    <span ref={rootRef} className="relative inline-flex items-center">
      <button
        type="button"
        data-kit="sheet-refresh"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Восстановление: ${refresh}. Изменить базовое значение`}
        className="cursor-pointer font-fantasy text-base tabular-nums text-text transition-colors duration-150 hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        {refresh}
      </button>

      {isOpen && (
        <div
          data-kit="sheet-refresh-panel"
          role="dialog"
          aria-label="Восстановление"
          className="absolute right-0 top-full z-50 mt-2 w-[260px] max-w-[calc(100vw-2rem)] border border-gold bg-ink-raised p-3 text-left font-sans text-xs normal-case text-text print:hidden"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-fantasy text-sm text-gold-light [font-variant-caps:small-caps]">
              Восстановление
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть"
              className="cursor-pointer text-text-muted transition-colors duration-150 hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-raised"
            >
              <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 py-1.5">
            <span className="font-sans text-xs uppercase tracking-wider text-text-muted">
              Базовое
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeBase(base - 1)}
                disabled={base <= MIN_BASE}
                aria-label="Уменьшить базовое восстановление"
                className="flex size-7 cursor-pointer items-center justify-center border border-gold bg-transparent text-gold-light transition-colors duration-150 hover:bg-wine focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-raised disabled:cursor-not-allowed disabled:border-line disabled:bg-ink-frame disabled:text-text-muted disabled:hover:bg-ink-frame"
              >
                <Minus className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>

              <span className="w-7 text-center font-fantasy text-base tabular-nums text-text">
                {base}
              </span>

              <button
                type="button"
                onClick={() => changeBase(base + 1)}
                disabled={base >= MAX_BASE}
                aria-label="Увеличить базовое восстановление"
                className="flex size-7 cursor-pointer items-center justify-center border border-gold bg-transparent text-gold-light transition-colors duration-150 hover:bg-wine focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-raised disabled:cursor-not-allowed disabled:border-line disabled:bg-ink-frame disabled:text-text-muted disabled:hover:bg-ink-frame"
              >
                <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line py-1.5">
            <span className="font-sans text-xs text-text-muted">Трюки сверх трёх</span>
            <span className="font-sans text-sm tabular-nums text-text">
              {extraStunts > 0 ? `−${extraStunts}` : '0'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line py-1.5">
            <span className="font-sans text-xs uppercase tracking-wider text-text-muted">
              Итог
            </span>
            <span className="font-fantasy text-base tabular-nums text-text">{refresh}</span>
          </div>
        </div>
      )}
    </span>
  );
};
