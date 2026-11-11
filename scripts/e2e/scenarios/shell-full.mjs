import { HELPERS } from '../lib/helpers.mjs';
import { WIZARD_SRC } from '../lib/wizard-src.mjs';

/**
 * Весь конструктор одним кадром: заполненный черновик со всеми секциями.
 * Снимается с высоким вьюпортом (`--height=3400`), чтобы страница влезла целиком.
 */
export default {
  name: 'shell-full',
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
        __t.run('shell-full', async () => {
          await fillWizard(window.__t, { stopAt: 'stunts' });
          window.scrollTo(0, 0);
        });
      `,
    },
    {
      waitFor: 'document.title === "shell-full:done" || document.title.startsWith("shell-full:error:")',
      timeout: 120000,
    },
    { wait: 500 },
    { shot: { out: 'scripts/e2e/shots/shell-full.png' } },
  ],
  asserts: [
    { name: 'driver-ok', expr: '!document.title.includes(":error:")' },
    { name: 'five-sections', expr: 'document.querySelectorAll("section[id]").length === 5' },
    { name: 'rail-present', expr: '!!document.querySelector("aside")' },
  ],
};
