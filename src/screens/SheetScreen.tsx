import { PortraitPlate } from '../components/PortraitPlate';
import { demoCharacter } from '../data/demoCharacter';
import '../styles/portrait-plate.css';
import '../styles/sheet.css';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

function Boxes() {
  return (
    <div className="boxes">
      {Array.from({ length: 4 }, (_, i) => i + 1).map((n) => (
        <span key={n} className="box">
          {n}
        </span>
      ))}
    </div>
  );
}

export default function SheetScreen() {
  return (
    <div className="table">
      <main
        className="book"
        style={{ backgroundImage: `url(${PAPER})` }}
        aria-label="Лист персонажа"
      >
        <article className="page page--left">
          <h2 className="page__band type-label">Персонаж</h2>

          <div className="sheet-portrait">
            <PortraitPlate src={demoCharacter.portrait} alt={`Портрет: ${demoCharacter.name}`} />
          </div>

          <h1 className="sheet-name type-display">{demoCharacter.name}</h1>
          <p className="sheet-concept type-meta">{demoCharacter.concept}</p>

          <div className="counters">
            <span className="counter">
              <b>{demoCharacter.refresh}</b>
              <span>Обновление</span>
            </span>
            <span className="counter">
              <b>{demoCharacter.fatePoints}</b>
              <span>Жетоны судьбы</span>
            </span>
          </div>

          <p className="sheet-description type-body">{demoCharacter.description}</p>

          <h2 className="page__band type-label">Аспекты</h2>
          <ul className="aspects">
            {demoCharacter.aspects.map((aspect, i) => (
              <li className="aspect" key={i}>
                <span className="aspect__label type-meta">{aspect.label}</span>
                <p className="type-body">{aspect.text}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="page page--right">
          <h2 className="page__band type-label">Навыки</h2>
          <div className="ladder">
            {demoCharacter.ladder.map((row) => (
              <div className="ladder__row" key={row.value}>
                <span className="ladder__value type-lead">+{row.value}</span>
                <div className="ladder__skills">
                  {row.skills.length > 0 ? (
                    row.skills.map((skill) => (
                      <span className="skill type-body" key={skill}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="ladder__empty type-meta">пусто</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h2 className="page__band type-label">Трюки</h2>
          <ul className="stunts">
            {demoCharacter.stunts.map((stunt) => (
              <li key={stunt.name}>
                <b className="type-body">{stunt.name}.</b>{' '}
                <span className="type-body">{stunt.text}</span>
              </li>
            ))}
          </ul>

          <h2 className="page__band type-label">Дополнения</h2>
          <div className="extras-block">
            <p className="type-body">{demoCharacter.extras}</p>
          </div>

          <div className="sheet-bottom">
            <div className="stress-grid">
              <section>
                <h3 className="type-meta">Физический стресс</h3>
                <Boxes />
              </section>
              <section>
                <h3 className="type-meta">Ментальный стресс</h3>
                <Boxes />
              </section>
            </div>

            <h2 className="page__band type-label">Последствия</h2>
            <ul className="consequences">
              {demoCharacter.consequences.map((c, i) => (
                <li className="consequence" key={i}>
                  <span className="consequence__value type-lead">{c.value}</span>
                  <span className="consequence__label type-meta">{c.kind}</span>
                  {c.text ? <span className="consequence__text type-body">{c.text}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </main>
    </div>
  );
}
