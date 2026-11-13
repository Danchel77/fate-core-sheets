import '@fontsource/cormorant-garamond/cyrillic-600.css';
import '@fontsource/cormorant-garamond/cyrillic-700.css';
import '@fontsource/pt-serif/cyrillic-400.css';
import '@fontsource/pt-serif/cyrillic-700.css';
import './sampler.css';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;
const PORTRAIT = `${import.meta.env.BASE_URL}assets/portraits/geralt.jpg`;

const VARIANTS = [
  {
    id: 'a1' as const,
    title: 'Золото',
    note: 'Бумага, золотые линии, тёмно-красные ленты. Текущий вариант, но с приглушённой текстурой и крупнее текст.',
  },
  {
    id: 'a2' as const,
    title: 'Багрянец',
    note: 'Больше тёмно-красного: рамки и ленты багряные, золото только тонкой линией.',
  },
  {
    id: 'a3' as const,
    title: 'Чернила',
    note: 'Строгий: рамки и ленты почти чёрные, золото — только уголки. Меньше «фэнтези-позолоты».',
  },
];

function Card({ id }: { id: 'a1' | 'a2' | 'a3' }) {
  return (
    <article className={`smp-card smp-card--${id}`}>
      <div
        className="smp-inner"
        style={{ backgroundImage: `url(${PAPER})` }}
      >
        <span className="smp-wash" aria-hidden="true" />
        <p className="smp-band">Персонаж</p>
        <div className="smp-portrait">
          <img className="smp-photo" src={PORTRAIT} alt="Портрет персонажа" />
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
        <h1>Пробник стиля · второй заход</h1>
        <p>
          Направление «пергамент и золото» оставил, но убрал шум бумаги, затемнил
          текст и увеличил кегль. Ниже три варианта цвета — выберите, какой
          читается лучше всего.
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
