import type { CSSProperties } from 'react';
import { ExtrasBlock, type ExtrasVariant } from '../components/ExtrasBlock';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/character-block.css';
import '../styles/extras-block.css';
import './extras-page.css';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

const PAGE_PAPER: CSSProperties = {
  backgroundImage: `linear-gradient(color-mix(in srgb, var(--bg-parchment) 72%, transparent), color-mix(in srgb, var(--bg-parchment) 72%, transparent)), url(${PAPER})`,
};

const SECOND_FIELD = 'Лютик знает, где меня искать. Йеннифэр не любит, когда я пропадаю.';

const VARIANTS: { variant: ExtrasVariant; caption: string }[] = [
  { variant: 'lines', caption: 'Вариант 1 — «строки»' },
  { variant: 'frames', caption: 'Вариант 2 — «карточки»' },
  { variant: 'columns', caption: 'Вариант 3 — «колонки»' },
];

/** Блок «Дополнения»: три примерки в размере правой страницы листа (1:1). */
export default function ExtrasVariants() {
  return (
    <main className="variants-page">
      <header className="variants-head">
        <h1>Дополнения — три варианта</h1>
        <p>
          Два свободных поля для заметок, снаряжения и связей. Поля начинаются с четырёх строк и
          растут вместе с текстом. Размер — 1:1, как на правой странице полного листа. Пока это
          примерка: на самом листе вместо блока стоит заглушка.
        </p>
      </header>

      {VARIANTS.map(({ variant, caption }) => (
        <section className="ext-variant" key={variant}>
          <p className="variant__caption">{caption}</p>
          <div className="ext-page" style={PAGE_PAPER}>
            <ExtrasBlock variant={variant} initial={[demoCharacter.extras, SECOND_FIELD]} />
          </div>
        </section>
      ))}
    </main>
  );
}
