# Lighthouse audit summary

Audited the home page on 2026-07-20 with Lighthouse 13.4.0 at the default mobile profile and the desktop preset.

| Profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 70 | 100 | 100 | 100 | 4.7 s | 4.9 s | 0 ms | 0.001 |
| Desktop | 97 | 100 | 100 | 100 | 0.8 s | 1.1 s | 0 ms | 0.003 |

These results were captured from Astro's local development server because the Netlify server adapter does not provide a local production preview. The development response includes Vite's unminified client and CSS modules, so the mobile performance score, transfer size, minification warnings, cache warnings, and development WebSocket/bfcache warning are not representative of the deployed production bundle. Recheck the branch URL in the Netlify development environment before release.

## Verified improvements

- Responsive local images are served through Astro and Netlify Image CDN URLs with explicit WebP format, width, and quality parameters.
- The mobile LCP image is discoverable in the initial document, eager-loaded, and given high fetch priority.
- Below-the-fold images are lazy-loaded and reserve layout space.
- The rendered page has no blocking-resource opportunity and negligible layout shift.
- Accessibility, best-practices, and SEO category scores are 100 on both profiles.
- Unused PostHog survey and session-recording extensions were disabled; this removed about 84 KiB of transferred third-party JavaScript from the audited page.

## Remaining verification

- Run Lighthouse against the deployed development URL to measure the minified production response, CDN cache headers, and real network delivery.
- The remaining unused-JavaScript opportunity in the local audit is the core PostHog analytics loader plus Vite's development client.
