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
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Восстановление: ${refresh}. Изменить базовое значение`}
        className="cursor-pointer text-[13px] font-semibold tabular-nums text-slate-100 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10141C]"
      >
        {refresh}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Восстановление"
          className="absolute left-1/2 top-full z-50 mt-2 w-[260px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-[#2A3444] bg-[#0B0E14] p-3 font-sans text-xs text-left normal-case shadow-2xl sm:left-0 sm:translate-x-0 print:hidden"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Восстановление
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer rounded p-0.5 text-slate-500 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
              aria-label="Закрыть"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-300">Базовое</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeBase(base - 1)}
                disabled={base <= MIN_BASE}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-[#2A3444] text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Уменьшить базовое восстановление"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="w-7 text-center font-mono text-sm font-bold tabular-nums text-white">
                {base}
              </span>

              <button
                type="button"
                onClick={() => changeBase(base + 1)}
                disabled={base >= MAX_BASE}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-[#2A3444] text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Увеличить базовое восстановление"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-3 text-slate-400">
            <span>Трюки сверх трёх</span>
            <span className="tabular-nums">{extraStunts > 0 ? `−${extraStunts}` : '0'}</span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#202734] pt-2">
            <span className="text-slate-300">Итог</span>
            <span className="font-semibold tabular-nums text-slate-100">{refresh}</span>
          </div>

        </div>
      )}
    </span>
  );
};
