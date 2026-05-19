// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";
import node from "@astrojs/node";
import netlify from "@astrojs/netlify";

const isNetlify = process.env.SERVER_ADAPTER === "NETLIFY";
const adapter = isNetlify
  ? netlify({ imageCDN: false })
  : node({ mode: "standalone" });

export default defineConfig({
  integrations: [
    tailwind({ applyBaseStyles: false }),
    partytown({
      config: { forward: ["dataLayer.push"] },
    }),
  ],
  site: "https://eyeagle.ai/",
  output: "server",
  adapter,
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
