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
    { name: 'A2: ribbons', expr: '(() => { const ribbons = Array.from(document.querySelectorAll("[data-ribbon]")); return ribbons.length >= 3 && ribbons.every((el) => { const bg = getComputedStyle(el).backgroundColor; if (!bg.startsWith("rgba(152, 120, 73")) return false; const alpha = parseFloat(bg.slice(bg.lastIndexOf(",") + 1)); return alpha >= 0.15 && alpha <= 0.3 && getComputedStyle(el).fontFamily.includes("Cinzel"); }); })()' },
    { name: 'A3: ribbons-font', expr: 'Array.from(document.querySelectorAll("[data-ribbon]")).every(el => getComputedStyle(el).fontFamily.includes("Cinzel"))' },
    { name: 'A4: blocks-unfilled', expr: '(() => { const blocks = Array.from(document.querySelectorAll("[data-kit=sheet-block]")); return blocks.length >= 2 && blocks.every((el) => { const cs = getComputedStyle(el); return cs.backgroundColor === "rgba(0, 0, 0, 0)" && cs.borderTopStyle === "none"; }); })()' },
    { name: 'A5: btn-primary', expr: 'getComputedStyle(document.querySelector("[data-btn=primary]")).backgroundColor === "rgb(152, 120, 73)"' },
    { name: 'A6: btn-disabled', expr: 'getComputedStyle(document.querySelector("[disabled]")).backgroundColor === "rgb(26, 26, 26)"' },
    { name: 'A7: stress', expr: 'document.querySelectorAll("[data-stress-box]").length >= 8' },
    { name: 'A8: no-scroll', expr: 'document.body.scrollWidth <= window.innerWidth' }
  ]
};
