// Проверка «фундамент на месте»: токены DESIGN.md §1 и вид общих компонентов.
// Сценарий намеренно не проверяет вёрстку экранов — только то, из чего она собрана.
// Провал означает, что токена нет в tailwind.config.js, класс не сгенерирован
// или компонент из src/components/common/ разошёлся с DESIGN.md.
// F16–F19 дополнительно проверяют каркас модальных окон §7: открытие, вложенность,
// Escape только для верхнего окна и восстановление прокрутки после закрытия.
export default {
  name: 'foundation',
  url: '/?mock=1&view=kit',
  steps: [
    { waitFor: 'document.readyState === "complete"', timeout: 10000 },
    { waitFor: '!!document.querySelector("[data-ribbon]")', timeout: 10000 },
    {
      eval: `(() => {
        window.__modalProbe = { overflowBefore: document.body.style.overflow };
        const trigger = document.querySelector('[data-kit="modal-demo-open"] button');
        if (!trigger) return false;
        trigger.focus();
        trigger.click();
        // Кнопка демонстрации ниже первого экрана: снимок всего документа
        // должен показать затемнение от верха страницы, а не от места фокуса.
        window.scrollTo(0, 0);
        return true;
      })()`
    },
    { waitFor: `!!document.querySelector("[data-kit=modal][data-modal-level='1']")`, timeout: 5000 },
    { wait: 200 },
    {
      eval: `(() => {
        const overlay = document.querySelector('[data-kit=modal][data-modal-level="1"]');
        const panel = overlay ? overlay.querySelector('[data-kit=modal-panel]') : null;
        if (!panel) return false;
        const cs = getComputedStyle(panel);
        const panelRect = panel.getBoundingClientRect();
        const ribbon = panel.querySelector('[data-ribbon]');
        const ribbonRect = ribbon ? ribbon.getBoundingClientRect() : null;
        window.__modalProbe.open = {
          level: overlay.getAttribute('data-modal-level'),
          border: cs.borderTopColor,
          radius: cs.borderTopLeftRadius,
          background: cs.backgroundColor,
          ribbon: !!ribbon,
          close: !!panel.querySelector('[data-kit=modal-close]'),
          bodyLocked: getComputedStyle(document.body).overflowY === 'hidden',
          panelRect: { left: panelRect.left, right: panelRect.right, width: panelRect.width },
          ribbonRect: ribbonRect
            ? { left: ribbonRect.left, right: ribbonRect.right, width: ribbonRect.width }
            : null
        };
        return true;
      })()`
    },
    { shot: {} },
    { waitFor: `!!document.querySelector('[data-kit="modal-demo-nested"] button')`, timeout: 5000 },
    {
      eval: `(() => {
        const trigger = document.querySelector('[data-kit="modal-demo-nested"] button');
        if (!trigger) return false;
        trigger.focus();
        trigger.click();
        return true;
      })()`
    },
    { waitFor: `!!document.querySelector("[data-kit=modal][data-modal-level='2']")`, timeout: 5000 },
    { wait: 200 },
    {
      eval: `(() => {
        const panel = document.querySelector('[data-kit=modal][data-modal-level="2"] [data-kit=modal-panel]');
        if (!panel) return false;
        const transform = getComputedStyle(panel).transform;
        const matrix = transform === 'none' ? null : new DOMMatrixReadOnly(transform);
        const panelRect = panel.getBoundingClientRect();
        window.__modalProbe.nested = {
          overlays: document.querySelectorAll('[data-kit=modal]').length,
          level2: true,
          radius: getComputedStyle(panel).borderTopLeftRadius,
          dx: matrix ? Math.round(matrix.m41) : 0,
          dy: matrix ? Math.round(matrix.m42) : 0,
          panelRect: { left: panelRect.left, right: panelRect.right, width: panelRect.width }
        };
        return true;
      })()`
    },
    { shot: {} },
    {
      eval: `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`
    },
    { wait: 300 },
    {
      eval: `(() => {
        window.__modalProbe.escape = {
          level2Gone: !document.querySelector('[data-kit=modal][data-modal-level="2"]'),
          level1Stays: !!document.querySelector('[data-kit=modal][data-modal-level="1"]')
        };
        return true;
      })()`
    },
    {
      eval: `(() => {
        const close = document.querySelector('[data-kit=modal][data-modal-level="1"] [data-kit=modal-close]');
        if (!close) return false;
        close.click();
        return true;
      })()`
    },
    { wait: 300 },
    {
      eval: `(() => {
        window.__modalProbe.closed = {
          modals: document.querySelectorAll('[data-kit=modal]').length,
          overflowAfter: document.body.style.overflow
        };
        return true;
      })()`
    },
    { shot: { out: 'scripts/e2e/shots/foundation.png' } }
  ],
  asserts: [
    {
      name: 'F1: body-ink',
      expr: 'getComputedStyle(document.body).backgroundColor === "rgb(0, 0, 0)"'
    },
    {
      name: 'F2: ribbon',
      expr: `(() => {
        const el = document.querySelector("[data-ribbon]");
        if (!el) return false;
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        // Подложка полупрозрачная: alpha ≤ 0.3, тон полосы, а не брусок.
        const alpha = bg.startsWith("rgba(")
          ? parseFloat(bg.slice(bg.lastIndexOf(",") + 1))
          : 1;
        const rect = el.getBoundingClientRect();
        return bg.startsWith("rgba(152, 120, 73")
          && alpha <= 0.3
          && cs.color === "rgb(166, 131, 84)"
          && cs.fontFamily.includes("Cinzel")
          && cs.textAlign === "center"
          && cs.fontSize === "14px"
          && rect.height <= 28
          && cs.clipPath.includes("polygon");
      })()`
    },
    {
      name: 'F3: block-unfilled',
      expr: `(() => {
        const blocks = Array.from(document.querySelectorAll("[data-kit=sheet-block]"));
        if (blocks.length < 2) return false;
        return blocks.every((block) => {
          const cs = getComputedStyle(block);
          return cs.backgroundColor === "rgba(0, 0, 0, 0)"
            && cs.borderStyle === "none";
        });
      })()`
    },
    {
      name: 'F4: field-label',
      expr: `(() => {
        const labels = Array.from(document.querySelectorAll("[data-kit=field-label]"));
        if (labels.length < 2) return false;
        return labels.every((el) => {
          const cs = getComputedStyle(el);
          return cs.color === "rgb(168, 160, 144)"
            && cs.fontSize === "12px"
            && cs.textTransform === "uppercase";
        });
      })()`
    },
    {
      name: 'F5: btn-primary',
      expr: `(() => {
        const el = document.querySelector("[data-btn=primary]");
        if (!el) return false;
        const cs = getComputedStyle(el);
        return cs.backgroundColor === "rgb(152, 120, 73)"
          && cs.color === "rgb(0, 0, 0)"
          && cs.borderTopLeftRadius === "0px";
      })()`
    },
    {
      name: 'F6: btn-secondary',
      expr: `(() => {
        const el = document.querySelector("[data-btn=secondary]");
        if (!el) return false;
        const cs = getComputedStyle(el);
        return cs.borderTopColor === "rgb(152, 120, 73)"
          && cs.borderTopLeftRadius === "0px";
      })()`
    },
    {
      name: 'F7: btn-disabled',
      expr: `(() => {
        const el = document.querySelector("[disabled]");
        if (!el) return false;
        const cs = getComputedStyle(el);
        return cs.backgroundColor === "rgb(26, 26, 26)"
          && cs.color === "rgb(168, 160, 144)";
      })()`
    },
    {
      name: 'F8: stress-box',
      expr: `(() => {
        const filled = Array.from(document.querySelectorAll("[data-stress-state=filled] [data-stress-box]"));
        const empty = Array.from(document.querySelectorAll("[data-stress-state=empty] [data-stress-box]"));
        if (filled.length < 1 || empty.length < 1) return false;
        const sizeOk = (el) => {
          const rect = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return Math.round(rect.width) === 28
            && Math.round(rect.height) === 28
            && cs.borderTopColor === "rgb(152, 120, 73)";
        };
        return filled.every((el) => sizeOk(el) && getComputedStyle(el).backgroundColor === "rgb(152, 120, 73)")
          && empty.every((el) => sizeOk(el) && getComputedStyle(el).backgroundColor === "rgb(0, 0, 0)");
      })()`
    },
    {
      name: 'F9: stat-table',
      expr: `(() => {
        const rows = Array.from(document.querySelectorAll("[data-kit=stat-row]"));
        return rows.length >= 2
          && rows.every((el) => getComputedStyle(el).borderBottomColor === "rgb(41, 35, 25)");
      })()`
    },
    {
      name: 'F10: bar',
      expr: `(() => {
        const track = document.querySelector("[data-kit=bar]");
        const fill = document.querySelector("[data-kit=bar-fill]");
        if (!track || !fill) return false;
        return getComputedStyle(track).borderTopColor === "rgb(119, 94, 57)"
          && getComputedStyle(fill).backgroundColor === "rgb(166, 131, 84)";
      })()`
    },
    {
      name: 'F11: input',
      expr: `(() => {
        const el = document.querySelector("[data-kit=input]");
        if (!el) return false;
        const cs = getComputedStyle(el);
        return cs.backgroundColor === "rgb(13, 13, 13)"
          && cs.borderTopColor === "rgb(41, 35, 25)";
      })()`
    },
    {
      name: 'F12: tabs',
      expr: `(() => {
        const active = document.querySelector("[data-kit=filter-tab][data-active=true]");
        const inactive = document.querySelector("[data-kit=filter-tab][data-active=false]");
        if (!active || !inactive) return false;
        return getComputedStyle(active).backgroundColor === "rgb(55, 36, 44)"
          && getComputedStyle(inactive).color === "rgb(168, 160, 144)";
      })()`
    },
    {
      name: 'F13: token-inventory',
      expr: `(() => {
        const expected = {
          "bg-ink-raised": "rgb(13, 13, 13)",
          "bg-ink-frame": "rgb(26, 26, 26)",
          "border-line": "rgb(41, 35, 25)",
          "bg-gold": "rgb(152, 120, 73)",
          "bg-gold-light": "rgb(166, 131, 84)",
          "border-gold-dim": "rgb(119, 94, 57)",
          "bg-wine": "rgb(55, 36, 44)",
          "text-text": "rgb(232, 232, 232)",
          "text-text-muted": "rgb(168, 160, 144)",
          "text-danger": "rgb(176, 73, 63)",
          "text-warn": "rgb(201, 162, 39)"
        };
        return Object.entries(expected).every(([cls, value]) => {
          const probe = document.createElement("div");
          probe.className = cls;
          document.body.appendChild(probe);
          const cs = getComputedStyle(probe);
          const actual = cls.startsWith("bg-")
            ? cs.backgroundColor
            : cls.startsWith("border-")
              ? cs.borderTopColor
              : cs.color;
          probe.remove();
          return actual === value;
        });
      })()`
    },
    {
      name: 'F14: font-min',
      expr: `(() => Array.from(document.querySelectorAll("*")).every((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const visible = rect.width > 0
          && rect.height > 0
          && cs.display !== "none"
          && cs.visibility !== "hidden"
          && cs.opacity !== "0";
        return !visible || parseFloat(cs.fontSize) >= 12;
      }))()`
    },
    {
      name: 'F15: no-scroll',
      expr: 'document.documentElement.scrollWidth <= window.innerWidth + 1'
    },
    {
      name: 'F16: modal-open',
      expr: `(() => {
        const probe = window.__modalProbe && window.__modalProbe.open;
        if (!probe) return false;
        return probe.level === '1'
          && probe.border === 'rgb(41, 35, 25)'
          && probe.background === 'rgb(20, 20, 20)'
          && probe.ribbon === true
          && probe.close === true;
      })()`
    },
    {
      name: 'F17: modal-nested',
      expr: `(() => {
        const probe = window.__modalProbe && window.__modalProbe.nested;
        if (!probe) return false;
        return probe.level2 === true
          && probe.overlays === 2
          && probe.dx === 24
          && probe.dy === 24;
      })()`
    },
    {
      name: 'F18: escape-top-only',
      expr: `(() => {
        const probe = window.__modalProbe && window.__modalProbe.escape;
        if (!probe) return false;
        return probe.level2Gone === true && probe.level1Stays === true;
      })()`
    },
    {
      name: 'F19: modal-closed',
      expr: `(() => {
        const probe = window.__modalProbe;
        if (!probe || !probe.open || !probe.closed) return false;
        return probe.open.bodyLocked === true
          && probe.closed.modals === 0
          && probe.closed.overflowAfter === probe.overflowBefore;
      })()`
    },
    {
      name: 'F20: modal-ribbon-width',
      expr: `(() => {
        const probe = window.__modalProbe && window.__modalProbe.open;
        if (!probe || !probe.ribbonRect) return false;
        return Math.abs(probe.ribbonRect.left - probe.panelRect.left) <= 1
          && Math.abs(probe.ribbonRect.width - probe.panelRect.width) <= 1;
      })()`
    },
    {
      name: 'F21: modal-sharp-fit',
      expr: `(() => {
        const open = window.__modalProbe && window.__modalProbe.open;
        const nested = window.__modalProbe && window.__modalProbe.nested;
        if (!open || !nested) return false;
        const fits = (rect) => rect.left >= 0 && rect.right <= window.innerWidth;
        return open.radius === '0px'
          && nested.radius === '0px'
          && fits(open.panelRect)
          && fits(nested.panelRect);
      })()`
    },
    {
      name: 'F22: ribbon-height',
      expr: `(() => {
        const ribbons = Array.from(document.querySelectorAll("[data-ribbon]"));
        return ribbons.length > 0
          && ribbons.every((el) => el.getBoundingClientRect().height <= 28);
      })()`
    },
    {
      name: 'F23: no-corners',
      expr: 'document.querySelectorAll("[data-corner]").length === 0 && document.querySelectorAll("[data-frame]").length === 0'
    },
    {
      name: 'F24: type-scale',
      expr: `(() => {
        const allowed = new Set(["12px", "14px", "16px", "18px", "20px", "24px", "30px"]);
        return Array.from(document.querySelectorAll("*")).every((el) => {
          const text = (el.textContent || "").trim();
          if (!text) return true;
          const cs = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          const visible = rect.width > 0
            && rect.height > 0
            && cs.display !== "none"
            && cs.visibility !== "hidden"
            && cs.opacity !== "0";
          return !visible || allowed.has(cs.fontSize);
        });
      })()`
    }
  ]
};
