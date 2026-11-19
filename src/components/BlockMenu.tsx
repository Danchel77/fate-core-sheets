import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';

type BlockMenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
};

type Props = {
  label: string;
  items: BlockMenuItem[];
};

/**
 * Меню действий блока: три точки в плашке заголовка.
 * Список открывается прямо под точками и связан с ними уголком.
 */
export function BlockMenu({ label, items }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = `block-menu-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    if (!open) return;

    const onDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !rootRef.current?.contains(target)) setOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);

    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>('.bmenu__item:not(:disabled)')?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const moveFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const list = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('.bmenu__item:not(:disabled)') ?? [],
    );
    if (list.length === 0) return;

    event.preventDefault();
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === 'ArrowDown'
        ? list[(at + 1) % list.length]
        : list[(at - 1 + list.length) % list.length];
    next.focus();
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="bmenu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="bmenu__trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <i />
        <i />
        <i />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          className="bmenu__list"
          role="menu"
          aria-label={label}
          onKeyDown={moveFocus}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`bmenu__item${item.danger ? ' bmenu__item--danger' : ''}`}
              disabled={item.disabled}
              title={item.title}
              onClick={() => {
                if (item.disabled) return;
                close();
                item.onSelect();
              }}
            >
              {item.icon ? <span className="bmenu__icon">{item.icon}</span> : null}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
