---
target: skill/agent detail template (DocsLayout.astro)
total_score: 38
p0_count: 0
p1_count: 0
timestamp: 2026-06-23T08-00-55Z
slug: src-components-docslayout-astro
---
# Critique — skill/agent detail template · post-fix re-score

Follow-up to the 33/40 baseline (same-day). Three fixes shipped to DocsLayout + site.js, applying to all 75 detail pages. Re-scored on `/skills/plan/` + `/agents/elixir-reviewer/`.

## Design Health Score

| # | Heuristic | Score | Δ | Note |
|---|-----------|-------|---|------|
| 1 | Visibility of System Status | 4 | +1 | Code/synopsis copy buttons now confirm "Copied"; + breadcrumbs, active nav, prev/next |
| 2 | Match System / Real World | 4 | — | Pills, synopsis, breadcrumbs |
| 3 | User Control and Freedom | 4 | +1 | Heading anchors let you jump within / deep-link sections, alongside prev/next + breadcrumbs |
| 4 | Consistency and Standards | 4 | +1 | Code blocks now carry copy buttons like the hand-authored pages; prose measure matches the 640px lede |
| 5 | Error Prevention | 3 | — | n/a (static) |
| 6 | Recognition Rather Than Recall | 4 | — | Sidebar groups, breadcrumbs, pills |
| 7 | Flexibility and Efficiency | 4 | +1 | One-click copy for the core "run this command" action; anchors for deep-linking; + search/prev-next |
| 8 | Aesthetic and Minimalist Design | 4 | +1 | Prose capped 86ch → 72ch (within the 65–75ch rule) — comfortable read on the highest-traffic pages |
| 9 | Error Recovery | 3 | — | n/a |
| 10 | Help and Documentation | 4 | — | Source link, structured sections, JSON-LD |
| **Total** | | **38/40** | **+5** | **Excellent — the 75 content pages are now as polished as the conversion surfaces** |

## What changed since baseline

- **[P2 resolved] Prose measure.** Capped `.docs-body` p/ul/ol/blockquote at 640px (≈72ch, matching the lede); `pre`/`table` and the h3 section dividers keep full width. Measured 86ch → 72ch.
- **[P2 resolved] Copy buttons.** site.js now injects a subtle "Copy" button into every rendered `<pre>` and the synopsis (skipping the hand-authored `.code-block`s that already have one). Verified: button copies the exact command text and flips to "Copied". 4 buttons on `/skills/plan/`.
- **[P3 resolved] Heading anchors.** Hover/focus-revealed `#` link on every `h3`/`h4` (build-emitted ids), enabling section deep-links. 10 anchors on `/skills/plan/` with correct `#slug` hrefs.

## Verification

- detect.mjs route files → `[]`; build:local → 82 pages
- `/skills/plan/`: prose 640px/72ch; 4 copy buttons (incl. synopsis); 10 heading anchors; copy handler captures exact command text (spied)
- `/agents/elixir-reviewer/`: template adapts (model/tools pills, no synopsis); same enhancements apply
- All text passes WCAG AA both themes (carried over from baseline measurement)
