/**
 * Строка с исходником внутристраничных помощников.
 *
 * Она подставляется в eval-шаг `interactive-shot.cjs` и определяет `window.__t`.
 * Так сценарии не дублируют поиск кнопок, ожидание состояний и установку
 * значений полей, совместимую с контролируемыми React-инпутами.
 *
 * Драйвер сообщает о прогрессе через `document.title`:
 *   `<name>:run` → `<name>:done` либо `<name>:error:<текст>`.
 */
export const HELPERS = String.raw`
window.__t = (() => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const norm = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const buttons = () => Array.from(document.querySelectorAll('button'));

  const btnLabel = (button) =>
    norm(button.textContent + ' ' + (button.getAttribute('aria-label') || ''));

  const findBtn = (text) => {
    const target = norm(text);
    return (
      buttons().find((button) => btnLabel(button) === target) ||
      buttons().find((button) => btnLabel(button).includes(target)) ||
      null
    );
  };

  const click = (text) => {
    const button = findBtn(text);
    if (!button) throw new Error('нет кнопки: ' + text);
    button.click();
    return true;
  };

  const until = async (predicate, ms, label) => {
    const deadline = Date.now() + (ms || 8000);
    while (Date.now() < deadline) {
      try {
        if (predicate()) return true;
      } catch (error) {
        /* состояние ещё не готово — пробуем снова */
      }
      await sleep(80);
    }
    throw new Error('таймаут: ' + (label || 'условие'));
  };

  const setValue = (selector, value) => {
    const element = document.querySelector(selector);
    if (!element) throw new Error('нет поля: ' + selector);
    const proto =
      element.tagName === 'TEXTAREA'
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  };

  const placed = (text) => {
    const target = norm(text);
    const row = buttons().find((button) => norm(button.textContent).startsWith(target));
    return Boolean(row) && row.disabled === true;
  };

  const enabled = (text) => {
    const button = findBtn(text);
    return Boolean(button) && !button.disabled;
  };

  const isVisible = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return true;
  };

  const visibleText = () => {
    const all = document.querySelectorAll('*');
    const texts = [];
    for (const el of all) {
      if (isVisible(el)) {
        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
            texts.push(child.textContent.trim());
          }
        }
      }
    }
    return texts.join(' ');
  };

  const run = (name, task) => {
    document.title = name + ':run';
    Promise.resolve()
      .then(task)
      .then(
        () => {
          document.title = name + ':done';
        },
        (error) => {
          document.title = name + ':error:' + (error && error.message ? error.message : String(error));
        }
      );
  };

  return { sleep, click, findBtn, until, setValue, enabled, placed, isVisible, visibleText, run };
})();
`;
