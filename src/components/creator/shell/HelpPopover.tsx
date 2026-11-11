import React, { useState, useEffect, useRef } from 'react';

interface HelpPopoverProps {
  help: { heading: string; intro: string; points?: string[]; example?: string };
  open: boolean;
  onClose: () => void;
}

export const HelpPopover: React.FC<HelpPopoverProps> = ({ help, open, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-label={help.heading}
      className="absolute right-0 top-full z-30 mt-2 w-[320px] rounded-lg border border-[#202734] bg-[#10141C] p-4 shadow-xl focus:outline-none max-[400px]:left-0 max-[400px]:right-auto max-[400px]:w-[calc(100vw-40px)]"
    >
      <h3 className="text-[13px] text-slate-200">{help.heading}</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{help.intro}</p>
      {help.points && (
        <ul className="mt-3 space-y-1.5">
          {help.points.map((p, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-slate-400">
              <span className="text-emerald-500">✓</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
      {help.example && (
        <p className="mt-3 border-l-2 border-slate-600 pl-3 text-[12px] italic text-slate-400">
          {help.example}
        </p>
      )}
    </div>
  );
};
