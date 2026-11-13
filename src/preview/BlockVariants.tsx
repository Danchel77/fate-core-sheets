import { CharacterBlock, type NameStyle } from '../components/CharacterBlock';
import '../styles/sheet.css';
import '../styles/character-block.css';

const VARIANTS: { id: NameStyle; caption: string }[] = [
  {
    id: 'smallcaps',
    caption: 'Вариант A — капитель Cormorant SC, тёмные чернила',
  },
  {
    id: 'prata',
    caption: 'Вариант B — Prata, плотная антиква, тёплый коричневый',
  },
  {
    id: 'playfair',
    caption: 'Вариант C — Playfair Display, курсив, бронза',
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

function Spread({ nameStyle, caption }: { nameStyle: NameStyle; caption: string }) {
  return (
    <div className="variant">
      <p className="variant__caption">{caption}</p>
      <div className="book">
        <div className="page page--left">
          <CharacterBlock variant="cartouche" nameStyle={nameStyle} />
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

/** Блок «Персонаж»: выбранный заголовок, облегчённая рамка и три начертания имени. */
export default function BlockVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Имя персонажа — три варианта</h1>
        <p>
          Плашка заголовка стала ниже, рамка портрета — в том же стиле: светлая текстура,
          тонкая двойная рамка, приглушённые уголки. Различается только имя. Масштаб 1:1.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} nameStyle={id} caption={caption} />
      ))}
    </main>
  );
}
