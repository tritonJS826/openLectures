# AGENTS.md — правила создания страниц лекций

Инструкции для агентов (и людей), которые добавляют новые лекции в **Нишский Лекторий /
Project Open Lectures**. Сайт — статический, без сборки и зависимостей: только чистые
HTML/CSS/JS. Соблюдайте структуру — от неё зависит загрузка текстов и ссылок.

## 1. Золотые правила

1. **Никаких фреймворков и сборки.** Только HTML/CSS/JS. Всё работает от `fetch` + DOM.
2. **Тексты — только в JSON, не в HTML.** Для каждой страницы свой JSON с `ru` / `en` / `sr`.
3. **Сербский — латиницей** (`srpski`, не `српски`). Язык по умолчанию — `ru`.
4. Каждый ключ обязан существовать во **всех трёх** языках.
5. Не редактируйте данные чужих страниц и не меняйте токены `css/base.css` без причины.

## 2. Где какие ссылки появляются

| Куда | Файл данных | Что показываем | Ссылки на элемент |
|---|---|---|---|
| **Будущие** лекции | `data/index.json` → `upcoming.items` | главная страница, блок «Предстоящие лекции» | **одна** — на страницу лекции |
| **Прошедшие** лекции | `data/archive.json` → `archive.items` | страница `archive.html` | **две** — страница лекции + материалы |

- Лекция **не может** быть одновременно в `upcoming` и `archive`.
- **Материалы** всегда ведут на папку лекции в GitHub:
  `https://github.com/tritonJS826/openLectures/tree/main/lectures/<slug>/`
- Ссылка на Telegram `https://t.me/NisLektorij` — в футере **каждой** страницы.
- Когда будущая лекция проходит: **удалить** её из `upcoming.items` (во всех языках),
  **добавить** в `archive.items`, сменить статус на «прошедшая», добавить материалы и recap.

## 3. Структура папки лекции

```
lectures/<YYYYMMDD-slug>/
├── index.html          # data-page="lecture" data-lecture="<slug>" data-json="data/lecture.json"
├── css/style.css       # копия из существующей лекции; акцент — через body[data-lecture="<slug>"]
├── js/main.js          # копировать как есть
├── data/lecture.json   # все три языка
└── images/             # только AVIF
```

Slug = дата + смысл, например `20261108-newspace`. Дата в slug — дата лекции.

## 4. Создание страницы лекции

1. Скопируйте `lectures/20261028-spiders` → `lectures/<slug>`.
2. Отредактируйте `data/lecture.json` для `ru` / `en` / `sr`.
   Обязательные ключи:
   - `meta.title`, `meta.description`
   - `a11y.skip`, `brand.sub`, `brand.name`, `nav.{schedule,archive,about,submit}`
   - `footer.{tagline,note,telegram}`
   - `lecture.{back,status,title,summary,whenLabel,when,placeLabel,place,speakerLabel,speaker,aboutLabel,about[],learnLabel,learn[]}`
   - для прошедших лекций ещё: `lecture.{materialsLabel,materialsText,materialsButton,materialsUrl,recapLabel,recapTitle,recap[]}`
3. `status`: `"Предстоящая лекция"` / `"Прошедшая лекция"` (и переводы).
4. `about`, `learn`, `recap` — **массивы** (рендерятся через `data-list`).
5. Обновите в `index.html`: `<title>`, `meta[name=description]`, `og:*` и `data-lecture` на `<body>`.

Акценты страницы задаются одним атрибутом: `<body data-lecture="newspace">` →
стили `body[data-lecture="newspace"] { … }` в `css/style.css`.

## 5. Изображения — только AVIF

- Формат — **AVIF** (компактнее JPEG/PNG, поддерживается всеми современными браузерами).
- Конвертация через **ffmpeg**:

  ```bash
  ffmpeg -y -i source.png -frames:v 1 -c:v libaom-av1 \
    -crf 30 -b:v 0 -cpu-used 6 -still-picture 1 -pix_fmt yuv420p out.avif
  ```

- Ориентиры: hero — не больше ~1600 px по длинной стороне и желательно < 300 КБ.
- Имена описательные: `images/spider.avif`; ссылка в HTML — `src="images/spider.avif"`.
- **alt-текст обязателен и локализован**:
  `<img src="images/spider.avif" data-i18n-attr="alt:lecture.imageAlt">`
  и ключ `lecture.imageAlt` в каждом языке.
- Не храните `jpg/png` в `images/` — только итоговые `.avif`.

## 6. Регистрация лекции в списках (это и есть «где появляются ссылки»)

Будущая — в `data/index.json` (`upcoming.items`, во всех языках):

```json
{
  "day": "08", "mon": "ноя",
  "badge": "Предстоящая лекция",
  "title": "…", "speaker": "…",
  "dateText": "8 ноября 2026", "time": "19:00",
  "place": "кафе «Звуки сердца», Niš",
  "url": "lectures/20261108-newspace/"
}
```

Прошедшая — в `data/archive.json` (`archive.items`, во всех языках), плюс две ссылки:

```json
{
  "day": "28", "mon": "окт", "badge": "Открытие лектория",
  "title": "…", "speaker": "…",
  "dateText": "28 октября 2026", "time": "19:00",
  "place": "кафе «Звуки сердца», Niš",
  "url": "lectures/20261028-spiders/",
  "materialUrl": "https://github.com/tritonJS826/openLectures/tree/main/lectures/20261028-spiders",
  "materialLabel": "Материалы"
}
```

`day`/`mon` локализуйте: `ноя` / `NOV` / `nov`; `окт` / `OCT` / `okt`.

## 7. Механика текстов (i18n)

Общие файлы `js/app.js` и `js/stars.js` — не переписывать. Разметка использует:

- `data-i18n="ключ.путь"` — подставить текст;
- `data-i18n-attr="href:ключ.путь"` / `"alt:…"` — подставить атрибут;
- `data-list="ключ"` + `data-list-type` — отрисовать массив:
  `upcoming` | `archive` | `point` | `learn` | `text`.

Общие ключи (`brand`, `nav`, `footer`, `a11y`) должны совпадать на всех страницах.

## 8. Качество и проверка

- Сохраняйте: skip-link, фокусные стили, локализованный `alt`, `prefers-reduced-motion`.
- Проверка локально: `python3 -m http.server 5173` → http://localhost:5173
  (открывать как `file://` нельзя — браузер блокирует `fetch` JSON).
- Проверьте: все три языка, список будущих, архив и **обе** ссылки в архиве.
