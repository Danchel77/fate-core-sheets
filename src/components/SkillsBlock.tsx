import type { LadderRow } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';

/** Три варианта сетки из отдельных блоков: пирамида прижата влево. */
export type SkillsVariant = 'tiles' | 'flush' | 'levels';

/** Названия ступеней по официальной русской лестнице Fate Core. */
const LEVEL_NAMES: Record<number, string> = {
  5: 'Великолепно',
  4: 'Отлично',
  3: 'Хорошо',
  2: 'Неплохо',
  1: 'Средне',
};

type Props = {
  ladder: LadderRow[];
  variant: SkillsVariant;
};

/** Блок «Навыки»: навыки — отдельные блоки равного размера, выровненные влево. */
export function SkillsBlock({ ladder, variant }: Props) {
  return (
    <section className={`skblock skblock--${variant}`}>
      <BlockHeader variant="lozenge" title="Навыки" />

      <div className="skb">
        {ladder.map((row) => (
          <div
            className={`skb__row${variant === 'levels' ? ' skb__row--levels' : ''}`}
            key={row.value}
          >
            <span className="skb__rank">
              <span className="skb__value">+{row.value}</span>
              {variant === 'levels' && (
                <span className="skb__level">{LEVEL_NAMES[row.value]}</span>
              )}
            </span>
            <div className="skb__grid">
              {row.skills.map((skill) => (
                <span className="skb__block" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
