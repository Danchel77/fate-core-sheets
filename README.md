# Fate Core — листы персонажей

Веб-сервис для создания, хранения и печати листов персонажей по системе **Fate Core**: пошаговый конструктор, веб-версия листа и печатный бланк формата A4 (альбомная ориентация).

Сайт: https://danchel77.github.io/fate-core-sheets/

## Документы проекта

| Файл | Что внутри |
|---|---|
| `project.md` | Продукт, стек, план, журнал решений |
| `design.md` | Визуальный стиль, ассеты, токены |
| `fate_core_rules.md` | Правила Fate Core, пресеты сеттингов |
| `AGENTS.md` | Протокол работы и определение готовности |

## Стек

- React 19 + TypeScript + Vite 6
- Чистый CSS с дизайн-токенами (`src/styles/tokens.css`)
- Хранение: IndexedDB (позже — Firebase для облака)
- Публикация: GitHub Pages через GitHub Actions

## Команды

```bash
npm install      # установить зависимости
npm run dev      # локальная разработка
npm run build    # проверка типов + сборка
npm run preview  # посмотреть собранную версию
```

Сборка — только через `npm`; в репозитории нет Bun-локов.

## Маршруты

| Адрес | Что открывается |
|---|---|
| `/` | собранный веб-лист — единственный источник правды (демо-персонаж) |
| `#stunts` | отдельная страница блока «Трюки» в масштабе 1:1 |
| `#print` | скелет печатного листа A4 |

## Структура

```
src/                  приложение
src/components/       блоки листа: CharacterBlock, AspectBlock, SkillsEditor,
                      StuntBlock, StressBlock, ExtrasBlock, Hint, PortraitPlate,
                      BlockHeader
src/screens/          SheetScreen — собранный веб-лист
src/preview/          рабочие страницы блоков (StuntsVariants, Wireframe)
src/data/             demoCharacter.ts — демо-герой
src/styles/           tokens.css — единственный источник цветов и шрифтов
public/assets/        textures/ frames/ portraits/ + CREDITS.md
```

`references/` — мудборд (в git не входит), `.scratch/` — временные скрипты и скриншоты.
