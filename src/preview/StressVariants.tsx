import { StressBlock, type StressVariant } from '../components/StressBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/character-block.css';
import '../styles/stress-block.css';
import '../styles/stress-page.css';

const VARIANTS: { id: StressVariant; title: string }[] = [
  { id: 'list', title: 'Вариант 1 — «строки»' },
  { id: 'split', title: 'Вариант 2 — «колонки»' },
  { id: 'grid', title: 'Вариант 3 — «сетка»' },
];

/** Три компактных варианта блока «Стресс и последствия» в масштабе страницы листа. */
export default function StressVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Стресс и последствия — три компактных варианта</h1>
        <p>
          Один и тот же блок в натуральную величину: ширина страницы как у листа персонажа.
          В каждом последствии есть поле на две строки — от короткой фразы до двухстрочного
          аспекта; если текст длиннее, поле прокручивается, а высота блока не меняется.
          У Геральта три слота: дополнительное лёгкое появляется только при +5.
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
