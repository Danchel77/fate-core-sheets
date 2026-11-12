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
    {
      eval: `(() => {
        const trigger = document.querySelector('[data-kit="sheet-refresh"]');
        if (!trigger) return false;
        trigger.click();
        return true;
      })()`
    },
    { waitFor: '!!document.querySelector("[data-kit=sheet-refresh-panel]")', timeout: 5000 },
    { shot: { out: 'scripts/e2e/shots/sheet-refresh-open.png' } },
    {
      eval: `(() => {
        const panel = document.querySelector('[data-kit="sheet-refresh-panel"]');
        const style = panel ? getComputedStyle(panel) : null;
        window.__refreshOpen = {
          exists: !!panel,
          border: style ? style.borderTopColor : null,
          background: style ? style.backgroundColor : null
        };
        const trigger = document.querySelector('[data-kit="sheet-refresh"]');
        if (trigger) trigger.click();
        return true;
      })()`
    },
    { wait: 150 },
    {
      eval: `(() => {
        window.__refreshClosed = !document.querySelector('[data-kit="sheet-refresh-panel"]');
        return true;
      })()`
    },
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
    },
    {
      name: 'S9: no-dup-titles',
      expr: `document.querySelectorAll('[data-zone] h2, [data-zone] h3').length === 0`
    },
    {
      name: 'S10: stress-boxes',
      expr: `(() => {
        const root = document.querySelector('[data-kit="sheet-stress"]');
        if (!root) return false;
        const cells = Array.from(root.querySelectorAll('[data-stress-cell]'));
        if (cells.length !== 8) return false;
        const sized = cells.every((cell) => {
          const rect = cell.getBoundingClientRect();
          return rect.width === 28 && rect.height === 28;
        });
        const open = cells.filter((cell) => !!cell.querySelector('[data-stress-box]'));
        const locked = cells.filter((cell) => !cell.querySelector('[data-stress-box]'));
        const gold = open.length === 7 && open.every(
          (cell) =>
            getComputedStyle(cell.querySelector('[data-stress-box]')).borderTopColor ===
            'rgb(152, 120, 73)'
        );
        const dashed = locked.length === 1 && locked.every(
          (cell) => getComputedStyle(cell).borderTopStyle === 'dashed'
        );
        return sized && gold && dashed;
      })()`
    },
    {
      name: 'S11: left-no-slate',
      expr: `(() => {
        const root = document.querySelector('[data-zone="left"]');
        if (!root) return false;
        const forbidden = 'rgb(100, 116, 139)';
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
          return colors.every((color) => color !== forbidden);
        });
      })()`
    },
    {
      name: 'S12: left-font-min',
      expr: `(() => {
        const root = document.querySelector('[data-zone="left"]');
        if (!root) return false;
        return Array.from(root.querySelectorAll('*')).every((el) => {
          const hasOwnText = Array.from(el.childNodes).some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
          );
          return !hasOwnText || parseFloat(getComputedStyle(el).fontSize) >= 12;
        });
      })()`
    },
    {
      name: 'S13: consequences',
      expr: `(() => {
        const rows = Array.from(document.querySelectorAll('[data-kit="sheet-consequence"]'));
        if (rows.length !== 3) return false;
        return rows.every((row) => {
          const label = row.querySelector('[data-kit="field-label"]');
          if (!label) return false;
          const style = getComputedStyle(label);
          return style.color === 'rgb(168, 160, 144)' && parseFloat(style.fontSize) >= 12;
        });
      })()`
    },
    {
      name: 'S14: fate-tokens',
      expr: `(() => {
        const tokens = Array.from(
          document.querySelectorAll('[data-kit="sheet-fate"] [data-kit="sheet-fate-token"]')
        );
        return tokens.length === 5 && tokens.every((token) => {
          const rect = token.getBoundingClientRect();
          return rect.width === 16 && getComputedStyle(token).borderRadius === '0px';
        });
      })()`
    },
    {
      name: 'S15: refresh-popover',
      expr: `(() => {
        const open = window.__refreshOpen;
        const closed = window.__refreshClosed;
        return !!open &&
          open.exists === true &&
          open.border === 'rgb(152, 120, 73)' &&
          open.background === 'rgb(13, 13, 13)' &&
          closed === true;
      })()`
    },
    {
      name: 'S16: skill-levels',
      expr: `(() => {
        const levels = Array.from(document.querySelectorAll('[data-kit="sheet-skill-level"]'));
        return (
          levels.length === 4 &&
          levels.every((level) => level.querySelectorAll('[data-kit="sheet-skill-slot"]').length >= 1)
        );
      })()`
    },
    {
      name: 'S17: skill-slots',
      expr: `document.querySelectorAll('[data-kit="sheet-skill-slot"]').length === 10`
    },
    {
      name: 'S18: center-sharp',
      expr: `(() => {
        const root = document.querySelector('[data-zone="center"]');
        if (!root) return false;
        return Array.from(root.querySelectorAll('*')).every((el) => {
          const className = typeof el.className === 'string' ? el.className : '';
          if (!className.trim()) return true;
          return getComputedStyle(el).borderRadius === '0px';
        });
      })()`
    },
    {
      name: 'S19: center-font-min',
      expr: `(() => {
        const root = document.querySelector('[data-zone="center"]');
        if (!root) return false;
        return Array.from(root.querySelectorAll('*')).every((el) => {
          if (!el.textContent || el.textContent.trim().length === 0) return true;
          return parseFloat(getComputedStyle(el).fontSize) >= 12;
        });
      })()`
    },
    {
      name: 'S20: center-no-slate',
      expr: `(() => {
        const root = document.querySelector('[data-zone="center"]');
        if (!root) return false;
        const forbidden = 'rgb(100, 116, 139)';
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
          return colors.every((color) => color !== forbidden);
        });
      })()`
    },
    {
      name: 'S21: stunt-rows',
      expr: `(() => {
        const rows = Array.from(document.querySelectorAll('[data-kit="sheet-stunt"]'));
        return (
          rows.length === 3 &&
          rows.every((row) => {
            const style = getComputedStyle(row);
            return style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.borderRadius === '0px';
          })
        );
      })()`
    }
  ]
};
