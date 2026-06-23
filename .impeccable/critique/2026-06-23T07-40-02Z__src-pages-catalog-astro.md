---
target: src/pages/catalog.astro
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-06-23T07-40-02Z
slug: src-pages-catalog-astro
---
# Critique — src/pages/catalog.astro (catalog / discovery surface)

Assessment A (design review) + Assessment B (detect.mjs + rendered light/dark evidence, exercised filtering logic, canvas contrast). The "findable beats average" surface — search + type filter + namespace filter over all 75 skills/agents.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Live "N shown · 75 total" with aria-live; active filter states; empty state |
| 2 | Match System / Real World | 4 | Speaks the plugin's vocabulary (phx:/lv:/ecto:, skill/agent); "search by name or behavior" |
| 3 | User Control and Freedom | 3 | Filters work + deep-link-in via ?type/?group/?q, but no one-click "clear all" to escape a filtered/empty state |
| 4 | Consistency and Standards | 3 | `role="tablist"` on both filter bars whose children aren't `role="tab"` (they're aria-pressed toggles); search input is type="text" while the global palette is type="search" |
| 5 | Error Prevention | 3 | Contradictory combos (Agents + phx) allowed but recover via the empty state |
| 6 | Recognition Rather Than Recall | 4 | Counts on every filter, all items shown by default, namespace pills — nothing to memorize |
| 7 | Flexibility and Efficiency | 3 | Deep-linking is a real power feature; but no clear-all, and filter state isn't written back to the URL on change (can't copy a filtered view) |
| 8 | Aesthetic and Minimalist Design | 4 | Clean, on-brand; the uniform card grid is the CORRECT affordance for a catalog (not a slop tell) |
| 9 | Error Recovery | 3 | Empty state names the problem + suggests "clearing them" but provides no control to do so |
| 10 | Help and Documentation | 4 | The catalog IS the discovery surface; a description on every card, links to detail pages |
| **Total** | | **35/40** | **Good (upper) — a genuinely strong discovery surface; the gap is ARIA semantics + a missing clear-filters affordance, not craft** |

## Anti-Patterns Verdict

**LLM assessment:** Not AI slop. The uniform card grid would be a tell on a marketing page, but for a directory of equivalent items it's exactly right — you scan and pick. Two filter tiers + search is the correct amount of control for ~75 items. Good hierarchy.

**Deterministic scan (detect.mjs):** `[]` — clean (the stray 5px filter-chip radius was fixed in the baseline-cleanup pass).

**Browser evidence:** Filtering verified working — "plan"→17, Agents→25, Agents+phx→0 (empty state shows correctly), reset→75. Deep-link params parsed on load. All text passes WCAG AA both themes (muted 5.23 light / 6.52 dark; card desc ~10:1).

## Overall Impression

This is the best-engineered page on the site — instant client-side filtering, deep-linkable, derived entirely from the plugin. It does its "findable beats average" job well. The opportunities are two narrow a11y-semantics fixes and closing the loop on the empty state with an actual clear-filters control.

## What's Working

1. **Instant, derived, deep-linkable filtering.** Search + type + namespace all update live with an aria-live count; `?type/?group/?q` deep-links work on load. This is the discovery experience done right.
2. **Counts everywhere.** Every filter chip shows its count (phx: 32, lv: 1, …) so users know what each filter yields before clicking — strong recognition-over-recall.
3. **Honest catalog grid.** Uniform cards are the right call here; descriptions are real and scannable; namespace pills color-code at a glance.

## Priority Issues

- **[P2] `role="tablist"` without tabs.** Both filter bars declare `role="tablist"`, but the child buttons have no `role="tab"`, no `aria-selected`, and control no `tabpanel` — they're `aria-pressed` toggle buttons. A screen reader announces "tab list" and then finds non-tabs; arrow-key tab semantics are implied but absent. **Fix:** change the containers to `role="group"` (they already have `aria-label`); keep `aria-pressed` on the buttons. **Command:** `/impeccable clarify` (a11y semantics).
- **[P2] Catalog search input has no accessible name.** `type="text"`, no `<label>`, no `aria-label` — only a placeholder, which is not a reliable accessible name (WCAG 4.1.2). **Fix:** add `aria-label="Search skills and agents"` and switch to `type="search"` (matches the global palette + gives the clear affordance). **Command:** `/impeccable clarify`.
- **[P3] No clear-filters control.** The empty state says "Try clearing them" but offers no button; recovering requires resetting both filter rows + the search box manually. **Fix:** add a "Clear filters" control that resets type/group/search, surfaced in the empty state (and when any filter is active). **Command:** `/impeccable clarify` / `/impeccable onboard`.

## Persona Red Flags

**Sam (screen-reader / keyboard):** Hits the `role="tablist"` mismatch immediately — the filters announce as tabs but don't behave as tabs. The unlabeled search input announces as a bare text field. Both are fixable with attribute-level changes.

**Alex (power user):** Loves the deep-linking, but notices the URL doesn't update when he filters interactively — he can't copy the current filtered view to share. Wants a clear-all to reset in one keystroke instead of three clicks.

**Riley (stress-tester):** Selects Agents + phx → 0 results; the empty state is graceful but dead-ends (no control to recover). Confirms contradictory filter combos are allowed.

**Priya (senior Phoenix engineer — project persona):** Uses this to assess breadth. Counts-on-every-filter (phx: 32, agents: 25) instantly communicate scope — exactly the credibility signal she wants. Converts well here.

## Minor Observations

- Filter state could be written back to the URL via `history.replaceState` so a filtered view is shareable — complements the existing deep-link-in and reinforces "findable beats average."
- The two filter axes are independent; no harm, but a one-line hint or the clear-all affordance would make the interaction model obvious.

## Questions to Consider

- Should selecting a namespace auto-relax the type filter (or vice-versa) to avoid the dead-end empty combos, or is the empty state + a clear-all enough?
- Should the catalog be the canonical `/skills/` and `/agents/` landing (it already is via the redirect stubs) — and if so, should those entry URLs pre-write the matching filter into the visible URL?
