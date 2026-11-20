import '../styles/splash.css';

/** Заставка на время загрузки героев: вместо пустого списка «Пока никого нет». */
export function SplashScreen() {
  return (
    <div className="splash" role="status" aria-live="polite">
      <div className="splash__card">
        <i className="splash__mark" aria-hidden="true" />
        <p className="splash__title">Fate Core Sheets</p>
        <p className="splash__text">Открываем книгу…</p>
        <span className="splash__line" aria-hidden="true" />
      </div>
    </div>
  );
}
