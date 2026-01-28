import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

const imageModules = import.meta.glob<{ default: ImageMetadata }>("/src/assets/Blog/*.{jpg,jpeg,png,webp,avif}", { eager: true });

const normalizeImagePath = (input: string) => {
  if (input.startsWith("/src/")) return input;
  const cleaned = input.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
  return cleaned.startsWith("src/") ? `/${cleaned}` : `/src/${cleaned}`;
};

let blogsData: CollectionEntry<"blogs">[] = await getCollection("blogs");
blogsData = blogsData.sort((a, b) => b.data.id - a.data.id);

const responseData = await Promise.all(
  blogsData.map(async (blog) => {
    const imageSource = typeof blog.data.img === "string" ? imageModules[normalizeImagePath(blog.data.img)]?.default : (blog.data.img ?? null);
    const image = imageSource
      ? await getImage({
          src: imageSource,
          widths: [400],
          formats: ["avif", "webp", "jpeg"],
          sizes: "(max-width: 400px) 100vw, 400px",
          quality: 80,
        })
      : null;

    return {
      title: blog.data.title,
      id: blog.data.id,
      author: blog.data.author,
      image: image?.src ?? "",
      date: blog.data.date,
      slug: "https://eyeagle.ai/blogs/" + blog.slug,
      // raw: blog,
    };
  }),
);

export function GET({}) {
  return new Response(JSON.stringify(responseData));
}
