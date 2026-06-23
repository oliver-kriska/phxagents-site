---
target: iron-laws.astro
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-06-23T08-23-18Z
slug: src-pages-iron-laws-astro
---
## Critique — src/pages/iron-laws.astro

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active nav + count in lede; no "where am I in 26 laws" cue |
| 2 | Match System / Real World | 3 | Terminology perfect for Elixir devs; "(continued)" muddies category model |
| 3 | User Control and Freedom | 2 | 26-item scroll, no jump-to-category or in-page escape |
| 4 | Consistency and Standards | 2 | "Ecto Iron Laws" renders 5× with "(continued)"; numbering jumps; single-item lists |
| 5 | Error Prevention | 3 | n/a-ish; code blocks render correctly, try/catch fallback exists |
| 6 | Recognition Rather Than Recall | 2 | Finding a law requires recalling its category + scroll-hunt; no index/anchors |
| 7 | Flexibility and Efficiency | 2 | No jump links, no per-law deep-link anchors (detail pages have them) |
| 8 | Aesthetic and Minimalist | 2 | Fragmented bordered headings + redundant h2 = dominant auto-derived tell |
| 9 | Error Recovery | 3 | n/a; no error states |
| 10 | Help and Documentation | 3 | Page is docs, links to source; lacks structure for reference use |
| **Total** | | **25/40** | **Acceptable — content excellent, presentation undersells it** |

### Anti-Patterns Verdict
- Deterministic scan: detect.mjs -> [] (clean). No banned patterns in markup.
- LLM assessment: not templated-AI, but auto-generated-without-curation, its own tell. Plugin CLAUDE.md appends laws chronologically, so the page renders 17 separate h3 headings + 17 fragmented ol islands — "Ecto Iron Laws (continued)" 5x, "LiveView (continued)" 4x, "Elixir (continued)" 4x, several wrapping a single law (ol start=15, 16…). Each gets a full-width top border, reading as a stack of broken dividers. Redundant h2 "Iron Laws Enforcement (NON-NEGOTIABLE)" sits under page h1 + lede (marked output bypasses rehypeShiftHeadings).

### What's Working
- Domain content + terminology genuinely excellent (heuristic 2, the near-4).
- Fully derived at build — count + law text always track the plugin.
- Clean lede framing + source-of-truth link to plugin CLAUDE.md.

### Priority Issues
- [P1] Fragmented category presentation. 26 laws shattered into 17 headings with "(continued)" x9 and single-law lists. Fix: parse section into {n, category, title, body}, regroup by the 8 real categories, preserve real law numbers.
- [P1] No wayfinding across 26 laws. No category index, jump nav, or per-law anchors. Fix: category index (with counts) at top + id/anchor per law.
- [P2] Redundant heading. Drop the marked ## Iron Laws Enforcement h2 — page h1 + lede already frame it.
- [P2] Law numbers buried as plain ol markers; "26 non-negotiable rules" claim not reinforced where laws live.

The fix is one move resolving all four: parse -> regroup -> render crafted layout (category index + numbered law rows + anchors), with marked fallback if upstream format drifts. Content stays 100% derived — zero hand-authored law text.

### Personas
- Jordan (dev evaluating plugin): lands on a wall of "(continued)" dividers; unclear if the page is finished or broken. Can't quickly grasp "what kinds of rules does this enforce."
- Alex (power user): wants one specific law (e.g. money/float); no index, no anchor to link a teammate to it; forced to Ctrl-F.
- Sam (a11y): heading structure is noisy (17 h3s, many for one item); a category index with real landmarks would improve screen-reader navigation.
