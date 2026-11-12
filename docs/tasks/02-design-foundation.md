# Задача 02: дизайн-основа (токены, компоненты, страница-эталон)

Разовая задача. Выполняется после задачи 01. Перед отправкой исполнителю оркестратор через `grep`/`glob` находит и подставляет в «ФАЙЛЫ» реальные пути: конфиг Tailwind, файл, где читается параметр `view` из адреса (`?view=sheet`), корневой `index.css`. Если пути не найдены, остановись и сообщи человеку.

```
РОЛЬ: исполнитель. Прочитай docs/agents/executor.md, docs/agents/product.md, docs/design/DESIGN.md.
ЗАДАЧА: Внедрить дизайн-систему из DESIGN.md. 1) Добавить токены цветов в tailwind.config (раздел 1, блок «Конфиг»). 2) Создать компоненты по рецептам из раздела 3, каждый в своём файле: SectionRibbon, CornerFrame, FieldLabel, StatTable, StressBox, Bar, Button (primary / secondary / disabled), Tabs, Input. 3) Создать страницу-эталон UiKit, где каждый компонент показан в нескольких состояниях, и открывать её по адресу ?mock=1&view=kit. 4) Фон страницы (`body`) сделать `bg-ink text-text`. Существующие экраны не переделывать.
ФАЙЛЫ (можно менять только эти):
  <конфиг tailwind>, <файл, где читается ?view=>, <корневой index.css, если нужно для фона body>,
  src/components/common/SectionRibbon.tsx, CornerFrame.tsx, FieldLabel.tsx, StatTable.tsx, StressBox.tsx, Bar.tsx, Button.tsx, Tabs.tsx, Input.tsx, UiKit.tsx,
  scripts/e2e/scenarios/ui-kit.mjs
ЭКРАН: сценарий ui-kit, ширина 1440 и 390, --regions="[data-kit=ribbons],[data-kit=buttons],[data-kit=stress]"
УТВЕРЖДЕНИЯ (реализуй в сценарии как есть, не убирай):
  A1 getComputedStyle(document.body).backgroundColor == "rgb(0, 0, 0)"
  A2 count("[data-ribbon]") >= 3, у каждой backgroundColor == "rgb(152, 120, 73)"
  A3 у каждой [data-ribbon] fontFamily содержит "Cinzel"
  A4 count("[data-corner]") == 4 * count("[data-frame]"), count("[data-frame]") >= 2
  A5 у первой кнопки [data-btn="primary"] backgroundColor == "rgb(152, 120, 73)"
  A6 у disabled-кнопки backgroundColor == "rgb(26, 26, 26)"
  A7 count("[data-stress-box]") >= 8 и среди них есть отмеченные (backgroundColor "rgb(152, 120, 73)") и пустые ("rgb(0, 0, 0)")
  A8 на 390px: нет горизонтального скролла
ДИЗАЙН: цвета только из токенов, скругления нет (rounded-none), рецепты классов из DESIGN.md, раздел 3 — дословно. Если рецепт ленты (clip-path) на 1440px выглядит неверно (края не заострены) — исправь значение и напиши в отчёте, что именно изменил.
ГОТОВО КОГДА: npm run typecheck && npm run build && node scripts/e2e/capture.mjs --scenario=ui-kit && node scripts/e2e/verify.mjs --scenario=ui-kit --allowed=<список выше>
```

После приёмки оркестратор сравнивает снимок `UiKit` с `docs/design/reference.png` по чек-листу из DESIGN.md (раздел 6). Принятая страница — эталон: дальше каждая задача на экран строится из этих компонентов.
