import './websheet.css';

type Variant = 'spread' | 'tabs';

function LeftPage() {
  return (
    <section className="ws-page ws-page--left">
      <div className="ws-portrait">портрет 3:4</div>
      <div className="ws-name">Имя персонажа</div>
      <div className="ws-sub">Концепция · сеттинг</div>
      <div className="ws-stats">
        <span>Обновление 3</span>
        <span>Жетоны судьбы 3</span>
      </div>
      <div className="ws-block ws-block--desc">Описание (2–3 строки)</div>
      <div className="ws-block ws-block--aspects">
        <strong>Аспекты</strong>
        <ul>
          <li>Концепция</li>
          <li>Проблема</li>
          <li>Первое приключение</li>
          <li>Переплетение судеб I</li>
          <li>Переплетение судеб II</li>
        </ul>
      </div>
    </section>
  );
}

function SkillsBlock() {
  const ladder = [
    ['+4', 'Отлично', 1],
    ['+3', 'Хорошо', 2],
    ['+2', 'Неплохо', 3],
    ['+1', 'Средне', 4],
    ['0', 'Посредственно', 8],
  ] as const;

  return (
    <div className="ws-block ws-block--skills">
      <strong>Навыки</strong>
      <ul>
        {ladder.map(([value, label, count]) => (
          <li key={value}>
            <span className="ws-skill-value">{value}</span>
            <span className="ws-skill-label">{label}</span>
            <span className="ws-skill-count">{count} шт.</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RightPage({ variant }: { variant: Variant }) {
  if (variant === 'tabs') {
    return (
      <section className="ws-page ws-page--right">
        <div className="ws-tabs">
          <span className="ws-tab ws-tab--active">Навыки</span>
          <span className="ws-tab">Трюки</span>
          <span className="ws-tab">Дополнения</span>
        </div>
        <SkillsBlock />
        <div className="ws-row">
          <div className="ws-block ws-block--stress">
            <strong>Физ. стресс</strong>
            <span className="ws-dots">1 2 3 4</span>
          </div>
          <div className="ws-block ws-block--stress">
            <strong>Мент. стресс</strong>
            <span className="ws-dots">1 2 3 4</span>
          </div>
        </div>
        <div className="ws-block ws-block--consequences">
          <strong>Последствия</strong>
          <ul>
            <li>2 — лёгкое</li>
            <li>4 — среднее</li>
            <li>6 — серьёзное</li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="ws-page ws-page--right">
      <SkillsBlock />
      <div className="ws-row">
        <div className="ws-block ws-block--stunts">
          <strong>Трюки</strong>
          <span>3–5 штук, каждый с пояснением</span>
        </div>
        <div className="ws-block ws-block--extras">
          <strong>Дополнения</strong>
          <span>свободное поле</span>
        </div>
      </div>
      <div className="ws-row">
        <div className="ws-block ws-block--stress">
          <strong>Физ. стресс</strong>
          <span className="ws-dots">1 2 3 4</span>
        </div>
        <div className="ws-block ws-block--stress">
          <strong>Мент. стресс</strong>
          <span className="ws-dots">1 2 3 4</span>
        </div>
      </div>
      <div className="ws-block ws-block--consequences">
        <strong>Последствия</strong>
        <ul>
          <li>2 — лёгкое</li>
          <li>2 — лёгкое (доп.)</li>
          <li>4 — среднее</li>
          <li>6 — серьёзное</li>
        </ul>
      </div>
    </section>
  );
}

function Book({ variant, title, note }: { variant: Variant; title: string; note: string }) {
  return (
    <article className="ws-variant">
      <h2>{title}</h2>
      <p className="ws-note">{note}</p>
      <div className="ws-book">
        <div className="ws-topbar">
          <span>← К списку</span>
          <span>Печать PDF</span>
          <span>Экспорт</span>
        </div>
        <div className="ws-spread">
          <LeftPage />
          <RightPage variant={variant} />
        </div>
      </div>
      <p className="ws-mobile">
        На телефоне: одна колонка — портрет, имя, аспекты, навыки, трюки,
        стресс, последствия.
      </p>
    </article>
  );
}

export default function WebSheet() {
  return (
    <div className="ws-page-wrap">
      <header className="ws-head">
        <h1>Лист персонажа в вебе — два скелета</h1>
        <p>
          Раскладка блоками, без стиля. Оба варианта — раскрытая книга, как в
          референсе; разница только в правой странице.
        </p>
      </header>

      <Book
        variant="spread"
        title="Вариант A — всё на виду"
        note="Левая страница: персонаж и аспекты. Правая: навыки, трюки, дополнения, стресс, последствия. Ничего не спрятано — удобно за столом."
      />

      <Book
        variant="tabs"
        title="Вариант B — с вкладками"
        note="Правая страница с лентами-вкладками: навыки / трюки / дополнения. Ближе к игре, но часть листа скрыта."
      />
    </div>
  );
}
