import React from 'react';
import { Character, SettingType } from '../../../types/character';
import { WizardField, WIZARD_INPUT_CLASS, WIZARD_TEXTAREA_CLASS } from '../WizardField';

interface BasicsStepProps {
  draft: Character;
  onPatch: (patch: Partial<Character>) => void;
  onSettingChange: (setting: SettingType) => void;
}

const SETTING_OPTIONS: { value: SettingType; label: string; note: string }[] = [
  { value: 'witcher', label: 'Ведьмак', note: 'Тёмное фэнтези' },
  { value: 'universal', label: 'Fate Core', note: 'Универсальная система' },
];

export const BasicsStep: React.FC<BasicsStepProps> = ({
  draft,
  onPatch,
  onSettingChange,
}) => (
  <div className="space-y-5">
    <WizardField label="Имя персонажа" htmlFor="wizard-name">
      <input
        id="wizard-name"
        type="text"
        autoFocus
        value={draft.name}
        onChange={(event) => onPatch({ name: event.target.value })}
        className={WIZARD_INPUT_CLASS}
      />
    </WizardField>

    <WizardField label="Сеттинг">
      <div className="grid gap-2 sm:grid-cols-2">
        {SETTING_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSettingChange(option.value)}
            className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 ${
              draft.setting === option.value
                ? 'border-slate-400 bg-[#1A212C]'
                : 'border-[#202734] bg-[#0B0E14] hover:border-slate-600'
            }`}
          >
            <span className="block text-xs font-semibold text-slate-200">{option.label}</span>
            <span className="mt-0.5 block text-[10px] text-slate-500">{option.note}</span>
          </button>
        ))}
      </div>
    </WizardField>

    <WizardField label="Описание" htmlFor="wizard-description">
      <textarea
        id="wizard-description"
        rows={3}
        value={draft.description}
        onChange={(event) => onPatch({ description: event.target.value })}
        className={WIZARD_TEXTAREA_CLASS}
      />
    </WizardField>
  </div>
);
