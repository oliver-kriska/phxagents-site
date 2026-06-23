---
target: src/pages/install.astro
total_score: 36
p0_count: 0
p1_count: 0
timestamp: 2026-06-23T07-27-38Z
slug: src-pages-install-astro
---
# Critique — src/pages/install.astro · post-fix re-score

Follow-up to the 34/40 baseline (same-day). Two fixes shipped from the critique backlog (layout + clarify/colorize). Re-scored with rendered light/dark evidence.

## Design Health Score

| # | Heuristic | Score | Δ | Note |
|---|-----------|-------|---|------|
| 1 | Visibility of System Status | 4 | — | Copy buttons confirm; status dots now show shipped vs pending at a glance |
| 2 | Match System / Real World | 4 | — | Real commands, Phoenix-fluent |
| 3 | User Control and Freedom | 3 | — | Static page; no traps (inherent ceiling) |
| 4 | Consistency and Standards | 4 | +1 | Client status now reads "v3.0 · in review" identically to the homepage; dot affordance matches the home client cards |
| 5 | Error Prevention | 3 | — | "one at a time" guidance; n/a otherwise |
| 6 | Recognition Rather Than Recall | 4 | — | Everything visible; labeled nav; copy buttons |
| 7 | Flexibility and Efficiency | 3 | — | Copy + `/` search are the right accelerators |
| 8 | Aesthetic and Minimalist Design | 4 | +1 | catchup detour removed from the conversion flow → page stays focused on getting phxagents in; catchup is now a clean end-aside marked "Not required" |
| 9 | Error Recovery | 3 | — | n/a |
| 10 | Help and Documentation | 4 | — | Task-focused docs; /phx:intro, contextual links |
| **Total** | | **36/40** | **+2** | **Excellent band — a focused, consistent, functional install page; remaining 3s are inherent to a static install page (no forms/errors/power-features to score higher)** |

## What changed since baseline

- **[P2 resolved] catchup no longer interrupts the conversion flow.** Running order is now Installation → What gets installed → After install → Client support → "Also in this marketplace: catchup" (end). Heading renamed from "Companion plugin" and tagged "Not required for phxagents" so a first-timer can't mistake it for a required step.
- **[P2 resolved] Status wording standardized.** Client table now says "v3.0 · in review" (was "in development"), matching the homepage and the page's own lede ("land in v3.0").
- **[P3 resolved] Status affordance added.** New `.cstat` indicator: green dot + "shipped (vX)" for Claude Code, amber dot + "v3.0 · in review" for the rest — reusing `--accent`/`--accent-fg` and `--warn`/`--warn-fg`, the same tokens as the homepage client cards.

## Routed elsewhere

- Dark-theme `--muted` mono labels (table th + code-head) at 4.61:1 — passes AA but thin margin. Shared token → handled in the audit task (index + shared shell), not here.

## Verification

- detect.mjs src/pages/install.astro → `[]`
- npm run build:local → 82 pages
- Rendered light + dark at 1256px; reorder + status dots confirmed visually
