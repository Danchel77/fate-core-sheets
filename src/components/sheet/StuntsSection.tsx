import React, { useState } from 'react';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { Character } from '../../types/character';
import { CharacterStunt } from '../../types/fate';
import { SETTING_PRESETS } from '../../config/presets';
import { countRealStunts } from '../../utils/fateMath';
import { GeminiModal } from '../ai/GeminiModal';

interface StuntsSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
  onOpenApiKeySettings: () => void;
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
  const realStuntCount = countRealStunts(character.stunts);

  const displayStunts: CharacterStunt[] = [...character.stunts];
  while (displayStunts.length < 3) {
    displayStunts.push(EMPTY_STUNT(`stunt_slot_${displayStunts.length}`));
  }

  const handleUpdateStunt = (index: number, updatedFields: Partial<CharacterStunt>) => {
    const list = [...displayStunts];
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
      stunts: displayStunts.filter((_, i) => i !== index),
    });
  };

  const openGemini = (stuntIndex: number) => {
    const topSkillId =
      character.skills[4]?.[0] || character.skills[3]?.[0] || 'fight';
    const skillDef = settingPreset.skills.find(s => s.id === topSkillId);
    setGeminiModalState({
      isOpen: true,
      stuntIndex,
      skillName: skillDef ? skillDef.nameRu : 'Ближний бой',
    });
  };

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          Трюки
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] tabular-nums text-slate-600">
            {realStuntCount} из 3 бесплатных
          </span>
          <button
            type="button"
            onClick={handleAddStunt}
            className="flex cursor-pointer items-center gap-1 text-[10px] font-medium text-slate-400 transition hover:text-slate-200"
          >
            <Plus className="h-3 w-3" />
            Добавить
          </button>
        </div>
      </div>

      <div>
        {displayStunts.map((stunt, index) => (
          <div
            key={stunt.id || `stunt_${index}`}
            className="group relative border-b border-[#1C212B]/70 py-3 last:border-b-0"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 w-6 shrink-0 font-mono text-[10px] text-slate-600">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={stunt.name}
                  onChange={(e) => handleUpdateStunt(index, { name: e.target.value })}
                  placeholder={`Название трюка #${index + 1}...`}
                  className="w-full bg-transparent font-fantasy text-[13px] font-semibold text-slate-100 placeholder-slate-600 focus:outline-none"
                />
                <textarea
                  rows={2}
                  value={stunt.description}
                  onChange={(e) => handleUpdateStunt(index, { description: e.target.value })}
                  placeholder="Формулировка правила: +2 или замена навыка..."
                  className="mt-1 w-full resize-none bg-transparent text-[11px] leading-relaxed text-slate-400 placeholder-slate-600 [field-sizing:content] focus:outline-none"
                />
              </div>

              <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => openGemini(index)}
                  className="cursor-pointer rounded p-1 text-slate-600 transition hover:text-sky-300"
                  title="Сформулировать через Gemini"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStunt(index)}
                  className="cursor-pointer rounded p-1 text-slate-600 transition hover:text-red-400"
                  title="Удалить трюк"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {character.stunts.length > 3 && (
        <p className="mt-2 text-[10px] text-slate-600">
          Каждый трюк сверх трёх снижает обновление на 1 (минимум 1).
        </p>
      )}

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
    </section>
  );
};
