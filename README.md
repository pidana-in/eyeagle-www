# EyEagle website

The public EyEagle website is an Astro application rendered with the Netlify adapter. It uses Tailwind CSS through Vite, Astro content collections for articles, and pnpm for dependency management.

## Requirements

- Node.js 24 (`.node-version` pins the tested release)
- pnpm 11.15 or newer in the 11.x line

## Local development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The local server is available at `http://localhost:4321` by default.

## Validation

```sh
pnpm check
pnpm lint
pnpm inventory
pnpm build
```

`pnpm inventory` writes route, link, and image inventories to `reports/`. With the development server running, `pnpm audit:site` crawls the rendered routes and validates page metadata, canonical URLs, headings, image alt attributes, links, and JSON-LD.

## Runtime configuration

The join flow and optional Shopify integration use deployment environment variables. Never commit their values.

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO`
- `USE_SHOPIFY_JOIN`
- `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`

SMTP credentials use private server-only variable names and must never use Astro's `PUBLIC_` prefix.

## Deployment

`pnpm build` produces the Netlify server bundle and static assets in `dist/`. This repository does not contain a `netlify.toml`; build and environment settings are managed outside the repository.
