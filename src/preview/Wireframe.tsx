import './wireframe.css';

const PAGE = { w: 1300, h: 934 };

function box(x: number, y: number, w: number, h: number) {
  return {
    left: `${(x / PAGE.w) * 100}%`,
    top: `${(y / PAGE.h) * 100}%`,
    width: `${(w / PAGE.w) * 100}%`,
    height: `${(h / PAGE.h) * 100}%`,
  };
}

const ASPECTS = [310, 350, 390, 430, 468];
const SKILLS = [
  { y: 312, label: 'Великолеп. (+5)' },
  { y: 345, label: 'Отличный (+4)' },
  { y: 381, label: 'Хороший (+3)' },
  { y: 416, label: 'Неплохой (+2)' },
  { y: 453, label: 'Средний (+1)' },
];

const CONSEQUENCES = [
  { style: box(400, 727, 395, 23), label: '2 Лёгкое' },
  { style: box(815, 727, 400, 23), label: '2 Лёгкое (доп.)' },
  { style: box(400, 765, 395, 23), label: '4 Среднее' },
  { style: box(400, 800, 395, 23), label: '6 Серьёзное' },
];

export default function Wireframe() {
  return (
    <div className="wf-page">
      <header className="wf-note">
        <h1>Скелет печатного листа</h1>
        <p>
          Только блоки и пропорции, без стиля. Формат — A4 горизонтально, как
          официальный бланк.
        </p>
      </header>

      <div className="wf-sheet">
        <div className="wf-bar" style={box(80, 118, 790, 22)}>
          Персонаж
        </div>
        <div className="wf-field" style={box(80, 145, 670, 33)}>
          Имя
        </div>
        <div className="wf-field" style={box(760, 145, 110, 105)}>
          Обновление
        </div>
        <div className="wf-field" style={box(80, 185, 670, 65)}>
          Описание
        </div>
        <div className="wf-logo" style={box(905, 130, 310, 115)}>
          Fate Core
        </div>

        <div className="wf-bar" style={box(80, 278, 425, 24)}>
          Аспекты
        </div>
        {ASPECTS.map((y, i) => (
          <div className="wf-field" style={box(80, y, 425, 33)} key={y}>
            {i === 0 ? 'Концепция' : i === 1 ? 'Проблема' : ''}
          </div>
        ))}

        <div className="wf-bar" style={box(530, 278, 685, 24)}>
          Навыки
        </div>
        {SKILLS.map((row) => (
          <div className="wf-skill-row" key={row.label}>
            <span className="wf-skill-label" style={box(530, row.y, 140, 21)}>
              {row.label}
            </span>
            {[0, 1, 2, 3, 4].map((c) => (
              <div
                className="wf-cell"
                style={box(675 + c * 108, row.y, 100, 21)}
                key={c}
              />
            ))}
          </div>
        ))}

        <div className="wf-bar" style={box(80, 505, 540, 25)}>
          Дополнения
        </div>
        <div className="wf-area" style={box(80, 533, 540, 135)}>
          свободное поле
        </div>

        <div className="wf-bar" style={box(650, 505, 565, 25)}>
          Трюки
        </div>
        <div className="wf-area" style={box(650, 533, 565, 135)}>
          свободное поле
        </div>

        <div className="wf-bar" style={box(80, 697, 290, 23)}>
          Физ. стресс <small>(Телосложение)</small>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div className="wf-stress" style={box(108 + i * 88, 727, 22, 22)} key={i}>
            {i + 1}
          </div>
        ))}

        <div className="wf-bar" style={box(80, 770, 295, 23)}>
          Ментал. стресс <small>(Воля)</small>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div className="wf-stress" style={box(108 + i * 88, 800, 22, 22)} key={i}>
            {i + 1}
          </div>
        ))}

        <div className="wf-bar" style={box(400, 697, 815, 23)}>
          Последствия
        </div>
        {CONSEQUENCES.map((c) => (
          <div className="wf-field" style={c.style} key={c.label}>
            {c.label}
          </div>
        ))}
      </div>

      <p className="wf-caption">
        Блоки: персонаж, 5 аспектов, сетка навыков, дополнения, трюки, два
        стресса, последствия.
      </p>
    </div>
  );
}
