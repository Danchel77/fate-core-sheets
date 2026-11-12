import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SectionRibbon } from './SectionRibbon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  level?: 1 | 2;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}

interface ModalStackEntry {
  id: number;
  close: () => void;
}

// Модульный стек открытых окон. Escape закрывает только верхнее окно,
// поэтому обработчик каждого окна сверяется с последним элементом стека.
const modalStack: ModalStackEntry[] = [];
let nextModalId = 0;

// Счётчик блокировки прокрутки. Флаг в одном окне не годится: при закрытии
// вложенного окна страница не должна разблокироваться, пока открыто родительское.
let scrollLockCount = 0;
let savedBodyOverflow = '';

const lockBodyScroll = () => {
  if (scrollLockCount === 0) {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
};

const unlockBodyScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = savedBodyOverflow;
  }
};

/**
 * Единственный каркас всплывающих окон проекта (DESIGN.md §7).
 * Уровень 1 — обычное окно, уровень 2 — вложенное поверх него.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  level = 1,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Свежий onClose без перезапуска эффекта: иначе инлайновый колбэк родителя
  // при каждом рендере снимал бы и заново ставил блокировку прокрутки и фокус.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const id = ++nextModalId;
    const entry: ModalStackEntry = { id, close: () => onCloseRef.current() };
    modalStack.push(entry);

    const previouslyFocused = document.activeElement;
    previouslyFocusedRef.current = previouslyFocused instanceof HTMLElement ? previouslyFocused : null;

    lockBodyScroll();
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const top = modalStack[modalStack.length - 1];
      if (top && top.id === id) {
        event.preventDefault();
        entry.close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = modalStack.findIndex((item) => item.id === id);
      if (index >= 0) modalStack.splice(index, 1);
      unlockBodyScroll();
      const target = previouslyFocusedRef.current;
      if (target && target.isConnected) target.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayLevelClass =
    level === 2 ? 'z-[60] bg-ink/60 pr-10 md:pr-4' : 'z-50 bg-ink/80';

  return (
    <div
      data-kit="modal"
      data-modal-level={level}
      className={`fixed inset-0 flex items-center justify-center p-4 ${overlayLevelClass}`}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={panelRef}
        data-kit="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-visible rounded-none border border-line bg-panel outline-none ${maxWidthClass} ${
          level === 2 ? 'translate-x-6 translate-y-6' : ''
        }`}
      >
        <div className="relative -mx-px w-[calc(100%+2px)] shrink-0">
          <SectionRibbon>{title}</SectionRibbon>
          <button
            type="button"
            data-kit="modal-close"
            aria-label="Закрыть"
            onClick={() => onCloseRef.current()}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-ink/70 transition-colors duration-150 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-gold"
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {children}
          {footer ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-3">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
