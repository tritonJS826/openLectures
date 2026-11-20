/* ==========================================================================
   build-materials.mjs — builds the file list for the “Materials” dialog.

   For every lecture folder public/lectures/<city>/<slug>/ it looks at images/
   and materials/ and writes public/lectures/<city>/<slug>/data/materials.json
   (no languages — data only).

   Run from the repo root:
     node scripts/build-materials.mjs        (or: npm run materials)

   Astro runs it automatically before `astro build` via `npm run build`.
   The script is idempotent and creates no new URL routes.
   ========================================================================== */
import { readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LECTURES = path.join(ROOT, "public", "lectures");
const REPO = "https://github.com/tritonJS826/openLectures";

const FOLDERS = [
  { id: "images", dir: "images" },
  { id: "materials", dir: "materials" },
];

const KINDS = {
  ".avif": "image", ".webp": "image", ".jpg": "image", ".jpeg": "image",
  ".png": "image", ".svg": "image", ".gif": "image",
  ".mp4": "video", ".webm": "video", ".mov": "video", ".m4v": "video",
  ".pdf": "doc", ".ppt": "doc", ".pptx": "doc", ".doc": "doc", ".docx": "doc",
  ".odt": "doc", ".odp": "doc", ".txt": "doc", ".md": "doc", ".csv": "doc",
  ".zip": "doc",
};

function kindOf(name) {
  return KINDS[path.extname(name).toLowerCase()] || "other";
}

function repoPath(city, slug, folder, name) {
  return `public/lectures/${city}/${slug}/${folder}/${encodeURIComponent(name)}`;
}

function assetPath(city, slug, folder, name) {
  return `lectures/${city}/${slug}/${folder}/${name}`;
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

async function buildLecture(city, slug) {
  const groups = [];
  for (const { id, dir } of FOLDERS) {
    const files = await listFiles(path.join(LECTURES, city, slug, dir));
    if (!files.length) continue;
    groups.push({
      id,
      files: files.map((f) => ({
        name: f.name,
        size: f.size,
        kind: kindOf(f.name),
        path: assetPath(city, slug, dir, f.name),
        url: `${REPO}/blob/main/${repoPath(city, slug, dir, f.name)}`,
      })),
    });
  }
  return {
    slug,
    city,
    repoUrl: `${REPO}/tree/main/public/lectures/${city}/${slug}`,
    groups,
  };
}

async function main() {
  let cities;
  try {
    cities = await readdir(LECTURES, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("No public/lectures yet — nothing to build.");
      return;
    }
    throw err;
  }

  for (const cityEntry of cities.filter((e) => e.isDirectory())) {
    const city = cityEntry.name;
    const lectures = await readdir(path.join(LECTURES, city), { withFileTypes: true });
    const slugs = lectures
      .filter((e) => e.isDirectory() && /^\d{8}-/.test(e.name))
      .map((e) => e.name)
      .sort();

    for (const slug of slugs) {
      const manifest = await buildLecture(city, slug);
      const outDir = path.join(LECTURES, city, slug, "data");
      await mkdir(outDir, { recursive: true });
      await writeFile(
        path.join(outDir, "materials.json"),
        JSON.stringify(manifest, null, 2) + "\n",
        "utf8",
      );
      const count = manifest.groups.reduce((n, g) => n + g.files.length, 0);
      console.log(
        `${city}/${slug}: ${count} file(s) → public/lectures/${city}/${slug}/data/materials.json`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
