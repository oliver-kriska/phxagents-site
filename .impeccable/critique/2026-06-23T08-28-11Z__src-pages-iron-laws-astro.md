---
target: iron-laws.astro
total_score: 36
p0_count: 0
p1_count: 0
timestamp: 2026-06-23T08-28-11Z
slug: src-pages-iron-laws-astro
---
## Re-critique — src/pages/iron-laws.astro (post-fix)

### Design Health Score

| # | Heuristic | Score | Note |
|---|-----------|-------|------|
| 1 | Visibility of System Status | 4 | per-category counts + :target "you are here" on deep-link |
| 2 | Match System / Real World | 4 | 8 clean categories match dev mental model, no "(continued)" |
| 3 | User Control and Freedom | 3 | jump-to-category + per-law permalinks (no in-page search) |
| 4 | Consistency and Standards | 4 | one heading per category, uniform law-row pattern |
| 5 | Error Prevention | 3 | n/a; marked fallback retained for upstream format drift |
| 6 | Recognition Rather Than Recall | 4 | index + counts + anchors → nothing to recall |
| 7 | Flexibility and Efficiency | 3 | per-law permalinks to share/deep-link a specific law |
| 8 | Aesthetic and Minimalist | 4 | crafted, rhythmic; dominant auto-derived tell gone |
| 9 | Error Recovery | 3 | n/a; no error states |
| 10 | Help and Documentation | 4 | genuinely usable reference w/ index + permalinks + source link |
| **Total** | | **36/40** | **Excellent (+11 from 25)** |

### What changed
- Rewrote iron-laws.astro to parse the derived CLAUDE.md section into structured laws ({n, title, body}) and regroup by the 8 real categories, preserving real law numbers. Content stays 100% derived — zero hand-authored law text.
- Added a category index (8 pills w/ counts) for wayfinding; per-law id anchors (#law-N) + clickable number permalinks; :target highlight; scroll-margin offset clears the sticky nav.
- Dropped the redundant "## Iron Laws Enforcement" h2 (page h1 + lede already frame it).
- Rendered the "Violation Response" block as a closing callout (full border, not a side-stripe).
- Kept a marked() fallback if parsing ever yields zero laws.

### Verified
- Build: 82 pages. detect.mjs -> [] (clean).
- Parsing: 26 laws -> 8 categories (LiveView 6, Ecto 6, Oban 3, Security 3, OTP 2, Elixir 4, Verification 1, Code Style 1).
- Light contrast: num 5.23, title 16.52, desc 10.31, index 10.31 — all pass 4.5:1.
- Dark contrast: num 6.52, title 16.29, desc 10.40, index 10.40 — all pass.
- Anchor jump to #law-4 scrolls correctly with sticky-header offset; :target highlight applies in both themes.

### Remaining (inherent to a static reference; 3s are fair)
- No in-page search/filter within the laws (site-wide search palette covers discovery).
