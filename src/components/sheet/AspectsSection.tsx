import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';
import { GeminiModal } from '../ai/GeminiModal';

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
    labelColor: string;
  }> = [
    {
      key: 'high_concept',
      kind: 'high_concept',
      label: 'Концепция',
      sublabel: 'High Concept',
      placeholder: 'Кем является персонаж в мире...',
      suggestions: settingPreset.defaultAspectSuggestions.highConcept,
      labelColor: 'text-slate-200',
    },
    {
      key: 'trouble',
      kind: 'trouble',
      label: 'Проблема',
      sublabel: 'Trouble',
      placeholder: 'Что постоянно усложняет жизнь...',
      suggestions: settingPreset.defaultAspectSuggestions.trouble,
      labelColor: 'text-slate-200',
    },
    {
      key: 'aspect_3',
      kind: 'other',
      label: 'Предыстория',
      sublabel: 'Origin',
      placeholder: 'Откуда он пришёл, что сформировало его...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      labelColor: 'text-slate-400',
    },
    {
      key: 'aspect_4',
      kind: 'other',
      label: 'Связь 1',
      sublabel: 'Relationship',
      placeholder: 'С кем или чем он связан...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      labelColor: 'text-slate-400',
    },
    {
      key: 'aspect_5',
      kind: 'other',
      label: 'Связь 2',
      sublabel: 'Relationship',
      placeholder: 'Вторая важная связь...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      labelColor: 'text-slate-400',
    },
  ];

  return (
    <section>
      <div className="mb-2 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          Аспекты
        </h2>
      </div>

      <div>
        {aspectSlots.map((slot) => {
          const value = character.aspects[slot.key] || '';

          return (
            <div
              key={slot.key}
              className="group grid grid-cols-[84px_1fr_auto] items-center gap-3 border-b border-[#1C212B]/70 py-2.5 last:border-b-0 sm:grid-cols-[96px_1fr_auto]"
            >
              <div>
                <span className={`block font-fantasy text-[11.5px] font-semibold uppercase tracking-[0.08em] ${slot.labelColor}`}>
                  {slot.label}
                </span>
                <span className="mt-0.5 block text-[9px] uppercase tracking-[0.12em] text-slate-500">
                  {slot.sublabel}
                </span>
              </div>

              <textarea
                rows={1}
                value={value}
                onChange={(e) => handleAspectChange(slot.key, e.target.value)}
                placeholder={slot.placeholder}
                className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-slate-200 placeholder-slate-500 [field-sizing:content] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
              />

              <button
                type="button"
                onClick={() => openGemini(slot.key, slot.kind)}
                className="mt-0.5 cursor-pointer rounded-md p-1 text-slate-500 opacity-60 transition hover:text-slate-200 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 group-hover:opacity-100"
                title="Помощь Gemini"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
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
