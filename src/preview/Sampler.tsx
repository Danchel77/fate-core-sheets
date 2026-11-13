import '@fontsource/cormorant-garamond/cyrillic-600.css';
import '@fontsource/cormorant-garamond/cyrillic-700.css';
import '@fontsource/pt-serif/cyrillic-400.css';
import '@fontsource/pt-serif/cyrillic-700.css';
import './sampler.css';

const TEXTURES = {
  a: `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`,
  b: `${import.meta.env.BASE_URL}assets/textures/leather.jpg`,
  c: `${import.meta.env.BASE_URL}assets/textures/parchment-weave.jpg`,
};

const VARIANTS = [
  {
    id: 'a' as const,
    title: 'Пергамент и золото',
    note: 'Тёплый пергамент, золотая рамка, тёмно-красные ленты. Ближе всего к референсу.',
  },
  {
    id: 'b' as const,
    title: 'Кожа и бронза',
    note: 'Тёмная кожаная страница, бронзовые линии, светлый текст. Дороже и мрачнее.',
  },
  {
    id: 'c' as const,
    title: 'Пепел и сталь',
    note: 'Светлый пергамент, графитовые ленты, стальные линии. Спокойнее и строже.',
  },
];

function Card({ id }: { id: 'a' | 'b' | 'c' }) {
  return (
    <article className={`smp-card smp-card--${id}`}>
      <div
        className="smp-inner"
        style={{ backgroundImage: `url(${TEXTURES[id]})` }}
      >
        <p className="smp-band">Персонаж</p>
        <div className="smp-portrait">
          <span>портрет 3:4</span>
        </div>
        <h3 className="smp-name">Геральт из Ривии</h3>
        <p className="smp-concept">Ведьмак · охотник на чудовищ</p>
        <p className="smp-aspect">Проблема: «Меня все ненавидят»</p>
        <ul className="smp-skills">
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
        <p className="smp-foot">Обновление 3 · Жетоны судьбы 3</p>
      </div>
    </article>
  );
}

export default function Sampler() {
  return (
    <div className="smp-room">
      <header className="smp-head">
        <h1>Пробник стиля</h1>
        <p>
          Одна и та же карточка персонажа в трёх вариантах, на настоящих
          текстурах и шрифтах. Выберите направление — по нему соберу весь лист.
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
        Текстуры: OpenGameArt (CC0), ambientCG (CC0). Шрифты: Cormorant
        Garamond и PT Serif (OFL).
      </p>
    </div>
  );
}
