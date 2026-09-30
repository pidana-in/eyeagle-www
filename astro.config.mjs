// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const sitemapExcludedPaths = new Set(["/404"]);

// Retired pages. Netlify serves these as permanent (301) redirects.
const retiredToStore = [
  "/solution",
  "/device",
  "/orders",
  "/checkout-2",
  "/join",
  "/success",
  "/offers/fathers-day-2025",
  "/offers/yoga-day-2025",
];
const retiredToInquiry = ["/enquiry", "/inequiery", "/assessment-form"];
const redirects = Object.fromEntries([
  ...retiredToStore.map((path) => [path, { status: 301, destination: "/store" }]),
  ...retiredToInquiry.map((path) => [path, { status: 301, destination: "/inquiry" }]),
]);

export default defineConfig({
  site: "https://eyeagle.ai/",
  trailingSlash: "never",
  output: "static",
  build: {
    format: "file",
  },
  adapter: netlify(),
  redirects,
  devToolbar: {
    enabled: false,
  },
  image: {
    layout: "constrained",
    responsiveStyles: true,
    breakpoints: [320, 480, 640, 800, 1024, 1280, 1600, 1920],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/$/, "") || "/";
        return !sitemapExcludedPaths.has(pathname);
      },
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
});
