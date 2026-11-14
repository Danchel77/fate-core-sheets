import type { CSSProperties } from 'react';
import { StuntBlock } from '../components/StuntBlock';
import type { StuntModalVariant } from '../components/StuntBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/character-block.css';
import '../styles/stunt-block.css';
import './stunts-page.css';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

/* Та же бумага, что и у страниц полного листа: 72% пергамента поверх текстуры. */
const PAGE_PAPER: CSSProperties = {
  backgroundImage: `linear-gradient(color-mix(in srgb, var(--bg-parchment) 72%, transparent), color-mix(in srgb, var(--bg-parchment) 72%, transparent)), url(${PAPER})`,
};

const VARIANTS: { variant: StuntModalVariant; title: string }[] = [
  { variant: 'plaque', title: 'Вариант 1 — окно «Плашка»' },
  { variant: 'margin', title: 'Вариант 2 — окно «Поля»' },
  { variant: 'ledger', title: 'Вариант 3 — окно «Запись»' },
];

/** Блок «Трюки»: три окна одного блока в размере правой страницы листа (1:1). */
export default function StuntsVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Трюки — три окна</h1>
        <p>
          Блок один и тот же: строки, как в аспектах, и «+» в заголовке. Нажми на строку —
          откроется окно. В окнах разный вид и разный текст подсказок: можно взять окно из одного
          варианта, а текст — из другого. Размер — 1:1, как на правой странице полного листа.
        </p>
      </header>

      {VARIANTS.map(({ variant, title }) => (
        <section className="stk-variant" key={variant}>
          <p className="variant__caption">{title}</p>
          <div className="stk-page" style={PAGE_PAPER}>
            <StuntBlock stunts={demoCharacter.stunts} modal={variant} />
          </div>
        </section>
      ))}
    </main>
  );
}
