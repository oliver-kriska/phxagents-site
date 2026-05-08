# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Documentation site for the **phxagents** Claude Code plugin, deployed at [phxagents.dev](https://phxagents.dev). Built with Astro 6 + Starlight 0.39, hosted on Cloudflare Pages.

**This repo contains no plugin source.** The plugin lives in [`oliver-kriska/claude-elixir-phoenix`](https://github.com/oliver-kriska/claude-elixir-phoenix) and is consumed at build time via `./plugin-source/`. That directory is gitignored — it is either a local symlink (dev) or a shallow clone (CI).

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
├── skills/<name>/SKILL.md            → src/content.config.ts (skills collection) → /skills/<name>/
├── skills/<name>/references/*.md     → src/content.config.ts (references collection)
└── agents/*.md                       → src/content.config.ts (agents collection) → /agents/<slug>/

plugin-source/CLAUDE.md               → src/data/stats.ts → Iron Laws count (regex on "## Iron Laws Enforcement")
```

Key files:

- `src/content.config.ts` — defines four Astro Content Collections (`docs`, `skills`, `agents`, `references`) all rooted at `./plugin-source/plugins/elixir-phoenix/`. Schemas are `passthrough()` because plugin frontmatter evolves independently.
- `src/lib/sidebar.mjs` — runs at config-load time (filesystem reads, not Astro APIs) to build the Skills/Agents sidebars by reading frontmatter `name:` and `model:` directly. Uses `process.cwd()` because `import.meta.url` is unreliable through Vite bundling. Skills group by `phx:`/`lv:`/`ecto:`/reference prefix; agents group by model tier (opus = Orchestrators, sonnet = Specialists, haiku = Mechanical).
- `src/data/stats.ts` — same filesystem-read pattern, exposes `{ skills, agents, references, ironLaws, version, description }` to MDX via import.
- `src/data/release.ts` — fetches the latest GitHub release at build time; uses `GITHUB_TOKEN` env var if set (CI does this) to avoid rate limits.
- `src/pages/skills/[...slug].astro` and `src/pages/agents/[...slug].astro` — dynamic routes that render markdown via `getCollection()` + `render()`. The skill route strips a trailing `/skill` segment from the collection ID since `pattern: '*/SKILL.md'` produces IDs like `phx-plan/skill`.

### What is safe to hand-edit

- `src/components/Footer.astro` — disclaimer text
- `src/styles/custom.css` — design tokens (teal accent, Inter/JetBrains Mono/Instrument Serif fonts), hero gradient, stat cards
- `src/assets/logo.svg`, `public/favicon.svg` — brand assets
- `astro.config.mjs` — sidebar structure, Plausible head tags, `langAlias` for heex/eex (aliased to html)
- `src/content/docs/index.mdx`, `install.mdx`, `iron-laws.mdx`, `changelog.mdx` — narrative pages (the Iron Laws *count* and laws themselves are still derived; the preamble is editable)

If you find yourself editing anything else by hand, you are probably duplicating plugin-repo content — change it there instead.

## Deployment

Cloudflare Pages, deployed via `cloudflare/wrangler-action@v3` (direct upload, **no Git connection on the CF side** — the GitHub Action is the only deploy path).

- `.github/workflows/deploy.yml` — runs on push to `main`, on `repository_dispatch` event `plugin-content-changed` (fired by the plugin repo when its content changes), and on manual `workflow_dispatch`. Always uses `wranglerVersion: '4'` (pinned because v3 had different command surface).
- `.github/workflows/daily-rebuild.yml` — cron `0 6 * * *` UTC daily, refreshes the latest-release widget and other time-sensitive data without requiring a commit.

Required GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Custom domain `phxagents.dev` is wired via Cloudflare Pages → Custom domains (CNAME → `phxagents-site.pages.dev`, proxied). DNS records on `phxagents.dev` zone require `Zone:DNS:Edit` permission on the API token if managing via API.

Build command on CF and in CI is `npm run build:local` after `sh scripts/clone-source.sh` runs separately. Do not switch CI to `npm run build` — that script is for non-CI environments where the workflow doesn't already clone the plugin source.

Full deployment details: `docs/cloudflare-setup.md`.

## Conventions specific to this site

- **Heex/EEx code blocks** — Shiki doesn't bundle these languages. `astro.config.mjs` aliases them to `html` (matches hexdocs.pm). Don't try to register a real grammar — the alias is fine.
- **Plausible analytics** — injected via inline `head` script in `astro.config.mjs`. Privacy-first, no cookies.
- **Search** — Pagefind (built into Starlight), plus a custom keybinding so `/` opens the search modal (Cmd+K is bound by Starlight already). The `/` handler is an inline script in `astro.config.mjs head`.
- **LLM exports** — `starlight-llms-txt` plugin generates `/llms.txt` and `/llms-full.txt` at build.

## Research persistence

Per the user's global rule: any non-trivial research done in a session about this repo (design directions, comparisons, evaluations) goes in `.claude/research/YYYY-MM-DD-topic.md`. Do not put research in `output/`, `dist/`, or temp paths. The folder already exists.
