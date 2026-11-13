import { AspectBlock, type AspectVariant } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';

const VARIANTS: { id: AspectVariant; caption: string }[] = [
  { id: 'rows', caption: 'Вариант A — книжные строки: подпись слева, текст справа, разделители' },
  { id: 'cards', caption: 'Вариант B — карточки: каждое поле в своей рамке' },
  { id: 'print', caption: 'Вариант C — печатные строки: подпись над линией, как в бланке' },
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

function Spread({ variant, caption }: { variant: AspectVariant; caption: string }) {
  return (
    <div className="variant">
      <p className="variant__caption">{caption}</p>
      <div className="book">
        <div className="page page--left">
          <CharacterBlock variant="lozenge" nameStyle="smallcaps" />
          <AspectBlock variant={variant} aspects={demoCharacter.aspects} />
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

/** Блок «Аспекты» в реальном масштабе: три варианта, поля редактируются. */
export default function BlockVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Аспекты — три варианта</h1>
        <p>
          Все поля редактируются прямо на листе: кликните по тексту. Кнопка «?» рядом с
          подписью раскрывает совет по этому аспекту. Масштаб 1:1.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} variant={id} caption={caption} />
      ))}
    </main>
  );
}
