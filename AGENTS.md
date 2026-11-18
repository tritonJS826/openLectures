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
- Ссылка на Telegram `https://t.me/NisLrktor` — в футере **каждой** страницы.
- Когда будущая лекция проходит: **удалить** её из `upcoming.items` (во всех языках),
  **добавить** в `archive.items`, сменить статус на «прошедшая», добавить материалы и recap.

## 3. Структура папки лекции

```
lectures/<YYYYMMDD-slug>/
├── index.html          # data-page="lecture" data-lecture="<slug>" data-json="data/lecture.json"
├── css/style.css       # копия из существующей лекции; акцент — через body[data-lecture="<slug>"]
├── js/main.js          # копировать как есть
├── data/lecture.json   # все три языка
├── data/materials.json # список файлов для окна «Материалы» (генерируется)
├── images/             # только AVIF
└── materials/          # файлы лекции: слайды, PDF, архивы (необязательно)
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
   - для прошедших лекций ещё: `lecture.{materialsLabel,materialsText,materialsButton,materialsUrl,recapLabel,recapTitle,recap[]}`,
    блок `materials.*` (см. §6.1) и `data-materials="<slug>"` на кнопке «Смотреть материалы»
   - если есть фото с лекции: `lecture.{galleryLabel,galleryAlt}` и блок
     `<div class="gallery">` с `<figure class="gallery__item"><img src="images/…avif" …></figure>`
3. `status`: `"Предстоящая лекция"` / `"Прошедшая лекция"` (и переводы).
4. `about`, `learn`, `recap` — **массивы** (рендерятся через `data-list`).
5. Обновите в `index.html`: `<title>`, `meta[name=description]`, `og:*` и `data-lecture` на `<body>`.
6. **Добавьте страницу в `sitemap.xml`** — иначе Google о ней не узнает:
   ```xml
   <url>
     <loc>https://openlectures.netlify.app/lectures/&lt;slug&gt;/</loc>
     <changefreq>monthly</changefreq>
     <priority>0.7</priority>
   </url>
   ```
   Адрес — со **слэшем на конце** и на `https://openlectures.netlify.app` (не на GitHub Pages).

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
  "url": "lectures/20261108-newspace/",
  "thumb": "lectures/20261108-newspace/images/cover.avif"
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
  "thumb": "lectures/20261028-spiders/images/spider.avif",
  "materialUrl": "https://github.com/tritonJS826/openLectures/tree/main/lectures/20261028-spiders",
  "materialLabel": "Материалы"
}
```

`thumb` — уменьшенная обложка для карточки списка (путь от корня сайта, обычно
`lectures/<slug>/images/cover.avif`). Если её нет, карточка покажет заглушку.
На телефоне дата и обложка выстраиваются в одну узкую колонку друг под другом,
чтобы заголовок не сжимался.

`day`/`mon` локализуйте: `ноя` / `NOV` / `nov`; `окт` / `OCT` / `okt`.

**Не забудьте про SEO:** на **главной странице** (`index.html`) в `<head>` должен остаться
`<meta name="google-site-verification" content="pf5xCPJNGuaX6KXcMd13fm-gsItBwLHK9rma9XsoFcU" />`
— только там его проверяет Google Search Console (на остальных страницах он не нужен).
Адрес новой лекции добавьте в `sitemap.xml` (`https://openlectures.netlify.app/lectures/<slug>/`).
`robots.txt` разрешает обход и указывает на `sitemap.xml`.

## 6.1. Окно «Материалы»

Клик по «Материалам» (в архиве — боковая полоса карточки, на странице лекции — кнопка
в блоке «Материалы») открывает `<dialog>` со списком файлов лекции и кнопкой «Открыть
папку на GitHub». Клик по файлу **скачивает его прямо с сайта** (атрибут `download`);
на GitHub ведёт только кнопка внизу окна. Код — в `js/app.js` (`initMaterials`),
стили — в `css/base.css`. Без JS и в старых браузерах ссылки ведут прямо на GitHub,
как раньше.

Список берётся из `lectures/<slug>/data/materials.json`, который собирается по
папкам `images/` и `materials/`:

```bash
node scripts/build-materials.mjs
```

Скрипт идемпотентный, без зависимостей. Прогоняйте его после добавления или
удаления файлов в `images/` / `materials/` и коммитьте обновлённый
`data/materials.json`. Новых URL он не создаёт — `sitemap.xml` не меняется.

Тексты окна — блок `materials.*` в `data/archive.json` и в `data/lecture.json`
прошедших лекций (`title`, `note`, `folderCta`, `groupImages`, `groupFiles`,
`loading`, `empty`, `error`, `close`, `b`, `kb`, `mb`) — во всех трёх языках.
Превью файлов в окне — те же картинки из `images/`.

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
- **SEO:** все HTML-страницы проекта должны быть перечислены в `sitemap.xml` ровно одним
  адресом (`https://openlectures.netlify.app/…`) — ни одной лишней и ни одной забытой.
  **Исключение — `404.html`: её в sitemap не добавляем.**
  Быстрая сверка:
  ```bash
  find . -name '*.html' -not -path './.git/*' | sort
  grep -o '<loc>[^<]*</loc>' sitemap.xml
  ```
- `<meta name="google-site-verification">` живёт только в корневом `index.html`; при
  копировании папки лекции в неё он не попадает — так и должно быть.
- **Один адрес на страницу.** Каждая страница живёт по одному адресу: `/`,
  `/archive.html`, `/lectures/<slug>/` — без `/index.html` на конце. `netlify.toml`
  отдаёт 301 с `/index.html` → `/` и с `/:section/:slug/index.html` → `/:section/:slug/`.
  Ссылки на главную поэтому пишем как `./` (из корня) и `../../` (из папки лекции),
  а не `index.html` / `../../index.html` — иначе каждая ссылка идёт через лишний 301.
- **Deploy previews и branch deploys не индексируются.** Сборки на
  `*--openlectures.netlify.app` запускают `scripts/preview-headers.sh`, который кладёт
  в корень `_headers` с `X-Robots-Tag: noindex, nofollow` (в `netlify.toml` хедеры по
  deploy context не настраиваются). Файл `_headers` добавлен в `.gitignore` — **не
  коммитьте его**, иначе `noindex` уедет на продакшен. Продакшен собирается без команды
  сборки, скрипт на него не влияет.

## 9. Страница 404

`404.html` в корне — её Netlify показывает автоматически на любой несуществующий адрес,
отдавая при этом статус **404** (поэтому её не нужно закрывать `noindex` и не нужно
добавлять в `sitemap.xml`).

Главное правило: **все пути внутри `404.html` — абсолютные.**

```html
<link rel="stylesheet" href="/css/base.css">   <!-- а не css/base.css -->
<body data-json="/data/404.json">              <!-- а не data/404.json -->
<a href="https://openlectures.netlify.app/#upcoming">Афиша</a>
```

Почему: файл отдаётся по тому адресу, который запросил пользователь (`/a/b/c/`), а не
по `/404.html`. Относительные ссылки в такой ситуации ломаются, абсолютные — работают.

Тексты страницы лежат в `data/404.json` (`ru` / `en` / `sr`), стили — в `css/404.css`.
Ведёт страница двумя кнопками: афиша (`/#upcoming`) и архив (`/archive.html`).
