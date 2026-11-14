import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsBlock } from '../components/SkillsBlock';
import { advancedCharacter, demoCharacter, overflowCharacter, type Character } from '../data/demoCharacter';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/skills-block.css';
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

function Spread({
  character,
  caption,
  mastery,
}: {
  character: Character;
  caption: string;
  mastery: number;
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
          <SkillsBlock
            ladder={character.ladder}
            variant="flush"
            hintVariant="side"
            mastery={mastery}
            free={0}
          />
          <Placeholder title="Трюки" lines={3} />
          <Placeholder title="Дополнения" lines={2} />
          <Placeholder title="Стресс и последствия" lines={2} />
        </div>
      </div>
    </div>
  );
}

/** Навыки: «кладка» + поведение на предельных данных. */
export default function SkillsVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Навыки — вариант B и предельные данные</h1>
        <p>
          Блоки равного размера, пирамида прижата влево, названия по центру. Если навыков
          больше четырёх — перенос на вторую строку, подпись ступени остаётся по центру
          группы. Пустые ступени не показываются. Масштаб 1:1.
        </p>
      </header>

      <Spread
        character={demoCharacter}
        mastery={20}
        caption="Обычный герой: 20 очков, ступени +4…+1, «+5» ещё нет"
      />
      <Spread
        character={overflowCharacter}
        mastery={21}
        caption="Переполнение: пять навыков на +1 после первой значимой вехи"
      />
      <Spread
        character={advancedCharacter}
        mastery={25}
        caption="Продвинутый герой: планка поднята, ступень +5 появилась"
      />
    </main>
  );
}
