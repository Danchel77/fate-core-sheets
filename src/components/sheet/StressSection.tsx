import React from 'react';
import { Lock } from 'lucide-react';
import { Character } from '../../types/character';
import { getSkillRating } from '../../utils/fateMath';
import { FieldLabel } from '../common/FieldLabel';
import { StressBox } from '../common/StressBox';

interface StressSectionProps {
  character: Character;
  onChange: (updated: Character) => void;
}

/**
 * Две дорожки стресса: физическая и ментальная.
 * Заголовок даёт лента SheetBlock, поэтому своего h2 здесь нет.
 */
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
    <div className="flex flex-col gap-1.5">
      {/* Дорожки стоят в двух колонках: подпись и навык держим двумя строками,
          чтобы клетки обеих дорожек начинались на одном уровне. */}
      <div className="flex flex-col [&_label]:leading-none">
        <FieldLabel>{label}</FieldLabel>
        <span className="font-sans text-xs leading-none tabular-nums text-text-muted">
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
                data-stress-cell
                title={`Требуется ${skillLabel} +${boxNum === 3 ? 1 : 3}`}
                className="flex size-7 items-center justify-center border border-dashed border-line text-text-muted"
              >
                <Lock className="size-3" strokeWidth={1.5} aria-hidden="true" />
              </div>
            );
          }

          return (
            <button
              type="button"
              key={boxNum}
              data-stress-cell
              onClick={() => toggleStress(track, boxNum)}
              aria-pressed={isChecked}
              title={isChecked ? 'Отметить как свободный' : `Получить ${boxNum} стресса`}
              className="block size-7 cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <StressBox filled={isChecked} />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section data-kit="sheet-stress">
      <div className="grid gap-4 sm:grid-cols-2">
        {renderTrack('physical', 'Физический', 'Телосложение', physiqueRating, maxPhysicalBoxes)}
        {renderTrack('mental', 'Ментальный', 'Воля', willRating, maxMentalBoxes)}
      </div>
    </section>
  );
};
