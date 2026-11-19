import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogKeys } from '../hooks/useDialogKeys';

type Props = {
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

/** Короткое подтверждение: «Отмена» и действие. Оформление — как у окна трюка. */
export function ConfirmDialog({ title, text, confirmLabel, onConfirm, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  useBodyScrollLock();
  useDialogKeys({ panel: panelRef, onClose, trap: true });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previous?.focus();
  }, []);



  return createPortal(
    <div
      className="sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
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
