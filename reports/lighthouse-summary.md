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

## Remaining verification

- The remaining deployed unused-JavaScript opportunity is about 40 KiB from the core PostHog analytics loader.
- Lighthouse measured a 940 ms initial document response in the mobile run and 630 ms in the desktop run. Production monitoring should confirm whether this is typical across regions and after CDN warming.
