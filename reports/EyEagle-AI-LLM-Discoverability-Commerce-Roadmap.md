# EyEagle AI & LLM Discoverability and Commerce Roadmap

How to make EyEagle's content easier for AI assistants to discover, understand, cite, and recommend—and make its products eligible for AI-assisted purchasing.

| Field | Value |
| --- | --- |
| Prepared for | EyEagle team |
| Version | 1.0 |
| Date | 20 July 2026 |
| Scope | `eyeagle.ai` and `shop.eyeagle.ai` |
| Status | Team planning document; implementation is not authorized by this document alone |
| Recommended review | Quarterly, and whenever a major crawler, commerce program, or Shopify flow changes |

## Executive summary

EyEagle can become more useful to ChatGPT, Claude, Gemini, Perplexity, Copilot, and other AI assistants by improving three separate but connected paths:

1. **Live discovery and citation:** an assistant searches or retrieves EyEagle pages while answering a question.
2. **Model-training permission:** an AI provider is allowed to use public EyEagle material when developing future models.
3. **Product and commerce distribution:** shopping systems receive accurate product, price, availability, image, policy, and purchase data.

The website already has a useful foundation: Astro produces readable static HTML, the most important information does not depend on client-side rendering, canonical URLs and a sitemap are present, and the blog has article structured data. The next high-impact work is to verify crawler access through Cloudflare, add standards-based feeds, make content evidence and authorship stronger, improve Shopify product data, and submit the catalog to merchant and AI-commerce programs.

An optional `llms.txt` file can act as a curated map, but it is not a replacement for crawlable pages, credible content, search indexing, structured data, or merchant feeds.

> **Core recommendation:** Treat this as a trust-and-distribution program, not an “AI SEO trick.” Publish material that is reliable for people, easy for crawlers to retrieve, and consistent with live Shopify data.

### What success looks like

- AI assistants can retrieve and cite relevant EyEagle articles when answering questions about senior safety, bathroom fall prevention, caregiving, and emergency response.
- AI systems can accurately explain what EyEagle is, which problems it addresses, how Guardian X and the Protection Kit differ, and where services are actually available.
- Product answers use the correct name, description, price, availability, images, policies, and canonical purchase URL.
- EyEagle can measure crawler access, indexing, citations, AI referrals, and resulting purchases rather than relying on anecdotal checks.
- The team has a written policy for live search, user-requested retrieval, and model-training use of public content.
- Every published claim, author, reviewer, rating, availability state, and business fact is genuine and verifiable.

### Important limitation

No robots rule, schema field, feed, `llms.txt` file, or merchant submission can guarantee that an AI assistant will recommend EyEagle. Each system selects sources and products according to its own rules. Results can depend on the user's question, evidence quality, independent reputation, geography, price, availability, and suitability. This roadmap improves eligibility, accuracy, and the likelihood of being considered; it cannot buy or force placement.

## Current-state assessment

This assessment is based on the current `eyeagle-www` repository and the known Shopify destinations, not on assumptions from another product or codebase.

| Area | Current position | Gap to close |
| --- | --- | --- |
| Website delivery | Astro generates static, readable HTML with limited client hydration. | Keep all essential facts and links in rendered HTML; test crawler rendering after meaningful releases. |
| Discovery | `public/robots.txt` permits crawling and the Astro sitemap integration generates a sitemap. | Verify that Cloudflare does not challenge or rate-limit verified search and AI crawlers. |
| Page metadata | The main layout handles canonical URLs, page metadata, and social data. | Maintain page-specific facts and validate generated output for every route. |
| Structured data | Organization, WebSite, WebPage, BreadcrumbList, and BlogPosting data already exist. | Add genuine modification and author identity data; make product/service modeling consistent with visible content. |
| Blog source | Articles live in `src/content/blogs/*.md`, with a schema in `src/content.config.ts`. | Expand governance fields for sources, reviewers, and real update dates. |
| Blog distribution | HTML pages and a limited `src/pages/blogsList.json.ts` endpoint exist. | Add RSS or Atom and a standards-based JSON Feed with canonical metadata. |
| LLM guidance | No `llms.txt` is published. | Optionally publish a short curated site map after the canonical content is settled. |
| Content trust | Articles expose bylines and publication dates. | Add verified author profiles, citations, a review policy, and qualified reviewers where genuinely used. |
| Commerce | Main-site CTAs link to canonical Shopify product pages. | Make Shopify product data authoritative and distribute it through merchant and AI-commerce feeds. |
| Measurement | No dedicated AI-visibility benchmark is present. | Establish prompt, crawler, citation, referral, and commerce baselines. |

### Current canonical commerce destinations

- **Bathroom safety audit:** <https://shop.eyeagle.ai/products/bathroom-audit>
- **Protection kit:** <https://shop.eyeagle.ai/products/eyeagle-bathroom-safety-package-audit-prevention-kit-installation-app-membership>

Use these stable product pages in content and feeds. A checkout URL is session- or market-sensitive and should not be treated as the permanent canonical product URL.

## How AI systems can use EyEagle

### Route 1: Live search and citation

An assistant may search or retrieve the public web at answer time. This is the most practical path for current EyEagle blog content because recent pages can be surfaced and cited by URL. The main requirements are:

- the crawler can access the page without a Cloudflare challenge;
- the page is indexable and canonical;
- its main text is present in HTML;
- its title, headings, links, and structured data are clear;
- the answer is accurate, well-supported, and relevant;
- other trustworthy sources corroborate important claims where possible.

OpenAI, Anthropic, and Perplexity publish separate identities for search/retrieval and other crawler purposes.[1][3][4]

### Route 2: Model training

A provider may use permitted public material when building future models. Training does not create immediate visibility, attribution, or product recommendations. This is a separate policy, copyright, and competitive decision.

For example, OpenAI documents separate controls for `OAI-SearchBot` and `GPTBot`; Anthropic separates `Claude-SearchBot`, `Claude-User`, and `ClaudeBot`.[1][3] EyEagle can allow live search while choosing a different policy for model training.

### Route 3: Product and commerce feeds

Shopping systems work best with structured catalog data: exact product title, description, image, price, currency, availability, policies, and purchase URL. Search-oriented Product/Offer data and merchant feeds improve eligibility. OpenAI also documents an Agentic Commerce product-feed path for approved partners.[7][8]

The Shopify store should be the source of truth. The marketing site should explain and link to products, but it should not maintain a second conflicting price or inventory system.

## Guiding principles

1. **Visible truth first.** Structured data, feeds, and AI-facing files must match facts visible to customers.
2. **One canonical source for commerce.** Shopify owns current product identity, price, availability, variants, and purchasing.
3. **Search and training are separate choices.** Document the purpose of every allowed or blocked crawler.
4. **Health-adjacent claims require stronger evidence.** Use primary evidence and qualified review where the subject calls for it.
5. **No invented trust signals.** Never create authors, credentials, reviewers, ratings, dates, addresses, service coverage, or results that do not exist.
6. **Prefer durable standards.** HTML, sitemaps, RSS/Atom, JSON Feed, JSON-LD, and merchant feeds matter more than speculative AI-only tactics.
7. **Keep pages useful without JavaScript.** Machine readers and people should receive the same essential information.
8. **Measure outcomes.** Track access, citations, representation, referrals, and purchases—not just whether a file exists.

## Roadmap overview

| Timing | Workstream | Primary outcome | Suggested lead |
| --- | --- | --- | --- |
| Week 1 | Policy, robots, and Cloudflare | Verified AI and search crawlers can fetch both domains without challenge. | Engineering + leadership |
| Weeks 1–2 | Feeds and machine-readable publishing | RSS/Atom, JSON Feed, accurate modification data, sitemap metadata, and optional `llms.txt` are available. | Engineering |
| Weeks 2–5 | Editorial trust and answer quality | Important content is sourced, reviewed, differentiated, and easy to cite. | Content + qualified reviewer |
| Weeks 2–4 | Shopify and commerce data | Products have accurate structured data and merchant feeds. | Ecommerce + engineering |
| Weeks 4–8 | Independent authority | EyEagle earns relevant references and subject credibility. | Marketing + partnerships |
| After baseline | Optional direct AI commerce | A user-invoked assistant can retrieve product data and safely start a purchase flow. | Product + engineering |
| Monthly | Measurement and iteration | The team tracks citations, factual representation, referrals, and conversions. | Marketing analytics |

## Phase 1 — Crawler access and policy

**Objective:** Make public content reachable while preserving a deliberate choice about model training.

### 1.1 Decide the access policy

Leadership should explicitly approve each purpose. A practical starting point is to allow live search and user-requested retrieval. Training can be allowed or blocked independently after a policy review.

| Purpose | Examples | Recommended starting position |
| --- | --- | --- |
| Search and indexing | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Googlebot`, `Bingbot` | Allow |
| User-requested retrieval | `ChatGPT-User`, `Claude-User`, `Perplexity-User` | Allow |
| Model training or extended use | `GPTBot`, `ClaudeBot`, `Google-Extended` | Leadership decision; document separately |

Record the decision, owner, approval date, and review date. Re-check provider documentation before every policy change because crawler identities and control semantics can change.

### 1.2 Make the robots policy explicit

The existing wildcard rule already allows compliant crawlers. Explicit groups make the intended policy easier to audit. `eyeagle.ai` and `shop.eyeagle.ai` are separate hosts and therefore require separate `robots.txt` review.

Example only—the training rules must reflect the approved decision:

```text
# Search and answer-time retrieval
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# Model training — replace with the approved Allow or Disallow policy
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: *
Allow: /

Sitemap: https://eyeagle.ai/sitemap-index.xml
```

Do not add a block merely because a bot name sounds related to AI. Confirm its documented purpose first. Also do not rely on `robots.txt` to protect private information; private resources must require authentication and must never be publicly exposed.

### 1.3 Verify Cloudflare and hosting behavior

The site is proxied through Cloudflare, so a permissive robots file is not enough. Review:

- Web Application Firewall rules;
- Bot Fight Mode or equivalent bot controls;
- managed challenges;
- rate limits;
- cache and redirect rules;
- host-specific rules for `eyeagle.ai` and `shop.eyeagle.ai`.

Prefer Cloudflare's verified-bot signal or provider-published network ranges. A User-Agent can be spoofed; do not create a broad security bypass based only on its text. OpenAI and Perplexity publish current crawler IP information.[1][4]

Test at least these resources:

- `/robots.txt`;
- `/sitemap-index.xml` and child sitemap files;
- homepage;
- `/blog`;
- one recent blog article;
- one older blog article;
- `/device`, `/protection`, `/solution`, and `/about-us`;
- both canonical Shopify product pages.

For each crawler identity, record:

| Test field | Required result |
| --- | --- |
| HTTP status | `200` for public pages; intentional redirect only where expected |
| Cloudflare action | No CAPTCHA, interactive challenge, or block |
| Response body | The actual page, not a challenge shell |
| Robots meta | Indexable unless the page is intentionally excluded |
| Canonical | Absolute and self-consistent |
| Main content | Readable without executing application JavaScript |
| Structured data | Parses and matches the visible page |
| Log evidence | Test date, crawler, source verification, response status, and rule ID retained |

### Phase 1 acceptance checklist

- [ ] Leadership or the designated legal owner has approved search, retrieval, and training policies.
- [ ] `robots.txt` is valid and consistent with that policy on both domains.
- [ ] Verified search and retrieval crawlers receive the real page with a `200` response and no challenge.
- [ ] Cloudflare exceptions, if needed, are narrow and identity-aware.
- [ ] The sitemap is accessible and submitted in Google Search Console and Bing Webmaster Tools.
- [ ] Private, account, cart, checkout, and administrative paths remain protected or intentionally excluded.
- [ ] A quarterly re-test has a named owner.

## Phase 2 — Machine-readable publishing

**Objective:** Give search engines, feed readers, and retrieval tools clean, current, canonical ways to discover content.

### 2.1 Publish RSS or Atom

Create a public feed, preferably at `/blog/feed.xml`, and advertise it in the HTML `<head>`:

```html
<link
  rel="alternate"
  type="application/rss+xml"
  title="EyEagle Blog"
  href="https://eyeagle.ai/blog/feed.xml"
/>
```

Each feed item should include:

- article title;
- concise description;
- canonical URL and stable identifier;
- actual named author;
- publication date;
- genuine modification date, when applicable;
- category or topic;
- representative image URL;
- readable excerpt or full article content according to the approved syndication policy.

Use absolute URLs. Sort newest first. Escape HTML correctly and validate the result with more than one standards-aware feed parser. A feed entry must not create an alternative canonical version of the article.

### 2.2 Add a standards-based JSON Feed

The existing `src/pages/blogsList.json.ts` is a limited endpoint, not a complete syndication contract. Add a JSON Feed, for example `/blog/feed.json`, with the same canonical identity and dates as RSS.

Recommended top-level fields:

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "EyEagle Blog",
  "home_page_url": "https://eyeagle.ai/blog",
  "feed_url": "https://eyeagle.ai/blog/feed.json",
  "description": "Evidence-informed guidance from EyEagle.",
  "items": []
}
```

Recommended item fields are `id`, `url`, `title`, `summary`, `content_html` or `content_text`, `image`, `date_published`, `date_modified`, `authors`, and `tags`. Populate only fields supported by repository content.

If an external consumer depends on `blogsList.json.ts`, retain it as a compatibility endpoint and document it. Otherwise, plan a deprecation after usage is confirmed. Do not silently repurpose its schema.

### 2.3 Model real modification dates

Add an optional `dateModified` field to `src/content.config.ts` and article front matter. It should be set only when a meaningful editorial update occurs. Examples include a changed recommendation, updated evidence, a corrected fact, or a substantially revised section.

Do not update dates merely to appear fresh. The following must agree:

- visible “Updated” date;
- BlogPosting `dateModified`;
- RSS and JSON Feed modification dates;
- sitemap `lastmod`;
- repository content history.

Use the original publication date as `datePublished`. Never reconstruct or invent dates when the source is unavailable.

### 2.4 Improve sitemap accuracy

The sitemap should include every canonical, indexable page and omit redirects, parked routes, error pages, and pages intentionally marked `noindex`. Specifically verify that it excludes the parked order-details work until that route is deliberately integrated.

`lastmod` should describe meaningful content changes, not deployment time. This prevents every release from making the entire site look newly modified.

Submit the sitemap in:

- Google Search Console;
- Bing Webmaster Tools;
- any other search console that the team actively maintains.

IndexNow can be considered for notifying participating search engines about added, updated, or deleted URLs, but it does not guarantee indexing.[9]

### 2.5 Publish an optional `llms.txt`

`/llms.txt` can provide a concise, human-maintained map for tools that choose to use it. Keep it factual and small. Link to canonical public pages, the blog, feeds, and stable product pages. Do not duplicate the whole website, publish confidential details, or make claims that are absent from visible pages.

Example starting point:

```markdown
# EyEagle

EyEagle provides bathroom fall-prevention and emergency-response solutions.
Use the linked pages for current product, service, coverage, and policy details.

## Company and solutions

- [About EyEagle](https://eyeagle.ai/about-us)
- [How EyEagle works](https://eyeagle.ai/solution)
- [Guardian X](https://eyeagle.ai/device)
- [Protection](https://eyeagle.ai/protection)

## Products and services

- [Bathroom safety audit](https://shop.eyeagle.ai/products/bathroom-audit)
- [EyEagle bathroom safety package](https://shop.eyeagle.ai/products/eyeagle-bathroom-safety-package-audit-prevention-kit-installation-app-membership)

## Educational content

- [EyEagle blog](https://eyeagle.ai/blog)
- [Blog RSS feed](https://eyeagle.ai/blog/feed.xml)
- [Blog JSON Feed](https://eyeagle.ai/blog/feed.json)
```

The first sentence must be reconciled with the exact wording the business approves and the pages visibly support.

> **Caution:** `llms.txt` is a community proposal, not a universal ranking or inclusion standard.[5] Google states that normal search fundamentals apply to its AI search features and that no special AI text file or AI-only schema is required.[2]

### 2.6 Keep essential facts in HTML

Astro already provides a strong static baseline. Preserve it:

- do not hide essential descriptions behind a client-only component;
- use ordinary anchor links for primary navigation and commerce CTAs;
- expose headings, article text, image alt text, bylines, dates, and policies in server-generated HTML;
- avoid loading a second copy of meaningful content after hydration;
- use progressive enhancement only where interaction genuinely requires it.

### Phase 2 acceptance checklist

- [ ] RSS/Atom validates and uses canonical absolute URLs.
- [ ] JSON Feed validates and matches the RSS and article metadata.
- [ ] Feed autodiscovery links appear in generated page heads.
- [ ] Real modification dates flow consistently into HTML, JSON-LD, feeds, and sitemap.
- [ ] Sitemap contains all and only canonical indexable routes.
- [ ] Optional `llms.txt` is concise, factual, and limited to public canonical resources.
- [ ] Feeds, sitemap, and `llms.txt` load without Cloudflare challenges.
- [ ] A build check detects missing required feed data and duplicate item identifiers.

## Phase 3 — Content authority and answer quality

**Objective:** Make EyEagle content trustworthy and useful enough to cite, especially for health-adjacent senior-safety questions.

### 3.1 Audit every factual claim

Review all articles for claims involving prevalence, injuries, mortality, medical guidance, percentage reductions, product performance, and technical behavior. Precise statistics need a direct source. Advice should distinguish general education from professional assessment.

Use this source hierarchy:

| Priority | Source type | Guidance |
| --- | --- | --- |
| 1 | Government health authorities, WHO, original peer-reviewed research, official standards, and official product documentation | Prefer for numerical, clinical, standards, and product behavior claims. |
| 2 | Recognized geriatric, occupational therapy, physiotherapy, engineering, and public-health institutions | Useful for practical synthesis within their expertise. |
| 3 | Systematic reviews and respected clinical or technical guidance | Use when they faithfully summarize primary evidence. |
| Avoid as sole evidence | Competitor pages, affiliate content, unattributed statistics, AI-generated citations, and unsourced infographics | Locate the original evidence or remove/qualify the claim. |

For each high-impact article:

1. List every claim that could influence a safety decision.
2. Link the strongest available source immediately after the claim.
3. Confirm that the cited source actually supports the wording and population.
4. Add limitations where the evidence does not apply universally.
5. Remove claims that cannot be substantiated.
6. Record who reviewed the article and when, but only after an actual review.

Never use a plausible-looking DOI, journal title, authority, or quotation without verifying it.

### 3.2 Establish real authorship and review signals

- Create a profile page for each recurring author with their real role, relevant experience, and credentials.
- Link the visible byline to that profile.
- Use the same canonical profile URL in BlogPosting `author.url`.[6]
- Where content is medically or clinically sensitive, show a qualified reviewer only if that named person actually reviewed the final text.
- Show reviewer expertise within its true scope; do not imply medical credentials the person does not hold.
- Publish an editorial policy covering research, reviews, corrections, conflicts, AI-assisted drafting, and the boundary between education and medical advice.
- Show the original publication date and a separate updated date only after meaningful revision.

If an author profile cannot yet be created, retain the real visible byline and avoid adding unsupported Person attributes.

### 3.3 Use an answer-first article template

Recommended article structure:

1. **Meaningful H1:** a plain description of the question or topic.
2. **Direct answer:** two to four sentences that resolve the primary question without a long preamble.
3. **Key takeaways:** three to six factual bullets.
4. **Explanation:** descriptive, question-based H2s and logically nested H3s.
5. **Practical steps:** actions, limitations, and when to seek qualified help.
6. **Evidence:** inline citations close to the claims they support.
7. **EyEagle relevance:** a clearly labeled explanation of the applicable product or service, separate from general guidance.
8. **Next step:** one descriptive link, such as “Book a bathroom safety audit” or “View the EyEagle Protection Kit.”
9. **References:** complete source names and direct URLs.
10. **Authorship:** byline, published date, updated date when applicable, and actual reviewer.

Avoid vague links such as “Click here,” “Learn more,” or “Buy now” when the destination can be named. Link text should make sense when read outside its surrounding paragraph.

### 3.4 Build differentiated topic clusters

Publish fewer, stronger resources instead of many overlapping posts. Suggested pillar resources, subject to factual and business review:

- a complete senior bathroom safety checklist for Indian homes;
- how a professional bathroom fall-risk assessment works;
- grab-bar placement, installation, and common mistakes;
- what the EyEagle Protection Kit includes and what it cannot prevent;
- how Guardian X behaves during Wi-Fi and power outages;
- installed emergency systems compared with wearable fall-alert devices;
- caring for parents remotely: prevention, detection, and response planning;
- service coverage, installation, warranty, returns, cancellation, and support using current verified facts.

Each cluster should have one authoritative pillar page. Supporting posts should answer distinct questions and link to the pillar with descriptive language. Consolidate or redirect thin, duplicated, and outdated articles instead of keeping several competing URLs.

### 3.5 Align BlogPosting structured data

Every article's JSON-LD should match the visible article and use only real values:

- `@type`: `BlogPosting` or `Article` as appropriate;
- `headline`: visible article headline;
- `description`: concise article summary;
- `mainEntityOfPage`: canonical URL;
- `url`: canonical URL;
- `image`: crawlable representative image with useful dimensions;
- `datePublished`: original publication date;
- `dateModified`: genuine editorial modification date, if one exists;
- `author`: real Person or Organization identity with a canonical profile URL where available;
- `publisher`: EyEagle Organization entity and real logo;
- `keywords`: meaningful article topics only, not an obsolete page-level meta-keywords list.

Do not mark a sales page as an article or add FAQ structured data merely because the page contains headings written as questions.

### Phase 3 acceptance checklist

- [ ] Priority safety and health-adjacent claims have direct, working sources.
- [ ] Unsupported statistics or performance claims have been removed or qualified.
- [ ] Recurring authors have verified profile pages.
- [ ] Qualified reviewers appear only on content they actually reviewed.
- [ ] Editorial, correction, and AI-use policies are published and followed.
- [ ] Articles use answer-first structure and descriptive internal links.
- [ ] BlogPosting JSON-LD matches visible authors, dates, images, and headlines.
- [ ] Duplicated and outdated posts have a consolidation or update plan.

## Phase 4 — Product data and commerce

**Objective:** Make Shopify the authoritative, current source of product and purchase information and distribute that truth to search and AI-commerce systems.

### 4.1 Resolve visible product ambiguity

During the prior review, the Bathroom Fall Risk Assessment appeared with a `₹0` price and a “Sold out” state. That combination is confusing to customers and product systems. Confirm the actual business state:

- free and currently bookable;
- paid and currently bookable;
- temporarily unavailable;
- limited by service area;
- requires contact or qualification before booking.

Then make the visible product page, inventory state, Product/Offer JSON-LD, merchant feeds, and CTA wording agree. This roadmap does not assume which state is correct.

> **Truth rule:** Do not put a value in structured data or a feed unless it is visible and accurate on the product page. Never invent ratings, review counts, GTINs, SKUs, stock, pricing, service coverage, or delivery dates.

### 4.2 Audit Shopify Product and Offer data

| Field group | Requirement |
| --- | --- |
| Identity | Exact product name, brand, SKU, and GTIN/MPN only when genuinely assigned. |
| Description | Clear purpose, contents, audience, limitations, and service geography. |
| Offer | Current INR price, accurate availability, condition, and stable product URL. |
| Variants | Each purchasable variant has distinct, accurate identifiers and availability. |
| Images | Crawlable, high-resolution, genuine product images; useful square and landscape crops where available. |
| Policies | Visible shipping, installation, return, cancellation, privacy, and warranty terms. |
| Canonical | One preferred product URL used in structured data, feeds, and internal links. |
| Validation | Rendered HTML review, Google Rich Results Test, and merchant diagnostics. |

The Protection Kit page should clearly state what the package includes, what requires installation, any app or membership dependency, purchase eligibility, geographic limitations, support terms, and important limitations. Every statement must reflect the current offer.

Google distinguishes merchant listings from editorial product information. The richest purchase-oriented Product/Offer representation belongs on the Shopify page where the customer can actually transact.[7] Main-site pages can explain a product or service, but should not pretend to be a live offer if checkout occurs elsewhere.

### 4.3 Submit and maintain merchant feeds

1. Connect Shopify to Google Merchant Center and configure eligible free listings.
2. Connect the catalog to Microsoft Merchant Center for eligible Bing and Microsoft surfaces.
3. Verify the site ownership and policy pages required by each program.
4. Synchronize title, description, price, currency, inventory, images, and product URL from Shopify.
5. Monitor mismatched prices, missing identifiers, inaccessible images, disapprovals, and out-of-stock products at least weekly.
6. Apply for OpenAI Agentic Commerce product-feed access if the business meets the current program requirements. Onboarding may be limited to approved partners.[8]
7. If accepted, implement the current feed specification and update cadence rather than copying an old example from this document.

Use product-page URLs—not temporary cart or checkout URLs—as the canonical feed destination. Let Shopify create the appropriate cart or checkout after the user chooses to purchase.

### 4.4 Prepare product content for assistants

Every product and service page should answer these questions in visible HTML:

- What is it?
- Who is it for?
- What problem does it address?
- What is included and excluded?
- What does installation involve?
- Does it require power, Wi-Fi, mobile service, an app, or a subscription?
- What happens during an outage?
- Where is it available?
- What does it cost today?
- Is it in stock or bookable?
- What are the shipping, installation, warranty, return, and cancellation terms?
- What should a customer do before purchasing?

Do not optimize these answers for keyword density. Optimize them for precision and easy comparison.

### Phase 4 acceptance checklist

- [ ] Audit product price and availability are unambiguous and current.
- [ ] Shopify is documented as the catalog source of truth.
- [ ] Product/Offer data matches visible content and live inventory.
- [ ] Canonical URLs use stable product pages, not checkout sessions.
- [ ] Product images are crawlable and accurately represent the item.
- [ ] Required policies are visible and consistent.
- [ ] Merchant feeds have no critical price, URL, availability, or image errors.
- [ ] A named owner reviews feed diagnostics weekly.

## Phase 5 — Independent authority and distribution

**Objective:** Build trustworthy evidence beyond EyEagle's own domains so recommendation systems can encounter corroborating information.

Recommended activities:

- publish real installation and safety-audit case studies with informed customer permission;
- partner with credible senior-care, occupational therapy, physiotherapy, accessibility, or ageing organizations for education and expert review;
- publish anonymized aggregate audit insights only when the sample, limitations, and method are honestly described;
- seek genuine editorial coverage and relevant citations;
- keep the company name, product names, legal identity, contact information, and official social profiles consistent across the web;
- maintain eligible business listings only for places and service areas that genuinely qualify;
- provide partners with canonical fact sheets and URLs so third-party descriptions stay accurate.

Avoid paid link schemes, mass guest posting, fake reviews, undisclosed endorsements, and low-quality syndication. Independent authority matters only when it is real.

### Suggested reusable evidence assets

- one-page product fact sheet with revision date;
- technical behavior and limitations sheet;
- installation and maintenance guide;
- service-coverage page;
- methodology for the bathroom safety audit;
- author and reviewer profiles;
- press and partner media kit with canonical product names and images;
- case-study consent and anonymization process.

## Phase 6 — Optional direct AI commerce

**Objective:** After the catalog and order flow are stable, enable a user-invoked assistant to retrieve facts or start a transaction safely.

This is optional. It does not automatically improve organic citations or recommendations. Build it only when there is a clear user need, a stable Shopify integration, and an owner for privacy and operations.

An eventual ChatGPT app or standards-based MCP service might expose:

| Tool | Purpose | Safety requirement |
| --- | --- | --- |
| `search_products` | Find a relevant product or service from a controlled catalog. | Do not claim suitability beyond supported criteria. |
| `get_product` | Return contents, price, images, eligibility, and limitations. | Read live values from Shopify or a synchronized source. |
| `check_service_area` | Confirm whether an audit or installation is offered at a location. | Collect the minimum necessary location data. |
| `get_policies` | Return shipping, return, cancellation, warranty, and privacy information. | Link to the current canonical policies. |
| `create_cart` | Create a Shopify cart or checkout. | Require explicit user confirmation before changing transaction state. |
| `book_audit` | Start the verified audit-booking workflow once integrated. | Confirm availability, price, scope, consent, and user details. |

Implementation controls:

- Shopify remains the source of product, price, and availability truth.
- Tools return explicit timestamps or freshness information where appropriate.
- The assistant asks for confirmation before creating a cart, booking, or purchase.
- Personal data is minimized, encrypted, retained only as required, and covered by the privacy policy.
- Logs avoid sensitive free-text content where possible.
- The integration does not provide medical advice or claim that a product can eliminate all fall risk.
- Failed or ambiguous tool results fail safely and direct the user to a human channel.
- Order, refund, cancellation, and customer-support handoffs are defined before launch.

## Phase 7 — Measurement and continuous improvement

**Objective:** Measure whether assistants can access, represent, cite, and convert—not merely whether technical files exist.

### 7.1 Create a stable prompt benchmark

Build a set of 25–40 questions across awareness, education, comparison, service, and purchase intent. Run the same set monthly across the relevant surfaces of ChatGPT, Claude, Gemini, Perplexity, and Microsoft Copilot.

Record the date, product mode, account/location conditions, exact prompt, response, cited sources, EyEagle mention, factual errors, product URL, and any purchase affordance. Results are variable, so compare trends rather than treating one answer as a fixed ranking.

Example questions:

| Intent | Benchmark question | Desired outcome |
| --- | --- | --- |
| Education | How can I make my elderly parent's bathroom safer? | Accurate answer; relevant EyEagle guidance is eligible for citation. |
| Education | Where should grab bars be placed in a bathroom? | Evidence-based answer with limitations and professional-installation guidance. |
| Comparison | Do fall-alert systems work without Wi-Fi or power? | Answer reflects documented product behavior and does not overgeneralize. |
| Comparison | What is the difference between an installed emergency system and a wearable fall alarm? | Balanced comparison with EyEagle included only when relevant. |
| Service | Where can I book a bathroom safety audit in India? | Correct product page and current availability information. |
| Purchase | Which bathroom fall-prevention kit can I buy in India? | Correct product URL, current price, availability, and limitations. |
| Brand | What is EyEagle and how does it work? | Accurate summary of company, Guardian X, and Protection offering. |
| Policy | What are EyEagle's installation and return policies? | Links to current canonical policy details. |

### 7.2 Track operational and business signals

| Category | Metrics |
| --- | --- |
| Access | Verified crawler requests, successful `200` responses, challenge rate, robots fetches, and WAF actions. |
| Indexing | Indexed pages, sitemap errors, canonical mismatches, feed validation, and last crawl date. |
| Representation | Citation rate, factual accuracy, correct company/product explanation, and correct destination URL. |
| Commerce | Merchant item approval, feed errors, product impressions, AI referrals, add-to-cart events, and purchases. |
| Content | Questions earning citations, source coverage, meaningful freshness, engagement, and assisted conversions. |

### 7.3 Analytics guidance

- Add a channel or report for known AI referral domains, but retain the raw referrer to update classifications later.
- Use UTM parameters only in controlled campaigns or partner links; do not replace canonical URLs with tracking URLs in structured data.
- Separate crawler traffic from human sessions.
- Keep Cloudflare logs or an appropriate sampled view long enough to investigate access problems within the approved privacy policy.
- Annotate major content, crawler, feed, and product releases so changes can be compared with outcomes.
- Review Search Console and Bing Webmaster data alongside the prompt benchmark.
- Treat unattributed direct traffic as unknown; do not automatically label it as AI traffic.

### 7.4 Monthly review questions

1. Can every approved crawler still retrieve representative pages?
2. Which EyEagle URLs were cited, and for which questions?
3. Were descriptions, availability, geography, or limitations wrong?
4. Did merchant systems reject or suppress any products?
5. Which content gaps repeatedly appear in user questions?
6. Did AI referrals lead to meaningful engagement, booking, cart creation, or purchase?
7. Which corrections or feed changes are required this month?

## Team responsibilities

| Owner | Accountability |
| --- | --- |
| Leadership / legal owner | Approve search, retrieval, and model-training policy; approve claims and partner participation. |
| Web engineering | Robots, feeds, sitemap, `llms.txt`, structured data, Cloudflare tests, build validation, and monitoring. |
| Content lead | Editorial calendar, source audit, article structure, internal links, update dates, and corrections. |
| Qualified safety or clinical reviewer | Review health-adjacent claims within actual expertise and document genuine review. |
| Ecommerce owner | Shopify catalog truth, inventory, price, service availability, shipping, returns, and product feeds. |
| Marketing / partnerships | Search consoles, Merchant Center, earned references, reputation, and the prompt benchmark. |
| Analytics owner | Crawler dashboard, citation log, referral attribution, and conversion reporting. |
| Privacy / security owner | Review crawler exceptions, direct AI-commerce data use, consent, retention, and incident handling. |

One person may hold multiple roles, but each accountability needs a named owner and backup.

## Eight-week delivery plan

| Week | Deliverables | Exit criteria |
| --- | --- | --- |
| 1 | Policy decision; crawler matrix; Cloudflare audit; tests on both domains; webmaster property review. | Verified crawlers fetch key pages successfully, and policy is recorded. |
| 2 | RSS/Atom; JSON Feed; feed discovery links; `dateModified` model; sitemap `lastmod`; initial `llms.txt`. | Feeds validate and machine-readable resources return the expected content. |
| 3 | Shopify Product/Offer audit; resolve audit availability; merchant account connections. | Visible product data, JSON-LD, and feed values agree. |
| 4 | OpenAI commerce eligibility review; product image/policy cleanup; first ten blog evidence audits. | Products are approved or have a remediation plan; priority claims are sourced. |
| 5 | Author profiles; editorial and review policies; revised article template; internal-link updates. | Governance and template are in production. |
| 6 | Revise pillar articles; consolidate overlapping content; create prompt benchmark. | Priority articles pass evidence and representation review. |
| 7 | Authority outreach; case-study framework; crawler and indexing dashboard. | Ownership and recurring reporting are active. |
| 8 | Full validation; baseline prompt run; KPI review; next-quarter backlog. | Leadership receives the baseline and prioritized iteration plan. |

If ownership or product truth is unresolved, pause dependent feed or schema work rather than publishing guessed values.

## Repository implementation backlog

This section maps the plan to the current Astro repository. Final file names can follow project conventions, but the responsibilities should remain clear.

### `src/content.config.ts`

- Add an optional genuine modification date field.
- Add source/reference data only if it can be represented consistently across articles.
- Add optional reviewer identity only when tied to real profile data and an actual review.
- Validate URLs and dates at build time.
- Do not auto-fill missing publication dates, authors, reviewers, or sources.

Suggested conceptual fields—not a copy-paste schema:

```ts
datePublished: z.date(),
dateModified: z.date().optional(),
author: z.string(),
reviewer: z.string().optional(),
sources: z.array(
  z.object({
    title: z.string(),
    url: z.string().url(),
    publisher: z.string().optional(),
  }),
).optional(),
```

Choose field names that preserve compatibility with the existing collection. Require only data the editorial team can maintain.

### `src/content/blogs/*.md`

- Audit titles, descriptions, H1 behavior, publication dates, author names, and hero-image alt text.
- Add sources close to supported claims and a reference list where useful.
- Set modification dates only after substantive edits.
- Remove unsupported statistics and vague product claims.
- Link to canonical pillar pages and the correct Shopify destination.
- Record qualified review only after the final version was actually reviewed.
- Keep article-specific keywords in content data only when meaningful; do not restore obsolete HTML meta keywords.

### `src/pages/blogs/[slug].astro`

- Render visible updated dates and reviewer data when present.
- Link author and reviewer names to real profile pages.
- Render references accessibly.
- Ensure exactly one meaningful H1.
- Keep article content in generated HTML.
- Pass accurate article data to BlogPosting JSON-LD.
- Add previous/next or related links only when the text describes the destination.

### `src/pages/blog.astro`

- Add RSS/Atom and JSON Feed discovery links through the shared head mechanism.
- Keep the blog collection indexable and self-canonical.
- Ensure cards include descriptive headings, excerpts, dates, and links.
- Avoid pagination or filters that produce duplicate indexable parameter URLs.

### Feed routes

Create static Astro endpoints following the existing project pattern, for example:

- `src/pages/blog/feed.xml.ts` for RSS or Atom;
- `src/pages/blog/feed.json.ts` for JSON Feed.

Both should read from the same Astro content collection and shared canonical helper. Add a build-time duplicate-ID check. If route conventions require different names, preserve the public URLs documented in page discovery links and `llms.txt`.

### `src/pages/blogsList.json.ts`

- Determine whether any current integration consumes it.
- Document its purpose and schema if retained.
- Do not let it conflict with the canonical JSON Feed.
- Deprecate it only after confirming no consumer depends on it.

### `src/layouts/MainLayout.astro`

- Keep canonical, robots, Open Graph, Twitter Card, and JSON-LD generation centralized.
- Add feed autodiscovery where appropriate.
- Make Organization and WebSite identity stable across pages.
- Ensure page types are selected from visible content: WebPage, AboutPage, ContactPage, CollectionPage, or BlogPosting as applicable.
- Include only real Organization properties. Do not invent an address, founding date, or contact details.
- Confirm structured data is emitted once and remains valid after HTML escaping.

### `public/robots.txt`

- Apply the approved crawler matrix.
- Keep the sitemap location correct.
- Do not use it to protect private data.
- Add a review comment or external policy record with the approval date; robots syntax itself should remain simple.

### Optional `public/llms.txt`

- Add only after content and canonical URLs are reviewed.
- Keep it short enough for a human owner to verify line by line.
- Use the exact Shopify URLs listed in this roadmap.
- Treat it as a curated map, not a replacement for the sitemap or feeds.

### Astro sitemap configuration

- Verify the configured `site` origin is `https://eyeagle.ai`.
- Exclude parked, redirect-only, and `noindex` routes.
- Use accurate per-content modification data rather than build time.
- Validate the generated sitemap after the production build.

### Build-time validation

Add a read-only validation command that fails CI for objective errors:

- duplicate or missing canonical URLs;
- missing or duplicate titles and descriptions;
- missing or multiple H1 elements;
- non-indexable pages accidentally present in the sitemap;
- indexable pages absent from the sitemap;
- malformed JSON-LD;
- BlogPosting dates, author, URL, or headline inconsistent with visible content;
- duplicate feed IDs or non-canonical feed URLs;
- missing local image assets;
- product links using retired checkout URLs;
- parked order-details route accidentally returning as a public page.

Warnings rather than failures may be more appropriate for subjective content length or source coverage. Do not turn arbitrary word-count rules into a publishing target.

## Validation checklist before launch

### Crawl and indexing

- [ ] `robots.txt`, sitemap, feeds, and optional `llms.txt` return expected content.
- [ ] Verified search and retrieval crawlers are not blocked by Cloudflare.
- [ ] Every indexable page returns `200` and has one absolute canonical.
- [ ] Redirects resolve in one hop where practical.
- [ ] Parked and private routes are absent from the sitemap and index.

### Page and article data

- [ ] Every generated page has a unique concise title and meta description.
- [ ] Every generated page has exactly one meaningful H1.
- [ ] Heading hierarchy is logical.
- [ ] Social images and alt text describe the actual page.
- [ ] BlogPosting headline, URL, image, author, publisher, and dates match visible content.
- [ ] Structured data passes syntax and eligibility checks without invented fields.
- [ ] Priority article sources are live and support the nearby claims.

### Feeds

- [ ] RSS/Atom and JSON Feed pass standards-aware validators.
- [ ] Item URLs and IDs are canonical and stable.
- [ ] Titles, summaries, authors, images, and dates match article pages.
- [ ] Feed discovery links resolve from generated HTML.
- [ ] Deleted or consolidated posts are handled consistently.

### Commerce

- [ ] Shopify pages show unambiguous price, availability, scope, and policies.
- [ ] Product/Offer data matches visible Shopify content.
- [ ] Merchant feeds use the same canonical URLs and live values.
- [ ] Product images are accessible to crawlers.
- [ ] Audit and Protection Kit CTAs lead to the correct stable product pages.
- [ ] No schema or feed contains fabricated identifiers, reviews, ratings, or coverage.

### Measurement

- [ ] Cloudflare and analytics reporting can identify crawler and AI-referral activity.
- [ ] The prompt benchmark has a documented baseline.
- [ ] Factual representation and destination URL accuracy are recorded.
- [ ] Each recurring report and correction process has an owner.

## Risks and controls

| Risk | Control |
| --- | --- |
| Unsupported safety or medical claims | Require primary sources and qualified review; remove claims that cannot be supported. |
| Structured data or feed mismatch | Generate commerce data from Shopify and compare rendered HTML, JSON-LD, and feeds. |
| Cloudflare blocks legitimate crawlers | Monitor verified crawler traffic and use narrow identity-aware rules. |
| A spoofed crawler receives a security bypass | Do not trust User-Agent alone; use verified-bot signals or published network ranges. |
| Training permission exceeds business intent | Maintain explicit bot groups and a written search-versus-training policy. |
| Mass-produced, low-value content | Require editorial briefs, original expertise, evidence, and consolidation before publishing. |
| Fabricated social proof or identity | Never invent reviews, ratings, credentials, authors, case studies, addresses, or service coverage. |
| Product answer contains old price or stock | Synchronize feeds from Shopify and monitor diagnostics on a fixed schedule. |
| Unstable purchase destinations | Use canonical product pages and let Shopify create checkout after user action. |
| Overreliance on `llms.txt` | Prioritize indexability, visible content, credibility, structured data, and feeds. |
| Direct AI commerce collects excessive personal data | Minimize inputs, require consent, define retention, and conduct privacy/security review. |
| LLM output is mistaken for deterministic ranking | Use repeated benchmark runs and track trends, citations, and factual accuracy. |

## Leadership decisions required

- [ ] Will EyEagle allow model-training crawlers, or allow only live search and user-requested retrieval?
- [ ] Who can approve the crawler policy and future changes?
- [ ] Who is authorized to review senior-safety and health-adjacent claims?
- [ ] Is the Bathroom Fall Risk Assessment free, paid, bookable, geographically limited, or temporarily unavailable?
- [ ] Which Shopify fields are authoritative for price, availability, installation, warranty, returns, and cancellation?
- [ ] Who owns Google Merchant Center, Microsoft Merchant Center, OpenAI Agentic Commerce, and feed diagnostics?
- [ ] Who owns the monthly AI-visibility benchmark and correction backlog?
- [ ] Which customer stories and audit insights may be published with valid consent?
- [ ] Does the business want direct AI-commerce integration after the catalog baseline is stable?

## Definition of done

The first roadmap release is complete only when:

1. approved crawler identities can retrieve representative public pages on both hosts;
2. crawler and training policies are written and owned;
3. RSS/Atom and JSON Feed publish canonical, valid article data;
4. sitemap and modification dates accurately represent published content;
5. priority health-adjacent articles pass evidence and authorship review;
6. Shopify product pages, structured data, and merchant feeds agree;
7. the correct audit and Protection Kit product URLs are used everywhere;
8. the prompt benchmark and operational dashboards have a recorded baseline;
9. recurring ownership and review schedules are active;
10. no invented fact, date, person, rating, review, price, availability, address, or credential is present.

## Sources and further reading

The links below were accessed for preparation on 20 July 2026. Provider documentation and program eligibility must be re-checked immediately before changing crawler rules or implementing feeds.

1. [Overview of OpenAI Crawlers — OpenAI Developers](https://developers.openai.com/api/docs/bots) — purposes and controls for `OAI-SearchBot`, `GPTBot`, and `ChatGPT-User`.
2. [AI features and your website — Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — normal search fundamentals apply to AI search features; no special AI-only markup is required.
3. [Does Anthropic crawl data from the web? — Anthropic Privacy Center](https://privacy.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) — controls for `ClaudeBot`, `Claude-User`, and `Claude-SearchBot`.
4. [Perplexity Crawlers — Perplexity Documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) — identities for `PerplexityBot` and `Perplexity-User`, with current network information.
5. [The `/llms.txt` file — llms.txt proposal](https://llmstxt.org/) — community proposal for a concise LLM-oriented site index.
6. [Article structured data — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/article) — author, author URL, publication date, modification date, and image guidance.
7. [Product structured data — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/product) — Product/Offer, merchant listing, and product feed guidance.
8. [Get started with Agentic Commerce — OpenAI Developers](https://developers.openai.com/commerce/guides/get-started) — product-feed onboarding and current participation path.
9. [IndexNow — Bing Webmaster Tools](https://www.bing.com/webmasters/help/indexnow-0z209wby) — notification of added, updated, and deleted URLs.
10. [Sitemaps — Bing Webmaster Tools](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed) — supported sitemap and feed submission formats.

## Document control

This roadmap should be updated when the crawler policy changes, the public product offer changes, Shopify routes change, a new commerce channel is added, or AI-provider documentation materially changes. Changes should identify the owner, date, reason, and affected implementation areas.

Implementation work should be reviewed through the normal code and content process. This document itself does not authorize deployment, crawler access changes, merchant enrollment, customer-data processing, or publication of new business claims.
