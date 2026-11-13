import { useState } from 'react';

type Props = {
  initial: number;
  refresh: number;
  max?: number;
};

/**
 * Жетоны судьбы: кликабельные кружки + значение обновления.
 * Повторный клик по последнему заполненному снимает один жетон.
 */
export function FatePoints({ initial, refresh, max = 5 }: Props) {
  const [value, setValue] = useState(initial);

  const pick = (index: number) => {
    setValue(index + 1 === value ? index : index + 1);
  };

  return (
    <div className="fp">
      <div className="fp__head">
        <span className="fp__label">Жетоны судьбы</span>
        <span className="fp__refresh">
          Обновление <b>{refresh}</b>
        </span>
      </div>
      <div className="fp__row" role="group" aria-label="Текущие жетоны судьбы">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < value;
          return (
            <button
              key={i}
              type="button"
              className={filled ? 'fp__coin is-filled' : 'fp__coin'}
              aria-pressed={filled}
              aria-label={`Жетон ${i + 1}`}
              onClick={() => pick(i)}
            />
          );
        })}
      </div>
    </div>
  );
}
