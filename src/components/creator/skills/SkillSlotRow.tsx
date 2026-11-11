import React from 'react';
import { X } from 'lucide-react';
import type { PyramidLevel } from '../../../utils/skillPyramid';

interface SkillSlotRowProps {
  name: string;
  level: PyramidLevel;
  onRemove?: () => void;
  disabled?: boolean;
}

export const SkillSlotRow: React.FC<SkillSlotRowProps> = ({
  name,
  level,
  onRemove,
  disabled = false,
}) => {
  return (
    <div
      data-skill-level={level}
      className="flex h-8 items-center justify-between gap-2 rounded-md border border-[#202734] bg-[#0B0E14] px-2.5 text-[13px] transition hover:border-slate-600"
    >
      <span className="min-w-0 truncate text-slate-200">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Снять ${name}`}
          className="shrink-0 cursor-pointer rounded p-0.5 text-slate-500 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
