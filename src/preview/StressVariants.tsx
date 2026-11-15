import { StressBlock, type StressVariant } from '../components/StressBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/character-block.css';
import '../styles/stress-block.css';
import '../styles/stress-page.css';

const VARIANTS: { id: StressVariant; title: string }[] = [
  { id: 'rows', title: 'Вариант 1 — «перечень»' },
  { id: 'cards', title: 'Вариант 2 — «карточки»' },
  { id: 'board', title: 'Вариант 3 — «табло»' },
];

/** Три варианта блока «Стресс и последствия» в масштабе страницы листа. */
export default function StressVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Стресс и последствия — три варианта</h1>
        <p>
          Один и тот же блок в натуральную величину: ширина страницы как у листа персонажа.
          Ячейки стресса можно отмечать, в последствия — вписывать текст. После выбора поставлю
          блок на правую страницу перед «Дополнениями».
        </p>
      </header>

      {VARIANTS.map((variant) => (
        <section className="stress-variant" key={variant.id}>
          <p className="variant__caption">{variant.title}</p>
          <div className="stress-page">
            <StressBlock
              variant={variant.id}
              physical={demoCharacter.physicalStress}
              mental={demoCharacter.mentalStress}
              consequences={demoCharacter.consequences}
            />
          </div>
        </section>
      ))}
    </main>
  );
}
