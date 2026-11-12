# E2E-сценарии мастера персонажа

Сценарии гоняют собранный `dist` в headless Chrome: проходят мастер, заполняют
поля, кликают кнопки и проверяют состояние через утверждения.

## Запуск

```bash
npm run build                       # сценарии работают по dist
node scripts/e2e/capture.mjs --scenario=foundation   # фундамент: токены и общие компоненты
node scripts/e2e/capture.mjs --scenario=review [--width=1440]
node scripts/e2e/verify.mjs --scenario=review
```

Коды выхода `capture.mjs`: `0` — успех, `1` — провал, `2` — таймаут, `3` — `dist` устарел.

## Результаты

- `scripts/e2e/reports/<сценарий>.json`: полный отчёт (png, sha256, консоль, failedAsserts, lint).
  В отчёте `asserts` — все утверждения с их `ok`, `failedAsserts` — только упавшие.
  `ok` в отчёте становится `false`, если упал хотя бы один ассерт, непуст `lint`
  или в консоли были ошибки.
- `scripts/e2e/shots/<сценарий>-<ширина>-<дата>.png`: снимок всего документа.
- Автопроверки (`lint`): clippedText, smallFont, lowContrast, offscreen, overlap, horizontalScroll, hardcodedColors.

## Процесс

`capture.mjs` проверяет свежесть `dist`, запускает `interactive-shot.cjs` для снимков и логов, а затем добавляет `lint`-проверки.
`verify.mjs` механически проверяет корректность отчёта, SHA-256 PNG, свежесть `distBuiltAt`, `git diff` и отсутствие запрещённых логов в `src/`.

Для проверки вёрстки используй `verify.mjs` после `capture.mjs`.

## Проверка фундамента

Сценарий `foundation` отвечает на вопрос «фундамент на месте?» до того, как
смотреть на экраны. Он открывает витрину `/?mock=1&view=kit` и проверяет
пятнадцать утверждений `F1`–`F15`:

- цвета `body`, ленты `[data-ribbon]`, углов `[data-corner]`, подписей
  `[data-kit=field-label]`, кнопок `[data-btn]`, клеток `[data-stress-box]`,
  строк `[data-kit=stat-row]`, полосы `[data-kit=bar]`, поля `[data-kit=input]`
  и вкладок `[data-kit=filter-tab]`;
- инвентарь токенов `DESIGN.md` §1 (`F13`): для каждого класса создаётся `div`,
  читается `getComputedStyle`, элемент удаляется. Если токена нет в
  `tailwind.config.js`, класс не сгенерирован и цвет будет `rgba(0, 0, 0, 0)`;
- минимальный шрифт `12px` (`F14`) и отсутствие горизонтального скролла (`F15`).

**Красный результат** означает одно из трёх:

1. токена нет в `tailwind.config.js` — добавь его по таблице `DESIGN.md` §1;
2. класс есть в конфиге, но нигде не используется, поэтому Tailwind его не
   сгенерировал — используй токен в компоненте или на витрине `UiKit.tsx`;
3. компонент из `src/components/common/` разошёлся с `DESIGN.md` §3 —
   поправь классы/`data-*` в его файле.

После правки: `npm run build`, затем снова
`node scripts/e2e/capture.mjs --scenario=foundation`. Смотреть снимок
`scripts/e2e/shots/foundation-*.png` и отчёт `scripts/e2e/reports/foundation.json`.

`verify.mjs` для любого сценария, кроме самого `foundation`, первым делом
читает `scripts/e2e/reports/foundation.json` и падает, если отчёта нет,
`ok !== true`, есть упавшие ассерты, непустой `lint` или сборка в отчёте
старше самого свежего файла в `src/`, `tailwind.config.js` или `index.html`.
Сценарий `foundation` гейт пропускает, поэтому рекурсии нет. Отчёт фундамента
не нужно перечислять в `--allowed`: `scripts/e2e/**` разрешён всегда.

## Новый сценарий

`scenarios/<имя>.mjs` экспортирует:

```js
export default {
  steps: [ { shot: { clip: null } }, { waitFor: '...' } ],
  asserts: [ { name: 'проверка', expr: '...' } ],
  regions: ['#selector1', '#selector2']
};
```

Используй `window.__t.visibleText()` для проверки текста.
