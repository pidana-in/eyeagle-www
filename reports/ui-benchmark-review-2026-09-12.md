# EyEagle UI benchmark review

Reviewed 12 September 2026. Local preview: http://127.0.0.1:4322/. Review only; no website code changed or pushed.

## Assessment

EyEagle has a promising visual foundation: restrained red, warm family photography, a legible sans serif, and a product gallery that makes the hardware tangible. The app hero is particularly effective because the product is visible alongside a short explanation.

The site does not yet feel as coherent as the references. The largest gaps are page rhythm, consistency between migrated and legacy pages, and clarity about what visitors can buy. Reducing every font or increasing every gap will not solve these problems. The spacing needs to communicate which elements belong together, and each section needs a distinct purpose.

## What to learn from the references

| Reference | Observed strength | Application to EyEagle |
| --- | --- | --- |
| [Superpower homepage](https://superpower.com/) | Concise offer near the hero CTA, restrained interface typography, clear product explanation and visible proof sections | State what Guardian-X includes early; keep supporting text compact; place authentic evidence near important claims |
| [Superpower editorial](https://superpower.com/blog/young-healthy-and-at-risk) | Compact split article introduction and a narrower reading column | Separate editorial typography from marketing typography; control reading measure and heading rhythm |
| [Eight Sleep product page](https://www.eightsleep.com/product/pod-cover/) | Clear product name, explanatory gallery, grouped configuration choices, assurance information and persistent total | Make the hardware and configuration the focus of the store; explain each addition visually and keep the total visible |
| [Luffu](https://luffu.com/) | Caregiver-specific language, family imagery, an identifiable product adjacent to the emotional promise, a compact primary navigation | Keep EyEagle's family warmth, but connect it to a concrete installed product and a clear next step |
| [Luffu's day-in-the-life page](https://luffu.com/pages/life-with-luffu) | Specific family situations organised into an everyday narrative | Replace repeated abstract reassurance with a few recognisable situations and demonstrable outcomes |

These are design interpretations, not conversion-performance claims. The references also have busy areas: Superpower's cookie/chat overlays compete with its hero, Luffu uses an automatically changing hero, and Eight Sleep has substantial configuration complexity. Copy their clarity and hierarchy selectively.

## Prioritized findings

### 1. Unify navigation and the buying journey — high priority

The migrated pages use six main links and “Become a member.” The legacy Guardian-X page uses a Products menu, Contact Us and “Get Started,” which leads to an external shop. It also presents “Join the waitlist.” The new store instead invites visitors to configure a purchase.

This makes a navigation click feel like a move to a different version of the business. “Why EyEagle” currently leads to a hardware page, which also weakens the information hierarchy.

Recommendation: use one shared header/footer across the public site, choose one primary purchase action, and label Guardian-X as a product. Establish whether the current journey is ordering, reserving or requesting availability before reconciling the copy. Preserve the underlying old pages while updating their shared presentation.

Evidence: `src/layouts/MainLayout.astro`, `src/components/HomeV3/SiteHeader.astro`, `src/pages/device.astro`, `src/pages/store.astro`.

### 2. Recompose homepage spacing and scrolling — high priority

At the inspected 1280 × 720 desktop viewport, the homepage's main sections total approximately 15,345px before the footer: over 21 viewport heights. Four large story tracks account for roughly 10,260px of that section height. Their combined height beyond one viewport per track is about 7,380px; this is a geometry-based indication of pinned-scroll commitment, not a measured time-to-complete.

The six-step alarm sequence alone is about 4,320px. The system introduction, alarm sequence, family sequence and included section revisit similar response concepts. The stylesheet also applies `min-height: 95svh` to every direct homepage section. This makes short sections occupy a full-screen beat regardless of their content.

Recommendation: keep one signature scroll story, make other explanations normal-flow sections or directly controlled tabs, and remove blanket full-screen minimums. Give a short benefit row less space than a major product demonstration. The user's desire for looser motion should be addressed through transition timing and readable holds, not simply by lengthening every track.

The hero also delays the heading by 2.2 seconds and the CTA by 3.3 seconds before its animation starts. Show the message and action immediately; reserve gradual reveals for secondary media.

Evidence: `src/styles/HomeV3/home.module.css` and the four story stylesheets in that directory.

### 3. Finish the design system beyond font and colour aliases — high priority

Global styles map the older font aliases to Geist and update the primary colours. This is a partial application of the new theme, not a complete application of the new spacing and component system. Legacy pages retain their own layout and chrome. New modules also contain independent fixed paddings, minimum heights and heading sizes.

Recommendation: define and actually consume shared tokens for page gutters, section spacing, heading-to-description spacing, text-to-action spacing and card gaps. Use semantic variants for marketing, product configuration and editorial content. Keep font weight and line length as deliberate hierarchy tools rather than making every heading larger.

Proposed starting values, subject to visual checks: desktop section spacing 80–104px; mobile 48–64px; heading-to-description 16–20px; description-to-action 24–32px; grid gaps 24–32px. These are proposed EyEagle values, not copied measurements from the reference sites.

### 4. Strengthen imagery through specificity — medium/high priority

The warm photography suits the audience. However, large lifestyle sections often rely on dark or white gradients to create text space. Repeated dramatic images make each section feel equally important. Blog thumbnails also contain embedded logos and campaign-style treatments that clash with the quieter page layout.

Recommendation: establish three image roles: accurate hardware photography, understandable app screenshots, and authentic family/installation stories. Compose photos with space for text instead of washing out most of the image. Use consistent crops and remove embedded promotional treatments from editorial images where original assets permit it. Avoid presenting illustrative response-team imagery as proof of actual service operations.

### 5. Make the store more direct — high priority

The split gallery/configuration structure is a good foundation. At 1280 × 720, the long headline occupies three lines, introductory content pushes the actual configuration below the first screen, and the persistent summary uses roughly the bottom 100px of the viewport.

Recommendation: use “Guardian-X” as the main product title with a shorter supporting promise; group price, included bathroom, membership term and configuration closely; add clear visuals showing what an extra bathroom or extra SOS button includes. Reduce the summary bar's desktop height while retaining touch-friendly controls.

The store displays USD, while the app's free plan displays rupees. This is a market/currency ambiguity to resolve, not grounds to assume the provided brochure prices are wrong. The store's current outbound link passes bathroom and SOS counts as URL parameters to an existing shop product; a real checkout preserving selections and prices has not been demonstrated by this review.

### 6. Give blogs an editorial system and editorial content — medium/high priority

The new split feature and narrower article measure are improvements. The remaining weaknesses go beyond font size: lengthy SEO-style decks, mixed thumbnail treatments, repeated headings in article bodies, and an index that presents 42 articles without search, topical filtering or pagination.

The inspected food-delivery article repeats a main heading inside the body after the template's H1. Related stories are selected by recency rather than meaningful topic relevance.

Recommendation: enforce one H1, use H2 for sections and H3 for subsections, edit decks as reader-facing summaries, standardize image ratios, and add a modest topic navigation and pagination. Retain readable 17–18px body text and a roughly 640–680px reading column; avoid copying very small reference text for this audience. Add author/reviewer information only where real attribution exists.

Evidence: `src/pages/blog.astro`, `src/pages/blogs/[slug].astro`, `src/styles/blog-editorial.css`.

### 7. Make confidence visible near decisions — medium/high priority

The references pair reassurance with tangible proof: identifiable experts, customer experiences, product details or founder context. EyEagle currently gives substantial space to promises and response narratives.

Recommendation: prioritize actual installed-device photos, a clear installation process, supported locations, contact access and verified customer experience where available. Reconcile the store's broad response language with the app/solution pages' eligible-alert language. Consistency is especially important in a safety-related product.

## Page-by-page direction

| Area | Keep | Improve first |
| --- | --- | --- |
| Homepage | Family warmth, limited palette, hardware/app connection | Reduce repeated narratives and long pins; reveal offer immediately |
| How it works | Step-based explanation | One clear sequence; optional controls; concise service conditions |
| App | Visible phone UI and clear download action | Reduce repeated reassurance; bring app behaviour and plan differences forward |
| Our Story | Human purpose and origin story | Shorter opening; tighter text-image relationships; fewer fixed-height sections |
| Store | Product gallery, bathroom/SOS controls, visible total | Short title; compact configuration; consistent market and purchase state |
| Guardian-X / Protection | Existing product information | Shared chrome, current CTA language and section rhythm |
| Blog index | Featured article and restrained layout | Cleaner imagery, topical discovery and shorter decks |
| Articles | Reading column and dedicated typography | One H1, consistent content spacing, attribution and relevant related links |

## Recommended sequence

1. Resolve shared navigation, CTA language, product names, purchase state and currency presentation.
2. Rework homepage rhythm using one signature interaction; verify the full journey before adding animation elsewhere.
3. Apply shared layout/component tokens to legacy pages, preserving functionality.
4. Refine store configuration and validate its eventual checkout handoff separately.
5. Finish editorial content and templates, then imagery and motion polish.

Acceptance checks: compare desktop, tablet and phone layouts; inspect short viewport heights; confirm keyboard focus and reduced-motion behaviour; ensure sticky elements do not obscure controls; check primary links remain consistent across old and new pages. These are follow-up checks, not claims that this review completed them.

## Scope and limitations

This is an expert visual and source review, not user research, a performance benchmark or a complete accessibility certification. It uses desktop browser inspection of the local homepage, app, store, product and blog surfaces; source inspection of shared styles, story and legacy pages; and the live reference home/product/editorial pages. Not every article, legal page or interaction was individually tested. Responsive rules were inspected, but this audit does not establish real-device mobile quality. No payment, live order or form submission was made. Website code remains unchanged by the audit.
