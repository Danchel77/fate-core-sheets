import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsBlock, type SkillsVariant } from '../components/SkillsBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/skills-block.css';
import '../styles/hint.css';

const VARIANTS: { id: SkillsVariant; caption: string }[] = [
  {
    id: 'grid',
    caption: 'Вариант A — ступени: таблица с ячейками, значение ступени слева',
  },
  {
    id: 'pyramid',
    caption: 'Вариант B — пирамида: навыки-чипы, выровненные по центру ступени',
  },
  {
    id: 'ledger',
    caption: 'Вариант C — леджер: ступени строками, навыки списком с ромбами',
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

function Spread({ variant, caption }: { variant: SkillsVariant; caption: string }) {
  return (
    <div className="variant">
      <p className="variant__caption">{caption}</p>
      <div className="book">
        <div className="page page--left">
          <CharacterBlock variant="lozenge" hintVariant="side" nameStyle="smallcaps" />
          <AspectBlock aspects={demoCharacter.aspects} hintVariant="side" variant="strong" />
        </div>
        <div className="page page--right">
          <SkillsBlock ladder={demoCharacter.ladder} variant={variant} />
          <Placeholder title="Трюки" lines={3} />
          <Placeholder title="Дополнения" lines={2} />
          <Placeholder title="Стресс и последствия" lines={2} />
        </div>
      </div>
    </div>
  );
}

/** Навыки: лестница +5…+1 в трёх подачах, в реальном масштабе листа. */
export default function SkillsVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Навыки — три варианта блока</h1>
        <p>
          Пирамида: одна ступень +4, две +3, три +2, четыре +1; ступень +5 откроется
          после развития. Свободные ячейки — место для записи. Масштаб 1:1.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} variant={id} caption={caption} />
      ))}
    </main>
  );
}
