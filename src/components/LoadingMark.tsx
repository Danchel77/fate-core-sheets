/** Единственная «заставка» приложения: тихая строка внутри страницы. */
export function LoadingMark() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <i className="loading__mark" aria-hidden="true" />
      <p className="loading__text">Открываем книгу…</p>
      <span className="loading__line" aria-hidden="true" />
    </div>
  );
}
