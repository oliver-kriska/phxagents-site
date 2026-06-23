# Product

## Register

brand

## Users

Elixir/Phoenix developers who drive AI coding agents — Claude Code, Codex, Cursor, OpenCode, Pi. They're at their editor or terminal, mid-engineering-task, and they've hit the recurring pain: a general-purpose AI writes plausible-looking Elixir that ignores how Phoenix actually works (contexts, scopes, Ecto changesets, LiveView lifecycle, Oban idempotency, OTP).

Two contexts bring them to the site:

- **Evaluating** — deciding whether to install the plugin. They want fast proof that it makes their agent Phoenix-fluent, and a credible signal that it's maintained and specific (not another generic "AI-powered" wrapper).
- **Referencing** — a current user looking up what a specific skill or agent does, or how the Iron Laws are enforced.

The job to be done: make their AI editor understand Phoenix conventions well enough that its output is correct and idiomatic on the first pass.

## Product Purpose

phxagents.dev is the documentation **and** marketing site for the phxagents plugin ([oliver-kriska/claude-elixir-phoenix](https://github.com/oliver-kriska/claude-elixir-phoenix)). It is positioned as the canonical namespace for agent-augmented Phoenix tooling — the thing people search for as "phx agents" / "phoenix agents," riding the Phoenix 1.8 AGENTS.md convention.

It exists to:

1. **Get discovered** — own the winnable search/GEO clusters ("best AI coding agent for Elixir & Phoenix," "tidewave mcp," "Claude Code plugin") and be the source AI answer engines cite.
2. **Convince** — show a working Elixir dev, in seconds, that the plugin teaches their agent how Phoenix really works.
3. **Convert** — to install.
4. **Stay truthful for free** — every count, version, skill, and agent page is derived at build time from the plugin source, so the reference is always accurate with zero manual upkeep.

Success looks like: installs, AI-engine citations and search ranking for the target clusters, and developers trusting it as the credible specialist source.

## Brand Personality

**Precise · Opinionated · Fast.**

The voice of a specialist who has strong, defensible conventions — the Iron Laws — and states them plainly without hedging. Engineered, no-nonsense, signal over fluff. It respects the reader as a working Elixir/Phoenix engineer and never over-explains the basics.

Crucially **specialist, not superlative**: the claim is "the specialized agent for Phoenix," grounded and specific, never absolute hype. Credibility is the conversion lever here, not excitement.

## Anti-references

- **Generic SaaS-cream landing** — warm-neutral/beige body background, a big gradient hero metric, and an endless grid of identical icon + heading + text feature cards. The saturated AI default; the opposite of distinctive.
- **AI-slop hero tropes** — gradient text (`background-clip: text`), decorative glassmorphism, the hero-metric template, a rounded-corner icon above every heading, and a tiny uppercase tracked eyebrow above every section.
- **Playful / mascot-heavy** — emoji as decoration, bouncy/elastic motion, cartoon mascots. Keep it serious-engineer, not cute. (The repo carries Astro's `houston.webp`; do not lean on it as a brand character.)
- **Implying affiliation** — must never read as an official Phoenix Framework or commercial [phoenix.new](https://phoenix.new) property. It is a community plugin; the "not affiliated" framing is a permanent constraint, not optional copy.

## Design Principles

1. **Practice what you preach.** A site selling Elixir/Phoenix engineering discipline must itself be impeccably engineered: build-time-derived, fast, accessible, no broken edges. The craft of the site is the strongest argument for the plugin.
2. **Show the rules, don't assert them.** The product's value is *enforced, concrete* conventions (the Iron Laws, named specialist agents). Make that discipline visible and specific — real commands, real skill names, real counts — instead of vague "AI-powered" claims.
3. **Specialist, not superlative.** Win by being unmistakably the Phoenix-specialized answer. Specificity and credibility convert this audience; generic superlatives repel it.
4. **Findable beats average.** In a flooded dev-tool/AI space, a tasteful-but-generic landing is invisible. Commit to a point of view and a distinctive look; restraint without intent reads as mediocre, not refined.
5. **Derived, never duplicated.** Counts, versions, and skill/agent lists come from the plugin source at build time. Truthfulness-by-construction is itself a trust signal — never hand-edit what mirrors plugin content.

## Accessibility & Inclusion

Target: **WCAG 2.2 AA.** Already established in the codebase and to be preserved in all future work:

- Body text ≥4.5:1 contrast; large/bold text ≥3:1 (verify in both light and dark themes).
- Visible keyboard focus via `:focus-visible`; a working skip link.
- Full `prefers-reduced-motion: reduce` alternative for every animation.
- Touch/click targets ≥44px (search/nav items already meet this).
- Light **and** dark themes are first-class; both must pass contrast independently.
