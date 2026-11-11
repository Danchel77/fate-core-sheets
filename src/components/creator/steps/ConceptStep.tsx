import React from 'react';
import { Character } from '../../../types/character';
import { WizardField, WIZARD_INPUT_CLASS, WIZARD_TEXTAREA_CLASS } from '../WizardField';

interface ConceptStepProps {
  draft: Character;
  onPatch: (patch: Partial<Character>) => void;
}

export const ConceptStep: React.FC<ConceptStepProps> = ({ draft, onPatch }) => {
  const setAspect = (key: string, value: string) =>
    onPatch({ aspects: { ...draft.aspects, [key]: value } });

  return (
    <div className="space-y-5">
      <WizardField label="Главная концепция" htmlFor="wizard-high-concept">
        <input
          id="wizard-high-concept"
          type="text"
          value={draft.aspects.high_concept || ''}
          onChange={(event) => setAspect('high_concept', event.target.value)}
          className={WIZARD_INPUT_CLASS}
        />
      </WizardField>

      <WizardField label="Проблема" htmlFor="wizard-trouble">
        <textarea
          id="wizard-trouble"
          rows={3}
          value={draft.aspects.trouble || ''}
          onChange={(event) => setAspect('trouble', event.target.value)}
          className={WIZARD_TEXTAREA_CLASS}
        />
      </WizardField>
    </div>
  );
};
