import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import type { HintVariant } from '../components/Hint';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/hint.css';

const VARIANTS: { id: HintVariant; caption: string }[] = [
  { id: 'pointer', caption: 'Вариант A — с ромбом: плашка над словом, указатель снизу' },
  { id: 'float', caption: 'Вариант B — парящая: плашка над словом без указателя, мягкая тень' },
  { id: 'side', caption: 'Вариант C — сбоку: плашка справа от слова, указатель слева' },
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

function Spread({ variant, caption }: { variant: HintVariant; caption: string }) {
  return (
    <div className="variant">
      <p className="variant__caption">{caption}</p>
      <div className="book">
        <div className="page page--left">
          <CharacterBlock variant="lozenge" hintVariant={variant} nameStyle="smallcaps" />
          <AspectBlock aspects={demoCharacter.aspects} hintVariant={variant} />
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

/** Подсказки: три способа всплывания, плашка в стиле листа. */
export default function BlockVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Подсказки — всплывающие плашки</h1>
        <p>
          Плашка всплывает поверх листа и закрывается сама: уход мыши, Escape или клик мимо.
          Подсказки есть у аспектов, у жетонов судьбы и у обновления. Масштаб 1:1.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} variant={id} caption={caption} />
      ))}
    </main>
  );
}
