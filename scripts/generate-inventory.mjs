import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoots = ["src", "public"];
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const textExtensions = new Set([".astro", ".css", ".js", ".json", ".md", ".mjs", ".ts"]);

async function walk(relativeDirectory) {
  const entries = await readdir(path.join(root, relativeDirectory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(relativePath)));
    else files.push(relativePath);
  }
  return files;
}

function classifyImage(file, width, height) {
  const lower = file.toLowerCase();
  const name = path.basename(lower);

  if (lower.includes("chatgptimage")) return { category: "generated artwork", confidence: "high", review: true };
  if (/logo|favicon|appstore|playstore|google(store)?/.test(name)) return { category: "logo", confidence: "high", review: false };
  if (path.extname(lower) === ".svg" || /(^|[-_])(icon|check|tick|chevron|divider|vector|line)([-_.]|$)/.test(name)) {
    return { category: "icon", confidence: "high", review: false };
  }
  if (/founder|senior-couple|testimonial|joinphoto|whatsapp/.test(lower)) {
    return { category: "photograph", confidence: "medium", review: true };
  }
  if (lower.includes("/blog/") && /\.jpe?g$/.test(lower)) {
    return { category: "photograph or generated artwork", confidence: "low", review: true };
  }
  if (/device|protection|product|guardian|bathroom|grabbar|handlebar|handrail|mat|tape|orderitem|cart/.test(lower)) {
    return { category: "product imagery", confidence: "medium", review: true };
  }
  if (/appimage|appinfograph|notifications|circleapp|backupimage/.test(lower)) {
    return { category: "screenshot", confidence: "medium", review: true };
  }
  if (width && height && width <= 256 && height <= 256) {
    return { category: "icon", confidence: "medium", review: true };
  }
  return { category: "illustration or photograph", confidence: "low", review: true };
}

function csv(rows) {
  return rows
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n") + "\n";
}

const allFiles = (await Promise.all(sourceRoots.map(walk))).flat();
const textFiles = allFiles.filter((file) => textExtensions.has(path.extname(file).toLowerCase()));
const textByFile = new Map(
  await Promise.all(textFiles.map(async (file) => [file, await readFile(path.join(root, file), "utf8")])),
);

const imageFiles = allFiles.filter((file) => imageExtensions.has(path.extname(file).toLowerCase()));
const images = [];
for (const file of imageFiles) {
  const absolutePath = path.join(root, file);
  const fileStat = await stat(absolutePath);
  let width = null;
  let height = null;
  let format = path.extname(file).slice(1).toLowerCase();
  try {
    const metadata = await sharp(absolutePath).metadata();
    width = metadata.width ?? null;
    height = metadata.height ?? null;
    format = metadata.format ?? format;
  } catch {
    // SVG dimensions are not guaranteed to be available through Sharp.
  }

  const basename = path.basename(file);
  const references = [...textByFile.entries()]
    .filter(([, content]) => content.includes(basename))
    .map(([sourceFile]) => sourceFile);
  const classification = classifyImage(file, width, height);

  images.push({
    file,
    format,
    width,
    height,
    bytes: fileStat.size,
    category: classification.category,
    classificationConfidence: classification.confidence,
    needsVisualReview: classification.review,
    referenced: references.length > 0,
    references,
  });
}

const pageFiles = (await walk("src/pages")).filter((file) => file.endsWith(".astro"));
const blogFiles = (await walk("src/content/blogs")).filter((file) => file.endsWith(".md"));
const routes = pageFiles
  .filter((file) => !file.endsWith("src/pages/blogs/[slug].astro"))
  .map((file) => {
    const relative = file.replace(/^src\/pages/, "").replace(/index\.astro$/, "").replace(/\.astro$/, "");
    return {
      route: relative || "/",
      source: file,
      kind: file.includes("[") ? "dynamic" : "page",
    };
  });

for (const file of blogFiles) {
  const content = textByFile.get(file) ?? "";
  const slug = content.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1]?.trim();
  if (slug) routes.push({ route: `/blogs/${slug}`, source: file, kind: "blog" });
}
routes.sort((a, b) => a.route.localeCompare(b.route));

const links = [];
for (const [file, content] of textByFile) {
  const patterns = [
    /href\s*=\s*["']([^"']+)["']/g,
    /(?:https?:\/\/|mailto:|tel:)[^\s"'<>`)]+/g,
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const href = match[1] ?? match[0];
      links.push({ source: file, href, external: /^(?:https?:)?\/\//.test(href) });
    }
  }
}

const reportDirectory = path.join(root, "reports");
await mkdir(reportDirectory, { recursive: true });
await writeFile(path.join(reportDirectory, "site-inventory.json"), JSON.stringify({ routes, images, links }, null, 2) + "\n");
await writeFile(
  path.join(reportDirectory, "image-inventory.csv"),
  csv([
    ["file", "category", "confidence", "needs_visual_review", "referenced", "format", "width", "height", "bytes", "references"],
    ...images.map((image) => [
      image.file,
      image.category,
      image.classificationConfidence,
      image.needsVisualReview,
      image.referenced,
      image.format,
      image.width,
      image.height,
      image.bytes,
      image.references.join("; "),
    ]),
  ]),
);
await writeFile(
  path.join(reportDirectory, "route-inventory.csv"),
  csv([["route", "kind", "source"], ...routes.map((route) => [route.route, route.kind, route.source])]),
);
await writeFile(
  path.join(reportDirectory, "link-inventory.csv"),
  csv([["source", "href", "external"], ...links.map((link) => [link.source, link.href, link.external])]),
);

console.log(`Inventoried ${routes.length} routes, ${images.length} images, and ${links.length} link references.`);
