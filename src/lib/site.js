export const LANGS = ["ru", "en", "sr"];
export const DEFAULT_LANG = "ru";
export const SITE = "https://openlectures.netlify.app";
export const TG = "https://t.me/NisLrktor";

const LOCALES = { ru: "ru-RU", en: "en-US", sr: "sr-Latn-RS" };

export function t(data, lang) {
  return data[lang] || data[DEFAULT_LANG];
}

export function brandName(ui, city) {
  const base = ui.brand.name; // "Open Lectures"
  return city ? `${base} · ${city.name[ui.__lang || DEFAULT_LANG]}` : base;
}

export function cityBrandName(ui, city, lang) {
  return city ? `${ui.brand.name} · ${city.name[lang]}` : ui.brand.name;
}

/** "27 декабря 2026, воскресенье, 18:00" → { dateText, time } */
export function parseWhen(when) {
  const parts = String(when).split(", ");
  const time = parts.length > 1 ? parts[parts.length - 1] : "";
  const dateText = parts[0] || "";
  return { dateText, time };
}

export function dayMon(iso, lang) {
  const d = new Date(`${iso}T12:00:00Z`);
  const day = String(d.getUTCDate()).padStart(2, "0");
  let mon = new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.ru, { month: "short" })
    .format(d)
    .replace(/\./g, "")
    .slice(0, 3);
  if (lang === "en") mon = mon.toUpperCase();
  return { day, mon };
}

export function lectureHref(lang, city, slug) {
  return `/${lang}/${city}/lectures/${slug}/`;
}

export function imageSrc(city, slug, file) {
  return `/lectures/${city}/${slug}/images/${file}`;
}

export function materialsRepo(city, slug) {
  return `https://github.com/tritonJS826/openLectures/tree/main/public/lectures/${city}/${slug}`;
}

/** Sort by date ascending (upcoming) or descending (archive). */
export function byDate(entries, dir = "asc") {
  const mul = dir === "desc" ? -1 : 1;
  return [...entries].sort((a, b) => mul * a.data.date.localeCompare(b.data.date));
}
