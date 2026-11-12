import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';
import { GeminiModal } from '../ai/GeminiModal';
import { FieldLabel } from '../common/FieldLabel';

interface AspectsSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
  onOpenApiKeySettings: () => void;
}

type AspectKey = 'high_concept' | 'trouble' | 'aspect_3' | 'aspect_4' | 'aspect_5';
type AspectKind = 'high_concept' | 'trouble' | 'other';

export const AspectsSection: React.FC<AspectsSectionProps> = ({
  character,
  onChange,
  onOpenApiKeySettings,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    aspectKey: AspectKey;
    aspectKind: AspectKind;
  }>({
    isOpen: false,
    aspectKey: 'high_concept',
    aspectKind: 'high_concept',
  });

  const settingPreset = SETTING_PRESETS[character.setting] || SETTING_PRESETS.witcher;

  const handleAspectChange = (key: string, value: string) => {
    onChange({
      ...character,
      aspects: {
        ...character.aspects,
        [key]: value,
      },
    });
  };

  const openGemini = (key: AspectKey, kind: AspectKind) => {
    setModalState({ isOpen: true, aspectKey: key, aspectKind: kind });
  };

  const aspectSlots: Array<{
    key: AspectKey;
    kind: AspectKind;
    label: string;
    sublabel: string;
    placeholder: string;
    suggestions: string[];
  }> = [
    {
      key: 'high_concept',
      kind: 'high_concept',
      label: 'Концепция',
      sublabel: 'High Concept',
      placeholder: 'Кем является персонаж в мире...',
      suggestions: settingPreset.defaultAspectSuggestions.highConcept,
    },
    {
      key: 'trouble',
      kind: 'trouble',
      label: 'Проблема',
      sublabel: 'Trouble',
      placeholder: 'Что постоянно усложняет жизнь...',
      suggestions: settingPreset.defaultAspectSuggestions.trouble,
    },
    {
      key: 'aspect_3',
      kind: 'other',
      label: 'Прошлое',
      sublabel: 'Past',
      placeholder: 'Откуда он пришёл, что его сформировало...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
    },
    {
      key: 'aspect_4',
      kind: 'other',
      label: 'Связь',
      sublabel: 'Bond',
      placeholder: 'Кто или что держит его в этом мире...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
    },
    {
      key: 'aspect_5',
      kind: 'other',
      label: 'Цель',
      sublabel: 'Goal',
      placeholder: 'Чего он добивается сейчас...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
    },
  ];

  return (
    <section>
      <div>
        {aspectSlots.map((slot) => {
          const value = character.aspects[slot.key] || '';

          return (
            <div
              key={slot.key}
              data-kit="sheet-aspect"
              className="group flex flex-col gap-1 py-2 first:pt-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <FieldLabel>{slot.label}</FieldLabel>
                  <span className="font-sans text-xs text-text-muted">{slot.sublabel}</span>
                </div>

                <button
                  type="button"
                  onClick={() => openGemini(slot.key, slot.kind)}
                  aria-label={`Помощь Gemini: ${slot.label}`}
                  className="cursor-pointer text-text-muted transition-colors duration-150 hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                  title="Помощь Gemini"
                >
                  <Sparkles className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>

              <textarea
                rows={1}
                value={value}
                onChange={(e) => handleAspectChange(slot.key, e.target.value)}
                placeholder={slot.placeholder}
                className="w-full resize-none border-b border-line bg-transparent pb-1 font-sans text-sm leading-relaxed text-text placeholder:text-text-muted transition-colors duration-150 [field-sizing:content] focus:outline-none focus-visible:border-gold"
              />
            </div>
          );
        })}
      </div>

      <GeminiModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type="aspect"
        aspectKind={modalState.aspectKind}
        character={character}
        onSelectSuggestion={(title: string) => handleAspectChange(modalState.aspectKey, title)}
        onOpenApiKeySettings={onOpenApiKeySettings}
      />
    </section>
  );
};
