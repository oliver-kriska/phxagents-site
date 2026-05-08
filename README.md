# phxagents-site

Documentation site for the [phxagents plugin](https://github.com/oliver-kriska/claude-elixir-phoenix) — Iron Laws and specialist agents for Elixir/Phoenix in Claude Code, Codex, OpenCode, and Pi.

Live at **[phxagents.dev](https://phxagents.dev)**.

## What this repo does

This repo builds the documentation site. **It does not contain plugin source code.** The plugin lives in [oliver-kriska/claude-elixir-phoenix](https://github.com/oliver-kriska/claude-elixir-phoenix). This repo:

1. Clones the plugin repo at build time (`scripts/clone-source.sh`)
2. Reads skills, agents, references, and the changelog from the cloned source
3. Generates a static Astro+Starlight site with auto-derived counts and stats
4. Deploys to Cloudflare Pages on push to `main` (or via deploy hook from the plugin repo)

**You should never hand-edit content that exists in the plugin repo.** Skill pages, agent pages, the homepage stat counters, and the version banner are all derived at build time. Edit those in the plugin repo.

## Stack

- **Framework**: [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) 0.39
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/) (free, auto-deploy on push)
- **Search**: [Pagefind](https://pagefind.app/) (built into Starlight, indexes at build time)
- **LLM-friendly export**: [`starlight-llms-txt`](https://delucis.github.io/starlight-llms-txt/) generates `/llms.txt` and `/llms-full.txt`
- **Analytics**: [Plausible](https://plausible.io) (privacy-friendly, no cookies)
- **Node**: 22 LTS (pinned via `.tool-versions`, `.nvmrc`, and `package.json` engines)

## Repo layout

```
phxagents-site/
├── .nvmrc, .tool-versions       Node 22 LTS pin
├── astro.config.mjs             Starlight config + Plausible head tags
├── package.json                 deps + scripts
├── plugin-source/               (gitignored) symlink in dev, clone in CI
├── public/                      static assets (favicon, etc.)
├── scripts/
│   ├── clone-source.sh          clones plugin repo at build
│   └── dev-link.sh              creates symlink for local dev
└── src/
    ├── components/
    │   └── Footer.astro         Starlight footer override (disclaimer + version)
    ├── content/
    │   └── docs/                static pages (homepage, install, iron-laws, changelog)
    ├── content.config.ts        Astro Content Collections (docs, skills, agents, references)
    ├── data/
    │   ├── stats.ts             build-time counts derived from filesystem
    │   └── release.ts           latest GitHub release fetcher
    ├── pages/
    │   ├── skills/              auto-generated skill pages from plugin repo
    │   └── agents/              auto-generated agent pages from plugin repo
    └── styles/
        └── custom.css           teal accent + design tokens
```

## Local development

### Prerequisites

- Node 22 LTS (use `mise` / `asdf` / `nvm` — `.nvmrc` and `.tool-versions` set the pin)
- Both repos checked out side-by-side:
  ```
  ~/Projects/
    ├── claude-elixir-phoenix/   ← plugin repo
    └── phxagents-site/          ← this repo
  ```

### First-time setup

```bash
# 1. Install dependencies (use --ignore-scripts on Node 23+ until sharp ships prebuilds)
npm install

# 2. Symlink the plugin repo so Astro can read its content
npm run dev:link
# Or with custom path:
sh scripts/dev-link.sh /path/to/claude-elixir-phoenix

# 3. Start the dev server
npm run dev
# → http://localhost:4321
```

The symlink lives at `./plugin-source` and is gitignored. Edits to files in the plugin repo (skills, agents, README, CHANGELOG) appear in dev preview live.

### Daily workflow

```bash
npm run dev               # local preview, watches for changes
npm run build:local       # build without re-cloning (uses existing symlink/clone)
npm run preview           # preview the production build
```

## Production build

The production build runs `scripts/clone-source.sh` first, which fetches a shallow clone of the plugin repo:

```bash
npm run build             # clones plugin repo to ./plugin-source then builds
```

If `./plugin-source` is already a symlink (local dev), the clone step is skipped.

## Auto-update flow

```
plugin repo push → main
        ↓
plugin repo GitHub Action fires (paths: plugins/**, README.md, CHANGELOG.md)
        ↓
curl POST → Cloudflare Pages Deploy Hook
        ↓
Cloudflare Pages build runs:
   sh scripts/clone-source.sh        (git clone --depth 1)
   astro build                        (renders site from cloned content)
        ↓
deployed to phxagents.dev within ~60–90 seconds
```

A daily cron-triggered rebuild (via separate GitHub Action) refreshes time-sensitive external data: GitHub stars, latest release notes, last-updated timestamps.

## Zero-manual-update principle

**The plugin repo is the only source of truth.** Every numeric, version, list, count, name, and link on this site is derived at build time:

| Site value | Source |
|---|---|
| Plugin version | `plugin-source/plugins/elixir-phoenix/.claude-plugin/plugin.json` |
| Skill count | filesystem (glob count) |
| Agent count | filesystem (glob count) |
| Reference count | filesystem (glob count) |
| Iron Laws count | parsed from `CLAUDE.md` (Phase A) → `laws.yaml` (Phase C) |
| Skill pages | `plugins/elixir-phoenix/skills/*/SKILL.md` |
| Agent pages | `plugins/elixir-phoenix/agents/*.md` |
| Hero tagline | `plugin.json.description` |
| Latest release | GitHub Releases API at build (cached) |

Adding a new skill in the plugin repo → site auto-renders a new page on next push. No site repo edits required.

## What you can hand-edit safely

Static brand and theme content:

- `src/components/Footer.astro` — footer disclaimer text
- `src/styles/custom.css` — accent color, typography
- `public/favicon.svg`, `src/assets/logo.svg` (when added) — brand assets
- `astro.config.mjs` `title`, `description`, `social` links, `head` tags (Plausible)
- `src/content/docs/install.mdx` — install guide narrative
- `src/content/docs/iron-laws.mdx` — Iron Laws preamble (the actual laws are auto-derived)

## Deployment

This repo deploys to Cloudflare Pages. Setup steps:

1. Connect this repo to a Cloudflare Pages project
2. Build command: `npm run build`
3. Build output: `dist`
4. Node version: 22 (CF reads `.nvmrc`)
5. Custom domain: `phxagents.dev` (CNAME to `phxagents-site.pages.dev`)

### Cross-repo trigger

The plugin repo has a 5-line GitHub Action (`.github/workflows/trigger-site.yml`) that pings Cloudflare's Deploy Hook on every push to plugin repo `main`. Steps to wire:

1. In Cloudflare Pages → Settings → Builds → Deploy Hooks → create one
2. In plugin repo → Settings → Secrets → add `PHXAGENTS_DEPLOY_HOOK` = the URL from step 1
3. Plugin repo's workflow file does `curl -X POST $PHXAGENTS_DEPLOY_HOOK` on push to main

## Phased delivery

This site ships in three phases:

| Phase | Status | What's included |
|---|---|---|
| **A — MVP (Claude-only)** | in progress | Auto-derived skill/agent pages, Iron Laws preamble, install page, Changelog stub, Plausible, llms.txt |
| **B — Multi-agent expansion** | landing with plugin v2.9.0 | Per-agent install pages (Codex, OpenCode, Pi), compatibility matrix, per-target invocation tabs on skill pages |
| **C — Iron Laws YAML** | landing with plugin v3.0.0 | Iron Laws aggregator switches data source from skill-parsing to `laws.yaml` |

Full architecture and rationale: `.claude/research/2026-05-08-phxagents-website-architecture.md` in the plugin repo.

## Contributing

- **Site bugs / typos / theme issues** → file in this repo (`oliver-kriska/phxagents-site`)
- **Plugin content / skill / agent issues** → file in [plugin repo](https://github.com/oliver-kriska/claude-elixir-phoenix/issues)

PRs welcome. Run `npm run build:local` before opening.

## License

Same as the plugin repo. See plugin repo for canonical license.

---

*Community plugin. Not affiliated with Phoenix Framework or [phoenix.new](https://phoenix.new).*
