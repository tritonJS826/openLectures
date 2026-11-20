import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const loc = z.object({
  ru: z.string(),
  en: z.string(),
  sr: z.string(),
});

const cities = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/cities" }),
  schema: z.object({
    slug: z.string(),
    order: z.number(),
    status: z.enum(["active", "coming-soon"]),
    isDefault: z.boolean().optional(),
    name: loc,
    venue: loc,
    address: z.string(),
  }),
});

const lectureText = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),
  lecture: z.object({
    back: z.string(),
    status: z.string(),
    title: z.string(),
    summary: z.string(),
    whenLabel: z.string(),
    when: z.string(),
    placeLabel: z.string(),
    place: z.string(),
    speakerLabel: z.string(),
    speaker: z.string(),
    imageAlt: z.string(),
    aboutLabel: z.string(),
    about: z.array(z.string()),
    learnLabel: z.string(),
    learn: z.array(z.string()),
    ctaLabel: z.string().optional(),
    ctaText: z.string().optional(),
    ctaButton: z.string().optional(),
    materialsLabel: z.string().optional(),
    materialsText: z.string().optional(),
    materialsButton: z.string().optional(),
    materialsUrl: z.string().optional(),
    recapLabel: z.string().optional(),
    recapTitle: z.string().optional(),
    recap: z.array(z.string()).optional(),
    galleryLabel: z.string().optional(),
    galleryAlt: z.string().optional(),
    galleryAlt2: z.string().optional(),
    videoAlt: z.string().optional(),
    videoAlt2: z.string().optional(),
    videoAlt3: z.string().optional(),
    videoAlt4: z.string().optional(),
  }),
  materials: z
    .object({
      eyebrow: z.string(),
      title: z.string(),
      note: z.string(),
      folderCta: z.string(),
      groupImages: z.string(),
      groupFiles: z.string(),
      loading: z.string(),
      empty: z.string(),
      error: z.string(),
      close: z.string(),
      download: z.string(),
      b: z.string(),
      kb: z.string(),
      mb: z.string(),
    })
    .optional(),
});

const lectureMedia = z.object({
  type: z.enum(["image", "video"]),
  src: z.string(),
  poster: z.string().optional(),
  altKey: z.string(),
});

const lectures = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/lectures" }),
  schema: z.object({
    slug: z.string(),
    city: z.string(),
    type: z.enum(["lecture", "gathering"]),
    status: z.enum(["upcoming", "past"]),
    date: z.string(),
    time: z.string(),
    image: z.string(),
    media: z.array(lectureMedia).default([]),
    translations: z.object({
      ru: lectureText,
      en: lectureText,
      sr: lectureText,
    }),
  }),
});

export const collections = { cities, lectures };
