import { AspectBlock, type AspectVariant } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/hint.css';

const VARIANTS: { id: AspectVariant; caption: string }[] = [
  {
    id: 'strong',
    caption: 'Вариант A — яркая линия: одна плотная линия во всю ширину, ромб лежит на ней',
  },
  {
    id: 'double',
    caption: 'Вариант B — двойная линия: две параллельные линии, ромб перекрывает обе',
  },
  {
    id: 'gap',
    caption: 'Вариант C — разрыв: линия расходится к краям, ромб висит в разрыве',
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

function Spread({ variant, caption }: { variant: AspectVariant; caption: string }) {
  return (
    <div className="variant">
      <p className="variant__caption">{caption}</p>
      <div className="book">
        <div className="page page--left">
          <CharacterBlock variant="lozenge" hintVariant="side" nameStyle="smallcaps" />
          <AspectBlock aspects={demoCharacter.aspects} hintVariant="side" variant={variant} />
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

/** Аспекты: один блок, зоны разделяет более яркая линия с ромбом — три варианта. */
export default function BlockVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Аспекты — одна плашка, разделитель с ромбом</h1>
        <p>
          Блок не разбиваем: два подписанных якоря и три свободные строки живут в одной
          плашке, а зоны отделяет линия ярче обычных строк. Масштаб 1:1, ширина листа 1180 px.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} variant={id} caption={caption} />
      ))}
    </main>
  );
}
