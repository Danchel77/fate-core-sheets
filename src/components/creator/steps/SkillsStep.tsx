import React, { useState } from 'react';
import type { Character } from '../../../types/character';
import { SETTING_PRESETS } from '../../../config/presets';
import {
  BASE_PYRAMID_CAPACITY,
  getActiveLevel,
  getPlacedLevel,
  getPyramidLevels,
  isBasePyramidComplete,
  placeSkill,
  removeSkill,
} from '../../../utils/skillPyramid';
import type { PyramidLevel } from '../../../utils/skillPyramid';
import { SkillPyramidColumn } from '../skills/SkillPyramidColumn';
import { SkillCatalog } from '../skills/SkillCatalog';

interface SkillsStepProps {
  draft: Character;
  onPatch: (patch: Partial<Character>) => void;
}

const BASE_LEVELS: PyramidLevel[] = [4, 3, 2, 1];

export const SkillsStep: React.FC<SkillsStepProps> = ({ draft, onPatch }) => {
  const [extraSlots, setExtraSlots] = useState<number>(() =>
    Math.max(0, (draft.skills?.[1]?.length ?? 0) - 4)
  );

  const catalog = SETTING_PRESETS[draft.setting].skills;
  const baseComplete = isBasePyramidComplete(draft.skills);
  const levels = getPyramidLevels(draft.skills, extraSlots);
  const targetLevel = getActiveLevel(levels);
  const filledLevel1 = draft.skills[1]?.length ?? 0;
  // Держим открытым максимум один свободный доп. слот: кнопка доступна,
  // только когда все добавленные доп. слоты уже заняты навыками.
  const freeExtraSlots = Math.max(
    0,
    BASE_PYRAMID_CAPACITY[1] + extraSlots - filledLevel1
  );
  const canAddExtraSlot = baseComplete && freeExtraSlots === 0;

  const placed: Record<string, PyramidLevel> = {};
  for (const level of BASE_LEVELS) {
    for (const skillId of draft.skills[level] ?? []) {
      placed[skillId] = level;
    }
  }

  const handlePlace = (skillId: string) => {
    if (targetLevel === null) return;
    const levelState = levels.find((item) => item.level === targetLevel);

    // Страховка от клика: не выходим за вместимость ступени и не дублируем навык.
    if (!levelState || levelState.filled >= levelState.capacity) return;
    if (getPlacedLevel(draft.skills, skillId) !== null) return;

    onPatch({ skills: placeSkill(draft.skills, skillId, targetLevel) });
  };

  const handleRemove = (skillId: string) => {
    onPatch({ skills: removeSkill(draft.skills, skillId) });
  };

  const handleAddExtraSlot = () => {
    setExtraSlots((current) => current + 1);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,272px)_minmax(0,1fr)] xl:gap-8">
      <SkillPyramidColumn
        levels={levels}
        skills={draft.skills}
        catalog={catalog}
        extraSlots={extraSlots}
        onRemove={handleRemove}
        onAddExtraSlot={handleAddExtraSlot}
        canAddExtraSlot={canAddExtraSlot}
      />

      <div className="xl:border-l xl:border-[#1C212B] xl:pl-8">
        <SkillCatalog
          skills={catalog}
          placed={placed}
          targetLevel={targetLevel}
          onPlace={handlePlace}
        />
      </div>
    </div>
  );
};
