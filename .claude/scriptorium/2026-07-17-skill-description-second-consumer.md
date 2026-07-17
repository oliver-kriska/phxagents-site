---
scriptorium: true
action: append
title: "Skill Description Optimization"
type: pattern
domain: claude-elixir-phoenix
tags: [claude-code, plugin, skill-routing, seo, docs-site, description-engineering, derivation]
---

## The Second Consumer: Search Engines

Discovered 2026-07-17 while acting on the first GSC-backed handoff for phxagents.dev
(`~/Projects/phxagents-site/.claude/research/2026-07-17-gsc-serp-snippets.md`).

A skill `description` optimized per this pattern has a **second consumer nobody tuned it
for**: any docs site that derives page metadata from the plugin's frontmatter. phxagents.dev
piped `description` straight into `<meta name="description">`. Result across its 77
skill/agent pages:

- **58 of 77** exceeded Google's ~160-char render budget. The `oban` page shipped 241 chars.
- **65 of 77** put a router directive in front of a human: the `/skills/oban/` search result
  literally read *"…Use when writing Oban workers, queue config, or debugging jobs."*
- Measured cost: `/skills/oban/` converts at **1.6% CTR from position 7.5**, while
  hand-written `/iron-laws/` converts at **10.0% from 7.3**. Same position band, ~6× gap.

### The budgets genuinely conflict — do not "fix" the description

The router wants ≤250 chars (under 200 preferred) of trigger vocabulary, and per the CSO
finding must contain *only* triggering conditions. Google wants ~160 chars of human
sentence. These cannot be satisfied by one string.

**Editing descriptions for SEO would regress the measured routing accuracy this pattern
exists to protect** (Pass 2's +29%, Pass 3's +27.5pp). The description is the router's
artifact. The fix belongs in the consumer.

### Resolution: derive the snippet, never duplicate it

The plugin's own three-part convention already contains the split:

```
"[identity]. Use when [triggers]. Skip for [exclusions]."
  └─ SERP snippet        └─ router only    └─ router only
```

The identity clause is exactly what a human should see; the trigger clause is exactly what
they should not. So a docs site can mechanically extract a good snippet with no hand-written
strings and no maintenance as skills are added (`src/lib/seo.ts` in phxagents-site):

1. Cut at the first **sentence-initial** directive marker (`Use` / `NOT for` / `Skip for` /
   `Trigger on` / `Internal use`).
2. Clamp to 160 on a word boundary.
3. Fall back to raw when a description is *only* a directive — CSO-perfect descriptions
   (`full`: "Use for large features…") have no identity clause to extract.

Two gotchas worth carrying to any reimplementation:

- **Anchor the marker to `^` or `". "`.** A naive sentence split on `.` mangles
  `Ecto.Query`, `AshPhoenix.Form`, `hex_vet.exs`. A naive "split on period + uppercase" has
  the same bug (`Ecto.` + `Query`).
- **Keep the raw description in the visible lede and JSON-LD.** Only the search snippet is
  rewritten — the page should still show what the plugin actually declares.

Applies to any plugin + docs-site pair: enaia's 19 skills, and any site built over
agentskills.io frontmatter, inherit the same mismatch the moment they render `description`
to humans.

### Generalization

The broader trap: **a field tuned by eval for a machine reader is not copy.** Any pipeline
that re-renders router/prompt metadata to an end user (SERP snippet, marketing card, README
table, OG description) is silently repurposing an artifact optimized against a different
objective, with a different budget and audience. Derive at the boundary; leave the tuned
artifact alone.
