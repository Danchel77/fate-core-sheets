import React, { useState } from 'react';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { Character } from '../../types/character';
import { CharacterStunt } from '../../types/fate';
import { SETTING_PRESETS } from '../../config/presets';
import { GeminiModal } from '../ai/GeminiModal';

interface StuntsSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
  onOpenApiKeySettings: () => void;
}

export const StuntsSection: React.FC<StuntsSectionProps> = ({
  character,
  onChange,
  onOpenApiKeySettings,
}) => {
  const [geminiModalState, setGeminiModalState] = useState<{
    isOpen: boolean;
    stuntIndex: number;
    skillName: string;
  }>({
    isOpen: false,
    stuntIndex: 0,
    skillName: '',
  });

  const settingPreset = SETTING_PRESETS[character.setting] || SETTING_PRESETS.witcher;

  const handleAddStunt = () => {
    const newStunt: CharacterStunt = {
      id: `stunt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      template: 'bonus',
      description: '',
    };

    onChange({
      ...character,
      stunts: [...character.stunts, newStunt],
    });
  };

  const handleUpdateStunt = (index: number, updatedFields: Partial<CharacterStunt>) => {
    const list = [...character.stunts];
    list[index] = { ...list[index], ...updatedFields };
    onChange({
      ...character,
      stunts: list,
    });
  };

  const handleDeleteStunt = (index: number) => {
    const list = character.stunts.filter((_, i) => i !== index);
    onChange({
      ...character,
      stunts: list,
    });
  };

  const openGemini = (stuntIndex: number) => {
    const topSkillId = character.skills[4]?.[0] || character.skills[3]?.[0] || 'fight';
    const skillDef = settingPreset.skills.find(s => s.id === topSkillId);
    setGeminiModalState({
      isOpen: true,
      stuntIndex,
      skillName: skillDef ? skillDef.nameRu : 'Фехтование',
    });
  };

  return (
    <div className="bg-[#121721] border border-[#1C212B] rounded-2xl p-5 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy font-bold text-base text-slate-100 tracking-wide uppercase">
          Трюки
        </h2>
        <button
          type="button"
          onClick={handleAddStunt}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B0E14] border border-[#1C212B] hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить трюк</span>
        </button>
      </div>

      {/* Stunts List */}
      <div className="space-y-2.5">
        {character.stunts.map((stunt, index) => (
          <div
            key={stunt.id}
            className="p-3 rounded-xl bg-[#0B0E14] border border-[#1C212B] focus-within:border-slate-700 transition group relative"
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <input
                type="text"
                value={stunt.name}
                onChange={(e) => handleUpdateStunt(index, { name: e.target.value })}
                placeholder={`Название трюка #${index + 1}...`}
                className="bg-transparent font-fantasy font-bold text-xs text-amber-300 placeholder-slate-600 focus:outline-none flex-1"
              />

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openGemini(index)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-amber-400 p-1 transition cursor-pointer"
                  title="Сформулировать через Gemini"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStunt(index)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 transition cursor-pointer"
                  title="Удалить трюк"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={stunt.description}
              onChange={(e) => handleUpdateStunt(index, { description: e.target.value })}
              placeholder="Формулировка правила трюка (+2 или замена навыка)..."
              className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        ))}

        {character.stunts.length === 0 && (
          <div className="text-center py-5 border border-dashed border-[#1C212B] rounded-xl text-xs text-slate-500">
            Нет добавленных трюков. Нажмите «Добавить трюк».
          </div>
        )}
      </div>

      {/* Gemini Modal for Stunts */}
      <GeminiModal
        isOpen={geminiModalState.isOpen}
        onClose={() => setGeminiModalState(prev => ({ ...prev, isOpen: false }))}
        type="stunt"
        skillName={geminiModalState.skillName}
        character={character}
        onSelectSuggestion={(title: string, description?: string) => {
          handleUpdateStunt(geminiModalState.stuntIndex, {
            name: title,
            description: description || '',
          });
        }}
        onOpenApiKeySettings={onOpenApiKeySettings}
      />
    </div>
  );
};
