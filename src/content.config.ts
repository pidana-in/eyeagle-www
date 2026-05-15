import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blogs = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blogs",
  }),

  schema: ({ image }) =>
    z.object({
      id: z.coerce.number(),
      title: z.string(),
      slug: z.string().optional(),
      category: z.string(),
      img: image(),
      author: z.string(),
      authorRole: z.string(),
      date: z.coerce.date(),
    }),
});

export const collections = {
  blogs,
};