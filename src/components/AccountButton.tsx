import { useEffect, useRef, useState } from 'react';
import { openAuthDialog, signOutUser, useAuth } from '../firebase/authStore';

/** Кнопка входа или аватар с меню аккаунта. */
export function AccountButton({ variant = 'list' }: { variant?: 'list' | 'sheet' }) {
  const { ready, user } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!ready) return null;

  if (!user) {
    return (
      <button
        type="button"
        className={variant === 'sheet' ? 'sheet-nav__btn' : 'heroes__login'}
        onClick={openAuthDialog}
      >
        Войти
      </button>
    );
  }

  const name = (user.displayName || user.email || '?').trim();
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="acct" ref={root}>
      <button
        type="button"
        className={`acct__trigger acct__trigger--${variant}`}
        aria-label={`Аккаунт ${user.email ?? ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {user.photoURL ? (
          <img className="acct__photo" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="acct__initial" aria-hidden="true">
            {initial}
          </span>
        )}
      </button>
      {open && (
        <div className="acct__menu" role="menu">
          <p className="acct__email">{user.email}</p>
          <button
            className="acct__item"
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOutUser();
            }}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
