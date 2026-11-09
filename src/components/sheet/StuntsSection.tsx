import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Award, Zap, Shield, Sword } from 'lucide-react';
import { Character } from '../../types/character';
import { CharacterStunt, StuntTemplate } from '../../types/fate';
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
    if (character.stunts.length >= 5) {
      alert('В Fate Core рекомендуется не более 5 трюков (чтобы сохранить хотя бы 1 пункт Освежения).');
      return;
    }

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
    // Pick the highest skill name if available
    const topSkillId = character.skills[4]?.[0] || character.skills[3]?.[0] || 'fight';
    const skillDef = settingPreset.skills.find(s => s.id === topSkillId);
    setGeminiModalState({
      isOpen: true,
      stuntIndex,
      skillName: skillDef ? skillDef.nameRu : 'Фехтование',
    });
  };

  return (
    <div className="bg-[#161B22] border border-[#2E3440] rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="font-fantasy font-bold text-lg text-amber-400 tracking-wide flex items-center gap-2">
            Трюки персонажа (Stunts)
          </h2>
          <p className="text-xs text-slate-400">
            Особые приемы, знаки, мутации и модификаторы действий (+2 или замена навыка).
          </p>
        </div>

        {/* Free Stunts Counter / Refresh Impact */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Бесплатно: <strong className="text-amber-400">{Math.min(3, character.stunts.length)} / 3</strong>
          </span>
          {character.stunts.length > 3 && (
            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-[10px] text-red-300 font-semibold">
              -{character.stunts.length - 3} к Освежению
            </span>
          )}
        </div>
      </div>

      {/* Stunts List */}
      <div className="space-y-4">
        {character.stunts.map((stunt, index) => (
          <div
            key={stunt.id}
            className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#2E3440] focus-within:border-amber-500/60 transition group relative"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <input
                type="text"
                value={stunt.name}
                onChange={(e) => handleUpdateStunt(index, { name: e.target.value })}
                placeholder={`Название трюка #${index + 1} (например, «Пируэт ведьмака»)`}
                className="bg-transparent font-fantasy font-bold text-sm text-amber-300 placeholder-slate-600 focus:outline-none flex-1"
              />

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Gemini Helper */}
                <button
                  type="button"
                  onClick={() => openGemini(index)}
                  className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1 transition"
                  title="Сгенерировать идею трюка через Gemini"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>ИИ</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteStunt(index)}
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition"
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
              placeholder="Потому что я [особое умение или снаряжение], я получаю +2 к [навык] когда я [условие]..."
              className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        ))}
      </div>

      {/* Add Stunt button */}
      <div className="mt-4 pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAddStunt}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить трюк</span>
        </button>

        <span className="text-[11px] text-slate-500">
          Максимум 5 трюков
        </span>
      </div>

      <GeminiModal
        isOpen={geminiModalState.isOpen}
        onClose={() => setGeminiModalState(prev => ({ ...prev, isOpen: false }))}
        type="stunt"
        skillName={geminiModalState.skillName}
        character={character}
        onSelectSuggestion={(title, desc) => {
          handleUpdateStunt(geminiModalState.stuntIndex, {
            name: title,
            description: desc || '',
          });
        }}
        onOpenApiKeySettings={onOpenApiKeySettings}
      />
    </div>
  );
};
