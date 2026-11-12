# Задача 01: доработать e2e-обвязку и добавить `verify.mjs`

Разовая задача. Передай исполнителю целиком в шапке из `orchestrator.md`. `verify.mjs` пока нет, поэтому её шаги в «ГОТОВО КОГДА» заменяются критериями из раздела «Готово когда» ниже. После выполнения формат отчёта живёт в `scripts/e2e/README.md`.

Файлы, которые можно менять: `scripts/e2e/capture.mjs`, `scripts/e2e/lib/helpers.mjs`, `scripts/e2e/lib/lint-src.mjs` (новый), `scripts/e2e/verify.mjs` (новый), `scripts/e2e/scenarios/*.mjs`, `scripts/e2e/README.md`, `scripts/interactive-shot.cjs`, `scripts/screenshot.cjs` (только комментарий об устаревании, см. «Прочее»), `.gitignore`.

## Что сейчас не так (по коду)

1. **Снимок — только видимая часть окна.** `Page.captureScreenshot` в `interactive-shot.cjs` вызывается без `captureBeyondViewport`, пока не задан `clip`. Страница длиннее окна (1100px) → в PNG попадает верх страницы или то место, куда сценарий прокрутил. Нижние секции листа на снимке просто отсутствуют.
2. **Фиксированный путь снимка.** Сценарии пишут в `shots/<имя>.png`, отчёт на файл не ссылается. Упал шаг `shot` или файл не создался — остаётся старый PNG.
3. **Нет проверки свежести `dist`.**
4. **Старый `screenshot.cjs` жив.** Он пишет в `scripts/preview-<view>.png`, ждёт по `--virtual-time-budget`, а при отсутствии файла в `dist` отдаёт `index.html` (404 на ассеты скрываются). Если кто-то из агентов снимает им, это и есть «снимок чужого состояния».
5. `process.exit(1)` в `waitFor` внутри `interactive-shot.cjs` обходит `finally`: Chrome и сервер остаются запущенными, в корне остаётся `.cdp-profile-<pid>`.
6. Консольные ошибки страницы нигде не собираются.
7. Отчёт содержит только первое проваленное утверждение. Утверждения через `document.body.textContent` проходят на скрытом тексте.
8. Нет автопроверок вёрстки.

## `interactive-shot.cjs`

1. Шаг `shot` принимает `full: true` (по умолчанию для шагов без `clip` считать `true`): взять `Page.getLayoutMetrics`, размер контента (`cssContentSize`), снять `clip {x:0,y:0,width,height,scale:1}` с `captureBeyondViewport: true`. Высоту ограничь 6000px.
2. Шаг `shot` принимает `regions`: массив CSS-селекторов. Для каждого найди элемент, возьми `getBoundingClientRect()` с учётом прокрутки (`+scrollX/scrollY`), снимай `clip` и сохраняй как `<out без .png>-r<N>.png`. Не нашёл селектор — выведи `[cdp] region-missing: <селектор>`.
3. Слушай `Runtime.exceptionThrown`, `Runtime.consoleAPICalled` (тип `error`) и `Log.entryAdded` (уровень `error`). В конце прогона печатай одной строкой `[cdp] console-errors: <N>` и до пяти первых текстов.
4. Замени `process.exit(1)` внутри цикла шагов на `throw`, чтобы выполнялся `finally` (убрать Chrome, сервер, профиль). Код выхода процесса при этом по-прежнему ненулевой.
5. Не меняй формат остальных строк вывода: `capture.mjs` разбирает `[cdp] eval:`.

## `capture.mjs`

1. **Свежесть.** До запуска сравни mtime `dist/index.html` с самым новым файлом в `src/`, `index.html`, `tailwind.config.*`, `vite.config.*`. `dist` старее → «dist устарел, запусти npm run build», выход с кодом **3** (код 2 занят таймаутом).
2. **Уникальный снимок.** Путь `scripts/e2e/shots/<сценарий>-<ширина>-<ГГГГММДД-ЧЧММСС>.png`. Подмени `out` у **каждого** шага `shot` (сценарии путь больше не прописывают: убери из существующих) и передай в `--out`. После прогона проверь: файл есть, mtime ≥ `startedAt`, иначе `ok:false`, причина `no-screenshot`. Храни не больше 20 снимков на сценарий, старые удаляй вместе с `-r<N>`-кропами.
3. **Параметр `--regions="<sel1>,<sel2>"`** (по умолчанию из сценария, поле `regions`): передаётся в `shot.regions`. Пути кропов — в отчёт.
4. **Отчёт** (`reports/<сценарий>.json`) дополни: `png`, `regionPngs`, `sha256`, `viewport`, `capturedAt`, `distBuiltAt`, `consoleErrors`, `failedAsserts` (**все**, а не первое), `lint`.
5. **Автопроверки.** После утверждений добавь шаг `eval` из `lib/lint-src.mjs`; `ok` требует, чтобы все списки были пусты и `consoleErrors == 0`:
   * `clippedText` — видимый текст с `scrollWidth > clientWidth` при `text-overflow: ellipsis`;
   * `smallFont` — видимый текст мельче 12px;
   * `lowContrast` — контраст ниже 4.5:1 (computed color против ближайшего предка с непрозрачным фоном);
   * `offscreen` — элементы с `getBoundingClientRect().right > innerWidth`;
   * `overlap` — пересечение больше 4px у соседних блоков-секций (прямые потомки колонок);
   * `horizontalScroll` — `documentElement.scrollWidth > innerWidth + 1`;
   * `hardcodedColors` — inline `style` с `#xxxxxx` или `rgb(`.
   Каждая запись — селектор или фрагмент текста.
6. Шаг `shot` выполняется даже при ошибке драйвера (как сейчас), но тогда `ok:false`, причина `driver-error`.

## `lib/helpers.mjs`

Добавь в `window.__t`: `visibleText()` (текст только видимых элементов: ненулевой `getBoundingClientRect`, не `display:none`, не `visibility:hidden`) и `isVisible(el)`. Во всех сценариях замени `document.body.textContent.includes(...)` на проверку по `visibleText()`. Если после замены утверждение упало, это настоящая находка. Сообщи отдельным пунктом отчёта, а не «чини» утверждение молча.

## `verify.mjs`

`node scripts/e2e/verify.mjs --scenario=<имя> --allowed=<файл1,файл2>` печатает `PASS` или `FAIL` и пронумерованные причины. Проверяет:

1. Отчёт есть, `ok: true`, утверждений ≥ 1, `lint` пуст.
2. PNG из `png` существует, SHA-256 совпадает с отчётом, mtime позже `distBuiltAt`.
3. `distBuiltAt` не старее самого нового файла в `src/`.
4. `git diff --name-only` и неотслеживаемые файлы ⊆ `--allowed` ∪ `scripts/e2e/**`.
5. В изменённых файлах `src/` нет `TODO`, `FIXME`, `console.log`.

## Прочее

* `screenshot.cjs`: добавь в начало файла комментарий `УСТАРЕЛ: используй scripts/e2e/capture.mjs` и `console.error` с тем же текстом при запуске; логику не менять.
* `.gitignore`: добавь `.cdp-profile-*`.
* `scripts/e2e/README.md`: обнови под новые флаги и отчёт.

## Готово когда

* `capture.mjs` и `verify.mjs` проходят на `review`, `wizard-skills`, `create-flow`, `mobile-shell`.
* Для любого сценария на 1440px PNG включает **весь** документ (приложи высоту PNG и `document.documentElement.scrollHeight`, они должны совпасть, до лимита 6000).
* `touch src/main.tsx` → код 3.
* Временный `truncate` на узком блоке → запись в `lint.clippedText`.
* После прогона нет процессов `chrome-headless-shell` и каталогов `.cdp-profile-*` (приложи вывод `pgrep` и `ls`).
* Сырой вывод всех прогонов в отчёте.
