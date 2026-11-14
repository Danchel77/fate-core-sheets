import { StuntBlock, type StuntVariant } from '../components/StuntBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/character-block.css';
import '../styles/stunt-block.css';
import './stunts-page.css';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

const VARIANTS: { variant: StuntVariant; title: string }[] = [
  { variant: 'scroll', title: 'Вариант 1 — «перечень»' },
  { variant: 'cards', title: 'Вариант 2 — «плашки»' },
  { variant: 'register', title: 'Вариант 3 — «реестр»' },
];

/** Блок «Трюки»: три варианта в размере правой страницы листа (1:1). */
export default function StuntsVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Трюки — три варианта</h1>
        <p>
          Каждый вариант стоит в такой же колонке, как правая страница полного листа: ширина строки
          и размер букв настоящие, 1:1. Различается только подача перечня — название и описание
          одни и те же.
        </p>
      </header>

      {VARIANTS.map(({ variant, title }) => (
        <section className="stk-variant" key={variant}>
          <p className="variant__caption">{title}</p>
          <div className="stk-page" style={{ backgroundImage: `url(${PAPER})` }}>
            <StuntBlock stunts={demoCharacter.stunts} variant={variant} />
          </div>
        </section>
      ))}
    </main>
  );
}
