import type { LadderRow } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';

/** Три способа показать лестницу навыков. */
export type SkillsVariant = 'grid' | 'pyramid' | 'ledger';

const MAX_SLOTS = 4;

type Props = {
  ladder: LadderRow[];
  variant: SkillsVariant;
};

/** Блок «Навыки»: пять ступеней +5…+1 по правилу пирамиды Fate Core. */
export function SkillsBlock({ ladder, variant }: Props) {
  const capacityOf = (value: number) => MAX_SLOTS + 1 - value;

  return (
    <section className={`skblock skblock--${variant}`}>
      <BlockHeader variant="lozenge" title="Навыки" />

      {variant === 'grid' && (
        <div className="sk-grid">
          {ladder.map((row) => (
            <div className="sk-grid__row" key={row.value}>
              <span className="sk-grid__value">+{row.value}</span>
              <div className="sk-grid__items">
                {row.skills.length === 0 && (
                  <span className="sk-grid__note">ступень открывается после развития</span>
                )}
                {row.skills.map((skill) => (
                  <span className="sk-grid__cell" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === 'pyramid' && (
        <div className="sk-pyramid">
          {ladder.map((row) => {
            const capacity = capacityOf(row.value);
            const ghosts = capacity - row.skills.length;
            return (
              <div className="sk-pyramid__row" key={row.value}>
                <span className="sk-pyramid__value">+{row.value}</span>
                <div className="sk-pyramid__chips">
                  {row.skills.map((skill) => (
                    <span className="sk-chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                  {Array.from({ length: Math.max(0, ghosts) }, (_, index) => (
                    <span className="sk-chip sk-chip--ghost" key={`ghost-${index}`} aria-hidden="true" />
                  ))}
                  {capacity === 0 && <span className="sk-pyramid__note">—</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {variant === 'ledger' && (
        <div className="sk-ledger">
          {ladder.map((row) => (
            <div className="sk-ledger__row" key={row.value}>
              <span className="sk-ledger__value">+{row.value}</span>
              <div className="sk-ledger__items">
                {row.skills.length === 0 && <span className="sk-ledger__note">—</span>}
                {row.skills.map((skill) => (
                  <span className="sk-ledger__item" key={skill}>
                    <span className="sk-ledger__mark" aria-hidden="true" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
