import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import type { HintVariant } from '../components/HintWord';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/hint.css';

const VARIANTS: { id: HintVariant; caption: string }[] = [
  { id: 'cartouche', caption: 'Вариант A — картуш: сплошная линия с затуханием, плашка с двойной рамкой' },
  { id: 'plate', caption: 'Вариант B — уголки: пунктир с затуханием, карточка с уголками' },
  { id: 'bookmark', caption: 'Вариант C — закладка: тонкая золотая линия, карточка с тёмной полосой' },
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
          <CharacterBlock variant="lozenge" nameStyle="smallcaps" />
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

/** Блок «Аспекты»: подсказки в словах, три варианта тултипов. */
export default function BlockVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Аспекты — подсказки</h1>
        <p>
          Пять полей переписаны по замечаниям: подпись сверху, текст на линии, отступ от
          края. Подсказка открывается нажатием на подпись и раскрывается плашкой прямо под
          строкой — соседние поля не перекрываются. Масштаб 1:1.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} variant={id} caption={caption} />
      ))}
    </main>
  );
}
