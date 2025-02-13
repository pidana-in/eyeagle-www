// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';
import partytown from '@astrojs/partytown';

const isNetlify = process.env.SERVER_ADAPTER === 'NETLIFY';
const adapter = isNetlify ? netlify({
  imageCDN: false,
}) : node({
  mode: 'standalone',
});


export default defineConfig({
  integrations: [tailwind({
    applyBaseStyles: false,
  }),
  partytown({
    config: {
      forward: ['dataLayer.push'],
    },
  }),
  ],
  output: 'static',
  adapter,
  security: {
    checkOrigin: false
  }
});
