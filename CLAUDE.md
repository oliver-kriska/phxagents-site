# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Documentation site for **phxagents**, deployed at [phxagents.dev](https://phxagents.dev). Claude Code receives the full canonical plugin; Amp, Codex, Pi, and OpenCode receive generated skill distributions. Built with **Astro 7 using native, hand-written layouts** (Starlight was dropped in commit `c58b6dd` in favor of a custom design + catalog + client search). Hosted on Cloudflare Pages.

**This repo contains no plugin source.** The plugin lives in [`oliver-kriska/claude-elixir-phoenix`](https://github.com/oliver-kriska/claude-elixir-phoenix) and is consumed at build time via `./plugin-source/`. That directory is gitignored — it is either a local symlink (dev) or a full clone (CI). Full history is required to derive honest per-file `dateModified` values.

## Common commands

```bash
# Local dev (requires plugin-source symlink — see below)
npm run dev:link                                 # symlink ../elixir-live-claude-engineer → ./plugin-source
sh scripts/dev-link.sh /path/to/plugin-repo      # or pass an explicit path
npm run dev                                      # http://localhost:4321

# Builds
npm run build:local                              # build without re-cloning (uses existing symlink/clone)
npm run build                                    # CI build: clones plugin-source first, then astro build
npm run preview                                  # serve dist/ locally
```

Node 22 LTS is required (pinned in `.nvmrc`, `.tool-versions`, and `package.json` engines). On Node 23+ install with `npm ci --ignore-scripts` because `sharp` doesn't yet ship prebuilds.

There is no test suite, linter, or formatter wired up — the only verification is `npm run build:local` succeeding.

## Architecture: zero-manual-update derivation

The single most important fact about this codebase: **every count, version, list, and page on the site is derived at build time from `./plugin-source/`.** Do not hand-edit anything that mirrors plugin content.

### Build-time data flow

```
plugin-source/plugins/elixir-phoenix/
├── .claude-plugin/plugin.json        → src/data/stats.ts → version, description, keywords
├── skills/<name>/SKILL.md            → src/content.config.ts (skills collection) → /skills/<name>/ + /skills/<name>.md
├── skills/<name>/references/*.md     → src/content.config.ts (references collection) → counted only, no route
└── agents/*.md                       → src/content.config.ts (agents collection) → /agents/<slug>/ + /agents/<slug>.md

plugin-source/docs/{amp,codex,pi,opencode}.md → upstreamDocs collection → /install/<runtime>/
plugin-source/docs/runtime-support.md          → upstreamDocs collection → /compatibility/
plugin-source/scripts/port_lib/skill_transforms.py → src/lib/skillNames.ts → Claude and generated command names
plugin-source/CLAUDE.md               → src/data/stats.ts → Iron Laws count (regex on "## Iron Laws Enforcement")

skills + agents + upstreamDocs        → /llms-full.txt
skills + agents + src/data/pages.ts   → /llms.txt
```

Key files:

- `src/content.config.ts` — defines **four** Astro Content Collections (`skills`, `agents`, `references`, `upstreamDocs`). The first three are rooted at `./plugin-source/plugins/elixir-phoenix/`; `upstreamDocs` loads the canonical runtime Markdown from `./plugin-source/docs/`. Schemas use `.passthrough()` because plugin frontmatter evolves independently. `references` is loaded for counts only; it has no public route.
- `src/lib/skillNames.ts` — reads upstream `CANONICAL_PORTABLE_NAMES` at build time. v3 frontmatter names contain only final command segments, so the site must derive `/phx:*`, `/ecto:*`, `/lv:*`, and generated hyphenated names from this map rather than from `name:` prefixes.
- `src/lib/docsNav.ts` — runs at build time (filesystem reads via `process.cwd()`, not Astro APIs) to build the Skills/Agents sidebar nav. Skills group by the command identities from `skillNames.ts`; agents group by model tier (opus = Orchestrators, sonnet = Specialists, haiku = Mechanical).
- `src/lib/sourceDates.ts` — derives `dateModified` from each plugin source file's last Git commit. `scripts/clone-source.sh` must retain full plugin history; a shallow clone without a frontmatter fallback fails rather than publishing fake freshness.
- `src/lib/og.ts` — build-time Open Graph card generator. `satori` lays out a flexbox tree with embedded JetBrains Mono and emits SVG; `sharp` rasterizes it to PNG (no system-font dependency). satori only understands a CSS subset (hex/rgb, no oklch), so the palette is hardcoded hex.
- `src/data/stats.ts` — same `process.cwd()` filesystem-read pattern; exposes `{ skills, agents, references, ironLaws, version, description, keywords }` to pages via import.
- `src/data/release.ts` — fetches the latest GitHub release **and** stargazer count at build time; uses `GITHUB_TOKEN` env var if set (CI does this) to avoid rate limits. Results are memoized per build.

### Routes (all under `src/pages/`)

- Narrative pages are **`.astro` files**, not MDX: `index.astro`, `install.astro`, `iron-laws.astro`, `changelog.astro`, `catalog.astro`, `tidewave-mcp.astro`, `404.astro`. (`iron-laws.astro` and `changelog.astro` use `marked` to render some inline markdown.)
- `src/pages/install/[runtime].astro` and `src/pages/compatibility.astro` render canonical upstream Markdown through `UpstreamDocPage.astro`. Astro redirects the legacy `/amp/` URL to `/install/amp/`.
- `src/pages/skills/[...slug].astro` and `src/pages/agents/[...slug].astro` — dynamic routes that render plugin markdown via `getCollection()` + `render()`, with prev/next nav. The skill route strips a trailing `/SKILL` segment from the collection ID (`pattern: '*/SKILL.md'` produces IDs like `oban/SKILL`).
- `src/pages/skills/[slug].md.ts` and `src/pages/agents/[slug].md.ts` — additive raw-Markdown twins built from each collection entry's retained `body`.
- `src/pages/llms.txt.ts` and `src/pages/llms-full.txt.ts` — generated LLM discovery index and concatenated full export. The full export deliberately excludes per-skill reference appendices to stay near 500 KB.
- `src/pages/og/[...slug].png.ts` — build-time endpoint emitting one OG PNG per page at `/og/<slug>.png` (home → `og/home.png`, `/skills/plan/` → `og/skills/plan.png`). `Default.astro` derives each page's `og:image` URL from its pathname; `default` is the fallback.
- `src/pages/search.json.ts` — emits `/search.json`, a flat index of every skill/agent (type, name, desc, url, group). This is the search backend (Pagefind was removed with Starlight). Its ten page entries are shared with `/llms.txt` through `src/data/pages.ts`.

### Layouts & shared client behavior

- `src/layouts/Default.astro` — base HTML shell for every page: `<head>` SEO meta, self-referential canonical, OG/Twitter tags, JSON-LD (`Organization` + `WebSite`), the inline **Plausible** snippet, and the footer. (Plausible moved here from `astro.config.mjs` when Starlight was dropped.)
- `src/layouts/DocPage.astro` — wrapper for narrative doc pages (sidebar + content).
- `src/components/DocsLayout.astro` — wrapper for skill/agent **detail** pages (sidebar + content + prev/next). Carries the CSS counterpart to the heading-shift rehype plugin.
- `src/scripts/site.js` — shared client behavior: theme toggle, the search palette (fetches `/search.json`), the `/` keybinding that opens search, mobile menu, GitHub star count, and code copy buttons.

### What is safe to hand-edit

- `src/styles/global.css` — design tokens (teal accent, Inter/JetBrains Mono fonts, hero gradient, cards)
- `src/assets/logo.svg`, `src/assets/houston.webp`, `public/favicon.svg` — brand assets
- `astro.config.mjs` — `site`, the `sitemap()` integration, `markdown.processor` (`unified()` from `@astrojs/markdown-remark`) carrying the `rehypeShiftHeadings` plugin (one-`<h1>`-per-page), `compressHTML: true` (restores v6 inline-whitespace collapsing — Astro 7's Rust compiler defaults to `'jsx'`, which strips newline-only whitespace between inline elements and would glue words like `dedicated<a>…`), and Shiki `langAlias` for `heex`/`eex`/`sface` (aliased to `html`)
- The narrative `.astro` pages' prose (`index`, `install`, `iron-laws`, `changelog`, `catalog`, `tidewave-mcp`, and the site-owned comparison framing in `compatibility`). The Iron Laws *count*, version, and skill/agent *lists* on them are still derived via the `stats`/`getCollection` imports — only the surrounding copy is editable. Runtime guide and compatibility matrix bodies remain upstream-owned Markdown.
- Footer text and the Plausible tag live in `src/layouts/Default.astro`.
- `public/skills/index.html` and `public/agents/index.html` — static meta-refresh **redirect stubs** to `/catalog/?type=skill|agent`, carrying `noindex`. These are the `/skills/` and `/agents/` landing URLs.

If you find yourself editing anything else by hand, you are probably duplicating plugin-repo content — change it there instead.

## Deployment

Cloudflare Pages, deployed via `cloudflare/wrangler-action@v3` (direct upload, **no Git connection on the CF side** — the GitHub Action is the only deploy path).

- `.github/workflows/deploy.yml` — runs on push to `main`, on `repository_dispatch` event `plugin-content-changed` (fired by the plugin repo when its content changes), and on manual `workflow_dispatch`. Always uses `wranglerVersion: '4'` (pinned because v3 had a different command surface).
- `.github/workflows/daily-rebuild.yml` — cron `0 6 * * *` UTC daily, refreshes the latest-release/star widgets and other time-sensitive data without requiring a commit.

For a release, publish the plugin tag and GitHub Release before deploying the matching site update. The site manifest version can lead the latest public release while work is staged; release-first ordering prevents marketplace install commands from lagging the version described on the site.

Required GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Custom domain `phxagents.dev` is wired via Cloudflare Pages → Custom domains (CNAME → `phxagents-site.pages.dev`, proxied). DNS records on the `phxagents.dev` zone require `Zone:DNS:Edit` on the API token if managing via API.

Build command on CF and in CI is `npm run build:local` after `sh scripts/clone-source.sh` runs separately. Do not switch CI to `npm run build` — that script is for non-CI environments where the workflow doesn't already clone the plugin source.

Full deployment details: `docs/cloudflare-setup.md`.

## Conventions specific to this site

- **One `<h1>` per page** — `rehypeShiftHeadings` in `astro.config.mjs` (wired through `markdown.processor: unified({ rehypePlugins: [...] })` under Astro 7) demotes every in-content heading by one level (h1→h2 … h6 stays) so the layout's title is the only `<h1>`. It runs on the rehype HTML AST, so `#` inside fenced code blocks is untouched; the companion CSS in `DocsLayout.astro` is shifted by the same +1, leaving rendering unchanged.
- **Per-page OG images** — generated at build by `satori` → `sharp` (`src/lib/og.ts` + `/og/[...slug].png.ts`). No runtime image service.
- **Heex/EEx/Surface code blocks** — Shiki doesn't bundle these. `astro.config.mjs` aliases `heex`/`eex`/`sface` to `html` (matches hexdocs.pm). Don't register a real grammar — the alias is fine.
- **Plausible analytics** — inline `<head>` script in `src/layouts/Default.astro`. Privacy-first, no cookies.
- **Search** — custom: the `/search.json` endpoint + the client palette in `src/scripts/site.js`. `/` opens the modal (no Pagefind).
- **LLM-readable outputs** — `/llms.txt` is a generated absolute-URL index; `/llms-full.txt` concatenates skills, agents, and upstream runtime docs; every skill and agent HTML page has an additive `.md` twin. Keep all of them collection-derived so removed upstream content cannot leave stale links.
- **Trailing slashes** — not configured (Astro default). Astro emits `dir/index.html`; Cloudflare Pages 308-redirects the no-slash variant to the trailing-slash URL.

## Research persistence

Per the user's global rule: any non-trivial research done in a session about this repo (design directions, comparisons, evaluations) goes in `.claude/research/YYYY-MM-DD-topic.md`. Do not put research in `output/`, `dist/`, or temp paths. The folder already exists.

## Design context

Strategic and visual design intent for this site is captured in `PRODUCT.md` (strategy) and `DESIGN.md` (visual system) at the repo root, maintained via the `/impeccable` skill.

- **Register: `brand`** — design IS the product. The landing/conversion surface leads; reference docs are secondary. Future design work should treat the marketing surfaces as the priority and avoid generic "just another docs site" defaults.
- **Personality:** Precise · Opinionated · Fast. **Specialist, not superlative** — win on Phoenix-specificity, never absolute hype. Never imply affiliation with Phoenix Framework or commercial `phoenix.new`.
- **Design principles:** (1) practice what you preach — the site's craft is the argument; (2) show the rules, don't assert them; (3) specialist, not superlative; (4) findable beats average; (5) derived, never duplicated.
- **Anti-references:** generic SaaS-cream landing; AI-slop hero tropes (gradient text, glassmorphism, hero-metric template, per-section uppercase eyebrows); playful/mascot-heavy.
- **Accessibility target:** WCAG 2.2 AA (both light and dark themes pass independently).

Read `PRODUCT.md` / `DESIGN.md` before any design-related change. Do not duplicate plugin content (see the derivation note above).
