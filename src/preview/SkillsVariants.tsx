import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor, type EditorRow, type SkillsEditorVariant } from '../components/SkillsEditor';
import { demoCharacter, type Character } from '../data/demoCharacter';
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
const ROWS: EditorRow[] = [
  { value: 4, skills: [{ name: 'Драка' }] },
  { value: 3, skills: [{ name: 'Внимательность' }, { name: 'Магия' }] },
  { value: 2, skills: [{ name: 'Скрытность' }, { name: 'Воля' }, { name: 'Монстрология' }] },
  {
    value: 1,
    skills: [
      { name: 'Атлетика' },
      { name: 'Верховая езда' },
      { name: 'Знания' },
      { name: 'Телосложение' },
      { name: 'Эмпатия' },
    ],
  },
];

const VARIANTS: { id: SkillsEditorVariant; caption: string }[] = [
  {
    id: 1,
    caption: 'Вариант 1 — «Жёлоб»: +/− столбиком прямо над «+4», уровень в правой части верхней ступени',
  },
  {
    id: 2,
    caption: 'Вариант 2 — «Шапка»: +/− парой над «+4», уровень с кошельком в ленте заголовка',
  },
  {
    id: 3,
    caption: 'Вариант 3 — «Печать»: +/− одной пилюлей над «+4», номер уровня в кольце',
  },
];

function Spread({ character, variant, caption }: { character: Character; variant: SkillsEditorVariant; caption: string }) {
  return (
    <div className="variant">
      <p className="variant__caption">{caption}</p>
      <div className="book">
        <div className="page page--left">
          <CharacterBlock variant="lozenge" hintVariant="side" nameStyle="smallcaps" />
          <AspectBlock aspects={character.aspects} hintVariant="side" variant="strong" />
        </div>
        <div className="page page--right">
          <SkillsEditor variant={variant} initial={ROWS} initialLevel={4} />
          <Placeholder title="Трюки" lines={3} />
          <Placeholder title="Дополнения" lines={2} />
          <Placeholder title="Стресс и последствия" lines={2} />
        </div>
      </div>
    </div>
  );
}

/** Навыки: три облика интерактивной пирамиды с уровнем и свободными очками. */
export default function SkillsVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Навыки — три облика верхней строки</h1>
        <p>
          «+» и «−» над крайней ступенью добавляют и откатывают ступень. Уровень растёт за веху и
          приносит очко; стрелки ↑ на карточках видны всегда, пока очко есть. Крестик убирает навык
          и возвращает его очки. Кошелёк справа показывает остаток; минус — красный. Масштаб 1:1.
        </p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <Spread key={id} character={demoCharacter} variant={id} caption={caption} />
      ))}
    </main>
  );
}
