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
        <span className="text-[10px] text-slate-500">
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
                className="flex h-9 w-9 items-center justify-center rounded border border-dashed border-[#252D3A] text-slate-600"
                title={`Требуется ${skillLabel} +${boxNum === 3 ? 1 : 3}`}
              >
                <Lock className="h-3 w-3 opacity-60" />
              </div>
            );
          }

          return (
            <button
              type="button"
              key={boxNum}
              onClick={() => toggleStress(track, boxNum)}
              aria-pressed={isChecked}
              className={`relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded border font-mono text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/50 ${
                isChecked
                  ? 'border-[#64748B] bg-[#1A2230] text-slate-500'
                  : 'border-[#2A3444] bg-[#161C26] text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
              title={isChecked ? 'Отметить как свободный' : `Получить ${boxNum} стресса`}
            >
              {isChecked && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 46%, rgba(148,163,184,0.55) 47%, rgba(148,163,184,0.55) 53%, transparent 54%)',
                  }}
                />
              )}
              <span className="relative z-10">{boxNum}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-[#1C212B] pb-2.5">
        <h2 className="font-fantasy text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          Стресс
        </h2>
        <span className="text-[10px] text-slate-500">по навыкам</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {renderTrack('physical', 'Физический', 'Телосложение', physiqueRating, maxPhysicalBoxes)}
        {renderTrack('mental', 'Ментальный', 'Воля', willRating, maxMentalBoxes)}
      </div>
    </section>
  );
};
