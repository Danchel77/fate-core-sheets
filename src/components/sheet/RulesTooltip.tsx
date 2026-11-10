import React, { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface RulesTooltipProps {
  label: string;
  text: string;
  className?: string;
}

/**
 * Небольшая кликабельная сноска к термину Fate Core.
 * Работает и на тач-устройствах: открывается по клику, закрывается по Esc/клику вне.
 */
export const RulesTooltip: React.FC<RulesTooltipProps> = ({ label, text, className = '' }) => {
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
    <span ref={rootRef} className={`relative inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="inline-flex items-center gap-1 text-left underline decoration-dotted decoration-slate-500/70 underline-offset-4 hover:text-white transition cursor-help"
      >
        <span>{label}</span>
        <HelpCircle className="w-3 h-3 text-slate-500" aria-hidden="true" />
      </button>

      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#2A3444] bg-[#0B0E14] p-3 text-[11px] font-normal normal-case leading-relaxed tracking-normal text-slate-300 shadow-2xl print:hidden"
        >
          {text}
        </span>
      )}
    </span>
  );
};
