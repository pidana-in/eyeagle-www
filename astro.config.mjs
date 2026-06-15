// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://eyeagle.ai/",
  output: "server",
  adapter: netlify(),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
});