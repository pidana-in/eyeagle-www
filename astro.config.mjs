// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const sitemapExcludedPaths = new Set([
  "/404",
  "/assessment-form",
  "/checkout-2",
  "/enquiry",
  "/inequiery",
  "/join",
  "/orders",
  "/store",
  "/success",
]);

export default defineConfig({
  site: "https://eyeagle.ai/",
  trailingSlash: "never",
  output: "static",
  build: {
    format: "file",
  },
  adapter: netlify(),
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
        return !pathname.startsWith("/offers/") && !sitemapExcludedPaths.has(pathname);
      },
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
});
