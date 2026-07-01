# Design Brief — phxagents.dev

Derived from this repo's existing `PRODUCT.md` and `DESIGN.md` (maintained via `/impeccable`). This file exists so ui-craft commands (`/finalize`, etc.) have the artifact they expect; `PRODUCT.md`/`DESIGN.md` remain the source of truth — update those first, then sync this file.

---

### 1. Product purpose

Converts Elixir/Phoenix developers evaluating AI coding agents into phxagents installs by proving, in seconds, that the plugin teaches their agent real Phoenix conventions (contexts, LiveView, Ecto, Oban, OTP) instead of generic scaffolding.

### 2. Primary user

An Elixir/Phoenix developer at their editor or terminal, mid-task, driving an AI coding agent (Claude Code, Codex, Cursor, OpenCode, Pi) that just produced plausible-looking but Phoenix-naive code — either evaluating whether to install phxagents, or referencing what a specific skill/agent/Iron Law does.

### 3. Principles (conflict-resolution order)

1. **Practice what you preach.** A site selling Elixir/Phoenix engineering discipline must itself be impeccably engineered: build-time-derived, fast, accessible, no broken edges. The site's own craft is the strongest argument for the plugin.
2. **Show the rules, don't assert them.** The product's value is *enforced, concrete* conventions (the Iron Laws, named specialist agents). Make that discipline visible and specific — real commands, real skill names, real counts — instead of vague "AI-powered" claims.
3. **Specialist, not superlative.** Win by being unmistakably the Phoenix-specialized answer. Specificity and credibility convert this audience; generic superlatives repel it.
4. **Findable beats average.** In a flooded dev-tool/AI space, a tasteful-but-generic landing is invisible. Commit to a point of view and a distinctive look; restraint without intent reads as mediocre, not refined.
5. **Derived, never duplicated.** Counts, versions, and skill/agent lists come from the plugin source at build time. Truthfulness-by-construction is itself a trust signal — never hand-edit what mirrors plugin content, and never restate the same explanation in two places on the same page.

### 4. Success metric for the surface

A visiting Elixir/Phoenix developer can tell within 5 seconds whether phxagents fits their stack (skill/agent/Iron Law counts, install command visible above the fold) and reaches `/install/` without hunting through generic marketing copy.

### 5. Out of scope

- Does not imply affiliation with Phoenix Framework or commercial phoenix.new — "not affiliated" is a permanent constraint, not optional copy.
- Does not use AI-slop hero tropes: gradient text, glassmorphism, the hero-metric template, a rounded icon above every heading, per-section uppercase eyebrows.
- Does not use emoji decoration, mascot characters, or bouncy/elastic motion — serious-engineer tone, not playful.
- Does not hand-edit content that mirrors plugin source (counts, versions, skill/agent lists, Iron Law text) — always derived at build time from `./plugin-source/`.

### 6. Learned constraints

- **2026-07-01** — No per-item decorative color (e.g. one bespoke gradient per client-logo badge). *Why:* violates principle 3/functional-color-only; reads as gradient soup instead of one accent used with intent. Client badges use the neutral `surface-2` + single accent-fg treatment shared with feature icons.
- **2026-07-01** — Hover-only affordances (`:hover` border/background changes) must be gated behind `@media (hover: hover) and (pointer: fine)`. *Why:* touch devices have no hover state; ungated hover rules are inert on mobile and can leave `:hover`-only feedback stuck after a tap.
- **2026-07-01** — Section vertical rhythm should vary by content density, not repeat a single `padding: 64px 0` on every band. *Why:* uniform rhythm across every section reads as templated rather than composed; denser sections (feature grid) get more air, lighter ones (client strip) get less, the closing CTA gets the most emphasis.
- **2026-07-01** — Accepted: the search palette (`Default.astro`) stays a hand-built `role="dialog"` div rather than converting to native `<dialog>`/`[popover]`. *Why:* `/finalize`'s `ui-craft-detect` flags this as Critical (`a11y/modal-without-dialog`), but the actual requirements the rule protects — focus trap, Escape-to-close, focus-restore-on-close — are already manually implemented and verified in `site.js`. A native-`<dialog>` refactor is real scope (CSS reset, `::backdrop`, cross-browser QA) with no live bug to justify it now; revisit only if a genuine bug surfaces or the overlay pattern is reused elsewhere.
