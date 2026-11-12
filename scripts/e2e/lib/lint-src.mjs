/**
 * Строка внутристраничного скрипта автопроверок вёрстки.
 *
 * Выполняется в контексте браузера после сценария и утверждений.
 * Возвращает JSON-объект с 7 списками замечаний:
 *   - clippedText
 *   - smallFont
 *   - lowContrast
 *   - offscreen
 *   - overlap
 *   - horizontalScroll
 *   - hardcodedColors
 *
 * Все поля — строго массивы. Для успешного прогона все массивы должны быть пустыми.
 */
export const LINT_SRC = String.raw`
(() => {
  const result = {
    clippedText: [],
    smallFont: [],
    lowContrast: [],
    offscreen: [],
    overlap: [],
    horizontalScroll: [],
    hardcodedColors: [],
  };

  const isVisible = (el) => {
    if (!el || el.nodeType !== 1) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (cs.opacity === '0') return false;
    if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.clipPath === 'inset(50%)') return false;
    return true;
  };

  const describeEl = (el) => {
    if (!el) return 'unknown';
    const tag = el.tagName.toLowerCase();
    const id = el.id ? '#' + el.id : '';
    const cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return tag + id + cls + (text ? ' ("' + text + '")' : '');
  };

  const hasDirectText = (el) => {
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
        return true;
      }
    }
    return false;
  };

  // 1. horizontalScroll (массив)
  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    result.horizontalScroll.push(
      'scrollWidth (' + document.documentElement.scrollWidth + 'px) > innerWidth (' + window.innerWidth + 'px)'
    );
  }

  // Цветовые функции для lowContrast
  const parseRgb = (str) => {
    if (!str || typeof str !== 'string') return null;
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: m[4] !== undefined ? Number(m[4]) : 1,
    };
  };

  const luminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const contrastRatio = (rgb1, rgb2) => {
    const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    const brighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (brighter + 0.05) / (darker + 0.05);
  };

  const allElements = Array.from(document.querySelectorAll('*'));

  for (const el of allElements) {
    if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'HEAD', 'META', 'LINK'].includes(el.tagName)) continue;

    // 7. hardcodedColors: inline style с #xxxxxx или rgb(
    const styleAttr = el.getAttribute('style');
    if (styleAttr) {
      if (/#([0-9a-fA-F]{3,8})\b/.test(styleAttr) || /rgba?\(/.test(styleAttr)) {
        result.hardcodedColors.push(describeEl(el) + ' [style="' + styleAttr + '"]');
      }
    }

    if (!isVisible(el)) continue;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    // 2. clippedText: видимый текст с scrollWidth > clientWidth при text-overflow: ellipsis
    if (cs.textOverflow === 'ellipsis') {
      if (el.scrollWidth > el.clientWidth + 1) {
        result.clippedText.push(
          describeEl(el) + ' (scrollWidth: ' + el.scrollWidth + ' > clientWidth: ' + el.clientWidth + ')'
        );
      }
    }

    // 4. offscreen: элементы с getBoundingClientRect().right > innerWidth
    if (rect.right > window.innerWidth + 1) {
      result.offscreen.push(
        describeEl(el) + ' (right: ' + Math.round(rect.right) + ' > innerWidth: ' + window.innerWidth + ')'
      );
    }

    // Проверки текста для видимых элементов с прямым текстом
    if (hasDirectText(el)) {
      // 3. smallFont: видимый текст мельче 12px
      const fontSize = parseFloat(cs.fontSize);
      if (fontSize > 0 && fontSize < 11.99) {
        result.smallFont.push(describeEl(el) + ' (fontSize: ' + cs.fontSize + ')');
      }

      // 5. lowContrast: контраст ниже 4.5:1 против ближайшего предка с непрозрачным фоном
      const fg = parseRgb(cs.color);
      if (fg && fg.a > 0.1) {
        let bg = null;
        let cur = el;
        while (cur && cur !== document && cur !== document.documentElement) {
          const curCs = getComputedStyle(cur);
          const curBg = parseRgb(curCs.backgroundColor);
          if (curBg && curBg.a >= 0.95) {
            bg = curBg;
            break;
          }
          cur = cur.parentElement;
        }
        if (!bg) {
          bg = { r: 0, g: 0, b: 0, a: 1 }; // базовый фон ink (#000000)
        }
        const ratio = contrastRatio(fg, bg);
        if (ratio < 4.5) {
          result.lowContrast.push(
            describeEl(el) + ' (contrast ' + ratio.toFixed(2) + ':1 < 4.5:1, fg: ' + cs.color + ')'
          );
        }
      }
    }
  }

  // 6. overlap: пересечение больше 4px у соседних блоков-секций (прямые потомки колонок)
  const columns = Array.from(document.querySelectorAll('main, aside, form, [class*="grid-cols"], [class*="col-"]'));
  for (const col of columns) {
    const children = Array.from(col.children).filter(isVisible);
    for (let i = 0; i < children.length - 1; i++) {
      const r1 = children[i].getBoundingClientRect();
      const r2 = children[i + 1].getBoundingClientRect();
      if (r1.height <= 0 || r2.height <= 0) continue;
      const horizOverlap = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
      if (horizOverlap > 10) {
        const vertOverlap = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
        if (vertOverlap > 4) {
          result.overlap.push(
            describeEl(children[i]) + ' overlaps ' + describeEl(children[i + 1]) + ' by ' + Math.round(vertOverlap) + 'px'
          );
        }
      }
    }
  }

  return result;
})()
`;
