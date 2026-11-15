import { demoCharacter } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';
import { FatePoints } from './FatePoints';
import { PortraitPlate } from './PortraitPlate';
import '../styles/portrait-plate.css';

/** Блок «Персонаж»: портрет слева, имя, жетоны судьбы и описание справа. */
export function CharacterBlock() {
  const c = demoCharacter;

  return (
    <section className="cblock">
      <BlockHeader title="Персонаж" />
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
