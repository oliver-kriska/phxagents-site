---
scriptorium: true
action: create
title: "Astro 6 → 7 Migration Gotchas"
type: solution
domain: general
tags: [astro, astro-7, vite-8, esbuild, migration, upgrade, rust-compiler]
---

# Astro 6 → 7 Migration Gotchas

Migrated phxagents-site (static site, Cloudflare Pages, content collections + satori/sharp OG + sitemap) from Astro 6.4.8 to 7.0.0 on 2026-06-23. Build stayed at 82 pages, 0 vulnerabilities. The three non-obvious things that bite:

## 1. `compressHTML` default changed to `'jsx'` — strips inline whitespace (the silent one)

Astro 7's Rust compiler defaults `compressHTML` to `'jsx'` instead of `true`. JSX semantics strip **newline-only whitespace between inline elements**. Source like:

```astro
<p>... ships a dedicated
<a href="/x/">link text</a> so ...</p>
```

renders as `dedicated<a>link text` → **"dedicatedlink text"** (glued words). This is silent — the build succeeds, pages just have missing spaces wherever prose wraps a line before an inline `<a>`/`<strong>`/`<code>`/`<em>`.

**Fix:** `compressHTML: true` in `astro.config.mjs` restores v6 HTML whitespace collapsing.

**Detection trick** (grep built HTML for a letter immediately followed by an inline tag):
```bash
grep -oE '[a-z]<(strong|code|a |em)' dist/**/index.html
```
Non-zero hits = stripped spaces. Was 3, became 0 after the fix.

## 2. `markdown.rehypePlugins` / `remarkPlugins` deprecated → route through the `unified` processor

Astro 6 already warns: *"markdown.remarkPlugins, markdown.rehypePlugins... are deprecated. Pass them to unified({...}) from @astrojs/markdown-remark directly."* In v7 the shorthand still works but requires `@astrojs/markdown-remark` installed (it's a peer of astro@7, version-locked to `7.2.0`). Clean form:

```js
import { unified } from '@astrojs/markdown-remark';

markdown: {
  processor: unified({ rehypePlugins: [myPlugin] }), // remarkPlugins/remarkRehype/gfm/smartypants also go here
  shikiConfig: { themes: {...}, langAlias: {...} },   // shikiConfig stays at markdown level, NOT inside unified()
}
```

`UnifiedProcessorOptions` accepts only `remarkPlugins | rehypePlugins | remarkRehype | gfm | smartypants` — **not** `shikiConfig`/`syntaxHighlight`. Install: `npm i @astrojs/markdown-remark@^7.2.0`.

## 3. Vite 8 still pins esbuild 0.27.7 → npm `overrides` to clear the low-sev advisory

Astro 7 brings Vite 8 (Rolldown bundler). astro@7 itself uses the patched esbuild 0.28.1, but **vite@8 still depends on esbuild 0.27.7**, which carries low-sev GHSA-g7r4-m6w7-qqqr (dev-server arbitrary file read, Windows-only — non-exploitable for a static/Linux-CI/macOS-dev build, but Dependabot flags it). `npm audit fix` can't dedupe it. Force it tree-wide:

```jsonc
// package.json
"overrides": { "esbuild": "^0.28.1" }
```
→ `npm install` → `npm ls esbuild` shows both astro + vite deduped to 0.28.1 → `npm audit` reports 0. Build verified fine (esbuild 0.27→0.28 is a safe minor for vite's transform/dep-optimize usage).

## Other facts
- **Node floor: Astro 7 requires Node >=22.12.0** (engines). Bump `package.json` engines + check `.nvmrc`/`.tool-versions`.
- **No change needed:** `@astrojs/sitemap@3.7.3` works with astro@7 (no peer error). The `satori → sharp` OG endpoint, `getCollection()`/`render()`, and `output: static` all work unchanged.
- **Verify after upgrade:** count `<h1>` per page (heading-shift rehype plugin), confirm shiki `langAlias` still highlights (grep dist for `language-<alias>` plain fallbacks = should be 0), confirm OG PNGs + search.json + sitemap built, and **eyeball inline prose spacing** (see #1).
- The Astro v7 upgrade-guide WebFetch summary hallucinated some items ("Sätteri", reserved `src/fetch.ts`) — cross-check breaking changes against the real changelog / your own build warnings, don't trust the LLM page summary.
