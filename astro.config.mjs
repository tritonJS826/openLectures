import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://openlectures.netlify.app",
  trailingSlash: "always",
  // Static builds render this as a meta-refresh page; Netlify turns the same
  // path into a real 301 (see netlify.toml).
  redirects: {
    "/": "/ru/",
  },
  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en", "sr"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "ru",
        locales: {
          ru: "ru",
          en: "en",
          sr: "sr",
        },
      },
      // 404 and the root redirect page are not indexable pages.
      filter: (page) =>
        !page.includes("/404") && page !== "https://openlectures.netlify.app/",
    }),
  ],
});
