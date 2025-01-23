// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';


export default defineConfig({
  integrations: [tailwind({
    applyBaseStyles: false,
  })],
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
});
