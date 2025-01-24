// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';

const isNetlify = process.env.SERVER_ADAPTER === 'NETLIFY';
const adapter = isNetlify ? netlify() : node({
  mode: 'standalone',
});


export default defineConfig({
  integrations: [tailwind({
    applyBaseStyles: false,
  })],
  output: 'static',
  adapter,
});
