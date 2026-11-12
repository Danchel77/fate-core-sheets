import { HELPERS } from '../lib/helpers.mjs';
import { WIZARD_SRC } from '../lib/wizard-src.mjs';

/**
 * Полное заполнение одностраничного конструктора и секция «Итог».
 * Проверяем, что все секции собираются в один черновик, «Итог» показывает имя,
 * четыре блока с кнопками «Изменить» и трюк готовой фразой, а кнопок «Далее»
 * в интерфейсе больше нет.
 */
export default {
  name: 'review',
  steps: [
    {
      waitFor: 'document.readyState === "complete" && !!document.querySelector("button")',
      timeout: 15000,
    },
    {
      eval:
        HELPERS +
        WIZARD_SRC +
        `
        __t.run('review', async () => {
          await fillWizard(window.__t, { scrollTo: 'review' });
        });
      `,
    },
    {
      waitFor: 'document.title === "review:done" || document.title.startsWith("review:error:")',
      timeout: 120000,
    },
    { shot: {} },
  ],
  asserts: [
    { name: 'driver-ok', expr: '!document.title.includes(":error:")' },
    { name: 'summary-visible', expr: 'window.__t.visibleText().includes("Итог")' },
    { name: 'no-next-buttons', expr: '!window.__t.visibleText().includes("Далее")' },
    {
      name: 'four-edit-links',
      expr:
        'Array.from(document.querySelectorAll("button")).filter((b) => (b.textContent || "").trim() === "Изменить").length === 4',
    },
    {
      name: 'name-on-review',
      expr: 'window.__t.visibleText().includes("Лето из Скеллиге")',
    },
    {
      name: 'stunt-phrase-on-review',
      expr: 'window.__t.visibleText().includes("Кошмарный удар")',
    },
  ],
};
