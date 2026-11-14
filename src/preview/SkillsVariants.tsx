import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor, type InitRow } from '../components/SkillsEditor';
import { demoCharacter } from '../data/demoCharacter';
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

/** Рабочая пирамида: 21 очко, уровень 4 → два свободных очка. */
const ROWS: InitRow[] = [
  { value: 4, skills: ['Драка'] },
  { value: 3, skills: ['Внимательность', 'Магия'] },
  { value: 2, skills: ['Скрытность', 'Воля', 'Монстрология'] },
  {
    value: 1,
    skills: ['Атлетика', 'Верховая езда', 'Знания', 'Телосложение', 'Эмпатия'],
  },
];

/** Навыки: рабочий блок с уровнем, свободными очками и слотами стартовой пирамиды. */
export default function SkillsVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Навыки — рабочий блок</h1>
        <p>
          «+» и «−» в ячейке крайней ступени добавляют и откатывают ступень. Пустые слоты стартовой
          пирамиды стоят в конце ступени: убрали навык — остальные сдвинулись, а пустой слот ушёл
          вправо. Стрелка ↑ появляется, пока есть очко. Уровень справа: стрелки ↑↓ меняют его и
          проступают при наведении. Масштаб 1:1.
        </p>
      </header>

      <div className="variant">
        <p className="variant__caption">Блок «Навыки», вариант 1</p>
        <div className="book">
          <div className="page page--left">
            <CharacterBlock variant="lozenge" hintVariant="side" nameStyle="smallcaps" />
            <AspectBlock aspects={demoCharacter.aspects} hintVariant="side" variant="strong" />
          </div>
          <div className="page page--right">
            <SkillsEditor initial={ROWS} initialLevel={4} />
            <Placeholder title="Трюки" lines={3} />
            <Placeholder title="Дополнения" lines={2} />
            <Placeholder title="Стресс и последствия" lines={2} />
          </div>
        </div>
      </div>
    </main>
  );
}
