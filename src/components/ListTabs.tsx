/** Две вкладки обоих экранов: «Мои персонажи» и «Группа». Активная — заголовок страницы. */
export function ListTabs({ active, count }: { active: 'characters' | 'group'; count: number }) {
  const characters = (
    <>
      Мои персонажи
      <span className="heroes__count"> ({count})</span>
    </>
  );

  return (
    <nav className="heroes__tabs" aria-label="Разделы">
      {active === 'characters' ? (
        <h1 className="heroes__tab is-active">{characters}</h1>
      ) : (
        <a className="heroes__tab" href="#/">
          {characters}
        </a>
      )}

      {active === 'group' ? (
        <h1 className="heroes__tab is-active">Группа</h1>
      ) : (
        <a className="heroes__tab" href="#/group">
          Группа
        </a>
      )}
    </nav>
  );
}
