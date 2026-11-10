import React from 'react';
import { Minus, Plus, TrendingUp } from 'lucide-react';
import { Character } from '../../types/character';

interface AdvancementSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

const MILESTONES = [
  { key: 'minor' as const, label: 'Minor', description: 'Конец сессии: обмен/замена навыка, смена трюка, переименование аспекта.' },
  { key: 'significant' as const, label: 'Significant', description: 'Конец сценария: +1 очко навыка, колонки, тяжёлое последствие.' },
  { key: 'major' as const, label: 'Major', description: 'Конец арки: +1 обновление, потолок навыка, высокая концепция.' },
];

/**
 * Домашний трекер развития. Это не «уровень» Fate Core:
 * вехи применяются вручную по правилам, а блок лишь хранит счётчики.
 */
export const AdvancementSection: React.FC<AdvancementSectionProps> = ({ character, onChange }) => {
  const milestones = character.milestones ?? { minor: 0, significant: 0, major: 0 };
  const skillPoints = character.skillPoints ?? 0;
  const skillCap = character.skillCap ?? 4;

  const setMilestone = (key: 'minor' | 'significant' | 'major', delta: number) => {
    onChange({
      ...character,
      milestones: {
        ...milestones,
        [key]: Math.max(0, milestones[key] + delta),
      },
    });
  };

  const setNumber = (key: 'skillPoints' | 'skillCap', value: number) => {
    onChange({
      ...character,
      [key]: Math.max(0, Math.min(key === 'skillCap' ? 6 : 12, value)),
    });
  };

  return (
    <details className="group mt-5 border-t border-[#1C212B] pt-4 print:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 transition hover:text-slate-200">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>Развитие</span>
        <span className="font-normal normal-case tracking-normal text-slate-600">
          вехи, очки навыков, потолок
        </span>
        <span className="ml-auto text-slate-600 transition group-open:rotate-180">⌄</span>
      </summary>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {MILESTONES.map((milestone) => (
          <div key={milestone.key} className="rounded-lg border border-[#202734] bg-[#0B0E14]/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-200">{milestone.label}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMilestone(milestone.key, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-[#2A3444] text-slate-400 transition hover:border-slate-500 hover:text-white"
                  aria-label={`Убрать веху ${milestone.label}`}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-5 text-center font-mono text-sm font-bold text-white">
                  {milestones[milestone.key]}
                </span>
                <button
                  type="button"
                  onClick={() => setMilestone(milestone.key, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-[#2A3444] text-slate-400 transition hover:border-slate-500 hover:text-white"
                  aria-label={`Добавить веху ${milestone.label}`}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{milestone.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-400">
        <label className="flex items-center gap-2">
          Очки навыков
          <input
            type="number"
            min={0}
            max={12}
            value={skillPoints}
            onChange={(e) => setNumber('skillPoints', Number(e.target.value))}
            className="w-14 rounded border border-[#2A3444] bg-[#0B0E14] px-2 py-1 text-center font-mono text-xs text-slate-200 focus:border-slate-500 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2">
          Потолок навыка
          <input
            type="number"
            min={4}
            max={6}
            value={skillCap}
            onChange={(e) => setNumber('skillCap', Number(e.target.value))}
            className="w-14 rounded border border-[#2A3444] bg-[#0B0E14] px-2 py-1 text-center font-mono text-xs text-slate-200 focus:border-slate-500 focus:outline-none"
          />
        </label>
        <span className="text-slate-600">Применяйте эффекты вех вручную — это трекер, не автобуст.</span>
      </div>
    </details>
  );
};
