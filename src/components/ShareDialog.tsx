import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogKeys } from '../hooks/useDialogKeys';
import { IconClose } from './icons';

const PAPER = `${import.meta.env.BASE_URL}assets/textures/parchment-soft.jpg`;

type Props = {
  link: string;
  busy: boolean;
  error: string | null;
  onNew: () => void;
  onRevoke: () => void;
  onClose: () => void;
};

/** Окно ссылки: сам адрес, копирование, новая ссылка и отзыв старой. */
export function ShareDialog({ link, busy, error, onNew, onRevoke, onClose }: Props) {
  useBodyScrollLock();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<'new' | 'revoke' | null>(null);

  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const titleId = `share-title-${id}`;
  const inputId = `share-link-${id}`;

  useDialogKeys({ panel: panelRef, onClose, trap: true });

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.select(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    const fallback = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
      setCopied(true);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(link)
        .then(() => setCopied(true))
        .catch(fallback);
      return;
    }
    fallback();
  };

  const onBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="sm" onMouseDown={onBackdrop}>
      <div
        ref={panelRef}
        className="sm__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="sm__head">
          <span
            className="sm__texture"
            aria-hidden="true"
            style={{ backgroundImage: `url(${PAPER})` }}
          />
          <span className="sm__head-title" id={titleId}>
            Ссылка на героя
          </span>
          <button type="button" className="sm__close" aria-label="Закрыть" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="sm__body">
          <p className="sm__lead">
            Откройте её у любого — герой покажется как есть. Правки в листе сразу видны
            по этой ссылке.
          </p>
          <div className="sm__field">
            <label className="sm__label" htmlFor={inputId}>
              Адрес
            </label>
            <input
              ref={inputRef}
              id={inputId}
              className="sm__input sm__input--link"
              value={link}
              readOnly
              onFocus={(event) => event.target.select()}
            />
          </div>
          {error && <p className="sm__note sm__note--warn">{error}</p>}
        </div>

        <footer className="sm__footer">
          <div className="sm__footer-left">
            {confirm === 'revoke' ? (
              <div className="sm__confirm" role="group" aria-label="Отозвать ссылку?">
                <span className="sm__confirm-text">Ссылка перестанет открываться.</span>
                <button
                  type="button"
                  className="sm__confirm-yes"
                  onClick={onRevoke}
                  disabled={busy}
                >
                  Да
                </button>
                <button type="button" className="sm__confirm-no" onClick={() => setConfirm(null)}>
                  Нет
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="sm__danger"
                onClick={() => setConfirm('revoke')}
                disabled={busy}
              >
                Отозвать
              </button>
            )}
          </div>
          <div className="sm__actions">
            {confirm === 'new' ? (
              <div className="sm__confirm" role="group" aria-label="Создать новую ссылку?">
                <span className="sm__confirm-text">Старая ссылка перестанет работать.</span>
                <button type="button" className="sm__confirm-yes" onClick={onNew} disabled={busy}>
                  Да
                </button>
                <button type="button" className="sm__confirm-no" onClick={() => setConfirm(null)}>
                  Нет
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="sm__ghost"
                  onClick={() => setConfirm('new')}
                  disabled={busy}
                >
                  Новая ссылка
                </button>
                <button type="button" className="sm__primary" onClick={copy} disabled={busy}>
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
