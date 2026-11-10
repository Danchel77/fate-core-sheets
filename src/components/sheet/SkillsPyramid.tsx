import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';

type SkillLevel = 6 | 5 | 4 | 3 | 2 | 1;

interface SkillsPyramidProps {
  character: Character;
  onChange: (updated: Character) => void;
}

export const SkillsPyramid: React.FC<SkillsPyramidProps> = ({ character, onChange }) => {
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
      <div className="mb-2 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          Навыки
        </h2>
      </div>

      <div>
        {rows.map(({ level, rating, titleRu, count }) => {
          const currentSkills = character.skills[level] || [];

          return (
            <div
              key={level}
              className="flex items-center gap-3 border-t border-[#1A202B] py-2.5 first:border-t-0 first:pt-0"
            >
              <div className="flex w-[72px] shrink-0 flex-col items-start justify-center sm:w-[82px]">
                <span className="font-mono text-[12px] font-bold text-slate-400">{rating}</span>
                <span className="text-[10px] leading-tight text-slate-500">{titleRu}</span>
              </div>

              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                {Array.from({ length: count }).map((_, slotIndex) => {
                  const currentSkillId = currentSkills[slotIndex] || '';
                  const skillDef = availableSkills.find((skill) => skill.id === currentSkillId);

                  if (skillDef) {
                    return (
                      <div
                        key={slotIndex}
                        className="group inline-flex min-h-[32px] max-w-full items-center gap-1 rounded-md border border-[#2A3444] bg-[#161C26] px-2 text-[11px] leading-tight text-slate-200 transition hover:border-slate-500 focus-within:border-slate-500"
                      >
                        <span className="min-w-0 break-words" title={skillDef.description}>
                          {skillDef.nameRu}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(level, slotIndex)}
                          className="ml-0.5 shrink-0 cursor-pointer rounded p-0.5 text-slate-600 opacity-0 transition hover:text-rose-300 focus:outline-none focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                          title="Очистить слот"
                          aria-label={`Убрать навык ${skillDef.nameRu}`}
                        >
                          <X className="h-3 w-3" />
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
                      className="inline-flex min-h-[32px] cursor-pointer items-center justify-center gap-1 rounded-md border border-dashed border-[#2A3444] px-2 text-[10px] text-slate-500 transition hover:border-slate-500 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Выбрать</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {activePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-[#2A3444] bg-[#121721] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1C212B] pb-3">
              <h3 className="font-fantasy text-base font-bold text-slate-100">
                Навык для уровня +{activePicker.level}
              </h3>
              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по названию или описанию..."
                className="w-full rounded-xl border border-[#1C212B] bg-[#0B0E14] py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const isAssigned = assignedSkillIds.has(skill.id);

                return (
                  <button
                    key={skill.id}
                    type="button"
                    disabled={isAssigned}
                    onClick={() => handleSetSkill(activePicker.level, activePicker.slotIndex, skill.id)}
                    className={`flex w-full items-start justify-between gap-3 rounded-xl border p-2.5 text-left transition ${
                      isAssigned
                        ? 'cursor-not-allowed border-[#1C212B] bg-[#0B0E14]/40 opacity-40'
                        : 'cursor-pointer border-[#1C212B] bg-[#0B0E14] hover:border-slate-600 hover:bg-[#161B22]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{skill.nameRu}</span>
                        <span className="text-[10px] text-slate-500">({skill.nameEn})</span>
                        {isAssigned && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400">
                            Уже выбран
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                        {skill.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredSkills.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  Ничего не найдено по запросу «{searchQuery}»
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
