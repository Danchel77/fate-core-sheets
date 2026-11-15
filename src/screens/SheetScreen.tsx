import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor, type InitRow } from '../components/SkillsEditor';
import { StuntBlock } from '../components/StuntBlock';
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

/** Собранный веб-лист: единственный источник правды. */
export default function SheetScreen() {
  return (
    <div className="table">
      <main className="book" aria-label="Лист персонажа">
        <article className="page page--left">
          <CharacterBlock />
          <AspectBlock aspects={demoCharacter.aspects} />
        </article>

        <article className="page page--right">
          <SkillsEditor initial={ROWS} initialLevel={4} />
          <StuntBlock stunts={demoCharacter.stunts} baseRefresh={demoCharacter.refresh} />
          <Placeholder title="Дополнения" lines={2} />
          <Placeholder title="Стресс и последствия" lines={2} />
        </article>
      </main>
    </div>
  );
}
