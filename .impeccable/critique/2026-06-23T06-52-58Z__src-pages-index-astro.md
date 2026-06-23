---
target: src/pages/index.astro
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-06-23T06-52-58Z
slug: src-pages-index-astro
---
# Critique — src/pages/index.astro (homepage) · post-polish re-score

Follow-up to the 32/40 baseline (2026-06-23T06-02-25Z). Six fixes shipped (quieter → typeset → layout → clarify → colorize → polish). This snapshot re-scores against the same heuristics with rendered light+dark evidence at 1256px.

## Design Health Score

| # | Heuristic | Score | Δ | Note |
|---|-----------|-------|---|------|
| 1 | Visibility of System Status | 3 | — | Static page; hover/active states + live star count |
| 2 | Match System / Real World | 4 | — | Phoenix fluency intact; new proof chips reinforce it |
| 3 | User Control and Freedom | 3 | — | Nav, Cmd-K search, Esc; no traps |
| 4 | Consistency and Standards | 4 | +1 | Radii snapped to 4/6/10 scale; gradient-text + glow gone; client colors documented as ignore-values. Flat-at-rest language now consistent |
| 5 | Error Prevention | 3 | — | n/a — no forms/destructive actions |
| 6 | Recognition Rather Than Recall | 4 | — | Iron Laws now glossed inline in the lede |
| 7 | Flexibility and Efficiency | 3 | — | `/` search shortcut, visible focus, star widget |
| 8 | Aesthetic and Minimalist Design | 4 | +2 | All three saturated AI tells removed: gradient text → solid accent; per-section eyebrows → H2-led; identical 6-card grid → bento (2 featured proof-chip cards + 4 compact). Hero glow cut |
| 9 | Error Recovery | 3 | — | n/a |
| 10 | Help and Documentation | 4 | — | Docs nav, catalog, search, terminal demo, contextual links |
| **Total** | | **35/40** | **+3** | **Good (upper) — the AI-slop tells that capped the baseline are gone; remaining points are dimensions the fixes didn't target** |

## What changed since baseline

- **[P1 resolved] Gradient text** — `h1.headline em` now `font-style: normal; color: var(--accent-fg)` (solid green). No `background-clip: text`. Confirmed light + dark.
- **[P1 resolved] Per-section eyebrows** — the three `.label` kickers (WHY PHXAGENTS / THE WORKFLOW / SUPPORTED CLIENTS) removed; each section leads with its H2. One deliberate hero kicker kept (voice, not scaffold).
- **[P1 resolved] Identical card grid** — `.features` is now a 4-col bento: the two conversion features (Iron Laws, Parallel review) span 2 cols and carry concrete proof chips (`no Repo in loops` / `no bare rescue` / …; `elixir-reviewer` / `security-analyzer` / …); the remaining four are compact. Responsive collapse at 900/600px.
- **[P2 resolved] Light-theme amber contrast** — added `--warn-fg` token (light `oklch(50% 0.12 65)`, dark `oklch(78% 0.15 80)`); `.status-coming` text uses it, dot stays `--warn`. Computed contrast now **6.16:1 light / 8.88:1 dark** (was 2.73:1 light fail).
- **[P2 resolved] Token drift** — `.term` 12px → `var(--radius-lg)`; `.feature-icon` + `.client-mark` 8px → `var(--radius)`. The 8 per-client logo-mark colors registered as `detector.ignoreValues` (`.impeccable/config.json`, reason: external client brand mark) rather than polluting the core palette. `detect.mjs` now returns `[]`.
- **Voice/GEO tension resolved (deliberate)** — the "best AI coding agent for Elixir and Phoenix" keyword is kept but reframed as an *earned conclusion* at the end of a specificity-first lede, not the opening superlative. Matches "specialist, not superlative" while preserving the GEO placement.
- **Stat de-ambiguated** — "1 / 4 · AI clients" → "1 · AI client live · 3 in v3.0" (no longer reads as "only 1 of 4 works").

## Remaining (not blocking — would move 35 → higher)

- No imagery/illustration; the page is all type + the terminal mock. Fine for "The Field Manual," but a single credible diagram could lift Aesthetic toward 5.
- Stats band still uses the big-number motif — saved by being real, linked data; keep an eye on it.
- True 390px mobile overflow still unverified (Chrome clamps the test window). Verify on a real device before treating mobile as signed off.

## Verification

- `detect.mjs --json src/pages/index.astro` → `[]` (clean).
- `npm run build:local` → 82 pages, no errors.
- Rendered light + dark at 1256px; computed contrast via canvas OKLCH→sRGB.
