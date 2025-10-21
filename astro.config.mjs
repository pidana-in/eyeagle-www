// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';

// Detect hosting environment
const isNetlify = process.env.SERVER_ADAPTER === 'NETLIFY';
const adapter = isNetlify ? netlify({ imageCDN: false }) : node({ mode: 'standalone' });

// 👇 Use Netlify's preview URL dynamically if available
const site =
  process.env.DEPLOY_PRIME_URL // set automatically by Netlify for previews
    ? `https://${process.env.DEPLOY_PRIME_URL}`
    : 'https://eyeagle.ai'; // fallback to production domain

export default defineConfig({
  site,
  integrations: [
    tailwind({ applyBaseStyles: false }),
    partytown({
      config: { forward: ['dataLayer.push'] },
    }),
  ],
  output: 'static',
  adapter,
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
