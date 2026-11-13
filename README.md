# Fate Core — листы персонажей

Веб-сервис для создания, хранения и печати листов персонажей по системе **Fate Core**: пошаговый конструктор, веб-версия листа и печатный бланк формата A4 (альбомная ориентация).

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

## Структура

```
src/            приложение
src/styles/     tokens.css, global.css
src/domain/     правила Fate Core в коде
src/storage/    хранение персонажей
public/assets/  текстуры, рамки, иконки + CREDITS.md
```

Сайт: https://danchel77.github.io/fate-core-sheets/
