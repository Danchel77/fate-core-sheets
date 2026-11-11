import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { STUNT_PATTERNS } from '../../../config/stuntPatterns';
import type { CharacterStunt } from '../../../types/fate';

interface StuntListItemProps {
  stunt: CharacterStunt;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export const StuntListItem: React.FC<StuntListItemProps> = ({
  stunt,
  index,
  onEdit,
  onDelete,
}) => {
  const patternDef = STUNT_PATTERNS.find((p) => p.id === stunt.template);
  const patternLabel = patternDef ? patternDef.label : stunt.template;
  const num = String(index + 1).padStart(2, '0');

  return (
    <div
      className={
        index === 0
          ? 'py-3'
          : 'border-t border-[#1C212B] py-3'
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-slate-500">
            {num}
          </span>
          <span className="truncate text-xs font-medium text-slate-200">
            {stunt.name}
          </span>
        </div>
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
          {patternLabel}
        </span>
      </div>

      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="text-[11px] leading-relaxed text-slate-400">
          {stunt.description}
        </p>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Изменить трюк"
            className="cursor-pointer text-slate-500 transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Удалить трюк"
            className="cursor-pointer text-slate-500 transition hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
