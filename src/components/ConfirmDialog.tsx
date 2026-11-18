import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/stunt-modal.css';

type Props = {
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

/** Короткое подтверждение: «Отмена» и действие. Оформление — как у окна трюка. */
export function ConfirmDialog({ title, text, confirmLabel, onConfirm, onClose }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const first = cancelRef.current;
      const last = confirmRef.current;
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div
      className="sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="sm__panel sm__panel--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
      >
        <div className="sm__head">
          <span className="sm__texture" aria-hidden="true" />
          <h2 className="sm__head-title" id="confirm-title">
            {title}
          </h2>
        </div>
        <div className="sm__body">
          <p className="sm__text" id="confirm-text">
            {text}
          </p>
        </div>
        <div className="sm__footer">
          <span />
          <div className="sm__actions">
            <button type="button" className="sm__ghost" ref={cancelRef} onClick={onClose}>
              Отмена
            </button>
            <button type="button" className="sm__primary" ref={confirmRef} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
