import { defineCollection, z } from "astro:content";

const blogs = defineCollection({
  schema: z.object({
    id: z.coerce.number(),
    title: z.string(),
    category: z.string(),
    img: z.string(),
    // Astro provides entry.slug from the filename; frontmatter slug is optional
    slug: z.string().optional(),
    author: z.string(),
    authorRole: z.string(),
    date: z.coerce.date(),
  }),
});

export const collections = {
  blogs,
};
