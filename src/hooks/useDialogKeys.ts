import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [href], [tabindex]:not([tabindex="-1"])';

type Options = {
  /** Окно, внутри которого держится Tab. */
  panel: RefObject<HTMLElement | null>;
  onClose: () => void;
  enabled?: boolean;
  /** Ловить Esc в фазе перехвата и не пускать дальше — чтобы окно под ним осталось открытым. */
  capture?: boolean;
  /** Ходить по кругу внутри окна. */
  trap?: boolean;
};

/**
 * Общее поведение модальных окон: Esc закрывает, Tab не выходит за пределы окна.
 * Фокус и прокрутку страницы каждый экран настраивает сам.
 */
export function useDialogKeys({ panel, onClose, enabled = true, capture = false, trap = false }: Options): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (capture) event.stopPropagation();
        onClose();
        return;
      }
      if (!trap || event.key !== 'Tab') return;

      const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (node) => node.offsetParent !== null,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.current?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, capture);
    return () => document.removeEventListener('keydown', onKeyDown, capture);
  }, [capture, enabled, onClose, panel, trap]);
}
