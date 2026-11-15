import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor, type InitRow } from '../components/SkillsEditor';
import { StuntBlock } from '../components/StuntBlock';
import { StressBlock } from '../components/StressBlock';
import { ExtrasBlock } from '../components/ExtrasBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/skills-editor.css';
import '../styles/hint.css';

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
          <StressBlock
            physical={demoCharacter.physicalStress}
            mental={demoCharacter.mentalStress}
            consequences={demoCharacter.consequences}
          />
          <AspectBlock aspects={demoCharacter.aspects} />
        </article>

        <article className="page page--right">
          <SkillsEditor initial={ROWS} initialLevel={4} />
          <StuntBlock stunts={demoCharacter.stunts} baseRefresh={demoCharacter.refresh} />
          <ExtrasBlock initial={demoCharacter.extras} />
        </article>
      </main>
    </div>
  );
}
