export default {
  name: 'ui-kit',
  url: '/?mock=1&view=kit',
  regions: ["[data-kit=ribbons]", "[data-kit=buttons]", "[data-kit=stress]"],
  steps: [
    { waitFor: 'document.readyState === "complete"', timeout: 10000 },
    { shot: { out: 'scripts/e2e/shots/ui-kit.png' } }
  ],
  asserts: [
    { name: 'A1: bg-color', expr: 'getComputedStyle(document.body).backgroundColor === "rgb(0, 0, 0)"' },
    { name: 'A2: ribbons', expr: 'document.querySelectorAll("[data-ribbon]").length >= 3 && Array.from(document.querySelectorAll("[data-ribbon]")).every(el => getComputedStyle(el).backgroundColor === "rgb(152, 120, 73)")' },
    { name: 'A3: ribbons-font', expr: 'Array.from(document.querySelectorAll("[data-ribbon]")).every(el => getComputedStyle(el).fontFamily.includes("Cinzel"))' },
    { name: 'A4: frames', expr: 'document.querySelectorAll("[data-corner]").length === 4 * document.querySelectorAll("[data-frame]").length && document.querySelectorAll("[data-frame]").length >= 2' },
    { name: 'A5: btn-primary', expr: 'getComputedStyle(document.querySelector("[data-btn=primary]")).backgroundColor === "rgb(152, 120, 73)"' },
    { name: 'A6: btn-disabled', expr: 'getComputedStyle(document.querySelector("[disabled]")).backgroundColor === "rgb(26, 26, 26)"' },
    { name: 'A7: stress', expr: 'document.querySelectorAll("[data-stress-box]").length >= 8' },
    { name: 'A8: no-scroll', expr: 'document.body.scrollWidth <= window.innerWidth' }
  ]
};
