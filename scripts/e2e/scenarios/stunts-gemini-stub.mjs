import { HELPERS } from '../lib/helpers.mjs';
import { WIZARD_SRC } from '../lib/wizard-src.mjs';

/**
 * Панель Gemini на шаге «Трюки» без обращения к сети.
 *
 * Клиент подменяет window.fetch на ответ с заранее известной оценкой. Так
 * проверяется именно рендер и разбор ответа, а не доступность модели: дневная
 * квота free tier не должна делать сценарий красным.
 */
const EVALUATION = {
  score: 7,
  verdict: 'Крепкий узкий трюк, но условие можно сузить ещё.',
  strengths: ['Опирается на навык «Магия +4».', 'Условие узкое: темнота и чудовища.'],
  improvements: ['Уточни, какие именно чудовища — тип врага.', 'Добавь, что происходит при провале.'],
  pattern: 'bonus',
  patternNote: 'Формулировка держится шаблона «Бонус +2».',
};

export default {
  name: 'stunts-gemini-stub',
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
        __t.run('stunts-gemini-stub', async () => {
          const t = window.__t;
          const text = () => t.visibleText();
          await fillWizard(t, { stopAt: 'stunts' });
          await t.until(() => !!document.querySelector('[aria-label="Паттерн трюка"]'), 8000, 'пикер паттернов');

          const payload = ${JSON.stringify(JSON.stringify(EVALUATION))};
          window.fetch = async () =>
            new Response(
              JSON.stringify({ candidates: [{ content: { parts: [{ text: payload }] } }] }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );

          t.click('Бонус +2');
          await t.until(() => document.querySelector('#wizard-stunt-name'), 6000, 'конструктор');
          t.setValue('#wizard-stunt-name', 'Кошмарный удар');
          t.setValue('#wizard-stunt-situation', 'против чудовищ, когда бью первым');
          t.click('Оценить');
          await t.until(() => text().includes('/10') && text().includes('Сильные места'), 12000, 'оценка Gemini');
          window.__facts = {
            score: t.visibleText().includes('7/10'),
            strengths: text().includes('Сильные места'),
            improvements: text().includes('Что улучшить'),
          };
        });
      `,
    },
    { waitFor: 'document.title === "stunts-gemini-stub:done" || document.title.startsWith("stunts-gemini-stub:error:")', timeout: 120000 },
    { eval: "document.getElementById('stunts').scrollIntoView({ block: 'start' })" },
    { wait: 700 },
    { shot: {} },
  ],
  asserts: [
    { name: 'driver-ok', expr: '!document.title.includes(":error:")' },
    { name: 'score-rendered', expr: 'window.__facts.score === true' },
    { name: 'strengths-rendered', expr: 'window.__facts.strengths === true' },
    { name: 'improvements-rendered', expr: 'window.__facts.improvements === true' },
    {
      name: 'pattern-tag-rendered',
      expr: 'window.__t.visibleText().includes("БОНУС +2") || window.__t.visibleText().includes("Бонус +2")',
    },
  ],
};
