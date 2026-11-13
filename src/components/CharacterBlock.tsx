import { demoCharacter } from '../data/demoCharacter';
import { BlockHeader, type HeaderVariant } from './BlockHeader';
import { FatePoints } from './FatePoints';
import { PortraitPlate } from './PortraitPlate';

type Props = {
  variant: HeaderVariant;
};

/** Блок «Персонаж»: портрет слева, имя, жетоны судьбы и описание справа. */
export function CharacterBlock({ variant }: Props) {
  const c = demoCharacter;

  return (
    <section className={`cblock cblock--${variant}`}>
      <BlockHeader variant={variant} title="Персонаж" />
      <div className="cblock__body">
        <div className="cblock__portrait">
          <PortraitPlate src={c.portrait} alt={`Портрет: ${c.name}`} />
        </div>
        <div className="cblock__main">
          <h2 className="cblock__name">{c.name}</h2>
          <FatePoints initial={c.fatePoints} refresh={c.refresh} />
          <p className="cblock__desc">{c.description}</p>
        </div>
      </div>
    </section>
  );
}
