import React from 'react';
import { STUNT_PATTERNS, StuntTemplate } from '../../../config/stuntPatterns';

interface StuntPatternPickerProps {
  selected: StuntTemplate | null;
  onSelect: (id: StuntTemplate) => void;
}

export const StuntPatternPicker: React.FC<StuntPatternPickerProps> = ({ selected, onSelect }) => {
  const selectedPattern = selected ? STUNT_PATTERNS.find(p => p.id === selected) : null;

  return (
    <div>
      <div role="group" aria-label="Паттерн трюка" className="grid grid-cols-3 gap-2">
        {STUNT_PATTERNS.map((pattern) => (
          <button
            key={pattern.id}
            type="button"
            onClick={() => onSelect(pattern.id)}
            aria-pressed={selected === pattern.id}
            className={`rounded-lg border px-3 py-2 text-left transition focus-visible:ring-2 focus-visible:ring-slate-400/30 ${
              selected === pattern.id ? 'border-slate-400 bg-[#1A212C]' : 'border-[#202734] hover:border-slate-600'
            }`}
          >
            <span className="text-[13px] font-semibold text-slate-200">{pattern.label}</span>
            <span className="hidden text-[11px] text-slate-500 sm:block">{pattern.caption}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 border-l-2 border-slate-600 pl-3">
        {selectedPattern ? (
          <>
            <p className="font-mono text-[11px] leading-relaxed text-slate-400">{selectedPattern.formula}</p>
            <p className="mt-1 text-[12px] italic text-slate-500">{selectedPattern.example}</p>
          </>
        ) : (
          <p className="text-[11px] text-slate-500">Выберите паттерн — здесь появится формула и пример.</p>
        )}
      </div>
    </div>
  );
};
