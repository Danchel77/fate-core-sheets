import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Character, SettingType } from '../../types/character';
import { WIZARD_SECTIONS } from '../../config/wizardSteps';
import { createNewCharacter, countRealStunts } from '../../utils/fateMath';
import { useCharacters } from '../../context/CharacterContext';
import { SettingsModal } from '../common/SettingsModal';
import { WizardShell } from './WizardShell';
import { SectionNav } from './shell/SectionNav';
import { WizardRail } from './shell/WizardRail';
import { MobileActionBar } from './shell/MobileActionBar';
import { useScrollSpy } from '../../hooks/useScrollSpy';

export const CharacterWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createCharFromDraft } = useCharacters();
  const [draft, setDraft] = useState<Character>(() => createNewCharacter('witcher', ''));
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const patchDraft = (patch: Partial<Character>) => setDraft((prev) => ({ ...prev, ...patch }));
  const handleSettingChange = (setting: SettingType) => {
    setDraft((prev) => ({ ...createNewCharacter(setting, prev.name), id: prev.id, aspects: prev.aspects }));
  };

  const activeId = useScrollSpy(WIZARD_SECTIONS.map((s) => s.id));
  const totalSkills = Object.values(draft.skills).flat().length;
  const canSave = draft.name.trim() !== '' && !!draft.aspects.high_concept?.trim() && !!draft.aspects.trouble?.trim() && totalSkills >= 10;
  
  const missingFields = [];
  if (draft.name.trim() === '') missingFields.push('имя');
  if (!draft.aspects.high_concept?.trim() || !draft.aspects.trouble?.trim()) missingFields.push('концепцию и проблему');
  if (totalSkills < 10) missingFields.push('навыки');

  const handleSave = async () => {
    if (!canSave || isSaving) return;
    setIsSaving(true);
    await createCharFromDraft({ ...draft, name: draft.name.trim() });
    setIsSaving(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-6 sm:px-6 lg:pb-0">
      <button type="button" onClick={onClose} className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-400 transition hover:text-slate-200">
        <ArrowLeft className="h-3.5 w-3.5" /> К списку персонажей
      </button>
      <h1 className="mt-3 font-fantasy text-[30px] leading-tight text-white sm:text-[34px]">Конструктор персонажа</h1>
      
      <SectionNav items={WIZARD_SECTIONS} activeId={activeId} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <WizardShell 
          draft={draft} 
          onPatch={patchDraft} 
          onSettingChange={handleSettingChange}
          onOpenApiKeySettings={() => setIsSettingsOpen(true)}
        />
        <WizardRail 
          draft={draft} 
          onJump={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          canSave={canSave}
          missingFields={missingFields}
          onSave={handleSave}
        />
      </div>

      <MobileActionBar 
        draft={draft} 
        canSave={canSave} 
        onSave={handleSave} 
        stuntCount={countRealStunts(draft.stunts)}
        totalSkills={totalSkills}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
