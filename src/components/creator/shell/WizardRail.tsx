import React from 'react';
import { SETTING_PRESETS } from '../../../config/presets';
import { calculateRefresh, countRealStunts } from '../../../utils/fateMath';
import { Character } from '../../../types/character';
import { ChecklistRow } from './ChecklistRow';

interface WizardRailProps {
  draft: Character;
  onJump: (id: string) => void;
  canSave: boolean;
  missingFields: string[];
  onSave: () => void;
}

export const WizardRail: React.FC<WizardRailProps> = ({ draft, onJump, canSave, missingFields, onSave }) => {
  const refresh = calculateRefresh(countRealStunts(draft.stunts), draft.freeStunts ?? 3, draft.baseRefresh ?? 3);
  const totalSkills = Object.values(draft.skills).flat().length;
  const stuntCount = countRealStunts(draft.stunts);

  return (
    <aside className="sticky top-[124px] self-start border-l border-[#1C212B] pl-6">
      <div>
        <p className="text-[15px] text-slate-100">{draft.name.trim() || 'Без имени'}</p>
        <p className="text-[12px] text-slate-400">{SETTING_PRESETS[draft.setting].name} · Восстановление {refresh}</p>
        <p className="mt-2 text-[12px] tabular-nums text-slate-500">Навыки {totalSkills}/10 · Трюки {stuntCount}</p>
      </div>

      <div className="mt-6 border-t border-[#1C212B] pt-4">
        <ChecklistRow label="Основы" done={draft.name.trim() !== ''} onClick={() => onJump('basics')} />
        <ChecklistRow label="Аспекты" done={!!draft.aspects.high_concept?.trim() && !!draft.aspects.trouble?.trim()} onClick={() => onJump('aspects')} />
        <ChecklistRow label="Навыки" done={totalSkills >= 10} onClick={() => onJump('skills')} />
        <ChecklistRow label="Трюки" done={stuntCount > 0} optional onClick={() => onJump('stunts')} />
      </div>

      <div className="mt-6 border-t border-[#1C212B] pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="w-full rounded-md bg-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-900 transition hover:bg-white disabled:opacity-40"
        >
          Создать персонажа
        </button>
        {!canSave && (
          <p className="mt-2 text-[11px] text-slate-500">Заполните: {missingFields.join(', ')}</p>
        )}
      </div>
    </aside>
  );
};
