import { CharacterBlock } from '../components/CharacterBlock';
import type { HeaderVariant } from '../components/BlockHeader';
import '../styles/sheet.css';
import '../styles/character-block.css';

const VARIANTS: { id: HeaderVariant; caption: string }[] = [
  {
    id: 'cartouche',
    caption: 'Вариант 1 — вставка: текстурированная заливка, двойная рамка, углы',
  },
  {
    id: 'emboss',
    caption: 'Вариант 2 — тиснение: заливка с внутренней тенью, ромбы по краям',
  },
  {
    id: 'rule',
    caption: 'Вариант 3 — линейка: золотой заголовок и плотные линии',
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
          <CharacterBlock variant={variant} />
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

/** Блок «Персонаж» в реальном масштабе листа: три трактовки заголовка. */
export default function BlockVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Блок «Персонаж» в реальном масштабе</h1>
        <p>
          Один пиксель = один пиксель будущего листа. Серое — будущие блоки, они ещё не
          сделаны. Кружки жетонов кликабельные.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} variant={id} caption={caption} />
      ))}
    </main>
  );
}
