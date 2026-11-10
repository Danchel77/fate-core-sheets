import React from 'react';
import { Lock } from 'lucide-react';
import { Character } from '../../types/character';
import { getSkillRating } from '../../utils/fateMath';

interface StressSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

export const StressSection: React.FC<StressSectionProps> = ({ character, onChange }) => {
  const physiqueRating = getSkillRating(character, 'physique');
  const willRating = getSkillRating(character, 'will');

  const maxPhysicalBoxes = physiqueRating >= 3 ? 4 : physiqueRating >= 1 ? 3 : 2;
  const maxMentalBoxes = willRating >= 3 ? 4 : willRating >= 1 ? 3 : 2;

  const toggleStress = (track: 'physical' | 'mental', index: number) => {
    const listKey = track === 'physical' ? 'physicalStress' : 'mentalStress';
    const currentList = [...character[listKey]];

    const existingIndex = currentList.findIndex((box) => box.index === index);
    if (existingIndex >= 0) {
      currentList[existingIndex] = {
        ...currentList[existingIndex],
        checked: !currentList[existingIndex].checked,
      };
    } else {
      currentList.push({ index, value: index, checked: true });
    }

    onChange({ ...character, [listKey]: currentList });
  };

  const handleConsequenceChange = (
    severity: 'mild' | 'moderate' | 'severe',
    aspectText: string
  ) => {
    onChange({
      ...character,
      consequences: {
        ...character.consequences,
        [severity]: { ...character.consequences[severity], aspect: aspectText },
      },
    });
  };

  const renderTrack = (
    track: 'physical' | 'mental',
    label: string,
    skillLabel: string,
    rating: number,
    maxBoxes: number
  ) => (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-300">{label}</span>
        <span className="text-[10px] text-slate-600">
          {skillLabel} {rating > 0 ? `+${rating}` : '0'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((boxNum) => {
          const isUnlocked = boxNum <= maxBoxes;
          const isChecked = character[
            track === 'physical' ? 'physicalStress' : 'mentalStress'
          ].some((box) => box.index === boxNum && box.checked);

          if (!isUnlocked) {
            return (
              <div
                key={boxNum}
                className="flex h-8 w-8 items-center justify-center rounded border border-dashed border-[#252D3A] text-slate-700"
                title={`Требуется ${skillLabel} +${boxNum === 3 ? 1 : 3}`}
              >
                <Lock className="h-3 w-3 opacity-50" />
              </div>
            );
          }

          return (
            <button
              type="button"
              key={boxNum}
              onClick={() => toggleStress(track, boxNum)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded border font-mono text-xs font-bold transition ${
                isChecked
                  ? track === 'physical'
                    ? 'border-red-700/60 bg-red-950/60 text-red-300 line-through'
                    : 'border-sky-700/60 bg-sky-950/60 text-sky-300 line-through'
                  : 'border-[#2A3444] bg-[#161C26] text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
              title={isChecked ? 'Отметить как свободный' : `Получить ${boxNum} стресса`}
            >
              {boxNum}
            </button>
          );
        })}
      </div>
    </div>
  );

  const consequences = [
    { key: 'mild' as const, value: 2, label: 'Лёгкое' },
    { key: 'moderate' as const, value: 4, label: 'Среднее' },
    { key: 'severe' as const, value: 6, label: 'Серьёзное' },
  ];

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          Стресс
        </h2>
        <span className="text-[10px] text-slate-600">по навыкам</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {renderTrack('physical', 'Физический', 'Телосложение', physiqueRating, maxPhysicalBoxes)}
        {renderTrack('mental', 'Ментальный', 'Воля', willRating, maxMentalBoxes)}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-[#1C212B] pb-2.5">
          <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
            Последствия
          </h2>
          <span className="text-[10px] text-slate-600">2 / 4 / 6</span>
        </div>

        <div>
          {consequences.map((consequence) => (
            <div
              key={consequence.key}
              className="grid grid-cols-[28px_64px_1fr] items-center gap-3 border-b border-[#1C212B]/70 py-2.5 last:border-b-0"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded border border-[#2A3444] bg-[#161C26] font-mono text-[10px] font-bold text-slate-400">
                {consequence.value}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                {consequence.label}
              </span>
              <input
                type="text"
                value={character.consequences[consequence.key].aspect}
                onChange={(e) =>
                  handleConsequenceChange(consequence.key, e.target.value)
                }
                placeholder="Формулировка аспекта травмы..."
                className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
