import { CharacterBlock } from '../components/CharacterBlock';
import type { HeaderVariant } from '../components/BlockHeader';
import '../styles/character-block.css';

const VARIANTS: { id: HeaderVariant; caption: string }[] = [
  { id: 'cartouche', caption: 'Вариант 1 — картуш: рамка с гравированными углами' },
  { id: 'fleuron', caption: 'Вариант 2 — флерон: гравюра под заголовком' },
  { id: 'plaque', caption: 'Вариант 3 — бронзовая плашка' },
];

/** Страница сравнения: один и тот же блок в трёх трактовках заголовка. */
export default function BlockVariants() {
  return (
    <main className="blocks-page">
      <header className="blocks-head">
        <h1>Блок «Персонаж»</h1>
        <p>Три варианта заголовка. Кружки жетонов кликабельные — попробуйте.</p>
      </header>

      {VARIANTS.map(({ id, caption }) => (
        <div className="blocks-item" key={id}>
          <p className="blocks-caption">{caption}</p>
          <CharacterBlock variant={id} />
        </div>
      ))}
    </main>
  );
}
