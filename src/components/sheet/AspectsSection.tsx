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

  const aspectSlots = [
    {
      key: 'high_concept' as const,
      kind: 'high_concept' as const,
      label: 'Концепция',
      sublabel: 'High Concept',
      placeholder: 'Кем является персонаж в мире...',
      suggestions: settingPreset.defaultAspectSuggestions.highConcept,
      labelColor: 'text-amber-400/90',
    },
    {
      key: 'trouble' as const,
      kind: 'trouble' as const,
      label: 'Проблема',
      sublabel: 'Trouble',
      placeholder: 'Что постоянно усложняет жизнь...',
      suggestions: settingPreset.defaultAspectSuggestions.trouble,
      labelColor: 'text-red-400/90',
    },
    {
      key: 'aspect_3' as const,
      kind: 'other' as const,
      label: 'Аспект 3',
      sublabel: '',
      placeholder: 'Связь, организация или предыстория...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      labelColor: 'text-slate-400',
    },
    {
      key: 'aspect_4' as const,
      kind: 'other' as const,
      label: 'Аспект 4',
      sublabel: '',
      placeholder: 'Особый стиль, вещь или убеждение...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      labelColor: 'text-slate-400',
    },
    {
      key: 'aspect_5' as const,
      kind: 'other' as const,
      label: 'Аспект 5',
      sublabel: '',
      placeholder: 'Личная цель или тайна...',
      suggestions: settingPreset.defaultAspectSuggestions.others,
      labelColor: 'text-slate-400',
    },
  ];

  return (
    <div className="bg-[#121721] border border-[#1C212B] rounded-2xl p-5 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy font-bold text-base text-slate-100 tracking-wide uppercase">
          Аспекты
        </h2>
      </div>

      {/* 5 Aspect Slots */}
      <div className="space-y-2">
        {aspectSlots.map((slot) => {
          const value = character.aspects[slot.key] || '';

          return (
            <div
              key={slot.key}
              className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#1C212B] focus-within:border-slate-700 transition relative group flex items-start gap-3"
            >
              {/* Badge Label */}
              <div className="w-24 shrink-0 pt-0.5">
                <span className={`text-xs font-bold font-fantasy block ${slot.labelColor}`}>
                  {slot.label}
                </span>
                {slot.sublabel && (
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                    {slot.sublabel}
                  </span>
                )}
              </div>

              {/* Input Area */}
              <div className="flex-1 min-w-0">
                <textarea
                  rows={1}
                  value={value}
                  onChange={(e) => handleAspectChange(slot.key, e.target.value)}
                  placeholder={slot.placeholder}
                  className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* AI Assistant Button */}
              <button
                type="button"
                onClick={() => openGemini(slot.key, slot.kind)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-amber-400 p-1 rounded-md transition cursor-pointer"
                title="Помощь Gemini"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Gemini Modal */}
      <GeminiModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type="aspect"
        aspectKind={modalState.aspectKind}
        character={character}
        onSelectSuggestion={(title: string) => handleAspectChange(modalState.aspectKey, title)}
        onOpenApiKeySettings={onOpenApiKeySettings}
      />
    </div>
  );
};
