import React, { useState } from 'react';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { Character } from '../../types/character';
import { CharacterStunt } from '../../types/fate';
import { SETTING_PRESETS } from '../../config/presets';
import { GeminiModal } from '../ai/GeminiModal';
import { Button } from '../common/Button';

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
            ? 'mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line pb-2'
            : 'mb-2 flex justify-end'
        }
      >
        {showHeader && (
          <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
            Трюки
          </h2>
        )}
        <Button
          variant="secondary"
          onClick={handleAddStunt}
          className="inline-flex items-center gap-1.5"
        >
          <Plus className="size-3.5" strokeWidth={1.5} />
          <span>Добавить</span>
        </Button>
      </div>

      <div className="flex flex-col">
        {character.stunts.length === 0 && (
          <p className="py-2 text-sm text-text-muted">Трюков пока нет.</p>
        )}

        {character.stunts.map((stunt, index) => {
          const isEmpty = !stunt.name.trim() && !stunt.description.trim();

          return (
            <div
              key={stunt.id || `stunt_${index}`}
              data-kit="sheet-stunt"
              className={`group grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-start gap-2 py-2 ${
                isEmpty ? 'border-b border-dashed border-line' : 'border-b border-line'
              }`}
            >
              <span className="pt-0.5 text-xs tabular-nums text-gold-light">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0">
                <input
                  type="text"
                  value={stunt.name}
                  onChange={(event) => handleUpdateStunt(index, { name: event.target.value })}
                  placeholder="Название трюка..."
                  className="w-full bg-transparent font-fantasy text-sm text-text placeholder:text-text-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                />
                <textarea
                  rows={2}
                  value={stunt.description}
                  onChange={(event) =>
                    handleUpdateStunt(index, { description: event.target.value })
                  }
                  placeholder="Что даёт этот трюк..."
                  className="mt-1 w-full resize-none bg-transparent font-sans text-sm leading-relaxed text-text-muted placeholder:text-text-muted [field-sizing:content] focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                />
              </div>

              <div className="flex shrink-0 items-center gap-1 pt-0.5 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => openGemini(index)}
                  className="cursor-pointer text-text-muted transition-colors duration-150 hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                  title="Сформулировать через Gemini"
                  aria-label="Сформулировать трюк через Gemini"
                >
                  <Sparkles className="size-3.5" strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteStunt(index)}
                  className="cursor-pointer text-text-muted transition-colors duration-150 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                  title={isEmpty ? 'Удалить пустой трюк' : 'Удалить трюк'}
                  aria-label={isEmpty ? 'Удалить пустой трюк' : 'Удалить трюк'}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                </button>
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
