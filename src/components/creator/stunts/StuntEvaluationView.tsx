import React from 'react';
import { STUNT_PATTERNS } from '../../../config/stuntPatterns';
import type { StuntEvaluation } from '../../../services/geminiStunts';

interface StuntEvaluationViewProps {
  evaluation: StuntEvaluation;
}

export const StuntEvaluationView: React.FC<StuntEvaluationViewProps> = ({
  evaluation,
}) => {
  const patternDef = STUNT_PATTERNS.find((p) => p.id === evaluation.pattern);
  const patternLabel = patternDef ? patternDef.label : evaluation.pattern;

  return (
    <div className="rounded-lg border border-[#202734] bg-[#0B0E14] p-4 space-y-3">
      <div>
        <div className="flex items-baseline gap-1">
          <span className="font-fantasy text-4xl font-bold text-slate-100">
            {evaluation.score}
          </span>
          <span className="text-xs text-slate-500">/10</span>
        </div>
        <p className="mt-1 text-xs font-medium leading-snug text-slate-300">
          {evaluation.verdict}
        </p>
      </div>

      {evaluation.strengths.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Сильные места
          </span>
          <ul className="space-y-1">
            {evaluation.strengths.map((str, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-300"
              >
                <span className="select-none font-bold text-emerald-400">+</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.improvements.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Что улучшить
          </span>
          <ul className="space-y-1">
            {evaluation.improvements.map((imp, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-300"
              >
                <span className="select-none font-bold text-amber-400">–</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-[#1C212B] pt-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
          {patternLabel}
        </span>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {evaluation.patternNote}
        </p>
      </div>
    </div>
  );
};
