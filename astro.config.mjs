// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://eyeagle.ai/",

  output: "server",

  adapter: netlify(),

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),

    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
});