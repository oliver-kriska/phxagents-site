# Cloudflare Pages setup

Two things must happen once for the site to deploy:

1. Cloudflare side: get an API token + account ID, create the Pages project
2. GitHub side: add the secrets so the deploy workflow can use them

After this, every push to `main` deploys automatically. Plugin-repo
changes trigger a redeploy via `repository_dispatch`.

## Step 1 — Cloudflare API token

CF dashboard → **My Profile** → **API Tokens** → **Create Token**.

Use the **"Edit Cloudflare Workers"** template — it grants permissions
for both Workers and Pages. Or create a custom token with these
permissions:

- Account → **Cloudflare Pages** → **Edit**
- Account → **Account Settings** → **Read**

Copy the token value. You will not be able to view it again.

## Step 2 — Cloudflare account ID

CF dashboard → any page → right sidebar shows **Account ID**. Copy it.

## Step 3 — Create the Pages project (one-time, via CLI)

You can do this via the dashboard OR via wrangler:

```bash
# Set the credentials in your shell (one-time, do not commit)
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...

# Create the Pages project
npx wrangler pages project create phxagents-site \
  --production-branch=main
```

This creates an empty project with no GitHub connection — deploys come
via the GitHub Action below.

## Step 4 — GitHub Secrets

In `oliver-kriska/phxagents-site` → Settings → Secrets and variables → Actions
→ New repository secret:

| Secret name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | from Step 1 |
| `CLOUDFLARE_ACCOUNT_ID` | from Step 2 |

## Step 5 — First deploy

Trigger the workflow manually:

```bash
gh workflow run deploy.yml -R oliver-kriska/phxagents-site
gh run watch -R oliver-kriska/phxagents-site
```

Or just push any change to `main` — the workflow runs on every push.

## Step 6 — Custom domain

Via wrangler:

```bash
npx wrangler pages domain add phxagents-site phxagents.dev
```

Or via dashboard: CF Pages project → Custom domains → Set up a custom
domain → `phxagents.dev`.

CF will tell you to add a CNAME record:
```
phxagents.dev   CNAME   phxagents-site.pages.dev
```

If your domain's DNS is also on Cloudflare, this is automatic.

## Step 7 — Cross-repo trigger from plugin repo

The plugin repo needs a 5-line GitHub Action that fires
`repository_dispatch` to this site repo whenever skills/agents/CHANGELOG
change.

In `oliver-kriska/claude-elixir-phoenix`:

```bash
gh secret set PHXAGENTS_DISPATCH_TOKEN --body="$(gh auth token)"
```

…and create `.github/workflows/trigger-site.yml` in the plugin repo:

```yaml
name: Trigger phxagents.dev rebuild
on:
  push:
    branches: [main]
    paths:
      - 'plugins/elixir-phoenix/**'
      - 'README.md'
      - 'CHANGELOG.md'

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer ${{ secrets.PHXAGENTS_DISPATCH_TOKEN }}" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            https://api.github.com/repos/oliver-kriska/phxagents-site/dispatches \
            -d '{"event_type":"plugin-content-changed"}'
```

Use a **fine-grained PAT** with `Contents: read` on the site repo
(GitHub Token can only dispatch to its own repo, so a PAT is needed
for cross-repo dispatch).

Alternative if you want to skip the PAT: use the Cloudflare Pages
**Deploy Hook** instead — give the plugin repo a CF webhook URL and
hit it with `curl`. CF dashboard → Pages project → Settings → Builds &
deployments → Deploy hooks → Add deploy hook.

## Daily rebuild

`.github/workflows/daily-rebuild.yml` runs at 06:00 UTC daily to refresh
the latest-release widget and any other time-sensitive data. ~30
deploys/month — well under CF's 500-build free tier.

Disable it if not needed:

```bash
gh workflow disable daily-rebuild.yml -R oliver-kriska/phxagents-site
```

## Verify deploys

```bash
# List recent deploys
npx wrangler pages deployment list --project-name=phxagents-site

# Tail logs of a build
npx wrangler pages deployment tail --project-name=phxagents-site
```

## Troubleshooting

- **`Sharp build error`**: Node 22 has prebuilds; if a deploy ever uses
  Node 23+ Sharp may rebuild from source. Pin via `.nvmrc` (already
  done) and CF respects it.
- **Build fails with `plugin-source not found`**: `scripts/clone-source.sh`
  must run before `astro build`. The deploy workflow does this
  explicitly via `npm run build:local`.
- **Stale content after plugin push**: check the plugin repo's
  `trigger-site.yml` ran (Actions tab). If yes, check this repo's
  `deploy.yml` ran (Actions tab here). If not, the dispatch failed —
  check the PAT.
