export default {
  name: 'sheet',
  url: '/?mock=1&view=sheet',
  regions: ['[data-kit="character-plate"]', '[data-zone="left"]', '[data-zone="right"]'],
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
    {
      eval: `(() => {
        const trigger = document.querySelector('[data-kit="sheet-portrait"]');
        if (!trigger) return false;
        trigger.focus();
        trigger.click();
        return true;
      })()`
    },
    { waitFor: `!!document.querySelector('[data-kit=modal][data-modal-level="1"]')`, timeout: 5000 },
    { wait: 200 },
    { shot: { out: 'scripts/e2e/shots/sheet-portrait-modal.png' } },
    {
      eval: `(() => {
        const modals = document.querySelectorAll('[data-kit="modal"]');
        const modal = document.querySelector('[data-kit=modal][data-modal-level="1"]');
        const panel = modal ? modal.querySelector('[data-kit="modal-panel"]') : null;
        const style = panel ? getComputedStyle(panel) : null;
        window.__portraitModal = {
          count: modals.length,
          exists: !!modal,
          background: style ? style.backgroundColor : null,
          radius: style ? style.borderRadius : null,
          ribbon: !!(panel && panel.querySelector('[data-ribbon]'))
        };
        return true;
      })()`
    },
    {
      eval: `(() => {
        const close = document.querySelector('[data-kit="modal-close"]');
        if (!close) return false;
        close.focus();
        close.click();
        return true;
      })()`
    },
    { wait: 200 },
    {
      eval: `(() => {
        const trigger = document.querySelector('[aria-label="Помощь Gemini: Концепция"]');
        if (!trigger) return false;
        trigger.focus();
        trigger.click();
        return true;
      })()`
    },
    { waitFor: `!!document.querySelector('[data-kit=modal][data-modal-level="1"]')`, timeout: 5000 },
    { wait: 200 },
    {
      eval: `(() => {
        const generate = Array.from(document.querySelectorAll('button')).find(
          (button) => button.textContent.trim() === 'Сгенерировать 3 варианта'
        );
        if (!generate) return false;
        generate.focus();
        generate.click();
        return true;
      })()`
    },
    { waitFor: `!!document.querySelector('[data-kit=modal][data-modal-level="2"]')`, timeout: 5000 },
    { wait: 250 },
    { shot: { out: 'scripts/e2e/shots/sheet-gemini-nested.png' } },
    {
      eval: `(() => {
        const first = document.querySelector('[data-kit=modal][data-modal-level="1"]');
        const second = document.querySelector('[data-kit=modal][data-modal-level="2"]');
        const panel = second ? second.querySelector('[data-kit="modal-panel"]') : null;
        const style = panel ? getComputedStyle(panel) : null;
        window.__geminiNested = {
          level1: !!first,
          level2: !!second,
          transform: style ? style.transform : null
        };
        return true;
      })()`
    },
    {
      eval: `(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return true;
      })()`
    },
    { wait: 200 },
    {
      eval: `(() => {
        window.__escapeTop = {
          level2Closed: !document.querySelector('[data-kit=modal][data-modal-level="2"]'),
          level1Open: !!document.querySelector('[data-kit=modal][data-modal-level="1"]')
        };
        return true;
      })()`
    },
    { shot: { out: 'scripts/e2e/shots/sheet-gemini.png' } },
    {
      eval: `(() => {
        const panel = document.querySelector('[data-kit=modal][data-modal-level="1"] [data-kit="modal-panel"]');
        if (!panel) {
          window.__modalLegacy = null;
          return true;
        }
        const nodes = [panel, ...Array.from(panel.querySelectorAll('*'))];
        let badClass = false;
        let badRadius = false;
        let badDim = false;
        for (const el of nodes) {
          const className = typeof el.className === 'string' ? el.className : '';
          const tokens = className.split(' ').filter(Boolean);
          const hasSlate = tokens.some(
            (token) =>
              token.startsWith('slate-') ||
              token.includes(':slate-') ||
              token.includes('-slate-')
          );
          const hasRounded = tokens.some(
            (token) => token.startsWith('rounded') && token !== 'rounded-none'
          );
          if (hasSlate || hasRounded || className.includes('backdrop-blur')) badClass = true;
          if (getComputedStyle(el).borderRadius !== '0px') badRadius = true;
          const bg = getComputedStyle(el).backgroundColor;
          if (
            bg.startsWith('rgba(0, 0, 0,') &&
            Math.abs(parseFloat(bg.slice(bg.lastIndexOf(',') + 1)) - 0.8) < 0.01
          ) {
            badDim = true;
          }
        }
        window.__modalLegacy = { badClass, badRadius, badDim };
        return true;
      })()`
    },
    {
      eval: `(() => {
        const close = document.querySelector('[data-kit="modal-close"]');
        if (!close) return false;
        close.focus();
        close.click();
        return true;
      })()`
    },
    { wait: 300 },
    {
      eval: `(() => {
        window.__modalsClosed = document.querySelectorAll('[data-kit="modal"]').length === 0;
        return true;
      })()`
    },
    {
      eval: `(() => {
        const trigger = document.querySelector('[data-kit="tooltip-trigger"]');
        if (!trigger) return false;
        trigger.focus();
        trigger.click();
        return true;
      })()`
    },
    { waitFor: '!!document.querySelector("[data-kit=tooltip-panel]")', timeout: 5000 },
    { wait: 200 },
    { shot: { out: 'scripts/e2e/shots/sheet-tooltip-open.png' } },
    {
      eval: `(() => {
        const panel = document.querySelector('[data-kit="tooltip-panel"]');
        const trigger = document.querySelector('[data-kit="tooltip-trigger"]');
        if (!panel || !trigger) {
          window.__tooltip = null;
          return true;
        }
        const panelStyle = getComputedStyle(panel);
        const rect = panel.getBoundingClientRect();
        const title = panel.children[0];
        const body = panel.children[1];
        const titleStyle = title ? getComputedStyle(title) : null;
        const bodyStyle = body ? getComputedStyle(body) : null;
        window.__tooltip = {
          exists: true,
          border: panelStyle.borderColor,
          background: panelStyle.backgroundColor,
          radius: panelStyle.borderRadius,
          left: rect.left,
          right: rect.right,
          innerWidth: window.innerWidth,
          expanded: trigger.getAttribute('aria-expanded'),
          titleFont: titleStyle ? titleStyle.fontFamily : '',
          bodyFont: bodyStyle ? bodyStyle.fontFamily : '',
          bodySize: bodyStyle ? parseFloat(bodyStyle.fontSize) : 0
        };
        return true;
      })()`
    },
    {
      eval: `(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return true;
      })()`
    },
    { wait: 200 },
    {
      eval: `(() => {
        window.__tooltipClosed = !document.querySelector('[data-kit="tooltip-panel"]');
        return true;
      })()`
    },
    {
      eval: `(() => {
        const trigger = document.querySelector('[data-kit="setting-button"]');
        if (!trigger) return false;
        trigger.click();
        return true;
      })()`
    },
    { waitFor: '!!document.querySelector("[data-kit=setting-panel]")', timeout: 5000 },
    { wait: 150 },
    { shot: { out: 'scripts/e2e/shots/sheet-setting-picker.png' } },
    {
      eval: `(() => {
        const panel = document.querySelector('[data-kit="setting-panel"]');
        const options = Array.from(document.querySelectorAll('[data-kit="setting-option"]'));
        const active = options.filter((option) => option.getAttribute('data-active') === 'true');
        const button = document.querySelector('[data-kit="setting-button"]');
        window.__settingPicker = {
          open: !!panel,
          options: options.length,
          activeCount: active.length,
          activeName: active.length === 1 ? active[0].textContent.trim() : null,
          expanded: button ? button.getAttribute('aria-expanded') : null
        };
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return true;
      })()`
    },
    { wait: 200 },
    {
      eval: `(() => {
        if (window.__settingPicker) {
          window.__settingPicker.closed = !document.querySelector('[data-kit="setting-panel"]');
        }
        return true;
      })()`
    },
    {
      // Снимок без фокус-ринга: в покое плашка должна читаться страницей, а не
      // формой. Фокус-ринг остаётся в CSS (`focus-visible`) и виден при Tab.
      eval: `(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        return true;
      })()`
    },
    {
      // Числа для S36 в сыром выводе: если лист не влезает в экран, в отчёте
      // будет точная высота документа, а не только упавшее утверждение.
      eval: `(() => {
        window.__sheetFit = {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          scrollHeight: document.documentElement.scrollHeight
        };
        return JSON.stringify(window.__sheetFit);
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
      name: 'S3: two-zones',
      expr: `(() => {
        const zones = Array.from(document.querySelectorAll('[data-zone]'));
        return zones.length === 2
          && !!document.querySelector('[data-zone="left"]')
          && !!document.querySelector('[data-zone="right"]');
      })()`
    },
    {
      name: 'S4: zone-order',
      expr: `(() => {
        const box = (name) => {
          const el = document.querySelector('[data-zone="' + name + '"]');
          return el ? el.getBoundingClientRect() : null;
        };
        const left = box('left');
        const right = box('right');
        if (!left || !right) return false;
        if (window.innerWidth >= 1024) return left.left < right.left;
        return left.top < right.top;
      })()`
    },
    {
      name: 'S5: blocks-unfilled',
      expr: `(() => {
        const blocks = Array.from(document.querySelectorAll('[data-kit="sheet-block"]'));
        if (blocks.length < 6) return false;
        const unfilled = blocks.every((block) => {
          const cs = getComputedStyle(block);
          return (
            cs.backgroundColor === 'rgba(0, 0, 0, 0)' &&
            cs.borderStyle === 'none' &&
            !!block.querySelector('[data-ribbon]')
          );
        });
        const legacy = document.querySelectorAll('[data-frame], [data-corner]').length;
        return unfilled && legacy === 0;
      })()`
    },
    {
      name: 'S6: portrait-size',
      expr: `(() => {
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        if (!portrait) return false;
        const rect = portrait.getBoundingClientRect();
        if (window.innerWidth >= 1024) {
          return Math.abs(rect.width - 240) <= 4 && Math.abs(rect.height - 300) <= 4;
        }
        return rect.height > 0 && rect.height <= 224;
      })()`
    },
    {
      name: 'S7: sharp',
      expr: `(() => {
        const blocks = Array.from(document.querySelectorAll('[data-kit="sheet-block"]'));
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        if (!portrait || blocks.length < 6) return false;
        return [portrait, ...blocks].every(
          (el) => getComputedStyle(el).borderRadius === '0px'
        );
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
        if (tokens.length !== 5) return false;
        const round = tokens.every((token) => {
          const style = getComputedStyle(token);
          const radius = style.borderRadius;
          return (
            (radius === '50%' || parseFloat(radius) >= 14) &&
            style.backgroundColor === 'rgba(0, 0, 0, 0)'
          );
        });
        if (!round) return false;
        const available = tokens.filter(
          (token) => getComputedStyle(token).borderTopStyle === 'solid'
        );
        const spent = tokens.filter(
          (token) => getComputedStyle(token).borderTopStyle === 'dashed'
        );
        return (
          available.length >= 1 &&
          spent.length >= 1 &&
          available.length + spent.length === tokens.length &&
          available.every(
            (token) => getComputedStyle(token).borderTopColor === 'rgb(152, 120, 73)'
          )
        );
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
    },
    {
      name: 'S22: right-no-slate',
      expr: `(() => {
        const root = document.querySelector('[data-zone="right"]');
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
      name: 'S23: right-font-min',
      expr: `(() => {
        const root = document.querySelector('[data-zone="right"]');
        if (!root) return false;
        return Array.from(root.querySelectorAll('*')).every((el) => {
          if (!el.textContent || el.textContent.trim().length === 0) return true;
          return parseFloat(getComputedStyle(el).fontSize) >= 12;
        });
      })()`
    },
    {
      name: 'S24: right-sharp',
      expr: `(() => {
        const root = document.querySelector('[data-zone="right"]');
        if (!root) return false;
        return [root, ...Array.from(root.querySelectorAll('*'))].every((el) => {
          const className = typeof el.className === 'string' ? el.className : '';
          if (!className.trim()) return true;
          return getComputedStyle(el).borderRadius === '0px';
        });
      })()`
    },
    {
      name: 'S25: aspects',
      expr: `(() => {
        const rows = Array.from(document.querySelectorAll('[data-kit="sheet-aspect"]'));
        if (rows.length !== 5) return false;
        return rows.every((row) => {
          const label = row.querySelector('[data-kit="field-label"]');
          if (!label) return false;
          const style = getComputedStyle(label);
          return style.color === 'rgb(168, 160, 144)' && parseFloat(style.fontSize) >= 12;
        });
      })()`
    },
    {
      name: 'S26: notes',
      expr: `(() => {
        const notes = Array.from(document.querySelectorAll('[data-kit="sheet-notes"]'));
        if (notes.length !== 1) return false;
        const style = getComputedStyle(notes[0]);
        const block = notes[0].closest('[data-kit="sheet-block"]');
        const ribbon = block ? block.querySelector('[data-ribbon]') : null;
        return (
          style.backgroundColor === 'rgb(13, 13, 13)' &&
          style.borderTopColor === 'rgb(41, 35, 25)' &&
          !!ribbon &&
          ribbon.textContent.trim() === 'Заметки'
        );
      })()`
    },
    {
      name: 'S27: portrait-modal',
      expr: `(() => {
        const facts = window.__portraitModal;
        return (
          !!facts &&
          facts.count === 1 &&
          facts.exists === true &&
          facts.background === 'rgb(20, 20, 20)' &&
          facts.radius === '0px' &&
          facts.ribbon === true
        );
      })()`
    },
    {
      name: 'S28: gemini-nested',
      expr: `(() => {
        const facts = window.__geminiNested;
        if (!facts || facts.level1 !== true || facts.level2 !== true) return false;
        const transform = facts.transform || '';
        if (!transform.startsWith('matrix(')) return false;
        const parts = transform
          .slice(transform.indexOf('(') + 1, transform.lastIndexOf(')'))
          .split(',')
          .map((value) => parseFloat(value.trim()));
        return (
          parts.length === 6 &&
          Math.abs(parts[4] - 24) < 0.5 &&
          Math.abs(parts[5] - 24) < 0.5
        );
      })()`
    },
    {
      name: 'S29: escape-top',
      expr: `(() => {
        const facts = window.__escapeTop;
        return !!facts && facts.level2Closed === true && facts.level1Open === true;
      })()`
    },
    {
      name: 'S30: modals-closed',
      expr: `window.__modalsClosed === true`
    },
    {
      name: 'S31: no-legacy-in-modals',
      expr: `(() => {
        const facts = window.__modalLegacy;
        return (
          !!facts &&
          facts.badClass === false &&
          facts.badRadius === false &&
          facts.badDim === false
        );
      })()`
    },
    {
      name: 'S32: tooltip-open',
      expr: `(() => {
        const facts = window.__tooltip;
        return (
          !!facts &&
          facts.exists === true &&
          facts.border === 'rgb(152, 120, 73)' &&
          facts.background === 'rgb(13, 13, 13)' &&
          facts.radius === '0px' &&
          facts.left >= 0 &&
          facts.right <= facts.innerWidth &&
          facts.expanded === 'true'
        );
      })()`
    },
    {
      name: 'S33: tooltip-type',
      expr: `(() => {
        const facts = window.__tooltip;
        if (!facts) return false;
        return (
          facts.titleFont.includes('Cinzel') &&
          (facts.bodyFont.includes('Inter') || facts.bodyFont.includes('sans-serif')) &&
          facts.bodySize >= 12
        );
      })()`
    },
    {
      name: 'S34: tooltip-escape',
      expr: `window.__tooltipClosed === true`
    },
    {
      name: 'S35: touch-targets',
      expr: `(() => {
        if (window.innerWidth >= 1024) return true;
        const slots = Array.from(document.querySelectorAll('[data-kit="sheet-skill-slot"]'));
        if (slots.length === 0) return false;
        return slots.every((slot) => {
          const remove = slot.querySelector('button');
          if (!remove) return false;
          return parseFloat(getComputedStyle(remove).opacity) >= 0.99;
        });
      })()`
    },
    {
      name: 'S36: sheet-fits',
      expr: `(() => {
        if (window.innerWidth < 1024) return true;
        const fit = window.__sheetFit;
        return !!fit && fit.scrollHeight <= fit.innerHeight + 2;
      })()`
    },
    {
      name: 'S38: no-setting-select',
      expr: `(() => {
        const left = document.querySelector('[data-zone="left"]');
        if (!left) return false;
        return (
          left.querySelectorAll('select').length === 0 &&
          !!left.querySelector('[data-kit="setting-button"]')
        );
      })()`
    },
    {
      name: 'S39: setting-picker',
      expr: `(() => {
        const facts = window.__settingPicker;
        return (
          !!facts &&
          facts.open === true &&
          facts.options === 2 &&
          facts.activeCount === 1 &&
          facts.expanded === 'true' &&
          facts.closed === true
        );
      })()`
    },
    {
      name: 'S40: portrait-centered',
      expr: `(() => {
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        const zone = document.querySelector('[data-zone="left"]');
        if (!portrait || !zone) return false;
        const p = portrait.getBoundingClientRect();
        const z = zone.getBoundingClientRect();
        return Math.abs(p.left + p.width / 2 - (z.left + z.width / 2)) <= 4;
      })()`
    },
    {
      name: 'S41: no-english',
      expr: `(() => {
        const sheet = document.querySelector('#printable-character-sheet');
        if (!sheet) return false;
        const text = (sheet.textContent || '').toLowerCase();
        return ['high concept', 'trouble', 'past', 'bond', 'goal'].every(
          (word) => !text.includes(word)
        );
      })()`
    },
    {
      name: 'S42: refresh-control',
      expr: `(() => {
        const left = document.querySelector('[data-zone="left"]');
        if (!left) return false;
        const trigger = left.querySelector('[data-kit="sheet-refresh"]');
        if (!trigger) return false;
        const label = trigger.getAttribute('aria-label') || '';
        return label.includes('Восстановление') && !label.includes('Обновление');
      })()`
    },
    {
      name: 'S43: character-plate',
      expr: `(() => {
        const plate = document.querySelector('[data-kit="character-plate"]');
        if (!plate) return false;
        const portrait = plate.querySelector('[data-kit="sheet-portrait"]');
        const name = plate.querySelector('[data-kit="character-name"]');
        if (!portrait || !name) return false;
        const value = name instanceof HTMLInputElement ? name.value : (name.textContent || '');
        return (
          value.trim().length > 0 &&
          getComputedStyle(plate).borderTopColor === 'rgb(152, 120, 73)'
        );
      })()`
    },
    {
      name: 'S44: wordmark-one-line',
      expr: `(() => {
        const mark = document.querySelector('[data-kit="setting-wordmark"]');
        if (!mark) return false;
        const cs = getComputedStyle(mark);
        return mark.getBoundingClientRect().height <= 24 && cs.whiteSpace === 'nowrap';
      })()`
    },
    {
      name: 'S45: term-restore',
      expr: `(() => {
        const left = document.querySelector('[data-zone="left"]');
        if (!left) return false;
        const text = left.textContent || '';
        return text.includes('Восстановление') && !text.includes('Обновление') && !/освежение/i.test(text);
      })()`
    }
  ]
};
