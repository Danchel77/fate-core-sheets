import { useEffect } from 'react';

/**
 * Пока окно открыто, страница под ним не прокручивается.
 * Вложенные окна возвращают предыдущее значение: закрытие подсказки
 * не разблокирует лист раньше времени.
 */
export function useBodyScrollLock(active = true): void {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previous;
    };
  }, [active]);
}
