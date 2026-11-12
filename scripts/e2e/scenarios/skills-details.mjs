import { HELPERS } from '../lib/helpers.mjs';
import { WIZARD_SRC } from '../lib/wizard-src.mjs';

/**
 * Шаг «Навыки», раскрытые детали одного навыка.
 *
 * Фиксирует блок деталей: описание, два примера-в-сеттинге и расшифровки
 * действий Fate (ACTION_LABELS + ACTION_HINTS) под кнопкой-шевроном.
 */
export default {
  name: 'skills-details',
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
        __t.run('skills-details', async () => {
          const t = window.__t;
          const text = () => t.visibleText();
          await fillWizard(t, { stopAt: 'skills' });
          t.click('Подробнее о навыке Атлетика');
          await t.until(() => text().includes('Преодоление —'), 8000, 'детали навыка');
          window.__facts = { detailsOpen: text().includes('Бег, прыжки, акробатика') };
        });
      `,
    },
    {
      waitFor:
        'document.title === "skills-details:done" || document.title.startsWith("skills-details:error:")',
      timeout: 90000,
    },
    { shot: {} },
  ],
  asserts: [
    { name: 'driver-ok', expr: '!document.title.includes(":error:")' },
    { name: 'details-open', expr: 'window.__facts && window.__facts.detailsOpen === true' },
    { name: 'action-hint-overcome', expr: 'window.__t.visibleText().includes("Действовать, когда исход неочевиден")' },
  ],
};
