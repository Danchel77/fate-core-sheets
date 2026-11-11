import React from 'react';
import { Lock, Plus } from 'lucide-react';
import type { Character } from '../../../types/character';
import type { SkillDefinition } from '../../../types/fate';
import {
  BASE_PYRAMID_CAPACITY,
  BASE_SKILL_COUNT,
  countSkills,
  isBasePyramidComplete,
} from '../../../utils/skillPyramid';
import type { PyramidLevel, PyramidLevelState } from '../../../utils/skillPyramid';
import { SkillSlotRow } from './SkillSlotRow';

interface SkillPyramidColumnProps {
  levels: PyramidLevelState[];
  skills: Character['skills'];
  catalog: SkillDefinition[];
  extraSlots: number;
  onRemove: (skillId: string) => void;
  onAddExtraSlot: () => void;
  canAddExtraSlot: boolean;
}

const LEVEL_NAMES: Record<PyramidLevel, string> = {
  4: 'Отлично',
  3: 'Хорошо',
  2: 'Неплохо',
  1: 'Средне',
};

export const SkillPyramidColumn: React.FC<SkillPyramidColumnProps> = ({
  levels,
  skills,
  catalog,
  extraSlots,
  onRemove,
  onAddExtraSlot,
  canAddExtraSlot,
}) => {
  const baseComplete = isBasePyramidComplete(skills);
  const totalSkills = countSkills(skills);
  const orderedLevels = [...levels].sort((a, b) => b.level - a.level);

  const skillName = (skillId: string): string =>
    catalog.find((skill) => skill.id === skillId)?.nameRu ?? skillId;

  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Пирамида</h3>

      <div className="mt-3">
        {orderedLevels.map((levelState) => {
          const capacityForDisplay = Math.max(
            levelState.level === 1 && !baseComplete
              ? BASE_PYRAMID_CAPACITY[1]
              : levelState.level === 1
                ? BASE_PYRAMID_CAPACITY[1] + extraSlots
                : levelState.capacity,
            levelState.filled
          );
          const placedSkills = skills[levelState.level] ?? [];
          const showGhostSlot = levelState.active && levelState.filled < capacityForDisplay;

          return (
            <div
              key={levelState.level}
              className="border-t border-[#1C212B] py-3 first:border-t-0 first:pt-0"
            >
              <div className="flex h-7 items-center gap-2">
                <span
                  className={`w-7 shrink-0 font-fantasy text-sm font-semibold tabular-nums ${
                    levelState.active
                      ? 'text-slate-200'
                      : levelState.locked
                        ? 'text-slate-500'
                        : 'text-slate-400'
                  }`}
                >
                  +{levelState.level}
                </span>
                <span
                  className={`text-xs ${
                    levelState.active
                      ? 'text-slate-200'
                      : levelState.locked
                        ? 'text-slate-500'
                        : 'text-slate-400'
                  }`}
                >
                  {LEVEL_NAMES[levelState.level]}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  {levelState.locked && <Lock className="h-3 w-3 text-slate-500" />}
                  <span className="text-[11px] tabular-nums text-slate-500">
                    {levelState.filled}/{capacityForDisplay}
                  </span>
                </span>
              </div>

              {(placedSkills.length > 0 || showGhostSlot) && (
                <div className="mt-2 space-y-1.5">
                  {placedSkills.map((skillId) => (
                    <SkillSlotRow
                      key={skillId}
                      level={levelState.level}
                      name={skillName(skillId)}
                      disabled={levelState.locked}
                      onRemove={() => onRemove(skillId)}
                    />
                  ))}
                  {showGhostSlot && (
                    <div
                      data-skill-level={levelState.level}
                      className="flex h-8 items-center rounded-md border border-dashed border-[#202734] px-2.5 text-xs text-slate-500"
                    >
                      Выберите навык справа
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {baseComplete && (
        <button
          type="button"
          onClick={onAddExtraSlot}
          disabled={!canAddExtraSlot}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-[#202734] px-3 py-2 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[#202734] disabled:hover:text-slate-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить навык
        </button>
      )}

      {totalSkills > BASE_SKILL_COUNT && (
        <p className="mt-2 text-[11px] leading-snug text-amber-400/90">
          {totalSkills} навыков: персонаж сильнее обычного старта
        </p>
      )}
    </div>
  );
};
