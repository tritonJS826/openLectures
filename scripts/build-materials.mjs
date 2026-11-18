/* ==========================================================================
   build-materials.mjs — собирает список файлов лекций для окна «Материалы».

   Для каждой папки lectures/<slug>/ смотрит images/ и materials/, пишет
   lectures/<slug>/data/materials.json (без языков — только данные).

   Запуск (из корня репозитория):
     node scripts/build-materials.mjs

   Скрипт идемпотентный: можно прогонять сколько угодно раз. Продакшен его
   не запускает — файлы манифеста просто лежат в репозитории.
   ========================================================================== */
import { readdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LECTURES = path.join(ROOT, "lectures");
const REPO = "https://github.com/tritonJS826/openLectures";

const FOLDERS = [
  { id: "images", dir: "images" },
  { id: "materials", dir: "materials" }
];

const KINDS = {
  ".avif": "image", ".webp": "image", ".jpg": "image", ".jpeg": "image", ".png": "image", ".svg": "image", ".gif": "image",
  ".mp4": "video", ".webm": "video", ".mov": "video", ".m4v": "video",
  ".pdf": "doc", ".ppt": "doc", ".pptx": "doc", ".doc": "doc", ".docx": "doc", ".odt": "doc", ".odp": "doc",
  ".txt": "doc", ".md": "doc", ".csv": "doc", ".zip": "doc"
};

function kindOf(name) {
  return KINDS[path.extname(name).toLowerCase()] || "other";
}

function toUrl(slug, folder, name) {
  return `${REPO}/blob/main/lectures/${slug}/${folder}/${encodeURIComponent(name)}`;
}

async function listFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    const info = await stat(full);
    files.push({ name: entry.name, size: info.size });
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

async function buildLecture(slug) {
  const groups = [];
  for (const { id, dir } of FOLDERS) {
    const files = await listFiles(path.join(LECTURES, slug, dir));
    if (!files.length) continue;
    groups.push({
      id,
      files: files.map((f) => ({
        name: f.name,
        size: f.size,
        kind: kindOf(f.name),
        path: `lectures/${slug}/${dir}/${f.name}`,
        url: toUrl(slug, dir, f.name)
      }))
    });
  }
  return {
    slug,
    repoUrl: `${REPO}/tree/main/lectures/${slug}`,
    groups
  };
}

async function main() {
  const entries = await readdir(LECTURES, { withFileTypes: true });
  const slugs = entries
    .filter((e) => e.isDirectory() && /^\d{8}-/.test(e.name))
    .map((e) => e.name)
    .sort();

  for (const slug of slugs) {
    const manifest = await buildLecture(slug);
    const out = path.join(LECTURES, slug, "data", "materials.json");
    await writeFile(out, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    const count = manifest.groups.reduce((n, g) => n + g.files.length, 0);
    console.log(`${slug}: ${count} file(s) → lectures/${slug}/data/materials.json`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
