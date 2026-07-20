# Lighthouse audit summary

Audited the home page on 2026-07-20 with Lighthouse 13.4.0 at the default mobile profile and the desktop preset. The production-profile results use PR #248's Netlify Deploy Preview.

| Environment and profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Netlify preview, mobile | 86 | 100 | 96 | 69 | 3.0 s | 3.2 s | 0 ms | 0.001 |
| Netlify preview, desktop | 95 | 100 | 96 | 69 | 1.1 s | 1.1 s | 0 ms | 0.003 |
| Local development, mobile | 70 | 100 | 100 | 100 | 4.7 s | 4.9 s | 0 ms | 0.001 |
| Local development, desktop | 97 | 100 | 100 | 100 | 0.8 s | 1.1 s | 0 ms | 0.003 |

The Netlify preview's Best Practices deduction is caused by the injected Deploy Preview drawer's cookie warning. Its SEO deduction is caused by Netlify's intentional `X-Robots-Tag: noindex` header on deploy previews. The page-level robots metadata, canonicals, structured data, titles, descriptions, and headings pass the repository's rendered-site audit across all 53 generated routes.

The earlier local development response includes Vite's unminified client and CSS modules, so its transfer-size, minification, cache, WebSocket, and bfcache findings are not representative of the deployed production bundle.

## Verified improvements

- Responsive local images are served through Astro and Netlify Image CDN URLs with explicit WebP format, width, and quality parameters.
- The mobile LCP image is discoverable in the initial document, eager-loaded, and given high fetch priority.
- Below-the-fold images are lazy-loaded and reserve layout space.
- The rendered page has no blocking-resource opportunity and negligible layout shift.
- Accessibility scores 100 on both deployed profiles. Excluding Netlify's preview-only drawer and noindex controls, the audited Best Practices and SEO checks pass.
- Unused PostHog survey and session-recording extensions were disabled; this removed about 84 KiB of transferred third-party JavaScript from the audited page.
- Production mobile performance improved from the development baseline of 70 to 86, with LCP improving from 4.9 s to 3.2 s.

## Remaining verification

- Recheck crawlability on the production domain after release because deploy previews are intentionally non-indexable.
- The remaining deployed unused-JavaScript opportunity is about 40 KiB from the core PostHog analytics loader.
- Mobile Lighthouse reports a 630 ms initial document response in this single preview run; production monitoring should confirm whether that is typical after CDN warming.
