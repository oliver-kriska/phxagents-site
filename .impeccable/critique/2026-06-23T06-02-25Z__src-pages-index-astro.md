---
target: src/pages/index.astro
total_score: 32
p0_count: 0
p1_count: 3
timestamp: 2026-06-23T06-02-25Z
slug: src-pages-index-astro
---
# Critique — src/pages/index.astro (homepage)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Hover/active states + live GitHub count present; static page, little to report |
| 2 | Match System / Real World | 4 | Speaks Phoenix fluently (contexts, Ecto.Multi, Oban); terminal mock mirrors real CLI |
| 3 | User Control and Freedom | 3 | Clear nav, Cmd-K search with Esc; no traps |
| 4 | Consistency and Standards | 3 | Strong system, but off-scale radii (8/12px) + gradient-text/glow break the flat language |
| 5 | Error Prevention | 3 | n/a — no forms or destructive actions on this page |
| 6 | Recognition Rather Than Recall | 4 | Everything visible; labeled nav; search palette; meta links |
| 7 | Flexibility and Efficiency | 3 | `/` search shortcut, visible focus, star widget |
| 8 | Aesthetic and Minimalist Design | 2 | Gradient text, per-section eyebrows, 6 identical cards, hero glow — decorative tells compete |
| 9 | Error Recovery | 3 | n/a — no error surfaces |
| 10 | Help and Documentation | 4 | Docs nav, catalog, search, terminal demo, contextual links throughout |
| **Total** | | **32/40** | **Good — solid foundation, specific AI-slop tells + one a11y fail hold it back from excellent** |

## Anti-Patterns Verdict

**LLM assessment:** It does *not* read as obviously AI-generated at a glance — the design system is genuinely good (cool-neutral palette, disciplined mono, the terminal mock is a real differentiator). But three saturated AI tells are present: (1) gradient text on the hero's key words, (2) a tiny uppercase tracked eyebrow above every section, (3) a 3×2 grid of identical icon+heading+text feature cards. Each is individually on the absolute-ban / anti-reference list from PRODUCT.md.

**Deterministic scan (detect.mjs):** 10 advisories, all design-system token drift — 7 undocumented colors (the per-client logo-mark gradients, lines 246/256/266/276) and 3 off-scale radii (12px term, 8px feature-icon + client-mark). The detector did NOT flag the gradient text or the per-section eyebrows; those are LLM-review catches. Detector and review agree on "system discipline is slightly leaking."

**Visual evidence (rendered, light + dark, 1440px):** Confirmed the gradient text on "Claude Code", the repeating eyebrows, and the identical card wall. Computed-contrast audit: nearly everything passes AA ≥5:1 in both themes — **one fail: `.status-coming`** ("v3.0 · in review" amber) at **2.73:1 in light theme** (dark passes at 8.88). Dark mode is notably strong and arguably the better fit for the brand. No horizontal overflow at desktop widths; true 390px mobile could not be force-tested (Chrome clamped the window), so mobile overflow is unverified.

## Overall Impression

This is a well-built, on-brand landing that mostly earns its "precise, opinionated, fast" voice — the terminal demo and the specific agent/Iron-Law naming are the credible proof a skeptical Phoenix engineer wants. What holds it back is a handful of reflexive marketing-template moves that quietly undercut the "specialist, not superlative" positioning, plus one light-theme contrast fail. The single biggest opportunity: strip the three AI tells (gradient text, per-section eyebrows, identical card grid) so the craft does the talking.

## What's Working

1. **The terminal mock is the hero's best asset.** Showing real agent names (`phoenix-patterns-analyst`, `ecto-schema-designer`, `oban-specialist`) doing a real `/phx:plan` is concrete proof, not a claim. This is "show, don't tell" executed well.
2. **Domain fluency + contrast discipline.** Copy speaks to working Phoenix devs without dumbing down; computed contrast passes AA almost everywhere in both themes — rare for an AI-built page.
3. **The workflow strip.** The numbered Plan→Work→Review→Compound list is the one place numbers are legitimately a sequence, and it's a denser, non-card layout that breaks up the page well.

## Priority Issues

- **[P1] Gradient text on the hero's most important words.** `h1.headline em` clips an accent→violet gradient onto "Claude Code" (index.astro:354). It's an absolute ban and your own anti-reference, applied to the brand's key noun, and gradient fill makes legibility/contrast vary across the word. **Fix:** solid `--fg` for the whole headline; if one word needs emphasis use a single solid accent or weight, not a gradient. **Command:** `/impeccable quieter`.
- **[P1] Uppercase tracked eyebrow above every section.** Hero "V2.12.0…", then "WHY PHXAGENTS", "THE WORKFLOW", "SUPPORTED CLIENTS". Per-section eyebrows are the saturated AI scaffold. **Fix:** drop them; lead with the H2. Keep at most the hero one, or replace with a distinctive cadence. **Command:** `/impeccable typeset`.
- **[P1] Identical feature-card grid (6 × icon+heading+text).** The SaaS-cliché card wall and an explicit anti-reference. **Fix:** break the uniformity — let the one conversion-driving feature own a larger cell, or demote some cards to a denser list (as the workflow strip already does). **Command:** `/impeccable layout`.
- **[P2] Light-theme contrast fail: `.status-coming` amber at 2.73:1.** The "v3.0 · in review" client labels (dark theme passes). **Fix:** use a darker amber-fg on light (mirror the `accent-fg`-on-`accent-soft` pattern) or pair text with the soft tint. **Command:** `/impeccable colorize`.
- **[P2] Design-system token drift.** 8px/12px radii off the 4/6/10 scale; 7 undocumented client-mark colors. **Fix:** the client-mark brand colors are legit — document them in DESIGN.md; snap stray radii to `--radius-lg` (10px) or add a token. **Command:** `/impeccable polish`.

## Persona Red Flags

**Jordan (new to AI agents, not to Phoenix):** "Iron Laws" and "the judge agent blocks PRs" appear before any one-line definition on the page (they link out to /iron-laws). He gets the Phoenix terms but not the plugin's own vocabulary. Minor — a single inline gloss would fix it.

**Riley (stress-tester):** The "1 / 4 · AI clients · 3 in v3.0" stat reads ambiguously as "only 1 of 4 works," which *undersells*. The "best AI coding agent" superlative invites the obvious "says who?" challenge.

**Casey (mobile):** Couldn't force a 390px viewport to verify, but the meta-line and eyebrow use small dashed-underline link targets (<44px) that are thumb-risky; the hero collapses to one column at ≤980px and CTAs stay reachable.

**Priya (senior Phoenix engineer evaluating the plugin — project persona):** Scans for credibility. The terminal mock and specific Iron-Law examples win her over. But the **bold hero lede leads with "phxagents is the best AI coding agent for Elixir and Phoenix"** — the exact superlative your brand voice says to avoid ("specialist, not superlative"). It's a deliberate GEO keyword placement, so this is a real tension between SEO and voice, not a bug — worth a conscious decision.

## Minor Observations

- Hero `::before` radial glow (accent + violet) is near-invisible in light mode — commit to it or cut it.
- Headline uses manual `<br>` hard breaks; `text-wrap: balance` would be more robust across widths.
- Stats band (4 big numbers + labels) flirts with the hero-metric template; it's saved by being real, linked data — keep an eye on it.
- The terminal mock is static; fine as a "screenshot," no action needed.

## Questions to Consider

- Your voice is "specialist, not superlative," but the lede leads with "the best AI coding agent." Keep the superlative as a deliberate GEO play, or lead with specificity and place the keyword lower?
- Dark mode suits "The Field Manual" better than light — should dark be the default, or at least the hero's art direction?
- If the 6 feature cards weren't all the same size, which ONE feature converts a skeptical Phoenix engineer — and could it own a larger cell?
