import React from 'react';
import { Character } from '../../../types/character';
import { WizardField, WIZARD_INPUT_CLASS } from '../WizardField';

interface BackstoryStepProps {
  draft: Character;
  onPatch: (patch: Partial<Character>) => void;
}

const ASPECT_FIELDS: { key: string; label: string; id: string }[] = [
  { key: 'aspect_3', label: 'Прошлое', id: 'wizard-aspect-3' },
  { key: 'aspect_4', label: 'Связь', id: 'wizard-aspect-4' },
  { key: 'aspect_5', label: 'Цель', id: 'wizard-aspect-5' },
];

export const BackstoryStep: React.FC<BackstoryStepProps> = ({ draft, onPatch }) => {
  const setAspect = (key: string, value: string) =>
    onPatch({ aspects: { ...draft.aspects, [key]: value } });

  return (
    <div className="space-y-5">
      {ASPECT_FIELDS.map((phase) => (
        <WizardField key={phase.key} label={phase.label} htmlFor={phase.id}>
          <input
            id={phase.id}
            type="text"
            value={draft.aspects[phase.key] || ''}
            onChange={(event) => setAspect(phase.key, event.target.value)}
            className={WIZARD_INPUT_CLASS}
          />
        </WizardField>
      ))}
    </div>
  );
};
