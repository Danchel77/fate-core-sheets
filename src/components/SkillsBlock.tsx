import type { LadderRow } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';
import { Hint, type HintVariant } from './Hint';

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
  hintVariant?: HintVariant;
  mastery?: number;
  free?: number;
};

/** Блок «Навыки»: блоки равного размера, пирамида влево, переполнение — переносом. */
export function SkillsBlock({
  ladder,
  variant,
  hintVariant = 'side',
  mastery = 20,
  free = 0,
}: Props) {
  return (
    <section className={`skblock skblock--${variant}`}>
      <BlockHeader variant="lozenge" title="Навыки" />

      <div className="skb__meta">
        <Hint
          variant={hintVariant}
          title="Мастерство"
          text="Сколько очков вложено в навыки. На старте — 20. После завершения сюжетной арки мастерство растёт на единицу: это очко можно вложить в новый навык или поднять уже имеющийся."
        >
          Мастерство
        </Hint>
        <span className="skb__meta-value">{mastery}</span>
        <span className="skb__meta-free">свободно {free}</span>
      </div>

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
