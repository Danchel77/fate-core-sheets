import React from 'react';
import { STUNT_PATTERNS } from '../../../config/stuntPatterns';
import type { StuntSuggestionInput } from '../../../services/geminiStunts';

interface StuntSuggestionsProps {
  suggestions: StuntSuggestionInput[];
  onApply: (suggestion: StuntSuggestionInput) => void;
}

export const StuntSuggestions: React.FC<StuntSuggestionsProps> = ({
  suggestions,
  onApply,
}) => {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Варианты от Gemini
      </span>
      <div className="space-y-2">
        {suggestions.map((item, idx) => {
          const patternDef = STUNT_PATTERNS.find((p) => p.id === item.template);
          const patternLabel = patternDef ? patternDef.label : item.template;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onApply(item)}
              aria-label={`Подставить вариант «${item.name}»`}
              className="w-full cursor-pointer rounded-lg border border-[#202734] bg-[#0B0E14] p-3 text-left transition hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  {item.name}
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
                  {patternLabel}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
