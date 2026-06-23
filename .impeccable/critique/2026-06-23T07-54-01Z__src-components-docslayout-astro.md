---
target: skill/agent detail template (DocsLayout.astro)
total_score: 33
p0_count: 0
p1_count: 0
timestamp: 2026-06-23T07-54-01Z
slug: src-components-docslayout-astro
---
# Critique — skill/agent detail template (DocsLayout.astro + skills/[...slug] + agents/[...slug])

The template behind **75 of the site's 82 pages** — the content users land on from Google, search, and the catalog. Assessment A (design review) + Assessment B (detect + rendered light/dark on a representative skill `/skills/plan/` AND agent `/agents/elixir-reviewer/`, measured prose width + contrast).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Breadcrumbs + active sidebar state + prev/next give good location sense; no copy feedback (no copy buttons exist) |
| 2 | Match System / Real World | 4 | Pills (kind/effort/model/tools), synopsis shows the real invocation, breadcrumbs natural |
| 3 | User Control and Freedom | 3 | prev/next + breadcrumbs + sidebar; but long multi-section pages have no in-page TOC/anchors to jump within |
| 4 | Consistency and Standards | 3 | Same shell/tokens as the site, BUT rendered code blocks lack the copy buttons the hand-authored install/index pages have, and body prose isn't measure-capped like the 640px lede |
| 5 | Error Prevention | 3 | n/a — static content |
| 6 | Recognition Rather Than Recall | 4 | Sidebar groups every skill/agent, breadcrumbs, pills, prev/next — nothing to memorize |
| 7 | Flexibility and Efficiency | 3 | Search + prev/next + sidebar are accelerators; but the core "copy a command" action has no button, and no heading anchors for deep-linking sections |
| 8 | Aesthetic and Minimalist Design | 3 | Clean + on-brand, but prose runs 86ch — wide/loose lines hurt readability (the site's own rule is 65–75ch) |
| 9 | Error Recovery | 3 | n/a |
| 10 | Help and Documentation | 4 | These pages ARE the docs; source link, structured sections, contextual links, JSON-LD TechArticle |
| **Total** | | **33/40** | **Good — a solid, well-structured template; the gaps (line length, copy buttons, anchors) are readability/utility on the highest-traffic pages** |

## Anti-Patterns Verdict

**LLM assessment:** Not AI slop. Strong information design — breadcrumbs, typed pills, a synopsis block for skills, source-on-GitHub, prev/next, per-entity JSON-LD. The template correctly adapts skill (synopsis + namespace pill) vs agent (model + tools pills). The weaknesses are typographic/utility, not aesthetic-reflex.

**Deterministic scan (detect.mjs):** `[]` on the route files; DocsLayout.astro is on the ignoreFile list (its only flagged construct is the sanctioned blockquote side-stripe).

**Browser evidence (skill + agent, light + dark):** Prose paragraph measured at **86 characters** wide (760px @ 14.5px). Rendered markdown has 3 `<pre>` code blocks and **0 copy buttons**. 9 `<h3>` sections, **no anchors**, no TOC. All text passes WCAG AA both themes (body 10.3:1; crumbs/pager muted 5.2 light / 6.5 dark; inline code 14–16:1).

## Overall Impression

This is good documentation architecture let down by three fixable details on the pages that get the most traffic. The single biggest win: **cap the prose measure** — 86ch is the difference between "reference doc" and "comfortable read," and it's one rule applied once that improves all 75 pages. Close behind: **copy buttons on code blocks** (skills literally show commands to run) and **heading anchors** for deep-linking long pages.

## What's Working

1. **The template adapts intelligently.** Skills get a synopsis block + namespace pill; agents get model + tools pills. Breadcrumbs, source-on-GitHub, prev/next, and per-entity JSON-LD (BreadcrumbList + TechArticle) are all present and correct.
2. **Strong location awareness.** Breadcrumbs + active sidebar highlight + prev/next means you always know where you are and where to go next across 75 pages.
3. **Contrast + theming are solid.** Every text role passes AA in both themes; the muted crumbs/pager benefit from the recent `--muted` dark bump.

## Priority Issues

- **[P2] Body prose runs 86ch.** `.docs-body` text has no measure cap (the cmd-head lede caps at 640px; the body doesn't), so paragraphs stretch to the full 760px column = ~86 characters/line. The site's own DESIGN rule is 65–75ch; long lines measurably hurt readability — on the highest-traffic pages. **Fix:** cap prose elements (p, ul, ol, h3, h4, blockquote) at ~70ch while letting `pre`/`table` keep more width. **Command:** `/impeccable typeset`.
- **[P2] Code blocks have no copy buttons.** Rendered markdown `<pre>` (and the synopsis invocation) are the most copy-worthy content on the site — skills show the exact commands to run — yet they have no copy affordance, while the hand-authored install/index pages do. Inconsistent + a real utility gap. **Fix:** inject copy buttons into `.docs-body pre` and `.synopsis` (one site.js pass, applies to all 75 pages). **Command:** `/impeccable polish`.
- **[P3] No heading anchors or in-page TOC.** `/skills/plan/` has 9 sections with no way to deep-link or jump within the page (the sidebar is the global nav, not the current page's outline). h3 already has `scroll-margin-top`, so anchors are cheap. **Fix:** clickable heading anchor links (hover-revealed `#`); a TOC is a larger optional follow-up. **Command:** `/impeccable layout`.

## Persona Red Flags

**Jordan (first-timer):** Lands on a skill from Google, sees the command in a code block, and has to hand-select it to copy — no button, unlike everywhere else he's seen on the site. Small friction, repeated across every skill.

**Alex (power user):** Wants to deep-link a colleague to a specific section of a long skill doc — can't, no anchors. Reads fast and the 86ch lines slow his scan.

**Sam (screen-reader/keyboard):** Template is good for him — breadcrumbs, landmarks, prev/next labeled, heading hierarchy correct (one h1, shifted h3/h4). Adding anchored headings would further help section navigation.

**Priya (senior Phoenix engineer — project persona):** These pages are where she actually evaluates depth. The content + source link + synopsis win her; the wide measure makes long reviews slightly tiring, and she'd expect to copy example commands directly.

## Minor Observations

- The synopsis `<pre>` is a prime copy target (the exact invocation) — include it in the copy-button pass.
- A right-rail or top "On this page" TOC would help the longer skills (some have 9+ sections); lower priority than the three above.
- Consider `text-wrap: pretty` on body paragraphs once the measure is capped, to reduce orphans.

## Questions to Consider

- Should the prose measure match the lede's 640px exactly (one shared content width), or stay slightly wider for tables/code?
- Worth a lightweight auto-generated TOC for skills above N sections, or are anchors enough?
