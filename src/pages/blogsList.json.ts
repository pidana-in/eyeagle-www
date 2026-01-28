import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

export const prerender = false;

const imageModules = import.meta.glob<{ default: ImageMetadata }>("/src/assets/Blog/*.{jpg,jpeg,png,webp,avif}", { eager: true });

const normalizeImagePath = (input: string) => {
  if (input.startsWith("/src/")) return input;
  const cleaned = input.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
  return cleaned.startsWith("src/") ? `/${cleaned}` : `/src/${cleaned}`;
};

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

const toPositiveInt = (value: string | null) => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const requestedSize = toPositiveInt(url.searchParams.get("size"));
  const size = Math.min(requestedSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

  let blogsData: CollectionEntry<"blogs">[] = await getCollection("blogs");
  blogsData = blogsData.sort((a, b) => b.data.id - a.data.id).slice(0, size);

  const responseData = await Promise.all(
    blogsData.map(async (blog) => {
      const imageSource = typeof blog.data.img === "string" ? imageModules[normalizeImagePath(blog.data.img)]?.default : (blog.data.img ?? null);
      const image = imageSource
        ? await getImage({
            src: imageSource,
            width: 400,
            format: "webp",
            quality: 80,
          })
        : null;

      return {
        title: blog.data.title,
        id: blog.data.id,
        author: blog.data.author,
        image: "https://eyeagle.ai" + (image?.src ?? "/favicon.svg"),
        date: blog.data.date,
        slug: "https://eyeagle.ai/blogs/" + blog.slug,
        // raw: blog,
      };
    }),
  );

  return new Response(JSON.stringify(responseData));
}
