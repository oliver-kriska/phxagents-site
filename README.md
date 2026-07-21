# phxagents-site

Documentation site for the
[phxagents plugin](https://github.com/oliver-kriska/claude-elixir-phoenix) —
Iron Laws and specialist Elixir/Phoenix guidance for Claude Code and Amp.

Live at **[phxagents.dev](https://phxagents.dev)**.

## What this repo does

This repo builds the documentation site. **It does not contain plugin source
code.** The plugin lives in
[oliver-kriska/claude-elixir-phoenix](https://github.com/oliver-kriska/claude-elixir-phoenix).
This repo:

1. Clones the plugin repo at build time (`scripts/clone-source.sh`)
2. Reads skills, agents, references, the Amp guide, and release data from the
   cloned source
3. Generates a static Astro site with auto-derived pages, counts, and stats
4. Deploys to Cloudflare Pages on push to `main` or a repository dispatch from
   the plugin repo

**You should never hand-edit content that exists in the plugin repo.** Skill
pages, agent pages, the Amp guide, homepage stat counters, and version data are
derived at build time. Edit those in the plugin repo.

## Stack

- **Framework**: [Astro](https://astro.build) 7 with custom documentation layouts
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/) via GitHub
  Actions direct upload
- **Search**: Build-time `/search.json` index with a custom command palette
- **Markdown**: Astro content collections with Shiki syntax highlighting
- **Analytics**: [Plausible](https://plausible.io) (privacy-friendly, no cookies)
- **Node**: 22 LTS (pinned via `.tool-versions`, `.nvmrc`, and `package.json` engines)

## Repo layout

```text
phxagents-site/
├── .nvmrc, .tool-versions       Node 22 LTS pin
├── astro.config.mjs             Astro, Markdown, syntax, and HTML processing
├── package.json                 deps + scripts
├── plugin-source/               (gitignored) symlink in dev, clone in CI
├── public/                      static assets (favicon, etc.)
├── scripts/
│   ├── clone-source.sh          clones plugin repo at build
│   └── dev-link.sh              creates symlink for local dev
└── src/
    ├── components/              shared site components
    ├── content.config.ts        skills, agents, references, and upstream docs
    ├── data/
    │   ├── stats.ts             build-time counts derived from filesystem
    │   └── release.ts           latest GitHub release fetcher
    ├── pages/
    │   ├── amp.astro            renders plugin-source/docs/amp.md
    │   ├── skills/              auto-generated skill pages from plugin repo
    │   ├── agents/              auto-generated agent pages from plugin repo
    │   ├── og/                  build-time Open Graph images
    │   └── search.json.ts       generated search index
    └── styles/
        └── global.css           design tokens and shared styles
```

## Local development

### Prerequisites

- Node 22 LTS (use `mise` / `asdf` / `nvm` — `.nvmrc` and `.tool-versions`
  set the pin)
- Both repos checked out side-by-side:

  ```text
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

The symlink lives at `./plugin-source` and is gitignored. Edits to skills,
agents, references, and `docs/amp.md` in the plugin repo are available to the
local site build without copying content between repositories.

### Daily workflow

```bash
npm run dev               # local preview, watches for changes
npm run build:local       # build without re-cloning (uses existing symlink/clone)
npm run preview           # preview the production build
```

## Production build

The production build runs `scripts/clone-source.sh` first, which fetches a
shallow clone of the plugin repo:

```bash
npm run build             # clones plugin repo to ./plugin-source then builds
```

If `./plugin-source` is already a symlink (local dev), the clone step is skipped.

## Auto-update flow

```text
plugin repo push → main
        ↓
plugin repo GitHub Action fires for imported content changes
        ↓
repository_dispatch → phxagents-site deploy workflow
        ↓
GitHub Actions runs:
   sh scripts/clone-source.sh        (git clone --depth 1)
   astro build                        (renders site from cloned content)
   wrangler pages deploy dist         (direct upload)
        ↓
deployed to phxagents.dev within ~60–90 seconds
```

A daily cron-triggered rebuild refreshes time-sensitive external data: GitHub
stars, latest release notes, and last-updated timestamps.

## Zero-manual-update principle

**The plugin repo is the only source of truth.** Every numeric, version, list,
count, name, and link on this site is derived at build time:

| Site value | Source |
| --- | --- |
| Plugin version | `.claude-plugin/plugin.json` |
| Skill count | filesystem (glob count) |
| Agent count | filesystem (glob count) |
| Reference count | filesystem (glob count) |
| Iron Laws count | parsed from `CLAUDE.md` (Phase A) → `laws.yaml` (Phase C) |
| Skill pages | `plugins/elixir-phoenix/skills/*/SKILL.md` |
| Agent pages | `plugins/elixir-phoenix/agents/*.md` |
| Amp installation and usage guide | `docs/amp.md` |
| Hero tagline | `plugin.json.description` |
| Latest release | GitHub Releases API at build (cached) |

Adding a new skill in the plugin repo makes the site render a new page on the
next push. No site repository edits are required.

## What you can hand-edit safely

Site presentation and integration code:

- `src/layouts/Default.astro` — shared shell, metadata, navigation, and footer
- `src/layouts/DocPage.astro` — narrative documentation layout and sidebar
- `src/pages/*.astro` — page framing and site-specific narrative
- `src/styles/global.css` — design tokens and shared styles
- `public/` and `src/assets/` — static brand assets

Canonical skill, agent, reference, and Amp guide content belongs in the plugin
repository. The `/amp/` page deliberately fails its build if `docs/amp.md` is
missing rather than falling back to a duplicated site copy.

## Deployment

This repo deploys to Cloudflare Pages through `.github/workflows/deploy.yml`:

1. GitHub Actions checks out the site.
2. `scripts/clone-source.sh` clones the plugin repository's current `main`.
3. `npm run build:local` writes the static site to `dist`.
4. Wrangler uploads `dist` to the `phxagents-site` Pages project.
5. `phxagents.dev` points at the Pages deployment.

### Cross-repo trigger

The plugin repo's `.github/workflows/notify-site.yml` sends a
`plugin-content-changed` repository dispatch. This repository's deploy workflow
handles that event. The plugin repository needs `SITE_DISPATCH_TOKEN`; this
repository needs the Cloudflare account and API-token secrets documented in
`docs/cloudflare-setup.md`.

## Client documentation

| Client | Status |
| --- | --- |
| Claude Code | Full plugin documentation |
| Amp | Generated 51-skill edition at `/amp/` |
| Codex, OpenCode, Pi | Broader adapter work remains in review upstream |

Full architecture and rationale:
`.claude/research/2026-05-08-phxagents-website-architecture.md` in the plugin
repository.

## Contributing

- **Site bugs / typos / theme issues** → file in this repository
  (`oliver-kriska/phxagents-site`)
- **Plugin content / skill / agent issues** → file in the
  [plugin repository](https://github.com/oliver-kriska/claude-elixir-phoenix/issues)

PRs welcome. Run `npm run build:local` before opening.

## License

Same as the plugin repo. See plugin repo for canonical license.

---

*Community plugin. Not affiliated with Phoenix Framework or [phoenix.new](https://phoenix.new).*
