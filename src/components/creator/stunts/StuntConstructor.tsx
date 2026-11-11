import React from 'react';
import { ACTION_LABELS, ACTION_ORDER } from '../../../config/skillActions';
import type { ActionType, SkillDefinition, StuntTemplate } from '../../../types/fate';
import { buildStuntDescription, isStuntDraftComplete } from '../../../utils/stuntPhrase';
import { WIZARD_INPUT_CLASS, WIZARD_TEXTAREA_CLASS, WizardField } from '../WizardField';

export type StuntForm = {
  name: string;
  template: StuntTemplate;
  skillId: string;
  action: ActionType;
  situation: string;
  swapFromSkillId: string;
  swapToSkillId: string;
  trigger: string;
  effect: string;
  frequency: string;
};

interface CharacterSkillOption {
  id: string;
  name: string;
  rating: number;
}

interface StuntConstructorProps {
  form: StuntForm;
  onChange: (patch: Partial<StuntForm>) => void;
  characterSkills: CharacterSkillOption[];
  allSettingSkills: SkillDefinition[];
  skillNames: Record<string, string>;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const StuntConstructor: React.FC<StuntConstructorProps> = ({
  form, onChange, characterSkills, allSettingSkills, skillNames, isEditing, onSave, onCancel,
}) => {
  const phrase = buildStuntDescription(form, skillNames);
  const isComplete = isStuntDraftComplete(form);

  return (
    <div className="border-t border-[#1C212B] pt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <WizardField label="Название трюка" htmlFor="wizard-stunt-name">
          <input
            id="wizard-stunt-name" type="text" className={WIZARD_INPUT_CLASS} value={form.name}
            onChange={(e) => onChange({ name: e.target.value })} placeholder="Например: Мастер серебряного меча"
          />
        </WizardField>
      </div>

      {form.template === 'bonus' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <WizardField label="Навык" htmlFor="wizard-stunt-skill">
            <select id="wizard-stunt-skill" className={WIZARD_INPUT_CLASS} value={form.skillId} onChange={(e) => onChange({ skillId: e.target.value })} disabled={characterSkills.length === 0}>
              <option value="">Выберите навык...</option>
              {characterSkills.map((s) => <option key={s.id} value={s.id}>{s.name} (+{s.rating})</option>)}
            </select>
          </WizardField>
          <WizardField label="Действие" htmlFor="wizard-stunt-action">
            <select id="wizard-stunt-action" className={WIZARD_INPUT_CLASS} value={form.action} onChange={(e) => onChange({ action: e.target.value as ActionType })}>
              {ACTION_ORDER.map((act) => <option key={act} value={act}>{ACTION_LABELS[act]}</option>)}
            </select>
          </WizardField>
        </div>
      )}

      {form.template === 'swap' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <WizardField label="Вместо навыка" htmlFor="wizard-stunt-swap-to">
            <select id="wizard-stunt-swap-to" className={WIZARD_INPUT_CLASS} value={form.swapToSkillId} onChange={(e) => onChange({ swapToSkillId: e.target.value })}>
              <option value="">Выберите навык...</option>
              {allSettingSkills.map((s) => <option key={s.id} value={s.id}>{s.nameRu}</option>)}
            </select>
          </WizardField>
          <WizardField label="Навык-замена" htmlFor="wizard-stunt-swap-from">
            <select id="wizard-stunt-swap-from" className={WIZARD_INPUT_CLASS} value={form.swapFromSkillId} onChange={(e) => onChange({ swapFromSkillId: e.target.value })}>
              <option value="">Выберите навык...</option>
              {allSettingSkills.map((s) => <option key={s.id} value={s.id}>{s.nameRu}</option>)}
            </select>
          </WizardField>
        </div>
      )}

      {(form.template === 'bonus' || form.template === 'swap') && (
        <WizardField label="Ситуация" htmlFor="wizard-stunt-situation">
          <textarea id="wizard-stunt-situation" rows={2} className={WIZARD_TEXTAREA_CLASS} value={form.situation} onChange={(e) => onChange({ situation: e.target.value })} placeholder="в темноте, против чудовищ, один на один" />
        </WizardField>
      )}

      {form.template === 'special' && (
        <>
          <WizardField label="Частота" htmlFor="wizard-stunt-frequency">
            <input id="wizard-stunt-frequency" type="text" className={WIZARD_INPUT_CLASS} value={form.frequency} onChange={(e) => onChange({ frequency: e.target.value })} placeholder="Раз за сцену" />
          </WizardField>
          <WizardField label="Триггер" htmlFor="wizard-stunt-trigger">
            <input id="wizard-stunt-trigger" type="text" className={WIZARD_INPUT_CLASS} value={form.trigger} onChange={(e) => onChange({ trigger: e.target.value })} placeholder="здоровье падает до тяжелого последствия" />
          </WizardField>
          <WizardField label="Эффект" htmlFor="wizard-stunt-effect">
            <textarea id="wizard-stunt-effect" rows={2} className={WIZARD_TEXTAREA_CLASS} value={form.effect} onChange={(e) => onChange({ effect: e.target.value })} placeholder="мгновенно применить Знак Квен без траты действия" />
          </WizardField>
        </>
      )}

      <div className="rounded-md border border-[#202734] bg-[#0B0E14] px-3 py-2.5">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Фраза для листа</span>
        {phrase ? <p className="mt-1 text-xs leading-relaxed text-slate-300">{phrase}</p> : <p className="mt-1 text-xs leading-relaxed text-slate-600">Заполните поля — фраза появится здесь</p>}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="cursor-pointer rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:text-slate-200">Отмена</button>
        <button type="button" onClick={onSave} disabled={!isComplete} className="cursor-pointer rounded-lg border border-[#B9C9DC] bg-[#B9C9DC] px-4 py-2 text-xs font-semibold text-[#0B0E14] transition hover:bg-[#CAD8E8] disabled:opacity-40">
          {isEditing ? 'Сохранить изменения' : 'Сохранить трюк'}
        </button>
      </div>
    </div>
  );
};
