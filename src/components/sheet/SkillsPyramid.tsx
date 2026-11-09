import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';

interface SkillsPyramidProps {
  character: Character;
  onChange: (updated: Character) => void;
}

export const SkillsPyramid: React.FC<SkillsPyramidProps> = ({ character, onChange }) => {
  const settingPreset = SETTING_PRESETS[character.setting] || SETTING_PRESETS.witcher;
  const availableSkills = settingPreset.skills;

  // Active slot being edited: { level, slotIndex }
  const [activePicker, setActivePicker] = useState<{ level: 4 | 3 | 2 | 1; slotIndex: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Set of all currently assigned skills
  const assignedSkillIds = new Set<string>([
    ...(character.skills[4] || []),
    ...(character.skills[3] || []),
    ...(character.skills[2] || []),
    ...(character.skills[1] || []),
  ]);

  const handleSetSkill = (level: 4 | 3 | 2 | 1, slotIndex: number, newSkillId: string) => {
    const currentList = [...(character.skills[level] || [])];
    
    while (currentList.length <= slotIndex) {
      currentList.push('');
    }

    if (!newSkillId) {
      currentList.splice(slotIndex, 1);
    } else {
      currentList[slotIndex] = newSkillId;
    }

    const filtered = currentList.filter(Boolean);

    onChange({
      ...character,
      skills: {
        ...character.skills,
        [level]: filtered,
      },
    });

    setActivePicker(null);
    setSearchQuery('');
  };

  const handleRemoveSkill = (level: 4 | 3 | 2 | 1, slotIndex: number) => {
    const currentList = [...(character.skills[level] || [])];
    currentList.splice(slotIndex, 1);
    const filtered = currentList.filter(Boolean);

    onChange({
      ...character,
      skills: {
        ...character.skills,
        [level]: filtered,
      },
    });
  };

  const rows: { 
    level: 4 | 3 | 2 | 1; 
    rating: string; 
    titleRu: string; 
    count: number; 
    gridClass: string;
  }[] = [
    { 
      level: 4, 
      rating: '+4', 
      titleRu: 'Великолепно', 
      count: 1, 
      gridClass: 'grid grid-cols-1 sm:grid-cols-2',
    },
    { 
      level: 3, 
      rating: '+3', 
      titleRu: 'Хорошо', 
      count: 2, 
      gridClass: 'grid grid-cols-1 sm:grid-cols-2',
    },
    { 
      level: 2, 
      rating: '+2', 
      titleRu: 'Сносно', 
      count: 3, 
      gridClass: 'grid grid-cols-1 sm:grid-cols-3',
    },
    { 
      level: 1, 
      rating: '+1', 
      titleRu: 'Посредственно', 
      count: 4, 
      gridClass: 'grid grid-cols-1 sm:grid-cols-2 gap-2',
    },
  ];

  const filteredSkills = availableSkills.filter(s =>
    s.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#121721] border border-[#1C212B] rounded-2xl p-5 shadow-sm relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy font-bold text-base text-slate-100 tracking-wide uppercase">
          Навыки
        </h2>
      </div>

      {/* Pyramid Rows */}
      <div className="space-y-2.5">
        {rows.map(({ level, rating, titleRu, count, gridClass }) => {
          const currentSkills = character.skills[level] || [];

          return (
            <div key={level} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {/* Level Rating Badge */}
              <div className="flex items-center gap-1.5 min-w-[120px] shrink-0 pt-0.5 sm:pt-0">
                <span className="px-2 py-0.5 rounded-md bg-[#0B0E14] border border-[#1C212B] text-amber-400/90 font-bold font-mono text-xs">
                  {rating}
                </span>
                <span className="text-xs font-medium text-slate-300">
                  {titleRu}
                </span>
              </div>

              {/* Slots Row */}
              <div className={`${gridClass} gap-2 flex-1 w-full`}>
                {Array.from({ length: count }).map((_, slotIndex) => {
                  const currentSkillId = currentSkills[slotIndex] || '';
                  const skillDef = availableSkills.find(s => s.id === currentSkillId);

                  if (skillDef) {
                    return (
                      <div
                        key={slotIndex}
                        className="group relative flex items-center justify-between min-h-[36px] px-2.5 py-1.5 rounded-lg border border-[#1C212B] bg-[#0B0E14] hover:border-slate-700 text-xs text-slate-200 transition shadow-xs"
                      >
                        <span 
                          className="line-clamp-2 leading-tight pr-1 select-none text-[11px] sm:text-xs" 
                          title={skillDef.description}
                        >
                          {skillDef.nameRu}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(level, slotIndex)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition p-0.5 rounded shrink-0 ml-1 cursor-pointer"
                          title="Очистить слот"
                        >
                          <X className="w-3.5 h-3.5" />
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
                      className="flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 py-1.5 rounded-lg border border-dashed border-[#1C212B] hover:border-slate-700 bg-[#0B0E14]/40 hover:bg-[#0B0E14] text-slate-500 hover:text-slate-300 text-xs transition duration-150 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-[11px]">Выбрать</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Skill Picker Modal */}
      {activePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#121721] border border-[#1C212B] rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1C212B] pb-3">
              <div>
                <h3 className="font-fantasy font-bold text-base text-slate-100">
                  Выбор навыка для уровня +{activePicker.level}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или описанию..."
                className="w-full pl-9 pr-3 py-2 bg-[#0B0E14] border border-[#1C212B] focus:border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Skills List */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {filteredSkills.map((sk) => {
                const isAssigned = assignedSkillIds.has(sk.id);

                return (
                  <button
                    key={sk.id}
                    type="button"
                    disabled={isAssigned}
                    onClick={() => handleSetSkill(activePicker.level, activePicker.slotIndex, sk.id)}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-start justify-between gap-3 transition ${
                      isAssigned
                        ? 'border-[#1C212B] bg-[#0B0E14]/40 opacity-40 cursor-not-allowed'
                        : 'border-[#1C212B] bg-[#0B0E14] hover:bg-[#161B22] hover:border-slate-700 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-200">
                          {sk.nameRu}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({sk.nameEn})
                        </span>
                        {isAssigned && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Уже выбран
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {sk.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredSkills.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  Ничего не найдено по запросу «{searchQuery}»
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
