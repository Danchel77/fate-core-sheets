import type { CSSProperties } from 'react';
import { LoadingMark } from '../components/LoadingMark';
import { SheetNavHome } from '../components/SheetNavHome';

const BASE = import.meta.env.BASE_URL;
const PAPER_TEXTURE = `url(${BASE}assets/textures/parchment-soft.jpg)`;

/** Лист до ответа хранилища: уже кожаный фолиант с пустыми страницами,
    поэтому переход к готовому листу не прыгает по высоте и не мигает. */
export default function SheetLoading() {
  return (
    <div
      className="table"
      style={{ '--sheet-texture': PAPER_TEXTURE } as CSSProperties}
      aria-busy="true"
    >
      <SheetNavHome />

      <div className="book-stage">
        <div className="book-cover">
          <main className="book" aria-label="Загрузка листа персонажа">
            <article className="page page--left page--loading">
              <LoadingMark />
            </article>
            <article className="page page--right page--loading" aria-hidden="true" />
          </main>
        </div>
        <span className="book-ribbon" aria-hidden="true" />
      </div>
    </div>
  );
}
