import React, { useState } from 'react';
import { Sparkles, HelpCircle, ChevronDown } from 'lucide-react';
import { Character } from '../../types/character';
import { SETTING_PRESETS } from '../../config/presets';
import { GeminiModal } from '../ai/GeminiModal';

interface AspectsSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
  onOpenApiKeySettings: () => void;
}

export const AspectsSection: React.FC<AspectsSectionProps> = ({
  character,
  onChange,
  onOpenApiKeySettings,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    aspectKey: 'high_concept' | 'trouble' | 'aspect_3' | 'aspect_4' | 'aspect_5';
    aspectKind: 'high_concept' | 'trouble' | 'other';
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

  const openGemini = (
    key: 'high_concept' | 'trouble' | 'aspect_3' | 'aspect_4' | 'aspect_5',
    kind: 'high_concept' | 'trouble' | 'other'
  ) => {
    setModalState({
      isOpen: true,
      aspectKey: key,
      aspectKind: kind,
    });
  };

  const aspectFields = [
    {
      key: 'high_concept' as const,
      kind: 'high_concept' as const,
      title: 'Главная концепция (High Concept)',
      subtitle: 'Кто ваш персонаж? Роль, суть, яркий эпитет.',
      placeholder: 'например, «Ветеран-ведьмак Школы Волка» или «Частный сыщик из трущоб»',
      suggestions: settingPreset.defaultAspectSuggestions.highConcept,
      accent: 'border-amber-500/40 focus-within:border-amber-500',
    },
    {
      key: 'trouble' as const,
      kind: 'trouble' as const,
      title: 'Проблема (Trouble)',
      subtitle: 'Что постоянно усложняет жизнь? Враг, слабость, долг, кодекс.',
      placeholder: 'например, «Кодекс не позволяет убивать разумных» или «В долгу перед новиградской бандой»',
      suggestions: settingPreset.defaultAspectSuggestions.trouble,
      accent: 'border-red-500/40 focus-within:border-red-500',
    },
    {
      key: 'aspect_3' as const,
      kind: 'other' as const,
      title: 'Аспект 3',
      subtitle: 'Связь, организация, репутация или предыстория.',
      placeholder: 'например, «Чеканная монета вперед, монстр — потом»',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      accent: 'border-[#2E3440] focus-within:border-amber-500/70',
    },
    {
      key: 'aspect_4' as const,
      kind: 'other' as const,
      title: 'Аспект 4',
      subtitle: 'Знаковая вещь, особый стиль или необычное убеждение.',
      placeholder: 'например, «Серебряный клинок моего погибшего наставника»',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      accent: 'border-[#2E3440] focus-within:border-amber-500/70',
    },
    {
      key: 'aspect_5' as const,
      kind: 'other' as const,
      title: 'Аспект 5',
      subtitle: 'Личная цель, тайная привязанность или роковая тайна.',
      placeholder: 'например, «Тайный союз с нильфгаардским офицером»',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      accent: 'border-[#2E3440] focus-within:border-amber-500/70',
    },
  ];

  return (
    <div className="bg-[#161B22] border border-[#2E3440] rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="font-fantasy font-bold text-lg text-amber-400 tracking-wide flex items-center gap-2">
            Аспекты персонажа (Aspects)
          </h2>
          <p className="text-xs text-slate-400">
            Основа судьбы и драмы героя. То, за что призывают и принуждают.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {aspectFields.map((field) => (
          <div
            key={field.key}
            className={`p-3 rounded-xl bg-[#0B0E14] border ${field.accent} transition duration-200 relative group`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div>
                <span className="font-fantasy font-bold text-xs text-slate-200 tracking-wide">
                  {field.title}
                </span>
                <span className="text-[11px] text-slate-500 ml-2 hidden sm:inline">
                  {field.subtitle}
                </span>
              </div>

              {/* Gemini Button */}
              <button
                type="button"
                onClick={() => openGemini(field.key, field.kind)}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition shrink-0"
                title="Попросить Gemini предложить варианты"
              >
                <Sparkles className="w-3 h-3" />
                <span>ИИ</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={character.aspects[field.key] || ''}
              onChange={(e) => handleAspectChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-transparent text-sm text-amber-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed font-medium"
            />
          </div>
        ))}
      </div>

      <GeminiModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type="aspect"
        aspectKind={modalState.aspectKind}
        character={character}
        onSelectSuggestion={(title) => handleAspectChange(modalState.aspectKey, title)}
        onOpenApiKeySettings={onOpenApiKeySettings}
      />
    </div>
  );
};
