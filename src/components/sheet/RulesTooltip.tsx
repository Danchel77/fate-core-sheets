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
 * Язык панели — DESIGN.md §7 и поповер восстановления (RefreshControl):
 * тёмная плашка ink-raised с золотой рамкой, заголовок Cinzel капителью,
 * тело Inter text-xs. font-sans обязателен — триггер может быть обёрнут
 * в font-fantasy, а панель должна остаться Inter.
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
        data-kit="tooltip-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="cursor-pointer text-left underline decoration-gold-dim underline-offset-4 transition-colors duration-150 hover:text-gold-light hover:decoration-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
      >
        {label}
      </button>

      {isOpen && (
        <span
          id={tooltipId}
          data-kit="tooltip-panel"
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-none border border-gold bg-ink-raised p-3 text-left font-sans text-xs font-normal normal-case leading-relaxed tracking-normal text-text print:hidden"
        >
          <span className="mb-1 block font-fantasy text-sm text-gold-light [font-variant-caps:small-caps]">
            {title}
          </span>
          <span className="block font-sans text-xs leading-relaxed text-text">{text}</span>
        </span>
      )}
    </span>
  );
};
