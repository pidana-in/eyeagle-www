# Lighthouse audit summary

Audited the production home page at `https://eyeagle.ai/` on 2026-07-20 with Lighthouse 13.4.0 at the default mobile profile and the desktop preset, after PR #248 was merged and deployed by Netlify.

| Profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 95 | 100 | 100 | 100 | 1.0 s | 2.9 s | 50 ms | 0.001 |
| Desktop | 99 | 100 | 100 | 100 | 0.3 s | 0.9 s | 0 ms | 0.003 |

The production origin is crawlable and has no failed Lighthouse accessibility, Best Practices, or SEO audits. Titles, descriptions, canonicals, robots metadata, structured data, headings, link text, and image alt text also pass the repository's rendered-site audit across all 53 generated routes.

## Verified improvements

- Responsive local images are served through Astro and Netlify Image CDN URLs with explicit WebP format, width, and quality parameters.
- The mobile LCP image is discoverable in the initial document, eager-loaded, and given high fetch priority.
- Below-the-fold images are lazy-loaded and reserve layout space.
- The rendered page has no blocking-resource opportunity and negligible layout shift.
- Accessibility, Best Practices, and SEO score 100 on both production profiles.
- Unused PostHog survey and session-recording extensions were disabled; this removed about 84 KiB of transferred third-party JavaScript from the audited page.
- Production mobile performance improved from the local development baseline of 70 to 95, with LCP improving from 4.9 s to 2.9 s.

## Pending optimization validation

The current working tree was also audited through a Brotli-compressed production-mode local server after the next performance pass. These results are regression checks rather than substitutes for a post-deploy production audit.

| Profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 98 | 100 | 100 | 100 | 0.9 s | 2.5 s | 0 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.2 s | 0.5 s | 0 ms | 0 |

- The remaining PostHog loader was removed, eliminating its approximately 40 KiB unused-JavaScript opportunity and legacy-JavaScript finding.
- Plus Jakarta Sans is now a self-hosted, preloaded 27 KiB Latin variable font; the Google Fonts connection chain was removed.
- Static content pages and the legacy blog-list JSON feed are prerendered. Only the waitlist POST route remains on-demand because it securely calls the waitlist API and either Shopify or SMTP. The unintegrated order-details prototype is parked outside the published route tree until Shopify supplies its data.
- Partytown remains because it keeps the approximately 166 KiB Google Analytics script off the main thread; both local profiles measured 0 ms total blocking time.
- The Solutions-page final image is constrained to its section at mobile, desktop, and 1920 px ultrawide viewports and no longer paints over the footer.

## Remaining production verification

- Deploy the pending changes and rerun both Lighthouse profiles against `https://eyeagle.ai/` before replacing the production baseline above.
- Add a Cloudflare Cache Rule that makes `/.netlify/images` eligible for caching while preserving the full query string in the cache key. The live response already sends `Cache-Control: public, max-age=31536000, immutable`, but Cloudflare currently reports `CF-Cache-Status: DYNAMIC` for this extensionless endpoint.
- The production baseline measured a 940 ms initial document response in the mobile run and 630 ms in the desktop run. Confirm that prerendering the content pages reduces this after deployment and CDN warming.
