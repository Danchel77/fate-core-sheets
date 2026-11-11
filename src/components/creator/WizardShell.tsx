import React from 'react';
import { SectionHeader } from './shell/SectionHeader';
import { BasicsStep } from './steps/BasicsStep';
import { ConceptStep } from './steps/ConceptStep';
import { BackstoryStep } from './steps/BackstoryStep';
import { SkillsStep } from './steps/SkillsStep';
import { StuntsStep } from './steps/StuntsStep';
import { ReviewStep } from './steps/ReviewStep';
import { WIZARD_SECTIONS } from '../../config/wizardSteps';
import { Character, SettingType } from '../../types/character';

interface CharacterWizardShellProps {
  draft: Character;
  onPatch: (patch: Partial<Character>) => void;
  onSettingChange: (setting: SettingType) => void;
  onOpenApiKeySettings: () => void;
}

export const WizardShell: React.FC<CharacterWizardShellProps> = ({ 
  draft, onPatch, onSettingChange, onOpenApiKeySettings 
}) => {
  return (
    <div className="space-y-10">
      <section id="basics" className="scroll-mt-28">
        <SectionHeader title="Основы" help={WIZARD_SECTIONS.find(s => s.id === 'basics')?.help} />
        <div className="mt-5">
          <BasicsStep draft={draft} onPatch={onPatch} onSettingChange={onSettingChange} />
        </div>
      </section>

      <section id="aspects" className="scroll-mt-28 border-t border-[#1C212B] pt-8">
        <SectionHeader title="Аспекты" help={WIZARD_SECTIONS.find(s => s.id === 'aspects')?.help} />
        <div className="mt-5 space-y-5">
          <ConceptStep draft={draft} onPatch={onPatch} />
          <BackstoryStep draft={draft} onPatch={onPatch} />
        </div>
      </section>

      <section id="skills" className="scroll-mt-28 border-t border-[#1C212B] pt-8">
        <SectionHeader title="Навыки" help={WIZARD_SECTIONS.find(s => s.id === 'skills')?.help} />
        <div className="mt-5">
          <SkillsStep draft={draft} onPatch={onPatch} />
        </div>
      </section>

      <section id="stunts" className="scroll-mt-28 border-t border-[#1C212B] pt-8">
        <SectionHeader title="Трюки" help={WIZARD_SECTIONS.find(s => s.id === 'stunts')?.help} />
        <div className="mt-5">
          <StuntsStep draft={draft} onPatch={onPatch} onOpenApiKeySettings={onOpenApiKeySettings} />
        </div>
      </section>

      <section id="review" className="scroll-mt-28 border-t border-[#1C212B] pt-8">
        <SectionHeader title="Итог" help={WIZARD_SECTIONS.find(s => s.id === 'review')?.help} />
        <div className="mt-5">
          <ReviewStep draft={draft} onJump={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} />
        </div>
      </section>
    </div>
  );
};
