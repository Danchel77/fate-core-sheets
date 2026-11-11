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
  showHeader?: boolean;
}

const EMPTY_STUNT = (id: string): CharacterStunt => ({
  id,
  name: '',
  template: 'bonus',
  description: '',
});

export const StuntsSection: React.FC<StuntsSectionProps> = ({
  character,
  onChange,
  onOpenApiKeySettings,
  showHeader = true,
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
  const handleUpdateStunt = (index: number, updatedFields: Partial<CharacterStunt>) => {
    const list = [...character.stunts];
    list[index] = { ...list[index], ...updatedFields };
    onChange({ ...character, stunts: list });
  };

  const handleAddStunt = () => {
    onChange({
      ...character,
      stunts: [
        ...character.stunts,
        EMPTY_STUNT(`stunt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
      ],
    });
  };

  const handleDeleteStunt = (index: number) => {
    onChange({
      ...character,
      stunts: character.stunts.filter((_, i) => i !== index),
    });
  };

  const openGemini = (stuntIndex: number) => {
    const topSkillId = character.skills[4]?.[0] || character.skills[3]?.[0] || 'fight';
    const skillDef = settingPreset.skills.find((skill) => skill.id === topSkillId);
    setGeminiModalState({
      isOpen: true,
      stuntIndex,
      skillName: skillDef ? skillDef.nameRu : 'Ближний бой',
    });
  };

  return (
    <section>
      <div
        className={
          showHeader
            ? 'mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-[#1C212B] pb-2.5'
            : 'mb-3 flex justify-end'
        }
      >
        {showHeader && (
          <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
            Трюки
          </h2>
        )}
        <button
          type="button"
          onClick={handleAddStunt}
          className="flex cursor-pointer items-center gap-1 text-[10px] font-medium text-slate-400 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
        >
          <Plus className="h-3 w-3" />
          Добавить
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {character.stunts.map((stunt, index) => {
          const isEmpty = !stunt.name.trim() && !stunt.description.trim();

          return (
            <div
              key={stunt.id || `stunt_${index}`}
              className={`group relative rounded-lg border p-3 transition focus-within:border-slate-500 ${
                isEmpty
                  ? 'border-dashed border-[#2A3444] bg-transparent'
                  : 'border-[#202734] bg-[#0B0E14]/35 hover:border-[#2A3444] hover:bg-[#0E131B]'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 w-5 shrink-0 font-mono text-[10px] text-slate-500">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={stunt.name}
                    onChange={(event) => handleUpdateStunt(index, { name: event.target.value })}
                    placeholder="Название трюка..."
                    className="w-full border-b border-transparent bg-transparent pb-0.5 font-fantasy text-[13px] font-semibold text-slate-100 placeholder-slate-500 transition hover:border-[#202734] focus:border-slate-600 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={stunt.description}
                    onChange={(event) =>
                      handleUpdateStunt(index, { description: event.target.value })
                    }
                    placeholder="Что даёт этот трюк..."
                    className="mt-1 w-full resize-none border-b border-transparent bg-transparent pb-0.5 text-[11px] leading-relaxed text-slate-400 placeholder-slate-500 transition [field-sizing:content] hover:border-[#202734] focus:border-slate-600 focus:outline-none"
                  />
                </div>

                <div
                  className={`flex shrink-0 items-center gap-1 transition ${
                    isEmpty
                      ? 'opacity-100'
                      : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openGemini(index)}
                    className="cursor-pointer rounded p-1 text-slate-500 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
                    title="Сформулировать через Gemini"
                    aria-label="Сформулировать трюк через Gemini"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteStunt(index)}
                    className="cursor-pointer rounded p-1 text-slate-500 transition hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
                    title={isEmpty ? 'Удалить пустую карточку' : 'Удалить трюк'}
                    aria-label={isEmpty ? 'Удалить пустую карточку' : 'Удалить трюк'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <GeminiModal
        isOpen={geminiModalState.isOpen}
        onClose={() => setGeminiModalState((prev) => ({ ...prev, isOpen: false }))}
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
    </section>
  );
};
