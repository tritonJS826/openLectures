# Project Open Lectures

Открытый лекторий в нескольких городах: Ниш, Белград, Нови-Сад, Златибор.
Любой может предложить тему и выступить — вход на встречи бесплатный.

**Сайт:** https://openlectures.netlify.app/

Сайт собирается на [Astro](https://astro.build/) (статический вывод), тексты хранятся
в JSON. Никаких UI-фреймворков: только Astro-шаблоны, CSS и немного ванильного JS.

## Команды

```bash
npm install        # один раз
npm run dev        # локальная разработка → http://localhost:4321
npm run build      # сборка в dist/ (перед этим собирает data/materials.json)
npm run preview    # посмотреть собранный сайт
npm run materials  # только пересобрать списки файлов для окна «Материалы»
```

Открывать `dist/index.html` через `file://` нельзя — используйте `npm run dev`
или `npm run preview`.

## Структура

```
.
├── astro.config.mjs          # site, i18n (ru/en/sr, префикс у всех), sitemap, redirect /
├── netlify.toml              # сборка, старые URL → новые, заголовки, deploy previews
├── src/
│   ├── content.config.ts     # схемы коллекций cities и lectures (Zod)
│   ├── content/
│   │   ├── cities/<slug>.json
│   │   └── lectures/<city>/<YYYYMMDD-slug>.json
│   ├── data/                 # тексты страниц: home, about, archive, form, error404
│   ├── i18n/ui.json          # общие строки: nav, footer, города, материалы
│   ├── layouts/BaseLayout.astro
│   ├── components/           # LectureCard, CityCard, Orbit
│   ├── pages/                # маршруты (см. ниже)
│   ├── scripts/              # stars.js, ui.js, about.js
│   └── styles/               # base.css + стили страниц
├── public/
│   ├── robots.txt
│   └── lectures/<city>/<slug>/
│       ├── images/           # только AVIF (+ mp4 для видео)
│       ├── materials/        # слайды, PDF, архивы (необязательно)
│       └── data/materials.json   # генерируется скриптом
└── scripts/
    ├── build-materials.mjs
    └── preview-headers.sh
```

## Маршруты

Язык всегда первый сегмент пути; язык по умолчанию — русский, но префикс есть у всех.

| Страница | Адрес | Файл |
|---|---|---|
| Главная (выбор города) | `/{lang}/` | `src/pages/[lang]/index.astro` |
| Город | `/{lang}/{city}/` | `src/pages/[lang]/[city]/index.astro` |
| Архив города | `/{lang}/{city}/archive/` | `src/pages/[lang]/[city]/archive.astro` |
| Предложить лекцию | `/{lang}/{city}/new-lecture/` | `src/pages/[lang]/[city]/new-lecture.astro` |
| Лекция | `/{lang}/{city}/lectures/<slug>/` | `src/pages/[lang]/[city]/lectures/[slug].astro` |
| О проекте | `/{lang}/about/` | `src/pages/[lang]/about.astro` |
| 404 | `/404.html` | `src/pages/404.astro` |

Города: `nis` (по умолчанию, здесь все прошедшие лекции), `beograd`, `novi-sad`,
`zlatibor`. Страницы создаются автоматически из `src/content/cities/*.json`.

`/` → 301 `/ru/` (правило в `netlify.toml`, плюс meta-refresh заглушка из
`astro.config.mjs`). Старые адреса тоже перенаправляются:

- `/archive.html` → `/ru/nis/archive/`
- `/about.html` → `/ru/about/`
- `/newLectureRequest.html` → `/ru/nis/new-lecture/`
- `/lectures/<slug>/` → `/ru/nis/lectures/<slug>/`

## Как добавить лекцию

1. Создайте папку `public/lectures/<city>/<YYYYMMDD-slug>/` и положите туда
   `images/cover.avif` (и другие AVIF/MP4, если есть). Материалы — в `materials/`.
2. Скопируйте любой файл из `src/content/lectures/nis/` в
   `src/content/lectures/<city>/<YYYYMMDD-slug>.json` и заполните:
   - `slug`, `city`, `type` (`lecture` или `gathering`), `status`
     (`upcoming` или `past`), `date` (`YYYY-MM-DD`), `time`, `image`
     (имя файла внутри `images/`), `media` (галерея, можно `[]`);
   - `translations.ru / en / sr` — полный набор ключей (см. ниже).
3. Пересоберите списки файлов и сайт:

   ```bash
   npm run materials
   npm run build
   ```

4. Проверьте все три языка и обе ссылки в архиве.

Списки на главной, в городе и в архиве **не редактируются вручную**: карточки берутся
из коллекции, будущее/прошлое определяется полем `status`, сортировка — по `date`.
Городская страница показывает предстоящие события, архив — прошедшие.

### Тексты лекции (`translations.<lang>.lecture`)

Обязательные ключи: `back`, `status`, `title`, `summary`, `whenLabel`, `when`,
`placeLabel`, `place`, `speakerLabel`, `speaker`, `imageAlt`, `aboutLabel`, `about[]`,
`learnLabel`, `learn[]`.

Для прошедших (`status: "past"`): `materialsLabel`, `materialsText`, `materialsButton`,
`materialsUrl`, `recapLabel`, `recapTitle`, `recap[]`, а при наличии фото —
`galleryLabel` и alt-ключи для каждого элемента `media` (`galleryAlt`, `videoAlt`, …).

Для будущих (`status: "upcoming"`) можно добавить блок призыва: `ctaLabel`, `ctaText`,
`ctaButton`. Если его нет, блок не выводится.

### Как добавить город

Создайте `src/content/cities/<slug>.json`:

```json
{
  "slug": "beograd",
  "order": 2,
  "status": "coming-soon",
  "name": { "ru": "Белград", "en": "Belgrade", "sr": "Beograd" },
  "venue": { "ru": "адрес скоро", "en": "venue to be announced", "sr": "adresa uskoro" },
  "address": ""
}
```

`status: "coming-soon"` показывает заглушку «Скоро» вместо афиши; `"active"` — обычную
страницу. `isDefault: true` помечает город по умолчанию (Ниш). Страницы и пункты
навигации появятся сами, отдельных списков нет.

## Языки

Три языка: `ru`, `en`, `sr` (сербский — **латиницей**). Каждый ключ должен быть во всех
трёх языках — это проверяет Zod-схема в `src/content.config.ts` при сборке.
Общие строки (навигация, футер, диалог материалов, подписи городов) — в
`src/i18n/ui.json`, тексты страниц — в `src/data/*.json`, тексты лекций — в самом файле
лекции.

Переключение языка — обычные ссылки на тот же путь с другим префиксом
(`/ru/...` ↔ `/en/...` ↔ `/sr/...`), без `localStorage` и клиентского JSON. В `<head>`
генерируются `canonical` и `hreflang` для всех трёх языков.

Общие ключи `brand`, `nav`, `footer`, `a11y` должны совпадать на всех страницах — они
лежат в `src/i18n/ui.json` и подставляются в `BaseLayout.astro`.

## Бейджи событий (лекция / общая встреча)

Есть два типа событий: **лекция** (`type: "lecture"`, есть лектор и тема) и
**общая встреча** (`type: "gathering"`: новогодний вечер, джем, поэтический вечер,
настольные игры и т.п.).

Текст бейджа хранится в `lecture.status` файла лекции и показывается на карточках и на
странице лекции. Формулировки — только из таблицы:

| Тип | RU | EN | SR |
|---|---|---|---|
| Лекция — предстоящая | `Предстоящая лекция` | `Upcoming talk` | `Predstojeće predavanje` |
| Лекция — прошедшая | `Прошедшая лекция` | `Past talk` | `Prošlo predavanje` |
| Общая встреча — предстоящая | `Общая встреча` | `Gathering` | `Okupljanje` |
| Общая встреча — прошедшая | `Прошедшая встреча` | `Past gathering` | `Prošlo okupljanje` |
| Открытие лектория (разово) | `Открытие лектория` | `Opening night` | `Otvaranje lektorija` |

Для не-лекций всегда «Общая встреча», а не «Лекция». «Открытие лектория» —
разовый бейдж самой первой встречи.

## Материалы

Кнопка «Материалы» (в архиве — боковая полоса карточки, на странице лекции — кнопка
в блоке «Материалы») открывает `<dialog>` со списком файлов. Список берётся из
`public/lectures/<city>/<slug>/data/materials.json`, который собирает
`scripts/build-materials.mjs` по папкам `images/` и `materials/`:

```bash
npm run materials
```

Скрипт идемпотентный и запускается автоматически перед `dev` и `build`. Клик по файлу
скачивает его прямо с сайта (`download`); на GitHub ведёт только кнопка внизу окна —
на `https://github.com/tritonJS826/openLectures/tree/main/public/lectures/<city>/<slug>`.

`lecture.materialsUrl` в JSON прошедшей лекции должен вести на эту же папку GitHub.

## Изображения

- Только **AVIF** для фото и обложек (компактнее JPEG/PNG).
- Конвертация через ffmpeg:

  ```bash
  ffmpeg -y -i source.png -frames:v 1 -c:v libaom-av1 \
    -crf 30 -b:v 0 -cpu-used 6 -still-picture 1 -pix_fmt yuv420p out.avif
  ```

- Если ваш ffmpeg умеет `libavif`, можно использовать `-c:v libavif`.
- Ориентиры: обложка — до ~1600 px по длинной стороне, желательно < 300 КБ.
- Имена описательные: `images/cover.avif`, `images/talk-1.avif`.
- alt обязателен и локализован: ключ `lecture.imageAlt` (и alt-ключи для галереи) в
  каждом языке.
- В `public/lectures/*/images/` не должно быть jpg/png — только итоговые `.avif`
  (и `.mp4` для видео с постером `.avif`).

## Стили и скрипты

- `src/styles/base.css` — общая база (шапка, футер, карточки, диалог материалов).
- Стили страниц (`home.css`, `archive.css`, `about.css`, `newLectureRequest.css`,
  `404.css`, `lecture.css`, `cities.css`) подключаются в соответствующих `.astro`
  файлах.
- Акцент страницы лекции — `<body data-lecture="<slug без даты>">` и правила
  `body[data-lecture="…"]` в `lecture.css`.
- `src/scripts/stars.js`, `ui.js` и `about.js` — ванильный JS: звёздное небо,
  мобильное меню, reveal, наклон обложки, диалог материалов, копирование почты.
  Сохраняйте `prefers-reduced-motion`, skip-link и фокусные стили.

## SEO и индексация

- `sitemap-index.xml` (и `sitemap-0.xml`) генерирует `@astrojs/sitemap` при
  сборке: все страницы, кроме `404.html` и корневой заглушки `/`. Вручную sitemap
  не редактируется. Старый адрес `/sitemap.xml` перенаправляется на индекс.
- `canonical` и `hreflang` — в `BaseLayout.astro`, по одному адресу на страницу.
- `<meta name="google-site-verification">` выводится только на `/ru/`.
- `public/robots.txt` разрешает обход и указывает на sitemap.
- Каждая страница живёт по одному адресу — со слэшем на конце, без `/index.html`.
  За это отвечают `trailingSlash: "always"` и правила в `netlify.toml`.
- Deploy previews и branch deploys не индексируются: `scripts/preview-headers.sh`
  кладёт в `dist/` файл `_headers` с `X-Robots-Tag: noindex, nofollow`.
  `_headers` в `.gitignore` — **не коммитьте его**, иначе `noindex` уедет на продакшен.

## Страница 404

`src/pages/404.astro` собирается в `dist/404.html`; Netlify отдаёт её на любой
несуществующий адрес со статусом 404. Страница помечена `noindex` и не попадает в
sitemap. Ссылки внутри неё абсолютные (`/ru/`, `/ru/nis/archive/`), потому что файл
открывается по произвольному глубокому адресу.

## Проверка перед коммитом

```bash
npm run build
```

Затем откройте `npm run preview` и проверьте:

- три языка на главной, в городе, архиве, лекции и на странице «О нас»;
- будущие события только в афише, прошедшие — только в архиве;
- у прошедшей лекции две ссылки: страница и материалы; окно материалов скачивает файлы;
- форму «Предложить лекцию» (Netlify Forms) на странице города и в «О нас»;
- мобильное меню, переключатель языка, 404 и редирект `/` → `/ru/`.

Полный список HTML-страниц для сверки с sitemap:

```bash
find dist -name '*.html' | sort
grep -o '<loc>[^<]*' dist/sitemap-0.xml
```
