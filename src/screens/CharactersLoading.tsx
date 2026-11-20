import { AccountButton } from '../components/AccountButton';
import { LoadingMark } from '../components/LoadingMark';

/** Список до первого ответа хранилища: та же страница, только вместо
    карточек — тихая строка загрузки. Пустой список не мелькает. */
export default function CharactersLoading() {
  return (
    <div className="heroes">
      <header className="heroes__top">
        <a className="heroes__brand" href="#/">
          <span className="heroes__brandname">Fate Core Sheets</span>
        </a>
        <AccountButton />
      </header>

      <main className="heroes__page" aria-busy="true">
        <header className="heroes__head">
          <h1 className="heroes__title">Мои персонажи</h1>
        </header>

        <div className="heroes__loading">
          <LoadingMark />
        </div>
      </main>
    </div>
  );
}
