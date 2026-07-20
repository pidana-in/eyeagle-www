import { readFile, writeFile } from "node:fs/promises";

const baseUrl = new URL(process.argv[2] || "http://127.0.0.1:4321");
const inventory = JSON.parse(await readFile(new URL("../reports/site-inventory.json", import.meta.url), "utf8"));
const routes = inventory.routes.filter((entry) => !entry.route.includes("["));

function matches(html, expression) {
  return [...html.matchAll(expression)].map((match) => match[1] ?? match[0]);
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

const results = [];
for (const entry of routes) {
  const requestUrl = new URL(entry.route, baseUrl);
  const response = await fetch(requestUrl, { redirect: "manual" });
  const html = await response.text();
  const renderedHtml = html.replace(/<!--[\s\S]*?-->/g, "");
  const titles = matches(renderedHtml, /<title>([\s\S]*?)<\/title>/gi).map(stripHtml);
  const descriptions = matches(renderedHtml, /<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/gi);
  const canonicals = matches(renderedHtml, /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?\s*>/gi);
  const robots = matches(renderedHtml, /<meta\s+name="robots"\s+content="([^"]*)"\s*\/?\s*>/gi);
  const h1s = matches(renderedHtml, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map(stripHtml).filter(Boolean);
  const headings = [...renderedHtml.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: stripHtml(match[2]),
  }));
  const headingJumps = headings.filter((heading, index) => index > 0 && heading.level > headings[index - 1].level + 1);
  // Astro serializes an intentionally empty alt value as the valid HTML shorthand `alt`.
  const imagesMissingAlt = [...renderedHtml.matchAll(/<img\b[^>]*>/gi)].filter((match) => !/\balt(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?(?=\s|>)/.test(match[0])).length;
  const vagueLinks = [...renderedHtml.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({ href: match[1], text: stripHtml(match[2]) }))
    .filter((link) => /^(?:click here|here|learn more|read|more|view all)$/i.test(link.text));
  const schemaBlocks = matches(renderedHtml, /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  const schemaErrors = [];
  const schemaTypes = new Set();
  for (const block of schemaBlocks) {
    try {
      const value = JSON.parse(block);
      for (const node of value["@graph"] ?? [value]) {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        types.filter(Boolean).forEach((type) => schemaTypes.add(type));
      }
    } catch (error) {
      schemaErrors.push(error.message);
    }
  }

  const expectedCanonical = new URL(entry.route === "/" ? "/" : entry.route.replace(/\/+$/, ""), "https://eyeagle.ai").toString();
  const issues = [];
  if (response.status !== 200) issues.push(`HTTP ${response.status}`);
  if (titles.length !== 1 || !titles[0]) issues.push(`title count ${titles.length}`);
  if (descriptions.length !== 1 || !descriptions[0]) issues.push(`description count ${descriptions.length}`);
  if (canonicals.length !== 1 || canonicals[0] !== expectedCanonical) issues.push(`canonical ${canonicals.join(", ") || "missing"}`);
  if (robots.length !== 1) issues.push(`robots count ${robots.length}`);
  if (h1s.length !== 1) issues.push(`H1 count ${h1s.length}`);
  if (schemaBlocks.length !== 1 || schemaErrors.length) issues.push("invalid or duplicate JSON-LD");
  if (!["Organization", "WebSite"].every((type) => schemaTypes.has(type))) issues.push("missing site schema types");
  if (!["WebPage", "AboutPage", "ContactPage", "CollectionPage"].some((type) => schemaTypes.has(type))) issues.push("missing page schema type");
  if (entry.kind === "blog" && !schemaTypes.has("BlogPosting")) issues.push("missing BlogPosting schema");
  if (imagesMissingAlt) issues.push(`${imagesMissingAlt} images missing alt`);
  if (headingJumps.length) issues.push(`${headingJumps.length} heading-level jumps`);
  if (vagueLinks.length) issues.push(`${vagueLinks.length} vague links`);

  results.push({
    route: entry.route,
    source: entry.source,
    status: response.status,
    title: titles[0] ?? "",
    description: descriptions[0] ?? "",
    canonical: canonicals[0] ?? "",
    robots: robots[0] ?? "",
    h1s,
    schemaTypes: [...schemaTypes],
    imagesMissingAlt,
    headingJumps,
    vagueLinks,
    issues,
  });
}

const duplicateValues = (field) => {
  const grouped = new Map();
  for (const result of results) {
    const value = result[field];
    if (!value) continue;
    grouped.set(value, [...(grouped.get(value) ?? []), result.route]);
  }
  return [...grouped.entries()].filter(([, groupedRoutes]) => groupedRoutes.length > 1).map(([value, groupedRoutes]) => ({ value, routes: groupedRoutes }));
};

const duplicateTitles = duplicateValues("title");
const duplicateDescriptions = duplicateValues("description");
const summary = {
  auditedRoutes: results.length,
  routesWithIssues: results.filter((result) => result.issues.length).length,
  duplicateTitles,
  duplicateDescriptions,
};

await writeFile(new URL("../reports/rendered-site-audit.json", import.meta.url), JSON.stringify({ summary, results }, null, 2) + "\n");
const markdown = [
  "# Rendered site audit",
  "",
  `- Audited routes: ${summary.auditedRoutes}`,
  `- Routes with issues: ${summary.routesWithIssues}`,
  `- Duplicate title groups: ${duplicateTitles.length}`,
  `- Duplicate description groups: ${duplicateDescriptions.length}`,
  "",
  ...results.filter((result) => result.issues.length).flatMap((result) => [
    `## ${result.route}`,
    "",
    ...result.issues.map((issue) => `- ${issue}`),
    "",
  ]),
];
await writeFile(new URL("../reports/rendered-site-audit.md", import.meta.url), markdown.join("\n"));
console.log(JSON.stringify(summary, null, 2));
if (summary.routesWithIssues || duplicateTitles.length || duplicateDescriptions.length) process.exitCode = 1;
