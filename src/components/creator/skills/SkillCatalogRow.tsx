import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { SkillDefinition } from '../../../types/fate';
import type { PyramidLevel } from '../../../utils/skillPyramid';
import { ACTION_HINTS, ACTION_LABELS } from '../../../config/skillActions';
import { SkillActionBadges } from './SkillActionBadges';

interface SkillCatalogRowProps {
  skill: SkillDefinition;
  expanded: boolean;
  onToggle: () => void;
  placedLevel: PyramidLevel | null;
  targetLevel: PyramidLevel | null;
  onPlace: () => void;
  canPlace: boolean;
}

export const SkillCatalogRow: React.FC<SkillCatalogRowProps> = ({
  skill,
  expanded,
  onToggle,
  placedLevel,
  targetLevel,
  onPlace,
  canPlace,
}) => {
  const examples = skill.examples?.slice(0, 2) ?? [];
  const isPlaced = placedLevel !== null;
  const isPlaceDisabled = isPlaced || !canPlace || targetLevel === null;

  return (
    <div className="border-t border-[#1C212B] first:border-t-0">
      <div className="flex h-11 items-center justify-between gap-2 -mx-2 px-2 transition hover:bg-[#141A24] sm:h-10">
        <button
          type="button"
          onClick={onPlace}
          disabled={isPlaceDisabled}
          aria-disabled={isPlaceDisabled}
          className={`min-w-0 flex-1 text-left text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 ${
            isPlaced
              ? 'cursor-default text-slate-400'
              : isPlaceDisabled
                ? 'cursor-not-allowed text-slate-500'
                : 'cursor-pointer text-slate-200 hover:text-white'
          }`}
        >
          <span className="truncate">{skill.nameRu}</span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5 -mr-2">
          {isPlaced && (
            <span className="rounded border border-[#1C212B] px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-slate-500">
              +{placedLevel}
            </span>
          )}

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={`Подробнее о навыке ${skill.nameRu}`}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded text-slate-400 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 sm:h-7 sm:w-7"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-150 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="-mx-2 px-2 pb-3 pt-1">
          <div className="border-l-2 border-slate-600 pl-3">
            <p className="text-xs leading-relaxed text-slate-300">{skill.description}</p>


            {examples.length > 0 && (
              <ul className="mt-2 space-y-1">
                {examples.map((example, index) => (
                  <li
                    key={index}
                    className="flex gap-1.5 text-xs leading-relaxed text-slate-400"
                  >
                    <span aria-hidden="true">–</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 space-y-1.5">
              <div className="mb-1">
                <SkillActionBadges actions={skill.actions} />
              </div>
              {skill.actions?.map((act) => (
                <p key={act} className="text-[11px] leading-relaxed text-slate-400">
                  <span className="font-medium text-slate-300">{ACTION_LABELS[act]}</span>
                  {' — '}
                  <span>{ACTION_HINTS[act]}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
