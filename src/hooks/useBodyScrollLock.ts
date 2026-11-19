import { useEffect } from 'react';

/**
 * Пока окно открыто, страница под ним не прокручивается.
 * Полоса прокрутки заменяется отступом, чтобы шапка не дёргалась.
 * Вложенные окна возвращают предыдущее значение: закрытие подсказки
 * не разблокирует лист раньше времени.
 */
export function useBodyScrollLock(active = true): void {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [active]);
}
