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
        className="cursor-pointer text-left underline decoration-solid decoration-slate-500/70 underline-offset-4 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
      >
        {label}
      </button>

      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#2A3444] bg-[#0B0E14] p-3 text-[11px] font-normal normal-case leading-relaxed tracking-normal text-slate-300 shadow-2xl print:hidden"
        >
          <span className="mb-1 block font-semibold text-slate-100">{title}</span>
          <span className="block">{text}</span>
        </span>
      )}
    </span>
  );
};
