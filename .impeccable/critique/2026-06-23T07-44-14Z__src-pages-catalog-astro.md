---
target: src/pages/catalog.astro
total_score: 39
p0_count: 0
p1_count: 0
timestamp: 2026-06-23T07-44-14Z
slug: src-pages-catalog-astro
---
# Critique — src/pages/catalog.astro · post-fix re-score

Follow-up to the 35/40 baseline (same-day). Four fixes shipped (2 a11y P2 + 2 UX P3). Re-scored with rendered evidence + exercised interactions.

## Design Health Score

| # | Heuristic | Score | Δ | Note |
|---|-----------|-------|---|------|
| 1 | Visibility of System Status | 4 | — | Live aria-live count, active states, empty state |
| 2 | Match System / Real World | 4 | — | Plugin vocabulary, namespaces |
| 3 | User Control and Freedom | 4 | +1 | One-click "Clear" (controls, shown when active) + "clear all filters" in the empty state; deep-link + URL sync |
| 4 | Consistency and Standards | 4 | +1 | Filter bars now `role="group"` (was a tablist-without-tabs mismatch); search input is `type="search"` matching the global palette |
| 5 | Error Prevention | 3 | — | Contradictory combos (Agents+phx) still allowed by design — now fully recoverable, but not prevented |
| 6 | Recognition Rather Than Recall | 4 | — | Counts on every filter |
| 7 | Flexibility and Efficiency | 4 | +1 | Filter state now written to the URL (`history.replaceState`) → filtered views are shareable; clear-all is a power affordance |
| 8 | Aesthetic and Minimalist Design | 4 | — | Clean catalog grid (correct affordance) |
| 9 | Error Recovery | 4 | +1 | Empty state now provides the recovery control it previously only described |
| 10 | Help and Documentation | 4 | — | Description on every card |
| **Total** | | **39/40** | **+4** | **Excellent — the strongest page on the site; the one held-back point is Error Prevention (impossible filter combos allowed, but recoverable)** |

## What changed since baseline

- **[P2 resolved] ARIA semantics.** Both filter bars changed from `role="tablist"` (whose children were never `role="tab"`) to `role="group"` with their existing `aria-label`s; the `aria-pressed` toggle buttons are now semantically correct.
- **[P2 resolved] Search input accessible name.** Added `aria-label="Search skills and agents"` and switched `type="text"` → `type="search"` (matches the global palette + gives the native clear affordance). WCAG 4.1.2.
- **[P3 resolved] Clear-filters control.** New `clearAll()` resets type/group/search and refocuses the input; surfaced as a "Clear" button in the controls (hidden until a filter is active) and a "clear all filters" link inside the empty state — closing the loop the empty copy already promised.
- **[P3 resolved] Shareable filtered views.** `update()` now writes `?type/?group/?q` back to the URL via `history.replaceState`, complementing the pre-existing deep-link-in. Verified: filter → URL updates; clear → URL empties.

## Verification

- detect.mjs src/pages/catalog.astro → `[]`
- npm run build:local → 82 pages
- Interactions exercised: roles=group, type=search; clear hidden initially → shows on filter → resets to 75 + hides + clears URL; search "oban" → 1 result + URL `q`; all text passes WCAG AA both themes (muted 5.23 light / 6.52 dark)
