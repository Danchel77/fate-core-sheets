import React, { useMemo, useState } from 'react';
import { SETTING_PRESETS, UNIVERSAL_SKILLS, WITCHER_SKILLS } from '../../../config/presets';
import type { Character } from '../../../types/character';
import type { ActionType, CharacterStunt, StuntTemplate } from '../../../types/fate';
import type { StuntSuggestionInput } from '../../../services/geminiStunts';
import { buildStuntDescription, isStuntDraftComplete } from '../../../utils/stuntPhrase';
import { StuntConstructor, type StuntForm } from '../stunts/StuntConstructor';
import { StuntList } from '../stunts/StuntList';
import { StuntPatternPicker } from '../stunts/StuntPatternPicker';
import { GeminiStuntPanel } from '../stunts/GeminiStuntPanel';

interface StuntsStepProps {
  draft: Character;
  onPatch: (patch: Partial<Character>) => void;
  onOpenApiKeySettings: () => void;
}

const createDefaultForm = (template: StuntTemplate = 'bonus'): StuntForm => ({
  name: '',
  template,
  skillId: '',
  action: 'attack',
  situation: '',
  swapFromSkillId: '',
  swapToSkillId: '',
  trigger: '',
  effect: '',
  frequency: 'Раз за сцену',
});

export const StuntsStep: React.FC<StuntsStepProps> = ({
  draft,
  onPatch,
  onOpenApiKeySettings,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<StuntTemplate | null>(null);
  const [isEditingIndex, setIsEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<StuntForm>(() => createDefaultForm('bonus'));

  const settingPreset = SETTING_PRESETS[draft.setting] || SETTING_PRESETS.witcher;
  const allSettingSkills = settingPreset.skills;

  const skillNames = useMemo(() => {
    const fallback = draft.setting === 'witcher' ? UNIVERSAL_SKILLS : WITCHER_SKILLS;
    const current = draft.setting === 'witcher' ? WITCHER_SKILLS : UNIVERSAL_SKILLS;
    const dict: Record<string, string> = {};
    for (const s of fallback) dict[s.id] = s.nameRu;
    for (const s of current) dict[s.id] = s.nameRu;
    return dict;
  }, [draft.setting]);

  const placedSkills = useMemo(() => {
    const result: { id: string; name: string; rating: number }[] = [];
    const ratings = [6, 5, 4, 3, 2, 1] as const;
    for (const r of ratings) {
      const ids = draft.skills[r];
      if (ids && ids.length > 0) {
        for (const id of ids) result.push({ id, name: skillNames[id] || id, rating: r });
      }
    }
    return result;
  }, [draft.skills, skillNames]);

  const handleSelectPattern = (pattern: StuntTemplate) => {
    setSelectedTemplate(pattern);
    setForm((prev) => ({
      ...prev,
      template: pattern,
      skillId: prev.skillId || (placedSkills[0]?.id ?? ''),
    }));
  };

  const handleFormChange = (patch: Partial<StuntForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSaveStunt = () => {
    if (!isStuntDraftComplete(form)) return;
    const description = buildStuntDescription(form, skillNames);
    const stuntId = isEditingIndex !== null ? draft.stunts[isEditingIndex].id : `stunt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const stunt: CharacterStunt = {
      id: stuntId,
      name: form.name.trim(),
      template: form.template,
      description,
      ...(form.template === 'bonus' ? { skillId: form.skillId, action: form.action, situation: form.situation.trim() } : {}),
      ...(form.template === 'swap' ? { swapFromSkillId: form.swapFromSkillId, swapToSkillId: form.swapToSkillId, situation: form.situation.trim() } : {}),
      ...(form.template === 'special' ? { trigger: form.trigger.trim(), effect: form.effect.trim(), frequency: form.frequency.trim() || 'Раз за сцену' } : {}),
    };
    const nextStunts = [...draft.stunts];
    if (isEditingIndex !== null) nextStunts[isEditingIndex] = stunt; else nextStunts.push(stunt);
    onPatch({ stunts: nextStunts });
    setSelectedTemplate(null);
    setIsEditingIndex(null);
    setForm(createDefaultForm('bonus'));
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setIsEditingIndex(null);
    setForm(createDefaultForm('bonus'));
  };

  const handleEditStunt = (index: number) => {
    const stunt = draft.stunts[index];
    if (!stunt) return;
    setIsEditingIndex(index);
    setSelectedTemplate(stunt.template);
    setForm({
      name: stunt.name, template: stunt.template, skillId: stunt.skillId || (placedSkills[0]?.id ?? ''),
      action: stunt.action || 'attack', situation: stunt.situation || '',
      swapFromSkillId: stunt.swapFromSkillId || '', swapToSkillId: stunt.swapToSkillId || '',
      trigger: stunt.trigger || '', effect: stunt.effect || '', frequency: stunt.frequency || 'Раз за сцену',
    });
  };

  const handleDeleteStunt = (index: number) => {
    const nextStunts = draft.stunts.filter((_, i) => i !== index);
    onPatch({ stunts: nextStunts });
    if (isEditingIndex === index) handleCancel();
  };

  const handleApplySuggestion = (suggestion: StuntSuggestionInput) => {
    setSelectedTemplate(suggestion.template);
    setIsEditingIndex(null);
    let targetSkillId = placedSkills[0]?.id ?? '';
    if (suggestion.skillId) {
      const match = allSettingSkills.find((s) => s.id.toLowerCase() === suggestion.skillId?.toLowerCase() || s.nameRu.toLowerCase() === suggestion.skillId?.toLowerCase());
      if (match) targetSkillId = match.id;
    }
    setForm({
      name: suggestion.name, template: suggestion.template, skillId: targetSkillId,
      action: suggestion.action || 'attack', situation: suggestion.situation || '',
      swapFromSkillId: '', swapToSkillId: '', trigger: suggestion.situation || '',
      effect: suggestion.description, frequency: 'Раз за сцену',
    });
  };

  return (
    <div className="space-y-8">
      <StuntPatternPicker selected={selectedTemplate} onSelect={handleSelectPattern} />
      
      {selectedTemplate && (
        <StuntConstructor
          form={form} onChange={handleFormChange} characterSkills={placedSkills}
          allSettingSkills={allSettingSkills} skillNames={skillNames}
          isEditing={isEditingIndex !== null} onSave={handleSaveStunt} onCancel={handleCancel}
        />
      )}

      <section className="border-t border-[#1C212B] pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-medium text-slate-200">Gemini</h3>
          <span className="text-[11px] text-slate-500">Оценка трюка и варианты на замену</span>
        </div>
        <div className="mt-4">
          <GeminiStuntPanel
            draft={draft} form={form} isConstructorOpen={selectedTemplate !== null}
            placedSkills={placedSkills} skillNames={skillNames}
            onApplySuggestion={handleApplySuggestion} onOpenApiKeySettings={onOpenApiKeySettings}
          />
        </div>
      </section>

      <StuntList
        stunts={draft.stunts} freeStunts={draft.freeStunts ?? 3} baseRefresh={draft.baseRefresh ?? 3}
        onEdit={handleEditStunt} onDelete={handleDeleteStunt}
      />
    </div>
  );
};
