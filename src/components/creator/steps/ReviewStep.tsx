import React from 'react';
import { SETTING_PRESETS } from '../../../config/presets';
import { calculateRefresh, countRealStunts } from '../../../utils/fateMath';
import { Character } from '../../../types/character';

interface ReviewStepProps {
  draft: Character;
  onJump: (sectionId: string) => void;
}

const ASPECT_ROWS: { key: string; label: string }[] = [
  { key: 'high_concept', label: 'КОНЦЕПЦИЯ' },
  { key: 'trouble', label: 'ПРОБЛЕМА' },
  { key: 'aspect_3', label: 'ПРОШЛОЕ' },
  { key: 'aspect_4', label: 'СВЯЗЬ' },
  { key: 'aspect_5', label: 'ЦЕЛЬ' },
];

const SKILL_LEVELS = [6, 5, 4, 3, 2, 1] as const;

export const ReviewStep: React.FC<ReviewStepProps> = ({ draft, onJump }) => {
  const skillCatalog = SETTING_PRESETS[draft.setting].skills;
  const stuntCount = countRealStunts(draft.stunts);
  const refresh = calculateRefresh(stuntCount, draft.freeStunts ?? 3, draft.baseRefresh ?? 3);

  const skillRows = SKILL_LEVELS.map((level) => ({
    level,
    names: (draft.skills[level] || []).map((id) => skillCatalog.find((s) => s.id === id)?.nameRu || id),
  })).filter((row) => row.names.length > 0);

  const renderBlock = (title: string, onEdit: () => void, children: React.ReactNode) => (
    <div className="mt-5 border-t border-[#1C212B] pt-5 first:mt-0 first:border-0 first:pt-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h3>
        <button onClick={onEdit} className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline underline-offset-4">Изменить</button>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );

  return (
    <div className="space-y-0">
      {renderBlock('Основы', () => onJump('basics'), (
        <div>
          <p className="font-fantasy text-2xl font-semibold leading-tight text-white">{draft.name.trim() || 'Без имени'}</p>
          <p className="mt-1 text-xs text-slate-400">{SETTING_PRESETS[draft.setting].name} · Восстановление {refresh}</p>
          {draft.description.trim() && <p className="mt-2 text-xs leading-relaxed text-slate-300">{draft.description}</p>}
        </div>
      ))}

      {renderBlock('Аспекты', () => onJump('aspects'), (
        <dl className="space-y-2">
          {ASPECT_ROWS.map(({ key, label }) => {
            const value = (draft.aspects[key] || '').trim();
            return (
              <div key={key} className="grid sm:grid-cols-[140px_minmax(0,1fr)]">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</dt>
                <dd className={`text-xs ${value ? 'text-slate-200' : 'text-slate-600'}`}>
                  {value || '—'}
                </dd>
              </div>
            );
          })}
        </dl>
      ))}

      {renderBlock('Навыки', () => onJump('skills'), (
        <div className="space-y-1">
          {skillRows.length > 0 ? (
            skillRows.map((row) => (
              <div key={row.level} className="flex gap-2">
                <span className="w-6 font-mono text-xs text-slate-500">+{row.level}</span>
                <span className="text-xs text-slate-200">{row.names.join(', ')}</span>
              </div>
            ))
          ) : <p className="text-xs text-slate-500">Не распределены</p>}
        </div>
      ))}

      {renderBlock('Трюки', () => onJump('stunts'), (
        <div className="space-y-2">
          {draft.stunts.length > 0 ? (
            draft.stunts.map((stunt) => (
              <div key={stunt.id}>
                <p className="text-xs text-slate-200">{stunt.name.trim()}</p>
                {stunt.description.trim() && <p className="text-[10px] leading-relaxed text-slate-400">{stunt.description}</p>}
              </div>
            ))
          ) : <p className="text-xs text-slate-500">Нет трюков</p>}
        </div>
      ))}
    </div>
  );
};
