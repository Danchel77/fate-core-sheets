import { HELPERS } from '../lib/helpers.mjs';

/**
 * Мобильная оболочка конструктора (390px).
 *
 * Проверяем три вещи, которые ломаются первыми при адаптивной вёрстке:
 * отсутствие горизонтального скролла, липкую нижнюю панель действий
 * и прилипание полоски секций под шапкой.
 */
export default {
  name: 'mobile-shell',
  steps: [
    {
      waitFor: 'document.readyState === "complete" && !!document.querySelector("button")',
      timeout: 15000,
    },
    { click: 'Создать персонажа' },
    {
      eval:
        HELPERS +
        `
        __t.run('mobile-shell', async () => {
          const t = window.__t;
          await t.until(() => !!document.querySelector('#wizard-name'), 10000, 'конструктор');
          window.scrollTo(0, 700);
          await t.sleep(500);
          const nav = document.querySelector('nav[aria-label], nav');
          window.__facts = {
            noHorizontalScroll: document.documentElement.scrollWidth <= window.innerWidth + 1,
            navTop: nav ? Math.round(nav.getBoundingClientRect().top) : -1,
            bottomBar: !!Array.from(document.querySelectorAll('div')).find((el) => {
              const cs = getComputedStyle(el);
              return cs.position === 'fixed' && cs.bottom === '0px' && el.textContent.includes('Создать персонажа');
            }),
          };
        });
      `,
    },
    {
      waitFor:
        'document.title === "mobile-shell:done" || document.title.startsWith("mobile-shell:error:")',
      timeout: 60000,
    },
    { shot: {} },
  ],
  asserts: [
    { name: 'driver-ok', expr: '!document.title.includes(":error:")' },
    { name: 'no-horizontal-scroll', expr: 'window.__facts.noHorizontalScroll === true' },
    { name: 'nav-sticky', expr: 'window.__facts.navTop === 64' },
    { name: 'bottom-bar-present', expr: 'window.__facts.bottomBar === true' },
  ],
};
