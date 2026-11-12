# AGENTS.md — правила для любой роли

Роль задаётся заданием. Не названа — ничего не меняй, работай на чтение и спроси.

* «исполнитель» → прочитай `docs/agents/executor.md`, `docs/agents/product.md`, `docs/design/DESIGN.md`.
* «оркестратор» → прочитай `docs/agents/orchestrator.md`, `docs/agents/product.md`, `docs/design/DESIGN.md`.

## Стек и команды

React 19 + Vite 6 + TypeScript strict + Tailwind 3.4, иконки lucide-react. Шрифты: Cinzel (`font-fantasy`), Inter (`font-sans`).

| Команда | Что делает |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | сборка в `dist`, нужна перед любым снимком |
| `node scripts/e2e/capture.mjs --scenario=<имя> [--width=1440 --height=1100]` | снимок всего документа + отчёт (формат — `scripts/e2e/README.md`) |
| `node scripts/e2e/verify.mjs --scenario=<имя> --allowed=<файлы через запятую>` | механическая проверка отчёта и диффа |
| `scripts/screenshot.cjs` | **устарел**, не использовать: снимки только через `capture.mjs` |
| `npm run dev` / `npm run preview` | только для ручной проверки; не оставляй запущенными |

## Жёсткие правила

* Менять файлы можно только из списка в задании. Нет списка — только чтение.
* Секреты — только через `import.meta.env`, никогда в коде и отчётах.
* Git-коммиты и пуш — только по прямой просьбе человека.
* Заглушки запрещены: код или отчёт, которые делают вид, что работают, — провал задания.
* Временные скрипты — в `scripts/`, отчёты — `scripts/e2e/reports/`, снимки — `scripts/e2e/shots/`.

## Принятие работы

Проверяет не тот, кто писал. Оркестратор сам перезапускает сборку и снимок и смотрит **свой** PNG. Исполнитель тоже осматривает снимок по шаблону из `executor.md`, но принимается только то, что снял и осмотрел оркестратор. Подробности — в `docs/agents/orchestrator.md`.

## Структура

* `src/components/dashboard/` — каталог персонажей
* `src/components/sheet/` — лист персонажа
* `src/components/creator/` — мастер создания (`steps/`, подшаги в своих папках)
* `src/components/common/` — общие элементы (SectionRibbon, CornerFrame и т.д., см. DESIGN.md)
* `src/services/` — Firebase, Gemini, картинки, PDF
* `src/context/` — AuthContext, CharacterContext
* `src/types/`, `src/config/` — типы, пресеты
* `scripts/e2e/` — сценарии, `capture.mjs`, `verify.mjs`

## Ссылки

* Видение: `PROJECT_VISION.md`
* Продуктовые правила Fate: `docs/agents/product.md`
* Дизайн и референс: `docs/design/DESIGN.md`, `docs/design/reference.png`
* Правила системы: `fate_core_rules.md`
