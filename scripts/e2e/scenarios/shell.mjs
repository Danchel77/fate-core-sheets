/**
 * Строгая шапка и подвал приложения на фундаменте.
 *
 * Открывает обычный вид приложения (`/?mock=1`): шапка + каталог + подвал.
 * Проверяет чёрный фон, тонкую золотую линию, капитель Cinzel, острые углы,
 * отсутствие легаси `slate-*`, минимальный шрифт 12px, компактную высоту,
 * отсутствие горизонтального скролла на 390px и наличие кнопок действий.
 * Авторизация не нужна.
 */
export default {
  name: 'shell',
  url: '/?mock=1',
  regions: ['header', 'footer'],
  steps: [
    { waitFor: 'document.readyState === "complete"', timeout: 15000 },
    {
      waitFor: '!!document.querySelector("header") && !!document.querySelector("footer")',
      timeout: 15000
    },
    {
      waitFor: '!!document.querySelector("[data-kit=character-list]")',
      timeout: 15000
    },
    { wait: 600 },
    { shot: {} }
  ],
  asserts: [
    {
      name: 'H1: header-ink',
      expr: `(() => {
        const header = document.querySelector('header');
        if (!header) return false;
        const style = getComputedStyle(header);
        return (
          style.backgroundColor === 'rgb(0, 0, 0)' &&
          style.borderBottomColor === 'rgb(119, 94, 57)' &&
          style.position === 'sticky'
        );
      })()`
    },
    {
      name: 'H2: brand-cinzel',
      expr: `(() => {
        const brand = document.querySelector('header [data-brand]');
        if (!brand) return false;
        const style = getComputedStyle(brand);
        return style.fontFamily.includes('Cinzel') && style.color === 'rgb(166, 131, 84)';
      })()`
    },
    {
      name: 'H3: header-sharp',
      expr: `(() => {
        const header = document.querySelector('header');
        if (!header) return false;
        return [header, ...Array.from(header.querySelectorAll('*'))].every((el) => {
          const className = typeof el.className === 'string' ? el.className : '';
          if (!className.trim()) return true;
          return getComputedStyle(el).borderRadius === '0px';
        });
      })()`
    },
    {
      name: 'H4: header-no-slate',
      expr: `(() => {
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        if (!header || !footer) return false;
        const forbidden = ['rgb(100, 116, 139)', 'rgb(11, 14, 20)', 'rgb(28, 33, 43)'];
        return [header, footer].every((root) => {
          if (root.outerHTML.includes('slate-')) return false;
          return [root, ...Array.from(root.querySelectorAll('*'))].every((el) => {
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
        });
      })()`
    },
    {
      name: 'H5: header-font-min',
      expr: `(() => {
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        if (!header || !footer) return false;
        const tooSmall = [];
        for (const root of [header, footer]) {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let node = walker.nextNode();
          while (node) {
            const text = node.textContent ? node.textContent.trim() : '';
            if (text) {
              const el = node.parentElement;
              const style = getComputedStyle(el);
              const visible =
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                el.getClientRects().length > 0;
              if (visible && parseFloat(style.fontSize) < 12) {
                tooSmall.push(el.tagName + ':' + style.fontSize);
              }
            }
            node = walker.nextNode();
          }
        }
        return tooSmall.length === 0;
      })()`
    },
    {
      name: 'H6: footer-ink',
      expr: `(() => {
        const footer = document.querySelector('footer');
        if (!footer) return false;
        const style = getComputedStyle(footer);
        return (
          style.borderTopColor === 'rgb(41, 35, 25)' && style.color === 'rgb(168, 160, 144)'
        );
      })()`
    },
    {
      name: 'H7: header-compact',
      expr: `(() => {
        const header = document.querySelector('header');
        if (!header) return false;
        const height = header.getBoundingClientRect().height;
        const noHorizontalScroll =
          document.scrollingElement.scrollWidth <= window.innerWidth;
        return height <= 72 && noHorizontalScroll;
      })()`
    },
    {
      name: 'H8: header-actions',
      expr: `(() => {
        const header = document.querySelector('header');
        if (!header) return false;
        const actions = Array.from(header.querySelectorAll('button, a'));
        return (
          actions.filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height >= 24;
          }).length >= 2
        );
      })()`
    }
  ]
};
