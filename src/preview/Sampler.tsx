import '@fontsource/cormorant-garamond/cyrillic-600.css';
import '@fontsource/cormorant-garamond/cyrillic-700.css';
import '@fontsource/pt-serif/cyrillic-400.css';
import '@fontsource/pt-serif/cyrillic-700.css';
import './sampler.css';
import type { CSSProperties } from 'react';

const BASE = import.meta.env.BASE_URL;
const PAPER = `${BASE}assets/textures/parchment-soft.jpg`;
const LEATHER = `${BASE}assets/textures/leather.jpg`;
const PORTRAIT = `${BASE}assets/portraits/geralt.jpg`;
const CORNER = `${BASE}assets/frames/ornament-corner.svg`;

const VARIANTS = [
  {
    id: 'v1' as const,
    title: 'Кожа и золото',
    note: 'Паспарту залито тёмной кожей, как переплёт книги. Уголки золотом, читаются на тёмном.',
  },
  {
    id: 'v2' as const,
    title: 'Тиснение',
    note: 'Та же бумага, но уголки выдавлены без краски — в тон паспарту, тенями.',
  },
  {
    id: 'v3' as const,
    title: 'Бронза',
    note: 'Паспарту залито металлом с блеском, уголки литые с тенью.',
  },
];

function Corners() {
  return (
    <span className="smp-frame" aria-hidden="true">
      {(['tl', 'tr', 'br', 'bl'] as const).map((corner) => (
        <i
          key={corner}
          className={`smp-corner smp-corner--${corner}`}
          style={{ maskImage: `url(${CORNER})`, WebkitMaskImage: `url(${CORNER})` }}
        />
      ))}
    </span>
  );
}

function Card({ id }: { id: 'v1' | 'v2' | 'v3' }) {
  const style = {
    backgroundImage: `url(${PAPER})`,
    '--leather': `url(${LEATHER})`,
  } as CSSProperties;

  return (
    <article className="smp-card smp-card--a1">
      <div className="smp-inner" style={style}>
        <span className="smp-wash" aria-hidden="true" />
        <p className="smp-band type-label">Персонаж</p>
        <div className={`smp-portrait smp-portrait--${id}`}>
          <img className="smp-photo" src={PORTRAIT} alt="Портрет персонажа" />
          <Corners />
        </div>
        <h3 className="smp-name type-display">Геральт из Ривии</h3>
        <p className="smp-concept type-meta">Ведьмак · охотник на чудовищ</p>
        <p className="smp-aspect type-body">Проблема: «Меня все ненавидят»</p>
        <ul className="smp-skills type-body">
          <li>
            <span>Драка</span>
            <b>+4</b>
          </li>
          <li>
            <span>Внимательность</span>
            <b>+3</b>
          </li>
          <li>
            <span>Магия</span>
            <b>+2</b>
          </li>
        </ul>
        <p className="smp-foot type-meta">Обновление 3 · Жетоны судьбы 3</p>
      </div>
    </article>
  );
}

export default function Sampler() {
  return (
    <div className="smp-room">
      <header className="smp-head">
        <h1>Паспарту · три варианта</h1>
        <p>
          Всё остальное зафиксировано: та же бумага, тот же золотой цвет, та же
          лента. Меняется только паспарту вокруг портрета — три способа дать
          ему заливку и объём.
        </p>
      </header>

      <div className="smp-grid">
        {VARIANTS.map((v) => (
          <section className="smp-item" key={v.id}>
            <Card id={v.id} />
            <h2>{v.title}</h2>
            <p>{v.note}</p>
          </section>
        ))}
      </div>

      <p className="smp-credits">
        Текстуры: OpenGameArt (CC0), ambientCG (CC0). Орнамент: S. H. Redmond,
        public domain. Шрифты: Cormorant Garamond и PT Serif (OFL).
      </p>
    </div>
  );
}
