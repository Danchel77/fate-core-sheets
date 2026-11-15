import type { CSSProperties } from 'react';
import { StuntBlock } from '../components/StuntBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/character-block.css';
import '../styles/stunt-block.css';
import './stunts-page.css';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

/* Та же бумага, что и у страниц полного листа: 72% пергамента поверх текстуры. */
const PAGE_PAPER: CSSProperties = {
  backgroundImage: `linear-gradient(color-mix(in srgb, var(--bg-parchment) 72%, transparent), color-mix(in srgb, var(--bg-parchment) 72%, transparent)), url(${PAPER})`,
};

/** Блок «Трюки»: выбранный вариант в размере правой страницы листа (1:1). */
export default function StuntsVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Трюки — рабочий вариант</h1>
        <p>
          Строки как в аспектах, меню из трёх точек в заголовке и окно правки. Нажми на строку,
          чтобы изменить трюк, или открой меню и выбери «Добавить трюк». Размер — 1:1, как на
          правой странице полного листа.
        </p>
      </header>

      <section className="stk-variant">
        <p className="variant__caption">Выбранный вариант — 1:1</p>
        <div className="stk-page" style={PAGE_PAPER}>
          <StuntBlock stunts={demoCharacter.stunts} />
        </div>
      </section>
    </main>
  );
}
