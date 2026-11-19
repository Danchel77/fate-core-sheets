import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  authErrorMessage,
  closeAuthDialog,
  registerWithEmail,
  resetPassword,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  useAuthDialogOpen,
  useAuth,
} from '../firebase/authStore';
import { IconClose } from './icons';
import '../styles/stunt-modal.css';
import '../styles/auth.css';

type Mode = 'login' | 'register';

/** Окно входа: Google или почта с паролем. */
export function AuthDialog() {
  const open = useAuthDialogOpen();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAuthDialog();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (open && user) closeAuthDialog();
  }, [open, user]);

  if (!open) return null;

  const changeMode = (next: Mode) => {
    setMode(next);
    setEmailOpen(true);
    setPassword('');
    setRepeat('');
    setError(null);
    setNotice(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Введите почту.');
      return;
    }
    if (password.length < 6) {
      setError('Пароль не короче шести знаков.');
      return;
    }
    if (mode === 'register' && password !== repeat) {
      setError('Пароли не совпали.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') await signInWithEmail(email, password);
      else await registerWithEmail(email, password);
      closeAuthDialog();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await signInWithGoogle();
      closeAuthDialog();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const recover = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Сначала введите почту.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      setNotice(`Письмо для смены пароля отправлено на ${email.trim()}.`);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="sm auth"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) closeAuthDialog();
      }}
    >
      <div
        className="sm__panel auth__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <header className="sm__head">
          <span className="sm__texture" aria-hidden="true" />
          <h2 className="sm__head-title" id="auth-title">
            {user ? 'Аккаунт' : mode === 'login' ? 'Вход' : 'Новый аккаунт'}
          </h2>
          <button
            type="button"
            className="sm__close"
            aria-label="Закрыть"
            onClick={closeAuthDialog}
          >
            <IconClose />
          </button>
        </header>

        {user ? (
          <div className="sm__body auth__body">
            <p className="auth__signed">
              Вы вошли как <b>{user.email}</b>.
            </p>
            <button
              type="button"
              className="sm__ghost auth__wide"
              onClick={() => void signOutUser()}
            >
              Выйти из аккаунта
            </button>
          </div>
        ) : (
          <div className="sm__body auth__body">
            <p className="auth__lead">
              Герои в аккаунте открываются на любом устройстве. Без входа они остаются только в
              этом браузере.
            </p>

            <button
              type="button"
              className="auth__google"
              onClick={() => void google()}
              disabled={busy}
            >
              Продолжить с Google
            </button>

            {!emailOpen && (
              <button
                type="button"
                className="sm__ghost auth__mail"
                onClick={() => setEmailOpen(true)}
                disabled={busy}
              >
                Продолжить с почтой
              </button>
            )}

            {emailOpen && (
            <form className="auth__form" onSubmit={(event) => void submit(event)}>
              <label className="sm__label" htmlFor="auth-email">
                Почта
              </label>
              <input
                id="auth-email"
                className="sm__input auth__input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={mode === 'register' ? 'name@example.com' : undefined}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <label className="sm__label" htmlFor="auth-password">
                Пароль
              </label>
              <input
                id="auth-password"
                className="sm__input auth__input"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'register' ? 'Не короче шести знаков' : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {mode === 'register' && (
                <>
                  <label className="sm__label" htmlFor="auth-repeat">
                    Пароль ещё раз
                  </label>
                  <input
                    id="auth-repeat"
                    className="sm__input auth__input"
                    type="password"
                    autoComplete="new-password"
                    placeholder={mode === 'register' ? 'Повторите пароль' : undefined}
                    value={repeat}
                    onChange={(event) => setRepeat(event.target.value)}
                  />
                </>
              )}

              {error && (
                <p className="auth__error" role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p className="auth__notice" role="status">
                  {notice}
                </p>
              )}

              <button type="submit" className="sm__primary auth__submit" disabled={busy}>
                {busy ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>

              <div className="auth__links">
                {mode === 'login' ? (
                  <>
                    <button type="button" className="auth__link" onClick={() => void recover()}>
                      Забыли пароль?
                    </button>
                    <button
                      type="button"
                      className="auth__link"
                      onClick={() => changeMode('register')}
                    >
                      Зарегистрироваться
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="auth__link"
                    onClick={() => changeMode('login')}
                  >
                    Уже есть аккаунт — войти
                  </button>
                )}
                <button
                  type="button"
                  className="auth__link auth__link--quiet"
                  onClick={() => {
                    setEmailOpen(false);
                    setMode('login');
                    setPassword('');
                    setRepeat('');
                    setError(null);
                    setNotice(null);
                  }}
                >
                  Другой способ входа
                </button>
              </div>
            </form>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
