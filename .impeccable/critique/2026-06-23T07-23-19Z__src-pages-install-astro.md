---
target: src/pages/install.astro
total_score: 34
p0_count: 0
p1_count: 0
timestamp: 2026-06-23T07-23-19Z
slug: src-pages-install-astro
---
# Critique — src/pages/install.astro (install / conversion page)

Assessment A (design review) + Assessment B (detect.mjs + rendered light/dark evidence at 1256px, canvas-measured contrast). The page the homepage now hands off to.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Copy buttons confirm ("Copied" 1.2s); active nav state; numbered steps |
| 2 | Match System / Real World | 4 | Real slash commands, "run these in Claude Code one at a time"; Phoenix-fluent |
| 3 | User Control and Freedom | 3 | Standard nav, no traps; nothing to undo (static page) |
| 4 | Consistency and Standards | 3 | Cross-page status wording diverges: "in development" here vs "v3.0 · in review" on home; lede says "land in v3.0" but table doesn't |
| 5 | Error Prevention | 3 | "one at a time" prevents paste-all errors; n/a otherwise |
| 6 | Recognition Rather Than Recall | 4 | Everything visible; labeled nav; copy buttons; scannable tables |
| 7 | Flexibility and Efficiency | 3 | Copy buttons + `/` search are the accelerators; nothing else needed |
| 8 | Aesthetic and Minimalist Design | 3 | Clean + on-brand, but the catchup detour injects off-task content into a focused conversion flow |
| 9 | Error Recovery | 3 | n/a — no error surfaces |
| 10 | Help and Documentation | 4 | The page IS task-focused docs; /phx:intro pointer, contextual links, full sidebar |
| **Total** | | **34/40** | **Good (upper) — a focused, functional install page; opportunities are IA focus + cross-page consistency, not craft** |

## Anti-Patterns Verdict

**LLM assessment:** Does not read as AI-generated. It's a disciplined, utilitarian docs page — real commands, derived counts, copy affordances. No slop tells (no gradient text, no eyebrows, no card wall). The one weakness is *information architecture*, not surface.

**Deterministic scan (detect.mjs):** `[]` — clean. No token drift, no banned patterns.

**Browser evidence (light + dark, canvas contrast):** All body/label text passes WCAG AA in both themes. Tightest: the muted 11.5px mono table-header + code-head labels at **4.61:1 dark / 5.08:1 light** — passes, but the dark margin is razor-thin (shared `--muted` token; routed to the audit task). Copy-button feedback verified working.

## Overall Impression

This page does its core job well: it makes installing phxagents obvious, fast, and credible. The single biggest opportunity is **focus** — the page currently detours through a *second, unrelated plugin* (catchup) in the middle of the phxagents conversion narrative, then returns to phxagents ("Client support"). Fix the running order and tighten cross-page status wording and this is an Excellent-band page.

## What's Working

1. **The core utility is nailed.** Two numbered install commands, each with a working Copy button that confirms "Copied." "No configuration required" is exactly the reassurance an installer wants. This is the conversion moment done right.
2. **Credible, derived lede.** Real counts ({skills}/{agents} from stats), a concrete v3.0 + PR #46 link — no superlatives, no fluff. Matches the "specialist, not superlative" voice.
3. **Scannable structure.** Requirements and Client-support tables, a clear Requirements → Install → What you get → After install arc. Speaks Phoenix + Claude Code fluently.

## Priority Issues

- **[P2] The `catchup` companion section interrupts the conversion flow.** Running order is: install phxagents → After install → **catchup pitch (a different, framework-agnostic plugin, 2 code blocks)** → Client support (back to phxagents). A user mid-install hits a detour for another product, then returns to phxagents info — a context switch on the one page that should stay laser-focused on getting phxagents in. **Fix:** move the catchup section to *after* Client support (or the very end) so the phxagents arc is contiguous; keep it as a clearly-separated "also in this marketplace" aside. **Command:** `/impeccable layout`.
- **[P2] Status terminology diverges across pages.** Same clients, three phrasings: install table "in development", install lede "land in v3.0", homepage "v3.0 · in review / in review PR #46". Users wonder whether these mean the same thing (heuristic #4). **Fix:** standardize on the homepage's "v3.0 · in review" and carry the v3.0 framing into the table. **Command:** `/impeccable clarify`.
- **[P3] Client-support table has no status affordance for non-shipped rows.** "✓ shipped" gets a check; "in development" rows are plain text — no dot/color, unlike the homepage's amber status. Visual-status gap + inconsistency. **Fix:** add a small status indicator (shipped = accent/green, pending = amber) matching the homepage client cards. **Command:** `/impeccable colorize` (fold into the clarify pass).

## Persona Red Flags

**Jordan (first-timer, new to Claude Code plugins):** The install steps are clear and copyable — good. But the catchup section mid-page may confuse him into thinking catchup is *part of* installing phxagents ("do I need this too?"). Moving it past Client support removes the ambiguity.

**Riley (stress-tester):** Will notice the "in development" vs homepage "in review" mismatch immediately and read it as the site not knowing its own status. Also: the lede promises "v3.0" but the table never repeats it — looks like two sources of truth.

**Casey (mobile / on the go):** The full ~40-item skills tree in the sidebar means a long scroll past nav before content on small screens (verify in the audit). Copy buttons are thumb-friendly. Primary action (copy a command) works one-handed.

**Priya (senior Phoenix engineer evaluating the plugin — project persona):** Converts here. The real commands + "no configuration required" + derived counts win her. The catchup detour is the one thing that reads as "marketing reaching" on an otherwise all-business page — she came for phxagents, not a second pitch.

## Minor Observations

- The full skills tree in the sidebar is heavy for a narrative page, BUT it maximizes findability (any skill reachable from anywhere) and is consistent with skill-detail pages — a deliberate tradeoff worth keeping, not a defect. Left as-is.
- `--muted` mono labels at 11.5px are at the dark-theme contrast edge (4.61:1). Shared token; the audit task should nudge it for margin.
- Page measure differs slightly (lede 640px, body 720px) — harmless.

## Questions to Consider

- Should the install page mention catchup at all, or does a one-line "the same marketplace also ships catchup → [link]" serve better than a full inline pitch with its own code blocks?
- Should client status be a single derived source (one constant) rendered identically on home + install, so the wording can never drift again?
