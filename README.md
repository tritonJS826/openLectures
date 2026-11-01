# Нишский Лекторий · Project Open Lectures

Открытый лекторий в Нише: любой может рассказать о чём угодно — просто заполните форму, и мы свяжемся.

Статический сайт на чистом HTML/CSS/JS. Без сборки и зависимостей.

**Сайт:** https://openlectures.netlify.app/

## Структура

```
.
├── index.html                # главная: идея, афиша, архив, форма
├── archive.html              # прошедшие лекции (+ ссылки на материалы)
├── newLectureRequest.html    # Netlify-форма «предложить лекцию»
├── css/                      # общие стили (base + по странице)
├── js/                       # app.js (тексты + языки), stars.js (звёздное небо)
├── data/                     # index.json / archive.json / newLectureRequest.json
└── lectures/
    └── <slug>/               # каждая лекция — отдельная папка
        ├── index.html
        ├── css/style.css
        ├── js/main.js
        ├── data/lecture.json
        └── images/
```

## Языки

Тексты каждой страницы лежат в одном JSON-файле: `{ "ru": {…}, "en": {…}, "sr": {…} }`
(сербский — латиницей). Переключатель RU/EN/SR в шапке; выбор сохраняется в `localStorage`,
по умолчанию — русский. Скрипт `js/app.js` берёт данные из файла, указанного в `data-json`
у `<body>`, и подставляет их по атрибутам `data-i18n` / `data-list`.

## Локальный просмотр

`fetch()` не работает с `file://`, поэтому нужен простой статический сервер:

```bash
python3 -m http.server 5173
# затем http://localhost:5173
```

## Деплой на Netlify

Готовый сайт: **https://openlectures.netlify.app/**

**Вариант A — через Git (рекомендуется).** Подключите репозиторий
`https://github.com/tritonJS826/openLectures` в Netlify. Настройки сборки не нужны:
в `netlify.toml` указано `publish = "."`.

**Вариант B — drag & drop.** Перетащите папку проекта в интерфейс Netlify.

Форма «предложить лекцию» (`newLectureRequest.html`) работает как Netlify Form с именем `lecture-request`.
Проверить её можно после деплоя в разделе **Forms** панели Netlify.

## Добавить новую лекцию

1. Скопируйте папку `lectures/20261028-spiders` → `lectures/<YYYYMMDD-slug>`.
2. Поправьте `data/lecture.json` (все три языка) и стили/картинки при необходимости.
3. Добавьте запись в `data/index.json` (афиша) или `data/archive.json` (архив).

Полные правила — в [`AGENTS.md`](./AGENTS.md): где появляются ссылки (1 ссылка у будущих
лекций, 2 у прошедших), структура папки лекции, обязательные ключи JSON и правила по картинкам.

**Картинки — только в формате AVIF** (компактнее JPEG). Конвертация через ffmpeg:

```bash
ffmpeg -y -i source.png -frames:v 1 -c:v libaom-av1 \
  -crf 30 -b:v 0 -cpu-used 6 -still-picture 1 -pix_fmt yuv420p out.avif
```
