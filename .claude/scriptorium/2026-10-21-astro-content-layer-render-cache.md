---
scriptorium: true
action: create
title: "Astro Content Layer Caches Rendered Markdown Past Plugin Changes"
type: solution
domain: general
tags: [astro, astro-7, content-collections, rehype, remark, cache, data-store]
---

# Astro content layer caches rendered Markdown past plugin changes

**Symptom:** you change a rehype/remark plugin in `astro.config.mjs` (or a module it imports) and `astro build` emits the *old* HTML. A debug `console.log`/`appendFileSync` in the plugin never fires, which makes it look like the plugin isn't wired at all. Other rehype plugins in the same array appear to "work" because their output was cached from before.

**Cause:** the glob loader renders each entry once and stores the HTML in the content data store, keyed by the *source file's* digest. A plugin change alters no source file, so nothing is invalidated. There are **two** stores, and `astro build` reads the second:

- `.astro/data-store.json` (dev / `astro sync` / `astro check`)
- `node_modules/.astro/data-store.json` (build)

Deleting only `.astro/data-store.json` is not enough; that is the trap.

**Fix:** delete both before verifying a Markdown-pipeline change:

```bash
rm -f .astro/data-store.json node_modules/.astro/data-store.json
```

CI that installs fresh (`npm ci`, with `actions/setup-node` `cache: 'npm'` caching only `~/.npm`) never sees this. It only bites local verification. Since it's a false negative, guard the behaviour with a post-build check on `dist/` (e.g. "no repository-relative hrefs in any HTML") rather than trusting a local rebuild.

Seen on Astro 7.4.1, phxagents-site, 2026-10-21. A rehype link rewriter gained a vfile-path fallback; the build kept shipping the un-rewritten link until both stores were cleared.

Related: the rehype plugin does receive `file.path` as the absolute source path (the symlinked path, e.g. `<project>/plugin-source/...`, not the realpath), so positional link resolution against a repo root works once the cache is cleared.
