# Project Open Lectures

Открытый лекторий в нескольких городах — Ниш, Белград, Нови-Сад, Златибор.
Любой может предложить тему и выступить; вход на встречи бесплатный.

**Сайт:** https://openlectures.netlify.app/

Сайт собирается на [Astro](https://astro.build/) в статический HTML. Тексты лежат в
JSON, интерфейс — чистый CSS и немного ванильного JS. UI-фреймворков нет.

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # сборка в dist/
npm run preview    # локальный просмотр сборки
```

## Адреса

```
/ru/                                  # выбор города (RU — язык по умолчанию)
/ru/nis/                              # афиша города
/ru/nis/archive/                      # прошедшие лекции
/ru/nis/new-lecture/                  # предложить лекцию
/ru/nis/lectures/<slug>/              # страница лекции
/ru/about/                            # о проекте
/en/… и /sr/…                         # то же на английском и сербском (латиница)
```

`/` перенаправляется на `/ru/`. Старые адреса (`/archive.html`, `/about.html`,
`/newLectureRequest.html`, `/lectures/<slug>/`) перенаправляются на новые — см.
`netlify.toml`.

## Структура

```
src/
├── content/cities/<slug>.json           # города
├── content/lectures/<city>/<slug>.json  # лекции (ru/en/sr внутри)
├── content.config.ts                    # Zod-схемы коллекций
├── data/                                # тексты страниц
├── i18n/ui.json                         # навигация, футер, общие строки
├── layouts/BaseLayout.astro
├── components/                          # карточки и декор
├── pages/                               # маршруты
├── scripts/                             # звёзды, меню, диалог материалов
└── styles/                              # base.css + стили страниц
public/
└── lectures/<city>/<slug>/              # изображения, материалы, манифест файлов
```

Как добавить лекцию или город, где появляются ссылки, правила для картинок и текстов —
в [`AGENTS.md`](./AGENTS.md).
