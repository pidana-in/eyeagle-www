import { defineCollection, z } from "astro:content";

const stories = defineCollection({
  schema: z.object({
    id: z.number(),
    title: z.string(),
    img: z.string(),
    category: z.string(),
    author: z.string(),
    authorImage: z.string(),
    authorRole: z.string(),
  }),
});

export const collections = {
  stories,
};
