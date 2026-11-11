import { HELPERS } from '../lib/helpers.mjs';
import { WIZARD_SRC } from '../lib/wizard-src.mjs';

/**
 * Сквозной путь: мастер → «Создать персонажа» → лист персонажа.
 * Проверяем, что персонаж действительно сохранён и открыт, а трюк из мастера
 * попал на лист готовой фразой.
 */
export default {
  name: 'create-flow',
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
        __t.run('create-flow', async () => {
          const t = window.__t;
          const text = () => document.body.textContent || '';
          await fillWizard(t, { stopAt: 'review' });
          t.click('Создать персонажа');
          await t.until(() => text().includes('Восстановление'), 12000, 'лист персонажа');
          window.__facts = {
            sheetOpened: text().includes('Восстановление'),
            stuntOnSheet: text().includes('Кошмарный удар'),
          };
        });
      `,
    },
    { waitFor: 'document.title === "create-flow:done" || document.title.startsWith("create-flow:error:")', timeout: 120000 },
    { shot: { out: 'scripts/e2e/shots/create-flow.png' } },
  ],
  asserts: [
    { name: 'driver-ok', expr: '!document.title.includes(":error:")' },
    { name: 'sheet-opened', expr: 'window.__facts.sheetOpened === true' },
    { name: 'stunt-on-sheet', expr: 'window.__facts.stuntOnSheet === true' },
    {
      name: 'name-on-sheet',
      expr: 'document.body.textContent.includes("Лето из Скеллиге")',
    },
  ],
};
