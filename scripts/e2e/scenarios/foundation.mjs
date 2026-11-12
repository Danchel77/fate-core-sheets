// Проверка «фундамент на месте»: токены DESIGN.md §1 и вид общих компонентов.
// Сценарий намеренно не проверяет вёрстку экранов — только то, из чего она собрана.
// Провал означает, что токена нет в tailwind.config.js, класс не сгенерирован
// или компонент из src/components/common/ разошёлся с DESIGN.md.
export default {
  name: 'foundation',
  url: '/?mock=1&view=kit',
  steps: [
    { waitFor: 'document.readyState === "complete"', timeout: 10000 },
    { waitFor: '!!document.querySelector("[data-ribbon]")', timeout: 10000 },
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
        return cs.backgroundColor === "rgb(152, 120, 73)"
          && cs.color === "rgb(0, 0, 0)"
          && cs.fontFamily.includes("Cinzel")
          && cs.textAlign === "center"
          && parseFloat(cs.fontSize) >= 18
          && cs.clipPath.includes("polygon");
      })()`
    },
    {
      name: 'F3: frame-corners',
      expr: `(() => {
        const frames = Array.from(document.querySelectorAll("[data-frame]"));
        if (frames.length < 2) return false;
        return frames.every((frame) => {
          const corners = Array.from(frame.querySelectorAll("[data-corner]"));
          if (corners.length !== 4) return false;
          return corners.every((corner) => {
            const cs = getComputedStyle(corner);
            const sides = [
              [cs.borderTopWidth, cs.borderTopColor],
              [cs.borderRightWidth, cs.borderRightColor],
              [cs.borderBottomWidth, cs.borderBottomColor],
              [cs.borderLeftWidth, cs.borderLeftColor],
            ].filter(([width]) => parseFloat(width) > 0);
            return sides.length === 2 && sides.every(([, color]) => color === "rgb(119, 94, 57)");
          });
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
    }
  ]
};
