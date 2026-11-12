# E2E-сценарии мастера персонажа

Сценарии гоняют собранный `dist` в headless Chrome: проходят мастер, заполняют
поля, кликают кнопки и проверяют состояние через утверждения.

## Запуск

```bash
npm run build                       # сценарии работают по dist
node scripts/e2e/capture.mjs --scenario=review [--width=1440]
node scripts/e2e/verify.mjs --scenario=review
```

Коды выхода `capture.mjs`: `0` — успех, `1` — провал, `2` — таймаут, `3` — `dist` устарел.

## Результаты

- `scripts/e2e/reports/<сценарий>.json`: полный отчёт (png, sha256, консоль, failedAsserts, lint).
- `scripts/e2e/shots/<сценарий>-<ширина>-<дата>.png`: снимок всего документа.
- Автопроверки (`lint`): clippedText, smallFont, lowContrast, offscreen, overlap, horizontalScroll, hardcodedColors.

## Процесс

`capture.mjs` проверяет свежесть `dist`, запускает `interactive-shot.cjs` для снимков и логов, а затем добавляет `lint`-проверки.
`verify.mjs` механически проверяет корректность отчёта, SHA-256 PNG, свежесть `distBuiltAt`, `git diff` и отсутствие запрещённых логов в `src/`.

Для проверки вёрстки используй `verify.mjs` после `capture.mjs`.

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
