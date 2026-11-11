import React, { useState } from 'react';
import type { SkillDefinition } from '../../../types/fate';
import type { PyramidLevel } from '../../../utils/skillPyramid';
import { SkillCatalogRow } from './SkillCatalogRow';

interface SkillCatalogProps {
  skills: SkillDefinition[];
  placed: Record<string, PyramidLevel>;
  targetLevel: PyramidLevel | null;
  onPlace: (skillId: string) => void;
}

const CATEGORY_GROUPS: { category: SkillDefinition['category']; title: string }[] = [
  { category: 'physical', title: 'Физические' },
  { category: 'mental', title: 'Ментальные' },
  { category: 'social', title: 'Социальные' },
];

export const SkillCatalog: React.FC<SkillCatalogProps> = ({
  skills,
  placed,
  targetLevel,
  onPlace,
}) => {
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const toggleSkill = (skillId: string) => {
    setExpandedSkillId((current) => (current === skillId ? null : skillId));
  };

  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        Каталог навыков
      </h3>

      <p className="mt-2 text-[11px] text-slate-500">
        {targetLevel !== null
          ? `Нажмите навык, чтобы поставить его на +${targetLevel}`
          : 'Пирамида заполнена'}
      </p>

      <div className="mt-4 space-y-4">
        {CATEGORY_GROUPS.map((group) => {
          const groupSkills = skills.filter(
            (skill) => skill.category === group.category
          );
          if (groupSkills.length === 0) return null;

          const placedInGroup = groupSkills.filter((s) => placed[s.id] !== undefined).length;

          return (
            <section key={group.category}>
              <div className="mb-1 flex items-center justify-between">
                <h4 className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  {group.title}
                </h4>
                <span className="font-mono text-[10px] tabular-nums text-slate-500">
                  {placedInGroup}/{groupSkills.length}
                </span>
              </div>
              <div className="mt-1 space-y-0">
                {groupSkills.map((skill) => (
                  <SkillCatalogRow
                    key={skill.id}
                    skill={skill}
                    expanded={expandedSkillId === skill.id}
                    onToggle={() => toggleSkill(skill.id)}
                    placedLevel={placed[skill.id] ?? null}
                    targetLevel={targetLevel}
                    onPlace={() => onPlace(skill.id)}
                    canPlace={targetLevel !== null}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
