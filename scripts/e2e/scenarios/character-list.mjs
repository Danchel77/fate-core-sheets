export default {
  name: 'character-list',
  url: '/?mock=1&view=list',
  regions: ["[data-kit=character-list]"],
  steps: [
    { waitFor: 'document.readyState === "complete"', timeout: 15000 },
    { waitFor: 'document.querySelectorAll("[data-kit=character-card]").length >= 1', timeout: 15000 },
    { shot: { out: 'scripts/e2e/shots/character-list.png' } }
  ],
  asserts: [
    {
      name: 'A1: isolated',
      expr: 'document.querySelectorAll("header, footer").length === 0 && getComputedStyle(document.body).backgroundColor === "rgb(0, 0, 0)"'
    },
    {
      name: 'A2: ribbon',
      expr: '(() => { const r = document.querySelector("[data-ribbon]"); return !!r && getComputedStyle(r).backgroundColor === "rgb(152, 120, 73)" && getComputedStyle(r).fontFamily.includes("Cinzel"); })()'
    },
    {
      name: 'A3: cards-panel',
      expr: '(() => { const cards = Array.from(document.querySelectorAll("[data-kit=character-card]")); return cards.length >= 3 && cards.every((card) => { const cs = getComputedStyle(card); return cs.backgroundColor === "rgb(20, 20, 20)" && cs.borderTopColor === "rgb(41, 35, 25)"; }); })()'
    },
    {
      name: 'A4: avatar-64',
      expr: '(() => { const avatars = Array.from(document.querySelectorAll("[data-avatar]")); return avatars.length >= 3 && avatars.every((avatar) => { const rect = avatar.getBoundingClientRect(); const card = avatar.closest("[data-kit=character-card]"); return !!card && rect.width <= 64 && rect.height <= 64 && rect.width <= card.getBoundingClientRect().width + 0.5; }); })()'
    },
    {
      name: 'A5: no-overflow',
      expr: 'document.documentElement.scrollWidth <= window.innerWidth + 1'
    },
    {
      name: 'A6: font-min',
      expr: '(() => { const root = document.querySelector("[data-kit=character-list]"); if (!root) return false; const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const tooSmall = []; let node = walker.nextNode(); while (node) { const text = node.textContent ? node.textContent.trim() : ""; if (text) { const el = node.parentElement; const style = getComputedStyle(el); const visible = style.display !== "none" && style.visibility !== "hidden" && el.getClientRects().length > 0; if (visible && parseFloat(style.fontSize) < 12) tooSmall.push(el.tagName + ":" + style.fontSize); } node = walker.nextNode(); } return tooSmall.length === 0; })()'
    },
    {
      name: 'A7: no-legacy-color',
      expr: '(() => { const root = document.querySelector("[data-kit=character-list]"); if (!root) return false; const html = root.outerHTML; const legacy = /(?:bg|text|border|ring|from|via|to)-(?:slate|gray|zinc)-/.test(html); const hex = html.indexOf("bg-[#") !== -1 || html.indexOf("text-[#") !== -1; return !legacy && !hex; })()'
    },
    {
      name: 'A8: new-card',
      expr: '(() => { const el = document.querySelector("[data-kit=character-new]"); return !!el && el.textContent.includes("Создать персонажа"); })()'
    }
  ]
};
