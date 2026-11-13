import { CharacterBlock } from '../components/CharacterBlock';
import type { HeaderVariant } from '../components/BlockHeader';
import '../styles/sheet.css';
import '../styles/character-block.css';

const VARIANTS: { id: HeaderVariant; caption: string }[] = [
  {
    id: 'caps',
    caption: 'Вариант A — капители: орнамент в натуральной пропорции, отбит линейкой',
  },
  {
    id: 'lozenge',
    caption: 'Вариант B — ромбы: острые навершия на концах плашки',
  },
  {
    id: 'bevel',
    caption: 'Вариант C — скосы: срезанные углы и золотая кромка по срезу',
  },
];

function Placeholder({ title, lines }: { title: string; lines: number }) {
  return (
    <div className="ph">
      <div className="ph__title">{title}</div>
      {Array.from({ length: lines }, (_, i) => (
        <div className="ph__line" key={i} />
      ))}
    </div>
  );
}

function Spread({ variant, caption }: { variant: HeaderVariant; caption: string }) {
  return (
    <div className="variant">
      <p className="variant__caption">{caption}</p>
      <div className="book">
        <div className="page page--left">
          <CharacterBlock variant={variant} nameStyle="smallcaps" />
          <Placeholder title="Аспекты" lines={5} />
        </div>
        <div className="page page--right">
          <Placeholder title="Навыки" lines={5} />
          <Placeholder title="Трюки" lines={3} />
          <Placeholder title="Дополнения" lines={2} />
          <Placeholder title="Стресс и последствия" lines={2} />
        </div>
      </div>
    </div>
  );
}

/** Концы плашки: три варианта при неизменных стиле, размере и имени. */
export default function BlockVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Концы плашки — три варианта</h1>
        <p>
          Имя стало жирнее, размер прежний. Стиль и высота плашки не менялись — различаются
          только концы. Масштаб 1:1.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} variant={id} caption={caption} />
      ))}
    </main>
  );
}
