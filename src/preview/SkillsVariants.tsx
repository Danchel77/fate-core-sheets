import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor, type EditorRow, type SkillsEditorVariant } from '../components/SkillsEditor';
import { overflowCharacter, type Character } from '../data/demoCharacter';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/skills-editor.css';
import '../styles/hint.css';

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

const ROWS: EditorRow[] = overflowCharacter.ladder.map((row) => ({
  value: row.value,
  skills: row.skills.map((name) => ({ name, paid: 0 })),
}));

const VARIANTS: { id: SkillsEditorVariant; caption: string }[] = [
  {
    id: 1,
    caption: 'Вариант 1 — «Медальон»: круглый счётчик, квадратный «+», стрелка глифом',
  },
  {
    id: 2,
    caption: 'Вариант 2 — «Тиснение»: пилюля уровня, круглая «+», стрелка в кружке',
  },
  {
    id: 3,
    caption: 'Вариант 3 — «Печать»: крупная цифра с чертой, вытянутая «+», стрелка всегда видна',
  },
];

function Spread({
  character,
  variant,
  caption,
}: {
  character: Character;
  variant: SkillsEditorVariant;
  caption: string;
}) {
  return (
    <div className="variant">
      <p className="variant__caption">{caption}</p>
      <div className="book">
        <div className="page page--left">
          <CharacterBlock variant="lozenge" hintVariant="side" nameStyle="smallcaps" />
          <AspectBlock aspects={character.aspects} hintVariant="side" variant="strong" />
        </div>
        <div className="page page--right">
          <SkillsEditor variant={variant} initial={ROWS} initialLevel={3} initialFree={1} />
          <Placeholder title="Трюки" lines={3} />
          <Placeholder title="Дополнения" lines={2} />
          <Placeholder title="Стресс и последствия" lines={2} />
        </div>
      </div>
    </div>
  );
}

/** Навыки: три облика интерактивной пирамиды с уровнем и свободным очком. */
export default function SkillsVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Навыки — интерактивная пирамида, три облика</h1>
        <p>
          Уровень справа, «+» для новой ступени слева, свободное очко вложено в стрелку ↑
          или в «+ навык». Стрелка поднимает навык на ступень (1 очко), крестик убирает
          навык, «+» сверху открывает следующую ступень. Масштаб 1:1, состояние живёт
          только на странице.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} character={overflowCharacter} variant={id} caption={caption} />
      ))}
    </main>
  );
}
