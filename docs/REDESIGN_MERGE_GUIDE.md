# EyEagle website redesign merge guide

Last verified: 14 September 2026

This guide explains how to land the reviewed website redesign branches safely. The pull requests form a stack, so merging them independently or squashing the early branches can make later pull requests show duplicate changes.

## Pull request map

```text
main
└── #263 codex/nav-footer
    └── #264 codex/homepage-redesign
        ├── #265 codex/contact-redesign
        └── #266 codex/solution-redesign
            └── #267 codex/our-story-redesign
                └── #268 codex/store-redesign
                    └── #269 codex/protection-redesign
                        └── #270 codex/assessment-redesign
```

| Order | PR | Branch | Current base | Main scope |
| ---: | --- | --- | --- | --- |
| 1 | [#263](https://github.com/pidana-in/eyeagle-www/pull/263) | `codex/nav-footer` | `main` | Shared navigation and footer |
| 2 | [#264](https://github.com/pidana-in/eyeagle-www/pull/264) | `codex/homepage-redesign` | `codex/nav-footer` | Homepage and shared visual foundation |
| 3 | [#265](https://github.com/pidana-in/eyeagle-www/pull/265) | `codex/contact-redesign` | `codex/homepage-redesign` | Contact page |
| 4 | [#266](https://github.com/pidana-in/eyeagle-www/pull/266) | `codex/solution-redesign` | `codex/homepage-redesign` | How EyEagle Works page |
| 5 | [#267](https://github.com/pidana-in/eyeagle-www/pull/267) | `codex/our-story-redesign` | `codex/solution-redesign` | Our Story page and corrected device imagery |
| 6 | [#268](https://github.com/pidana-in/eyeagle-www/pull/268) | `codex/store-redesign` | `codex/our-story-redesign` | Store, setup preview, and availability signup |
| 7 | [#269](https://github.com/pidana-in/eyeagle-www/pull/269) | `codex/protection-redesign` | `codex/store-redesign` | Bathroom Protection page and assessment journey |
| 8 | [#270](https://github.com/pidana-in/eyeagle-www/pull/270) | `codex/assessment-redesign` | `codex/protection-redesign` | Home Safety Assessment form UI |

PR [#214](https://github.com/pidana-in/eyeagle-www/pull/214) is unrelated to this redesign stack and is not part of this sequence.

## Recommended merge policy

Use **Create a merge commit** for this stack. Keep each parent branch until all dependent pull requests have been moved to `main`. This preserves the shared ancestry and keeps each review focused on its own page.

Do not use **Squash and merge** for the parent pull requests unless the engineer handling the stack is prepared to rebase every dependent branch with `--onto` and force-push with lease.

## Merge procedure

Merge the pull requests in the table order. After each merge:

1. Pull the new `main` locally.
2. Merge `origin/main` into the next branch.
3. Push the updated branch.
4. Change that pull request's base to `main`.
5. Confirm that the PR now contains only its intended scope.
6. Run CI and smoke-test the relevant route before merging it.

Use this command pattern for each next branch:

```bash
git fetch origin
git switch <next-branch>
git merge origin/main
git push origin <next-branch>
gh pr edit <pr-number> --base main
```

The deterministic sequence is:

1. Merge #263.
2. Update and retarget #264, then merge it.
3. Update and retarget #265, then merge it.
4. Update #266 from the latest `main`, which now includes Contact; retarget and merge it.
5. Repeat for #267, #268, #269, and #270.

#265 and #266 are sibling branches from the Homepage branch. Merging Contact first and then updating Solution from `main` gives the team one predictable sequence.

Do not delete a merged branch until its direct children have been updated and retargeted. After #270 is merged and production smoke checks pass, the redesign branches can be deleted.

## If squash merge is mandatory

For each child branch, replay only the child-specific commits on top of the newly updated `main`:

```bash
git fetch origin
git switch <child-branch>
git rebase --onto origin/main origin/<old-parent-branch> <child-branch>
git push --force-with-lease origin <child-branch>
gh pr edit <pr-number> --base main
```

Inspect the full diff before pushing. Use `--force-with-lease`, never an unrestricted force push. Coordinate the rewrite with anyone who has the branch checked out.

## Conflict rules

- Keep the newer shared header, footer, typography tokens, and layout behavior from the redesign stack.
- For page-specific conflicts, keep the implementation from that page's PR.
- The App link is intentionally absent from navigation and the footer. `/app` remains directly accessible but is marked `noindex` while the page is being revised.
- The Store header intentionally shows only the EyEagle logo.
- Do not reintroduce gallery numbering on the Store page.
- Do not alter the assessment form payload, validation rules, API path, or submission behavior while resolving its UI files.
- Do not commit generated `dist`, `.astro`, or `.netlify` output.

If a shared file conflict is unclear, stop that merge and compare the parent and child PR scopes before choosing a side. Do not resolve a broad shared-file conflict by accepting an entire file without checking the page-specific changes inside it.

## Validation for every branch

```bash
npm ci
npm run check
npm run lint
npm run build
```

`astro check` currently reports one existing informational hint: `SHOP_URLS` is unused in `src/components/NewHome/StepsSection.astro`. It is not an error introduced by this redesign.

## Route smoke-test checklist

- `/`: desktop and mobile header, primary CTA, major sections, and footer.
- `/contact`: contact options, form validation, and responsive layout.
- `/solution`: story flow, interactive sections, and responsive typography.
- `/about-us`: full hero image is visible without cropping; the correct EyEagle alarm device appears in the response scene.
- `/store`: logo-only header; gallery tabs; no slide numbering; price starts at `$799`; bathroom and extra SOS controls stop at three; totals update correctly; renewal states `$20/month` only with approval.
- `/protection`: Bathroom Protection CTA leads to the assessment; FAQ styling matches the shared site pattern.
- `/assessment-form`: all fields use the red active state; country selection updates the dial code; mobile phone input remains full width; validation messages work; a staging submission reaches the configured backend.
- Confirm the App link is absent from the header and footer across the redesigned routes.

## Deployment configuration and launch decisions

- Set `STORE_WAITLIST_API_URL` in the deployment environment before testing the Store availability form. The endpoint is server-only and must not be exposed to the browser.
- `src/utils/urls.ts` currently points assessment submissions at `https://uat.eyeagle.ai`. Confirm and change this to the approved production API before the production deployment.
- Store ordering remains unavailable and the page is currently `noindex`. Enabling live ordering and search indexing is a separate launch decision.
- Country-based pricing from the visitor's IP is intentionally deferred. The current Store preview uses USD and excludes GST.

Test both forms in staging with approved test records before production. Confirm the Store signup creates an availability lead and the assessment creates the expected CRM opportunity and notification.

## Final production check

After #270 is merged:

1. Run the complete validation suite from `main`.
2. Deploy to staging from the exact `main` commit intended for production.
3. Complete the route checklist at desktop and mobile widths.
4. Test both form integrations with approved test data.
5. Confirm environment variables and the assessment API target.
6. Deploy that same commit to production.
7. Repeat the critical smoke checks on production.

If a rollback is needed, revert merge commits in reverse order, beginning with the most recently merged redesign PR. Keep the remote branches until the production verification window is complete.
