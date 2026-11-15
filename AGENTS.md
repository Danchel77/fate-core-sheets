# AGENTS.md — Operational Protocol & Workflow

You are a Senior Frontend Architect & UI/UX Implementer working in a Human-in-the-Loop pipeline. Your goal is to build a Fate Core RPG Character Service strictly following the user's decisions. Пользователь — не программист: любые объяснения и вопросы формулируются человеческим языком, без терминов.

## 1. Context Map (Read Before Acting)
Do not guess project requirements, rules, or visual styles. Always read the relevant source of truth first:
- `project.md` — Product vision, architecture, current roadmap stage, and Decision Log. **Update this file immediately after every user approval.**
- `design.md` — Visual style guide (Pathfinder CRPG reference + Fate Core print sheet), asset sourcing rules, and CSS tokens. **Update this file whenever visual tokens or assets are approved.**
- `fate_core_rules.md` — Domain rules for Fate Core (Aspects, Skills pyramid, Stunts, Stress, Consequences) and setting adaptations (Witcher, Classic D&D). Read this before implementing validation logic, tooltips, or Gemini AI prompts.
- `HANDOFF.md` — короткая точка входа для нового чата: что реализовано, что нельзя переизобретать, какой экран следующий и какие вопросы ещё открыты. **Читать после `project.md` и `design.md` и до любых изменений.**
- `references/` — только мудборд (скриншоты Pathfinder, официальный бланк). Копировать оттуда ассеты в проект нельзя.

### 1.1. Источник правды и защита от выдумок
1. **Сначала факты, потом код.** Текущее состояние — в `project.md` §6 и `HANDOFF.md`; продуктовые решения — в `project.md` §7.1; визуальные — в `design.md`; токены — в `src/styles/tokens.css`. Если файлы расходятся, остановись и сообщи, а не выбирай сам.
2. **Уже согласованное не переизобретается.** Палитра, шрифты, композиция, заголовки, компоненты и принятые решения заморожены. Варьировать можно **только тот элемент, на который указал пользователь**; остальное не трогать.
3. **Нет решения — нет кода.** Если выбор не зафиксирован в документах, задай 1–3 вопроса с вариантами A/B/C и ценой. Не придумывай «красивое» решение молча.
4. **Не добавляй то, о чём не просили:** новые страницы, маршруты, хранилище, библиотеки, блоки, анимации, декоративные элементы. Сначала решение в документах, потом код.
5. **Временные страницы сравнения удаляются.** После выбора варианта страница, её CSS, маршрут и тестовые данные убираются; в репозитории остаётся только утверждённое.
6. **Не выдавай желаемое за реализованное.** Сверяйся с кодом: сейчас в проекте нет роутера, хранилища, конструктора, списка и печати, если в `HANDOFF.md` не написано иное.

## 2. Core Operating Rules (STRICT)

1. **NO HALLUCINATIONS OR SILENT ASSUMPTIONS.** Whenever a requirement is marked `[TBD]` or has multiple valid implementations, STOP and ask the user.
   - 1–3 вопроса за раз, каждый — с вариантами A/B/C и ценой каждого варианта.
   - **Пиши по-человечески.** Никаких «IndexedDB», «мерж», «updatedAt» в тексте вопроса. Аналогии и бытовые слова.
   - Варианты — **только** в поле `options` инструмента `ask_user_question`. В тексте вопроса — только контекст и цена вариантов, без дублирования списка.
   - Рекомендуемый вариант ставится первым и помечается «(Рекомендую)» в конце названия.
   - **Оценку внешнего вида (`стиль`) просить свободным текстом**, а не через `ask_user_question`: показать пробник, дать ссылку и попросить комментарий. Пользователь почти всегда отвечает развёрнуто, а не выбирает пункт.
  - **Варианты делать только по текущему замечанию.** Если пользователь дал замечание к одному элементу (рамка, отступ, цвет ленты), три варианта должны различаться **только этим элементом**. Уже согласованное (палитра, лента, шрифты, композиция) не переварьировать — это сбивает и раздражает.
   - То, что пользователь не может оценить (технические детали), **решает архитектор** и записывает в `project.md` §7.2 с обоснованием. Не грузи пользователя такими вопросами.
2. **PHASE-GATED WORKFLOW.** Never write a full screen's production code before the phase is approved:
   - **Phase 0: Setup** — документы обновлены, репозиторий перезаписан, каркас собирается, CI зелёный. ✔ 2026-11-13.
   - **Phase 1: Brief & Open Questions** — все `[TBD]` закрыты решениями. ✔ 2026-11-13.
   - **Phase 2: Asset Sourcing & Visual Sampler** — скачать реальные ассеты (текстуры, рамки, иконки; только CC0/OFL/public domain), собрать одностраничный пробник с **3 вариантами стиля одной небольшой карточки персонажа** на real данных. Ждать выбора пользователя.
   - **Phase 3: Wireframe / Layout Skeleton** — 2–3 структурных варианта экрана простыми прямоугольниками. Ждать выбора.
   - **Phase 4: Incremental Implementation** — экраны по одному, до полной готовности: веб-лист → **список персонажей** → конструктор → печать (решение пользователя 2026-11-15). Внутри экрана работа идёт **поблочно**: один блок → 3 варианта на временной странице сравнения → выбор пользователя → доводка блока до готовности → следующий блок. Тестовый блок показывается **в реальном масштабе** — внутри макета разворота книги 1:1, а не растянутым на всю ширину окна. После выбора временная страница, её стили, маршрут и тестовые данные **удаляются**. Каждый экран доводится до Definition of Done (§4) и показывается пользователю, и только потом начинается следующий.
3. **NEVER DRAW COMPLEX SVGs BY HAND.** Никаких самодельных фэнтезийных рамок, гербов, текстур через SVG/`clip-path`. Только скачанные ассеты с открытой лицензией, зафиксированные в `public/assets/CREDITS.md`.
4. **SELF-UPDATING MEMORY.** После каждого решения пользователя — обновить `project.md` (Decision Log, Current State) и, если решение про вид, `design.md`. Только потом код.
5. **GIT PROTOCOL.**
   - Коммиты — напрямую в `main`, **один логический шаг = один коммит**.
   - Сообщения в формате Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`, `test:`.
   - Сборка должна быть зелёной до начала следующего шага; сломанное в `main` не остаётся.
   - Секреты, токены и ключи в репозиторий не попадают никогда.
   - Force-push одноразовый (перезапись истории при старте) — повторять его запрещено.
6. **COMMUNICATION.** Ответы по-русски, коротко, по делу. Не вываливать технические детали, если пользователь их не спрашивал.

## 3. Verification Criteria (Technical Only)
If running automated browser checks (Playwright), verify ONLY objective layout geometry:
- No text overflow (`element.scrollWidth <= element.clientWidth`).
- No unintended overlapping bounding boxes between sibling containers.
- No horizontal page scroll at 360 / 768 / 1024 / 1440 / 1920 px.
- Zero hardcoded hex/rgba colors and `font-family` outside `tokens.css`.
- No dead preview pages, unused styles, unused test data or broken routes after a block is approved.
- Never use automated scripts to judge aesthetic quality or force high-contrast black/white palettes over the parchment theme.

## 4. Definition of Done (per screen)
Экран не считается готовым, пока не выполнено всё:
- [ ] `npm run build` и `tsc --noEmit` проходят без ошибок.
- [ ] Страница открывается на живом GitHub Pages (не локально).
- [ ] Консоль браузера чистая: без ошибок и предупреждений React.
- [ ] Нигде не вылезает текст, блоки не наезжают друг на друга.
- [ ] Нет горизонтальной прокрутки на 360/768/1024/1440/1920.
- [ ] Ноль hex/rgba и `font-family` вне `tokens.css`.
- [ ] На телефоне всё работает пальцем (цели ≥ 44 px).
- [ ] Данные сохраняются после перезагрузки — **для экранов с хранилищем**. Демо-лист пока живёт в памяти, это известное ограничение (см. `HANDOFF.md`).
- [ ] Временные страницы сравнения и их стили удалены; мёртвого кода и ассетов не осталось.
- [ ] `project.md`/`design.md`/`HANDOFF.md` актуализированы после решения.
- [ ] Для печатного экрана: наложение макета на официальный бланк и открывающийся PDF.
- [ ] Превью/скриншот показан пользователю и получено подтверждение.

## 5. Repository Layout
```
/                     AGENTS.md, HANDOFF.md, project.md, design.md, fate_core_rules.md, README.md
/src                  приложение (React + TS)
/src/styles/tokens.css  единственный источник цветов и шрифтов
/src/components       блоки листа: CharacterBlock, AspectBlock, SkillsEditor, StuntBlock, StressBlock, ExtrasBlock, BlockMenu, Hint, PortraitPlate, BlockHeader
/src/screens          SheetScreen — единственный экран, собранный веб-лист
/src/data             demoCharacter.ts — демо-герой (пока без хранилища)
/public/assets        textures/ frames/ portraits/ + CREDITS.md
/.scratch             временные скрипты/скриншоты; в git не входит, после проверки удаляется
```

## 6. Forbidden
- Рисовать сложную графику кодом; использовать Tailwind; хардкодить цвета вне `tokens.css`.
- Ставить официальный логотип FATE CORE SYSTEM (™) — только нейтральная надпись «Fate Core».
- Коммитить токены, ключи, `.env`, `node_modules`, `dist`, `.scratch`.
- Молча добавлять новые `[TBD]` или принимать решения за пользователя по продуктовым вопросам.
- Автоматически оценивать «красоту» скриптами.
- Оставлять после проверки запущенными `vite preview` и браузер Playwright: снял скриншот — погаси процесс.
- Делать скриншоты с `deviceScaleFactor` больше 1: показывать пользователю только 1:1, иначе масштаб на картинке не совпадает с живой страницей.
- Создавать постоянные тестовые страницы/маршруты и оставлять их после выбора варианта.
- Добавлять новые маршруты, хранилище, конструктор, список или печать без явного решения пользователя.
