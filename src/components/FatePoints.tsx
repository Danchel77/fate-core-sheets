import { useEffect, useState } from 'react';
import { Hint } from './Hint';

export const FATE_POINTS_HINT =
  'Валюта истории. Отдай жетон, чтобы воспользоваться аспектом: +2 к броску или переброс.';
export const REFRESH_HINT = 'Сколько жетонов судьбы герой получает в начале каждой игровой сессии.';

type Props = {
  initial: number;
  refresh: number;
  max?: number;
  /** Новое число жетонов: лист сохраняет его сразу. */
  onChange?: (value: number) => void;
};

/**
 * Жетоны судьбы: кликабельные кружки + значение обновления.
 * Повторный клик по последнему заполненному снимает один жетон.
 */
export function FatePoints({ initial, refresh, max = 5, onChange }: Props) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  const pick = (index: number) => {
    const next = index + 1 === value ? index : index + 1;
    setValue(next);
    onChange?.(next);
  };

  return (
    <div className="fp">
      <div className="fp__head">
        <span className="fp__label">
          <Hint title="Жетоны судьбы" text={FATE_POINTS_HINT}>
            Жетоны судьбы
          </Hint>
        </span>
        <span className="fp__refresh">
          <Hint title="Обновление" text={REFRESH_HINT}>
            Обновление
          </Hint>{' '}
          <b>{refresh}</b>
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
