// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://eyeagle.ai/",
  trailingSlash: "never",
  output: "server",
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
      filter: (page) =>
        !page.includes("/offers/") &&
        !page.endsWith("/store") &&
        !page.endsWith("/success"),
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
});
