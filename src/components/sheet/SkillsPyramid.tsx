import React from 'react';
import { Shield, Sparkles, AlertCircle, X } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';

interface SkillsPyramidProps {
  character: Character;
  onChange: (updated: Character) => void;
}

export const SkillsPyramid: React.FC<SkillsPyramidProps> = ({ character, onChange }) => {
  const settingPreset = SETTING_PRESETS[character.setting] || SETTING_PRESETS.witcher;
  const availableSkills = settingPreset.skills;

  // Flatten all assigned skills to avoid duplicate assignment
  const assignedSkillIds = new Set<string>([
    ...(character.skills[4] || []),
    ...(character.skills[3] || []),
    ...(character.skills[2] || []),
    ...(character.skills[1] || []),
  ]);

  const handleSetSkill = (level: 4 | 3 | 2 | 1, slotIndex: number, newSkillId: string) => {
    const currentList = [...(character.skills[level] || [])];
    
    // Fill gaps if any
    while (currentList.length <= slotIndex) {
      currentList.push('');
    }

    if (!newSkillId) {
      // Remove
      currentList.splice(slotIndex, 1);
    } else {
      currentList[slotIndex] = newSkillId;
    }

    // Clean empty items
    const filtered = currentList.filter(Boolean);

    onChange({
      ...character,
      skills: {
        ...character.skills,
        [level]: filtered,
      },
    });
  };

  const rows: { level: 4 | 3 | 2 | 1; titleRu: string; count: number; color: string; badge: string }[] = [
    { level: 4, titleRu: 'Отлично (+4)', count: 1, color: 'border-amber-500/60 bg-amber-500/10 text-amber-300', badge: 'bg-amber-500 text-black' },
    { level: 3, titleRu: 'Хорошо (+3)', count: 2, color: 'border-amber-600/40 bg-amber-600/10 text-amber-200', badge: 'bg-amber-600 text-black' },
    { level: 2, titleRu: 'Сносно (+2)', count: 3, color: 'border-sky-500/40 bg-sky-500/10 text-sky-200', badge: 'bg-sky-600 text-white' },
    { level: 1, titleRu: 'Посредственно (+1)', count: 4, color: 'border-slate-600/40 bg-slate-800/40 text-slate-300', badge: 'bg-slate-700 text-white' },
  ];

  return (
    <div className="bg-[#161B22] border border-[#2E3440] rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="font-fantasy font-bold text-lg text-amber-400 tracking-wide flex items-center gap-2">
            Пирамида навыков (Skill Pyramid)
          </h2>
          <p className="text-xs text-slate-400">
            Официальная структура Fate Core: 1 навык на +4, 2 на +3, 3 на +2, 4 на +1.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map(({ level, titleRu, count, color, badge }) => {
          const currentSkills = character.skills[level] || [];

          return (
            <div key={level} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-fantasy ${badge}`}>
                  {titleRu}
                </span>
                <span className="text-[11px] text-slate-500">
                  {currentSkills.length} из {count} {count === 1 ? 'слота' : 'слотов'}
                </span>
              </div>

              {/* Slots row */}
              <div className={`grid gap-2.5 ${
                count === 1 ? 'grid-cols-1' :
                count === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                count === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}>
                {Array.from({ length: count }).map((_, slotIndex) => {
                  const currentSkillId = currentSkills[slotIndex] || '';
                  const skillDef = availableSkills.find(s => s.id === currentSkillId);

                  return (
                    <div
                      key={slotIndex}
                      className={`relative rounded-xl border p-2.5 transition duration-150 ${
                        currentSkillId ? color : 'border-slate-800 bg-[#0B0E14] border-dashed hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <select
                          value={currentSkillId}
                          onChange={(e) => handleSetSkill(level, slotIndex, e.target.value)}
                          className="w-full bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="" className="bg-[#161B22] text-slate-400">
                            — Выберите навык —
                          </option>
                          {availableSkills.map((sk) => {
                            const isAssignedElsewhere = assignedSkillIds.has(sk.id) && sk.id !== currentSkillId;
                            return (
                              <option
                                key={sk.id}
                                value={sk.id}
                                disabled={isAssignedElsewhere}
                                className="bg-[#161B22] text-slate-200"
                              >
                                {sk.nameRu} {isAssignedElsewhere ? '(Уже выбран)' : ''}
                              </option>
                            );
                          })}
                        </select>

                        {currentSkillId && (
                          <button
                            type="button"
                            onClick={() => handleSetSkill(level, slotIndex, '')}
                            className="p-0.5 text-slate-400 hover:text-red-400 rounded transition"
                            title="Очистить слот"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {skillDef ? (
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {skillDef.description}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-600 italic">
                          Пустой слот +{level}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-[#0B0E14] border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          Все остальные навыки, не вошедшие в пирамиду, автоматически считаются на уровне <strong>Так себе (0)</strong>.
        </span>
      </div>
    </div>
  );
};
