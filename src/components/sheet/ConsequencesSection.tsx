import React from 'react';
import { Character } from '../../types/character';

interface ConsequencesSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

const CONSEQUENCES = [
  { key: 'mild' as const, value: 2, label: 'Лёгкое' },
  { key: 'moderate' as const, value: 4, label: 'Среднее' },
  { key: 'severe' as const, value: 6, label: 'Серьёзное' },
];

export const ConsequencesSection: React.FC<ConsequencesSectionProps> = ({ character, onChange }) => {
  const update = (key: 'mild' | 'moderate' | 'severe', aspect: string) => {
    onChange({
      ...character,
      consequences: {
        ...character.consequences,
        [key]: { ...character.consequences[key], aspect },
      },
    });
  };

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          Последствия
        </h2>
        <span className="font-mono text-[10px] tabular-nums text-slate-500">2 / 4 / 6</span>
      </div>

      <div>
        {CONSEQUENCES.map((consequence) => (
          <div
            key={consequence.key}
            className="grid grid-cols-[28px_68px_1fr] items-center gap-3 border-b border-[#1C212B]/70 py-2.5 last:border-b-0"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded border border-[#2A3444] bg-[#161C26] font-mono text-[10px] font-bold text-slate-400">
              {consequence.value}
            </span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
              {consequence.label}
            </span>
            <input
              type="text"
              value={character.consequences[consequence.key].aspect}
              onChange={(event) => update(consequence.key, event.target.value)}
              aria-label={`Аспект последствия: ${consequence.label}`}
              className="w-full border-b border-[#202734] bg-transparent pb-1 text-xs text-slate-200 transition placeholder:text-slate-600 focus:border-slate-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
