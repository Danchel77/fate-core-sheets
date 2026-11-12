export default {
  name: 'sheet',
  url: '/?mock=1&view=sheet',
  regions: ['[data-kit="character-identity"]', '[data-zone="center"]', '[data-zone="right"]'],
  steps: [
    { waitFor: 'document.readyState === "complete"', timeout: 15000 },
    {
      waitFor: 'document.querySelectorAll("[data-kit=sheet-block]").length >= 6',
      timeout: 15000
    },
    { wait: 500 },
    {
      // Исходные данные мока и геометрия до крайних состояний: всё, что ниже,
      // временно портит персонажа и обязано вернуть его как было.
      eval: `(() => {
        localStorage.setItem('e2e_pool_backup', localStorage.getItem('fate_characters_pool') || '');
        const list = document.querySelector('[data-kit="sheet-stunt-list"]');
        const block = list.closest('[data-kit="sheet-block"]');
        const identity = document.querySelector('[data-kit="character-identity"]');
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        const name = document.querySelector('[data-kit="character-name"]');
        const desc = document.querySelector('[data-kit="character-description"]');
        const pr = portrait.getBoundingClientRect();
        window.__noAvatarBefore = {
          w: pr.width,
          h: pr.height,
          identityH: identity.getBoundingClientRect().height
        };
        window.__stuntsScroll = {
          rowsBefore: document.querySelectorAll('[data-kit="sheet-stunt"]').length,
          listHBefore: Math.round(list.getBoundingClientRect().height),
          blockHBefore: Math.round(block.getBoundingClientRect().height),
          pageBefore: document.documentElement.scrollHeight,
          maxH: parseFloat(getComputedStyle(list).maxHeight)
        };
        window.__longName = {
          nameBefore: name.value,
          descBefore: desc.value,
          identityHBefore: identity.getBoundingClientRect().height
        };
        const levels = document.querySelectorAll('[data-kit="skill-level"]').length;
        const right = document.querySelector('[data-zone="right"]').getBoundingClientRect();
        localStorage.setItem('e2e_skillcap', JSON.stringify({
          capBefore: null,
          rowsBefore: levels,
          rightWBefore: right.width
        }));
        return JSON.stringify({
          stunts: window.__stuntsScroll,
          name: window.__longName.nameBefore,
          levels,
          rightW: right.width
        });
      })()`
    },
    {
      eval: `(() => {
        document.querySelector('[data-kit="stunt-add"]').click();
        return true;
      })()`
    },
    { wait: 250 },
    {
      eval: `(() => {
        document.querySelector('[data-kit="stunt-add"]').click();
        return true;
      })()`
    },
    { wait: 250 },
    { waitFor: 'document.querySelectorAll("[data-kit=sheet-stunt]").length === 5', timeout: 5000 },
    {
      // Пять трюков: список ограничен max-h и скроллится внутри блока.
      eval: `(() => {
        const list = document.querySelector('[data-kit="sheet-stunt-list"]');
        const block = list.closest('[data-kit="sheet-block"]');
        Object.assign(window.__stuntsScroll, {
          rows5: document.querySelectorAll('[data-kit="sheet-stunt"]').length,
          listH: Math.round(list.getBoundingClientRect().height),
          scrollH: list.scrollHeight,
          clientH: list.clientHeight,
          blockH5: Math.round(block.getBoundingClientRect().height),
          page5: document.documentElement.scrollHeight
        });
        return JSON.stringify(window.__stuntsScroll);
      })()`
    },
    {
      eval: `(() => {
        const rows = document.querySelectorAll('[data-kit="sheet-stunt"]');
        const last = rows[rows.length - 1];
        const remove = last.querySelector('button[aria-label="Удалить пустой трюк"]');
        if (!remove) return false;
        remove.click();
        return true;
      })()`
    },
    { wait: 250 },
    {
      eval: `(() => {
        const rows = document.querySelectorAll('[data-kit="sheet-stunt"]');
        const last = rows[rows.length - 1];
        const remove = last.querySelector('button[aria-label="Удалить пустой трюк"]');
        if (!remove) return false;
        remove.click();
        return true;
      })()`
    },
    { wait: 250 },
    { waitFor: 'document.querySelectorAll("[data-kit=sheet-stunt]").length === 3', timeout: 5000 },
    {
      eval: `(() => {
        const list = document.querySelector('[data-kit="sheet-stunt-list"]');
        const block = list.closest('[data-kit="sheet-block"]');
        Object.assign(window.__stuntsScroll, {
          rowsAfter: document.querySelectorAll('[data-kit="sheet-stunt"]').length,
          blockHAfter: Math.round(block.getBoundingClientRect().height),
          pageAfter: document.documentElement.scrollHeight
        });
        localStorage.setItem('e2e_stunts', JSON.stringify(window.__stuntsScroll));
        return JSON.stringify(window.__stuntsScroll);
      })()`
    },
    {
      // Длинные имя и описание: имя остаётся одной строкой, описание — три.
      eval: `(() => {
        const name = document.querySelector('[data-kit="character-name"]');
        const desc = document.querySelector('[data-kit="character-description"]');
        const setValue = (el, value) => {
          const proto = el instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        setValue(name, 'Геральт из Ривии, Белый Волк, Гроза Чудовищ Севера, Мастер Меча');
        setValue(desc, 'Длинное описание персонажа. '.repeat(16));
        return true;
      })()`
    },
    { wait: 250 },
    {
      eval: `(() => {
        const name = document.querySelector('[data-kit="character-name"]');
        const desc = document.querySelector('[data-kit="character-description"]');
        const identity = document.querySelector('[data-kit="character-identity"]');
        const descStyle = getComputedStyle(desc);
        Object.assign(window.__longName, {
          docScrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          identityHAfter: identity.getBoundingClientRect().height,
          nameH: name.getBoundingClientRect().height,
          titleFull: name.getAttribute('title') === name.value,
          descH: desc.getBoundingClientRect().height,
          descScrollH: desc.scrollHeight,
          descClientH: desc.clientHeight,
          descLineH: parseFloat(descStyle.lineHeight)
        });
        localStorage.setItem('e2e_longname', JSON.stringify(window.__longName));
        return JSON.stringify(window.__longName);
      })()`
    },
    {
      eval: `(() => {
        const name = document.querySelector('[data-kit="character-name"]');
        const desc = document.querySelector('[data-kit="character-description"]');
        const setValue = (el, value) => {
          const proto = el instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        setValue(name, window.__longName.nameBefore);
        setValue(desc, window.__longName.descBefore);
        return true;
      })()`
    },
    { wait: 250 },
    {
      eval: `(() => {
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        if (!portrait) return false;
        portrait.click();
        return true;
      })()`
    },
    { waitFor: `!!document.querySelector('[data-kit=modal][data-modal-level="1"]')`, timeout: 5000 },
    { wait: 200 },
    {
      eval: `(() => {
        const remove = Array.from(document.querySelectorAll('[data-kit="modal"] button')).find(
          (button) => button.textContent.trim() === 'Удалить портрет'
        );
        if (!remove) return false;
        remove.click();
        return true;
      })()`
    },
    { wait: 300 },
    { waitFor: `!document.querySelector('[data-kit=modal][data-modal-level="1"]')`, timeout: 5000 },
    {
      // Без портрета рамка на месте: те же ширина/высота, иконка и подпись.
      eval: `(() => {
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        const identity = document.querySelector('[data-kit="character-identity"]');
        const rect = portrait.getBoundingClientRect();
        const facts = {
          hasImg: !!portrait.querySelector('img'),
          hasLabel: (portrait.textContent || '').includes('Портрет'),
          w: rect.width,
          h: rect.height,
          identityH: identity.getBoundingClientRect().height,
          wBefore: window.__noAvatarBefore.w,
          hBefore: window.__noAvatarBefore.h,
          identityHBefore: window.__noAvatarBefore.identityH
        };
        localStorage.setItem('e2e_noavatar', JSON.stringify(facts));
        return JSON.stringify(facts);
      })()`
    },
    {
      // skillCap: 6 в моке + перезагрузка без mock=1, чтобы приложение
      // подняло персонажа из localStorage с новым потолком.
      eval: `(() => {
        const pool = JSON.parse(localStorage.getItem('fate_characters_pool') || '[]');
        if (!pool.length) return false;
        const facts = JSON.parse(localStorage.getItem('e2e_skillcap') || '{}');
        facts.capBefore = pool[0].skillCap;
        localStorage.setItem('e2e_skillcap', JSON.stringify(facts));
        pool[0].skillCap = 6;
        localStorage.setItem('fate_characters_pool', JSON.stringify(pool));
        location.href = '/?view=sheet';
        return true;
      })()`
    },
    { wait: 900 },
    {
      waitFor: 'document.querySelectorAll("[data-kit=sheet-block]").length >= 6',
      timeout: 15000
    },
    { waitFor: 'document.querySelectorAll("[data-kit=skill-level]").length === 6', timeout: 5000 },
    {
      eval: `(() => {
        const facts = JSON.parse(localStorage.getItem('e2e_skillcap') || '{}');
        const right = document.querySelector('[data-zone="right"]');
        const left = document.querySelector('[data-zone="left"]');
        facts.rowsAfter = document.querySelectorAll('[data-kit="skill-level"]').length;
        facts.rightWAfter = right.getBoundingClientRect().width;
        facts.leftXAfter = Math.round(left.getBoundingClientRect().x);
        facts.pageAfter = document.documentElement.scrollHeight;
        localStorage.setItem('e2e_skillcap', JSON.stringify(facts));
        return JSON.stringify(facts);
      })()`
    },
    {
      // Вернуть мок и штатную страницу листа для остальных проверок.
      eval: `(() => {
        localStorage.setItem('fate_characters_pool', localStorage.getItem('e2e_pool_backup') || '');
        location.href = '/?mock=1&view=sheet';
        return true;
      })()`
    },
    { wait: 900 },
    {
      waitFor: 'document.querySelectorAll("[data-kit=sheet-block]").length >= 6',
      timeout: 15000
    },
    { waitFor: 'document.querySelectorAll("[data-kit=sheet-stunt]").length === 3', timeout: 5000 },
    {
      eval: `(() => {
        const name = document.querySelector('[data-kit="character-name"]');
        const portrait = document.querySelector('[data-kit="sheet-portrait"]');
        return JSON.stringify({
          name: name ? name.value : null,
          avatar: !!(portrait && portrait.querySelector('img')),
          stunts: document.querySelectorAll('[data-kit="sheet-stunt"]').length,
          levels: document.querySelectorAll('[data-kit="skill-level"]').length
        });
      })()`
    },
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
      // Одна ячейка навыка освобождается: на снимке видна и занятая, и пустая.
      eval: `(() => {
        const cells = Array.from(
          document.querySelectorAll('[data-kit="skill-cell"][data-slot="filled"]')
        );
        if (!cells.length) return false;
        const remove = cells[cells.length - 1].querySelector('button');
        if (!remove) return false;
        remove.click();
        return true;
      })()`
    },
    { wait: 250 },
    {
      waitFor: 'document.querySelectorAll("[data-kit=skill-cell][data-slot=empty]").length >= 1',
      timeout: 5000
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
      // Крестик удаления не занимает ширину у имени: он появляется по hover и
      // по focus внутри ячейки. На тач-экране ячейка фокусируется касанием.
      eval: `(() => {
        const cell = document.querySelector('[data-kit="skill-cell"][data-slot="filled"]');
        if (!cell) throw new Error('нет заполненной ячейки');
        cell.focus({ preventScroll: true });
        return document.activeElement === cell;
      })()`
    },
    { wait: 300 },
    {
      eval: `(() => {
        const cells = Array.from(document.querySelectorAll('[data-kit="skill-cell"][data-slot="filled"]'));
        const cell = cells[0];
        const remove = cell.querySelector('button');
        const name = cell.querySelector('span');
        const rect = remove.getBoundingClientRect();
        window.__skillRemove = {
          focused: document.activeElement === cell,
          opacity: parseFloat(getComputedStyle(remove).opacity),
          hitW: Math.round(rect.width),
          hitH: Math.round(rect.height),
          clippedNames: Array.from(
            document.querySelectorAll('[data-kit="skill-cell"] span')
          )
            .filter((span) => span.scrollWidth > span.clientWidth + 1)
            .map((span) => (span.textContent || '').trim())
        };
        return JSON.stringify(window.__skillRemove);
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
    { wait: 300 },
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
      // Три колонки строго одинаковой ширины: ровно три зоны, разброс ≤8px.
      name: 'S3: three-equal',
      expr: `(() => {
        const zones = Array.from(document.querySelectorAll('[data-zone]'));
        if (zones.length !== 3) return false;
        const names = zones.map((zone) => zone.getAttribute('data-zone')).sort().join(',');
        if (names !== 'center,left,right') return false;
        const widths = zones.map((zone) => zone.getBoundingClientRect().width);
        return Math.max(...widths) - Math.min(...widths) <= 8;
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
      // Рамка только у портрета: img 240×300 в рамке 1px; у блока имени и
      // описания ни рамки, ни заливки.
      name: 'S6: portrait-frame',
      expr: `(() => {
        const frame = document.querySelector('[data-kit="portrait-frame"]');
        const identity = document.querySelector('[data-kit="character-identity"]');
        if (!frame || !identity) return false;
        const img = frame.querySelector('img');
        if (!img) return false;
        const rect = img.getBoundingClientRect();
        const frameStyle = getComputedStyle(frame);
        const identityStyle = getComputedStyle(identity);
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        const noBorder = sides.every(
          (side) => parseFloat(identityStyle['border' + side + 'Width']) === 0
        );
        return (
          rect.width >= 234 && rect.width <= 246 &&
          rect.height >= 294 && rect.height <= 306 &&
          frameStyle.borderTopWidth === '1px' &&
          frameStyle.borderTopColor === 'rgb(152, 120, 73)' &&
          noBorder &&
          identityStyle.backgroundColor === 'rgba(0, 0, 0, 0)'
        );
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
      // Четыре ступени пирамиды: 1, 2, 3 и 4 ячейки сверху вниз.
      name: 'S16: skill-rows',
      expr: `(() => {
        const rows = Array.from(document.querySelectorAll('[data-kit="skill-level"]'));
        if (rows.length !== 4) return false;
        const counts = rows.map(
          (row) => row.querySelectorAll('[data-kit="skill-cell"]').length
        );
        return counts.join(',') === '1,2,3,4';
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
      // Крестик живёт поверх ячейки: по focus-внутри он виден, хит ≥16px,
      // и ни одно имя навыка не обрезано.
      name: 'S35: skill-remove-focus',
      expr: `(() => {
        const facts = window.__skillRemove;
        return (
          !!facts &&
          facts.focused === true &&
          facts.opacity >= 0.99 &&
          facts.hitW >= 16 &&
          facts.hitH >= 16 &&
          facts.clippedNames.length === 0
        );
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
        const sheet = document.querySelector('#printable-character-sheet');
        if (!sheet) return false;
        return (
          sheet.querySelectorAll('select').length === 0 &&
          !!document.querySelector('[data-zone="center"] [data-kit="setting-button"]')
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
      name: 'S45: term-restore',
      expr: `(() => {
        const left = document.querySelector('[data-zone="left"]');
        if (!left) return false;
        const text = left.textContent || '';
        return text.includes('Восстановление') && !text.includes('Обновление') && !/освежение/i.test(text);
      })()`
    },
    {
      name: 'S46: stunts-scroll',
      expr: `(() => {
        let facts = null;
        try {
          facts = JSON.parse(localStorage.getItem('e2e_stunts') || 'null');
        } catch (error) {
          return false;
        }
        if (!facts) return false;
        return (
          Number.isFinite(facts.maxH) &&
          facts.rows5 === 5 &&
          facts.rowsAfter === 3 &&
          facts.listH <= facts.maxH + 1 &&
          facts.scrollH > facts.clientH
        );
      })()`
    },
    {
      // имя одной строкой, описание — ровно три, блок не вырос,
      // документ не получил горизонтального скролла.
      name: 'S47: long-name',
      expr: `(() => {
        let facts = null;
        try {
          facts = JSON.parse(localStorage.getItem('e2e_longname') || 'null');
        } catch (error) {
          return false;
        }
        if (!facts) return false;
        const descriptionThreeLines =
          facts.descH <= facts.descLineH * 3 + 1 &&
          facts.descScrollH > facts.descClientH;
        return (
          facts.docScrollW <= facts.innerW &&
          Math.abs(facts.identityHAfter - facts.identityHBefore) <= 2 &&
          facts.nameH <= 40 &&
          facts.titleFull === true &&
          descriptionThreeLines
        );
      })()`
    },
    {
      name: 'S48: no-avatar',
      expr: `(() => {
        let facts = null;
        try {
          facts = JSON.parse(localStorage.getItem('e2e_noavatar') || 'null');
        } catch (error) {
          return false;
        }
        if (!facts) return false;
        return (
          facts.hasImg === false &&
          facts.hasLabel === true &&
          Math.abs(facts.w - facts.wBefore) <= 2 &&
          Math.abs(facts.h - facts.hBefore) <= 2 &&
          Math.abs(facts.identityH - facts.identityHBefore) <= 2
        );
      })()`
    },
    {
      name: 'S49: skill-cap',
      expr: `(() => {
        let facts = null;
        try {
          facts = JSON.parse(localStorage.getItem('e2e_skillcap') || 'null');
        } catch (error) {
          return false;
        }
        if (!facts) return false;
        return (
          facts.capBefore === 4 &&
          facts.rowsBefore === 4 &&
          facts.rowsAfter === 6 &&
          Math.abs(facts.rightWAfter - facts.rightWBefore) <= 1
        );
      })()`
    },
    {
      // Имя стоит над портретом: низ имени выше верха рамки.
      name: 'S50: name-above-portrait',
      expr: `(() => {
        const name = document.querySelector('[data-kit="character-name"]');
        const frame = document.querySelector('[data-kit="portrait-frame"]');
        if (!name || !frame) return false;
        const nameRect = name.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        return nameRect.bottom <= frameRect.top + 0.5;
      })()`
    },
    {
      // Имя по левому краю: не по центру и совпадает с левым краем рамки.
      name: 'S51: name-left',
      expr: `(() => {
        const name = document.querySelector('[data-kit="character-name"]');
        const frame = document.querySelector('[data-kit="portrait-frame"]');
        if (!name || !frame) return false;
        const style = getComputedStyle(name);
        const nameRect = name.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        return (
          style.textAlign !== 'center' &&
          Math.abs(nameRect.left - frameRect.left) <= 2
        );
      })()`
    },
    {
      // Ячейки навыков фиксированного размера; пустая — пунктиром без текста.
      name: 'S52: skill-cells',
      expr: `(() => {
        const cells = Array.from(document.querySelectorAll('[data-kit="skill-cell"]'));
        if (cells.length < 10) return false;
        const sized = cells.every((cell) => {
          const rect = cell.getBoundingClientRect();
          return (
            rect.width >= 88 && rect.width <= 96 &&
            rect.height >= 24 && rect.height <= 32
          );
        });
        if (!sized) return false;
        const empty = cells.filter((cell) => cell.getAttribute('data-slot') === 'empty');
        return (
          empty.length >= 1 &&
          empty.every((cell) => {
            const style = getComputedStyle(cell);
            return (
              style.borderTopStyle === 'dashed' &&
              (cell.textContent || '').trim().length === 0
            );
          })
        );
      })()`
    },
    {
      // Крупный знак системы в правом верхнем углу блока «Навыки»:
      // правый верх, высота ≥64 и ни одного пересечения с ячейками.
      name: 'S53: skills-logo',
      expr: `(() => {
        const button = document.querySelector('[data-kit="setting-button"]');
        if (!button) return false;
        const block = button.closest('[data-kit="sheet-block"]');
        if (!block) return false;
        const ribbon = block.querySelector('[data-ribbon]');
        if (!ribbon || ribbon.textContent.trim() !== 'Навыки') return false;
        const b = button.getBoundingClientRect();
        const blockRect = block.getBoundingClientRect();
        const cells = Array.from(document.querySelectorAll('[data-kit="skill-cell"]'));
        const intersects = cells.some((cell) => {
          const c = cell.getBoundingClientRect();
          return !(
            c.right <= b.left ||
            c.left >= b.right ||
            c.bottom <= b.top ||
            c.top >= b.bottom
          );
        });
        return (
          b.height >= 64 &&
          b.left > blockRect.left + blockRect.width / 2 &&
          b.top < blockRect.top + blockRect.height / 2 &&
          !intersects
        );
      })()`
    },
    {
      // Две заметки, каждая 160–200px высотой.
      name: 'S54: notes-two',
      expr: `(() => {
        const notes = Array.from(document.querySelectorAll('[data-kit="sheet-notes"]'));
        if (notes.length !== 2) return false;
        return notes.every((note) => {
          const height = note.getBoundingClientRect().height;
          return height >= 160 && height <= 200;
        });
      })()`
    },
    {
      // Ни один блок не растянут на всю ширину листа (на десктопе ≤40%).
      name: 'S55: no-wide-blocks',
      expr: `(() => {
        if (window.innerWidth < 1024) return true;
        const sheet = document.querySelector('#printable-character-sheet');
        const blocks = Array.from(document.querySelectorAll('[data-kit="sheet-block"]'));
        if (!sheet || blocks.length < 6) return false;
        const width = sheet.getBoundingClientRect().width;
        return blocks.every((block) => block.getBoundingClientRect().width <= width * 0.4);
      })()`
    },
    {
      // В левой зоне нет текста сеттинга и подписи-вордмарка.
      name: 'S56: no-setting-text',
      expr: `(() => {
        const left = document.querySelector('[data-zone="left"]');
        if (!left) return false;
        const text = left.textContent || '';
        return (
          !text.includes('Ведьмак') &&
          !text.includes('Тёмное фэнтези') &&
          left.querySelectorAll('[data-kit="setting-wordmark"]').length === 0
        );
      })()`
    }
  ]
};
