import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';
import { FieldLabel } from '../common/FieldLabel';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';

type SkillLevel = 6 | 5 | 4 | 3 | 2 | 1;

interface SkillsPyramidProps {
  character: Character;
  onChange: (updated: Character) => void;
  showHeader?: boolean;
}

export const SkillsPyramid: React.FC<SkillsPyramidProps> = ({
  character,
  onChange,
  showHeader = true,
}) => {
  const settingPreset = SETTING_PRESETS[character.setting] || SETTING_PRESETS.witcher;
  const availableSkills = settingPreset.skills;

  const [activePicker, setActivePicker] = useState<{
    level: SkillLevel;
    slotIndex: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const assignedSkillIds = new Set<string>([
    ...(character.skills[6] || []),
    ...(character.skills[5] || []),
    ...(character.skills[4] || []),
    ...(character.skills[3] || []),
    ...(character.skills[2] || []),
    ...(character.skills[1] || []),
  ]);

  const handleSetSkill = (level: SkillLevel, slotIndex: number, newSkillId: string) => {
    const currentList = [...(character.skills[level] || [])];

    while (currentList.length <= slotIndex) {
      currentList.push('');
    }

    if (!newSkillId) {
      currentList.splice(slotIndex, 1);
    } else {
      currentList[slotIndex] = newSkillId;
    }

    onChange({
      ...character,
      skills: {
        ...character.skills,
        [level]: currentList.filter(Boolean),
      },
    });

    setActivePicker(null);
    setSearchQuery('');
  };

  const handleRemoveSkill = (level: SkillLevel, slotIndex: number) => {
    const currentList = [...(character.skills[level] || [])];
    currentList.splice(slotIndex, 1);

    onChange({
      ...character,
      skills: {
        ...character.skills,
        [level]: currentList.filter(Boolean),
      },
    });
  };

  const levelMeta: Record<SkillLevel, { rating: string; titleRu: string }> = {
    6: { rating: '+6', titleRu: 'Фантастично' },
    5: { rating: '+5', titleRu: 'Великолепно' },
    4: { rating: '+4', titleRu: 'Отлично' },
    3: { rating: '+3', titleRu: 'Хорошо' },
    2: { rating: '+2', titleRu: 'Неплохо' },
    1: { rating: '+1', titleRu: 'Средне' },
  };

  const skillCap = Math.max(4, Math.min(6, character.skillCap ?? 4));
  const rows: {
    level: SkillLevel;
    rating: string;
    titleRu: string;
    count: number;
  }[] = [];

  for (let level = skillCap; level >= 1; level--) {
    const lvl = level as SkillLevel;
    const count = lvl >= 5 ? 1 : lvl === 4 ? 1 : lvl === 3 ? 2 : lvl === 2 ? 3 : 4;
    rows.push({ level: lvl, ...levelMeta[lvl], count });
  }

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="relative">
      {showHeader && (
        <div className="mb-2 border-b border-line pb-2.5">
          <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
            Навыки
          </h2>
        </div>
      )}

      <div className="table w-full border-collapse">
        {rows.map(({ level, rating, titleRu, count }) => {
          const currentSkills = character.skills[level] || [];

          return (
            <div key={level} data-kit="sheet-skill-level" className="table-row">
              <div className="table-cell whitespace-nowrap border-t border-line py-px pr-3 align-middle">
                <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="font-fantasy text-base leading-none tabular-nums text-gold-light">
                    {rating}
                  </span>
                  <span className="text-xs leading-none text-text-muted">{titleRu}</span>
                </span>
              </div>

              <div className="table-cell border-t border-line py-px align-middle">
                <div className="flex flex-wrap items-center gap-1">
                  {Array.from({ length: count }).map((_, slotIndex) => {
                    const currentSkillId = currentSkills[slotIndex] || '';
                    const skillDef = availableSkills.find((skill) => skill.id === currentSkillId);

                    if (skillDef) {
                      return (
                        <div
                          key={slotIndex}
                          data-kit="sheet-skill-slot"
                          className="group inline-flex min-h-[28px] max-w-full items-center gap-1 border border-line bg-ink-raised px-2 py-0.5 font-fantasy text-sm text-text transition-colors duration-150 hover:border-gold-dim focus-within:border-gold-dim"
                        >
                          <span className="min-w-0 break-words" title={skillDef.description}>
                            {skillDef.nameRu}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(level, slotIndex)}
                            className="ml-0.5 shrink-0 cursor-pointer text-text-muted opacity-100 transition-colors duration-150 hover:text-danger focus:outline-none focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
                            title="Очистить слот"
                            aria-label={`Убрать навык ${skillDef.nameRu}`}
                          >
                            <X className="size-3" strokeWidth={1.5} />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slotIndex}
                        type="button"
                        onClick={() => {
                          setActivePicker({ level, slotIndex });
                          setSearchQuery('');
                        }}
                        className="inline-flex min-h-[28px] cursor-pointer items-center justify-center gap-1 border border-dashed border-line px-2 py-0.5 text-xs text-text-muted transition-colors duration-150 hover:border-gold-dim hover:text-gold-light focus:outline-none focus-visible:border-gold-dim focus-visible:text-gold-light"
                      >
                        <Plus className="size-3" strokeWidth={1.5} />
                        <span>Выбрать</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={activePicker !== null}
        onClose={() => {
          setActivePicker(null);
          setSearchQuery('');
        }}
        title="Выбор навыка"
        maxWidthClass="max-w-lg"
      >
        {activePicker ? (
          <div className="flex flex-col gap-3">
            <div>
              <FieldLabel>Навык для уровня +{activePicker.level}</FieldLabel>
              <p className="mt-1 font-sans text-xs text-text-muted">
                Выберите навык из пресета сеттинга. Уже занятые навыки недоступны.
              </p>
            </div>

            <Input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по названию или описанию..."
              autoFocus
            />

            <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const isAssigned = assignedSkillIds.has(skill.id);

                return (
                  <button
                    key={skill.id}
                    type="button"
                    disabled={isAssigned}
                    onClick={() => handleSetSkill(activePicker.level, activePicker.slotIndex, skill.id)}
                    className={`flex w-full items-start justify-between gap-3 border p-2.5 text-left transition-colors duration-150 focus:outline-none focus-visible:border-gold ${
                      isAssigned
                        ? 'cursor-not-allowed border-line bg-ink-frame opacity-40'
                        : 'cursor-pointer border-line bg-ink-raised hover:border-gold-dim'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-sans text-sm text-text">{skill.nameRu}</span>
                        {isAssigned ? (
                          <span className="border border-line px-1.5 py-0.5 font-sans text-xs text-text-muted">
                            Уже выбран
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 font-sans text-xs leading-snug text-text-muted">
                        {skill.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredSkills.length === 0 ? (
                <div className="py-6 text-center font-sans text-xs text-text-muted">
                  Ничего не найдено по запросу «{searchQuery}»
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};
