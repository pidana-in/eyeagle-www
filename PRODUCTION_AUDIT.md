# EyEagle Production Readiness Audit

**Updated:** 2026-09-29  
**Scope:** Current working tree, including the redesign and uncommitted assets  
**Release action:** No commit, push, deployment, test order, or valid customer-form submission was made.

## Status

The application code passes the production build and automated site audit. Release is **ready for a configured staging/production smoke test**, with the environment items below required before public launch.

## Validation Results

| Check | Result |
|---|---|
| Astro diagnostics | PASS — 167 files, 0 errors, 0 warnings, 0 hints |
| ESLint | PASS |
| Netlify production build | PASS |
| Rendered route audit | PASS — 66 routes, 0 route issues |
| Internal link audit | PASS — 0 broken internal links |
| Metadata audit | PASS — no duplicate titles or descriptions |
| Shopify configurator | PASS — all 15 supported configurations |
| Inquiry invalid-payload test | PASS — HTTP 400 with `VALIDATION_ERROR` |
| Dependency audit | 0 critical, 0 moderate, 2 high reports for the same transitive `extract-zip` package |

Detailed rendered results are in `reports/rendered-site-audit.md` and `reports/rendered-site-audit.json`.

## Production Fixes Included

- Replaced hardcoded UAT/development form origins with required server-only environment variables.
- Added strict inquiry validation, payload limits, no-store responses, and upstream timeouts.
- Added SMTP notification support after the CRM accepts an inquiry.
- Added input validation and payload limits to the store waitlist endpoint.
- Redirected legacy form URLs to `/inquiry` and removed them from the sitemap.
- Excluded noindex, checkout utility, success, store, and expired-offer routes from the sitemap.
- Added a branded 404 page and baseline version-controlled security headers.
- Removed active expired-offer payment links and replaced dead Shopify product links.
- Upgraded Astro, the Netlify adapter, Nodemailer, Sharp, and related packages.
- Applied supported patched versions for vulnerable transitive dependencies.
- Archived 29 unused public image originals outside the deployable public directory, reducing the built output from roughly 419 MB to 355 MB.

## Required Production Environment

Set these in the hosting environment before release:

- `ASSESSMENT_API_BASE_URL` — production CRM origin.
- `USER_WAITLIST_API_URL` — required only while the legacy `/join` handler is retained.
- `STORE_WAITLIST_API_URL` — production availability-signup endpoint.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.
- `INQUIRY_NOTIFICATION_TO=rehan.tamang@ipsator.com` during notification testing; replace it with the operational recipient when testing is complete.
- Shopify Admin values only if the legacy Shopify join flow is enabled.

The local `.env` points inquiry submissions at UAT for development and has the testing recipient, but it does not contain SMTP credentials. Email delivery therefore cannot be verified locally yet.

## Remaining Release Checks

1. Build once in CI with the declared Node `24.18.0` runtime. The local audit machine is running Node 25, although the build succeeds.
2. Submit one controlled inquiry against the production CRM and confirm both the CRM record and notification email.
3. Submit one store availability signup after `STORE_WAITLIST_API_URL` is configured.
4. Open the 15 live Shopify cart configurations in the intended market and complete one test-mode checkout.
5. Confirm the Netlify `_headers` file is active after deployment.

## Known Dependency Exception

The registry audit reports two high findings for the same transitive `extract-zip@2.0.1` path inside Netlify development/build tooling. The advisory says `2.0.2` is patched, but npm currently publishes only through `2.0.1`; pnpm cannot install the stated fix. There are no critical or moderate findings, and this dependency is not application request-handling code. Recheck after the Netlify dependency chain publishes a usable patch.

## Build Size

The current Netlify output is approximately 355 MB because the adapter bundles original source images for runtime image transformation. Public raw assets are about 1.1 MB. Runtime pages request optimized images through Netlify Image CDN URLs; monitor the deployed image pipeline and Core Web Vitals after staging deployment.
