import React from 'react';
import { Character } from '../../types/character';
import { FieldLabel } from '../common/FieldLabel';

interface ConsequencesSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

const CONSEQUENCES = [
  { key: 'mild' as const, value: 2, label: 'Лёгкое' },
  { key: 'moderate' as const, value: 4, label: 'Среднее' },
  { key: 'severe' as const, value: 6, label: 'Серьёзное' },
];

/**
 * Три строки последствий: штраф в узком столбце, подпись и поле аспекта.
 * Заголовок даёт лента SheetBlock — своего здесь нет.
 */
export const ConsequencesSection: React.FC<ConsequencesSectionProps> = ({
  character,
  onChange,
}) => {
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
    <section className="flex flex-col">
      {CONSEQUENCES.map((consequence) => (
        <div
          key={consequence.key}
          data-kit="sheet-consequence"
          className="grid grid-cols-[2.5rem_6rem_minmax(0,1fr)] items-center gap-2 border-b border-line py-1.5 last:border-b-0"
        >
          <span className="text-right font-sans text-xs tabular-nums text-gold-light">
            −{consequence.value}
          </span>

          <FieldLabel>{consequence.label}</FieldLabel>

          <input
            type="text"
            value={character.consequences[consequence.key].aspect}
            onChange={(event) => update(consequence.key, event.target.value)}
            aria-label={`Аспект последствия: ${consequence.label}`}
            placeholder="Аспект"
            className="min-w-0 w-full border border-line bg-ink-raised px-2 py-1 font-sans text-sm text-text placeholder:text-text-muted focus:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
          />
        </div>
      ))}
    </section>
  );
};
