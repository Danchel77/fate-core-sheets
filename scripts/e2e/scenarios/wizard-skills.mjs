import { HELPERS } from '../lib/helpers.mjs';
import { WIZARD_SRC } from '../lib/wizard-src.mjs';

/**
 * Шаг «Навыки»: пирамида собирается снизу вверх.
 *
 * Сценарий фиксирует два состояния: пустая пирамида с тремя заблокированными
 * ступенями и пирамида, где заняты четыре слота +1 и активна ступень +2.
 * Наблюдения собираются в window.__facts до того, как снимутся снимки.
 */
export default {
  name: 'wizard-skills',
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
        __t.run('wizard-skills', async () => {
          const t = window.__t;
          const text = () => document.body.textContent || '';
          await fillWizard(t, { stopAt: 'skills' });

          window.__facts = {
            locksEmpty: document.querySelectorAll('svg.lucide-lock').length,
            emptyCounter: text().includes('0/4'),
          };
        });
      `,
    },
    { waitFor: 'document.title === "wizard-skills:done" || document.title.startsWith("wizard-skills:error:")', timeout: 90000 },
    { shot: { out: 'scripts/e2e/shots/wizard-skills-empty.png' } },
    {
      eval:
        HELPERS +
        `
        __t.run('wizard-skills-fill', async () => {
          const t = window.__t;
          const text = () => document.body.textContent || '';
          for (const skill of ['Атлетика', 'Ближний бой', 'Стрельба', 'Скрытность']) {
            t.click(skill);
            await t.until(() => t.placed(skill), 6000, 'размещение ' + skill);
          }
          window.__facts = Object.assign(window.__facts || {}, {
            locksAfterFour: document.querySelectorAll('svg.lucide-lock').length,
            fullCounter: text().includes('4/4'),
          });
        });
      `,
    },
    { waitFor: 'document.title === "wizard-skills-fill:done" || document.title.startsWith("wizard-skills-fill:error:")', timeout: 60000 },
    { shot: { out: 'scripts/e2e/shots/wizard-skills-level2.png' } },
  ],
  asserts: [
    { name: 'driver-ok', expr: '!document.title.includes(":error:")' },
    { name: 'skills-step-visible', expr: 'document.body.textContent.includes("Каталог навыков")' },
    { name: 'three-locked-initially', expr: 'window.__facts.locksEmpty === 3' },
    { name: 'four-slots-empty-counter', expr: 'window.__facts.emptyCounter === true' },
    { name: 'two-locked-after-four', expr: 'window.__facts.locksAfterFour === 2' },
    { name: 'plus-one-tier-full', expr: 'window.__facts.fullCounter === true' },
  ],
};
