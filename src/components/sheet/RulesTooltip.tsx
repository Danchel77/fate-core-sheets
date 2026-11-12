import React, { useEffect, useId, useRef, useState } from 'react';

interface RulesTooltipProps {
  label: string;
  title: string;
  text: string;
  className?: string;
}

/**
 * Кликабельная сноска к термину Fate Core.
 * Подчёркивание — сплошное; иконки-вопросики не используются.
 *
 * Типографика панели намеренно совпадает с поповером восстановления:
 * Inter (font-sans), text-xs, заголовок text-slate-200, пояснение text-slate-300.
 * font-sans обязателен — триггер может быть обёрнут в font-fantasy.
 */
export const RulesTooltip: React.FC<RulesTooltipProps> = ({
  label,
  title,
  text,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

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

  return (
    <span ref={rootRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="cursor-pointer text-left underline decoration-gold-dim underline-offset-4 transition hover:text-gold-light hover:decoration-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {label}
      </button>

      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#2A3444] bg-[#0B0E14] p-3 font-sans text-xs font-normal normal-case leading-relaxed tracking-normal text-slate-300 shadow-2xl print:hidden"
        >
          <span className="mb-1 block font-medium text-slate-200">{title}</span>
          <span className="block">{text}</span>
        </span>
      )}
    </span>
  );
};
