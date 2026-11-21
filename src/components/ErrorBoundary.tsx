import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Последняя страховка: неожиданная ошибка экрана не должна оставлять пустую страницу. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Страница не открылась', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="app-crash">
        <h1 className="heroes__empty-title">Что-то пошло не так</h1>
        <p className="heroes__empty-text">
          Перезагрузите страницу — герои и правки остались на месте.
        </p>
        <button
          className="heroes__empty-action"
          type="button"
          onClick={() => window.location.reload()}
        >
          Перезагрузить
        </button>
      </main>
    );
  }
}
