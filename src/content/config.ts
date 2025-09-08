import { defineCollection, z } from "astro:content";

const blogs = defineCollection({
  schema: ({ image }) =>
    z.object({
      id: z.coerce.number(),
      title: z.string(),
      category: z.string(),
      img: image(),
      slug: z.string().optional(),
      author: z.string(),
      authorRole: z.string(),
      date: z.coerce.date(),
    }),
});

export const collections = {
  blogs,
};
