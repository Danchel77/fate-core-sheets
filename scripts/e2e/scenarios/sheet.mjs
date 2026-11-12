export default {
  name: 'sheet',
  url: '/?mock=1&view=sheet',
  regions: ['[data-zone="left"]', '[data-zone="center"]', '[data-zone="right"]'],
  steps: [
    { waitFor: 'document.readyState === "complete"', timeout: 15000 },
    {
      waitFor: 'document.querySelectorAll("[data-kit=sheet-block]").length >= 6',
      timeout: 15000
    },
    { wait: 500 },
    { shot: { out: 'scripts/e2e/shots/sheet.png' } }
  ],
  asserts: [
    {
      name: 'S1: isolated',
      expr: `(() => document.body.textContent.includes('Все права на сеттинги') === false && !!document.querySelector('[data-zone="left"]'))()`
    },
    {
      name: 'S2: body-ink',
      expr: `getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'`
    },
    {
      name: 'S3: three-zones',
      expr: `document.querySelectorAll('[data-zone]').length === 3`
    },
    {
      name: 'S4: zone-order',
      expr: `(() => {
        const box = (name) => {
          const el = document.querySelector('[data-zone="' + name + '"]');
          return el ? el.getBoundingClientRect() : null;
        };
        const left = box('left');
        const center = box('center');
        const right = box('right');
        if (!left || !center || !right) return false;
        if (window.innerWidth >= 1024) {
          return left.left < center.left && center.left < right.left;
        }
        return left.top < center.top && center.top < right.top;
      })()`
    },
    {
      name: 'S5: blocks-framed',
      expr: `(() => {
        const blocks = Array.from(document.querySelectorAll('[data-kit="sheet-block"]'));
        if (blocks.length < 6) return false;
        const framed = blocks.every(
          (block) => !!block.querySelector('[data-ribbon]') && !!block.querySelector('[data-frame]')
        );
        const frames = Array.from(document.querySelectorAll('[data-frame]'));
        const corners = frames.every(
          (frame) => frame.querySelectorAll('[data-corner]').length === 4
        );
        return framed && frames.length > 0 && corners;
      })()`
    },
    {
      name: 'S6: portrait-size',
      expr: `(() => {
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        if (!portrait) return false;
        const rect = portrait.getBoundingClientRect();
        return rect.width >= 260 && rect.width <= 340 && rect.height >= 340 && rect.height <= 440;
      })()`
    },
    {
      name: 'S7: sharp',
      expr: `(() => {
        const framed = Array.from(document.querySelectorAll('[data-frame]'));
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        const nodes = portrait ? [...framed, portrait] : framed;
        return nodes.length > 0 && nodes.every((el) => getComputedStyle(el).borderRadius === '0px');
      })()`
    },
    {
      name: 'S8: no-legacy-color',
      expr: `(() => {
        const root = document.querySelector('[data-kit="sheet-header"]');
        if (!root) return false;
        const forbidden = ['rgb(100, 116, 139)', 'rgb(15, 20, 28)'];
        const nodes = [root, ...Array.from(root.querySelectorAll('*'))];
        return nodes.every((el) => {
          const className = typeof el.className === 'string' ? el.className : '';
          if (className.includes('slate-')) return false;
          const style = getComputedStyle(el);
          const colors = [
            style.color,
            style.backgroundColor,
            style.borderTopColor,
            style.borderRightColor,
            style.borderBottomColor,
            style.borderLeftColor
          ];
          return colors.every((color) => !forbidden.includes(color));
        });
      })()`
    }
  ]
};
