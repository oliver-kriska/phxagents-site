---
scriptorium: true
action: update
title: "Vercel Satori"
type: tool
domain: claude-elixir-phoenix
tags: [og-images, satori, sharp, resvg, astro, build-time]
---

## Refinement: rasterize with `sharp` instead of `@resvg/resvg-js`

The standard pairing is `satori` + `@resvg/resvg-js`, but `@resvg/resvg-js` is a
native module (one more prebuilt-binary dependency to verify in CI). If the
project **already depends on `sharp`** (Astro image optimization does), you can
skip resvg entirely:

- satori renders with `embedFont: true` (the default), so glyphs come out as
  vector `<path>` elements — the output SVG has **no `<text>` nodes and no font
  dependency at raster time**. Verified: `svg.includes('<text') === false`.
- Therefore `sharp(Buffer.from(svg)).png().toBuffer()` rasterizes it faithfully
  without any system fonts installed.

Net: `satori` is the only new dependency; `sharp` (already present) does the PNG
step. Used on phxagents.dev — build-time endpoint `src/pages/og/[...slug].png.ts`
generates `dist/og/<slug>.png` for ~74 pages in ~2s.

### Font-format gotcha

satori reads **TTF / OTF / WOFF**, but **not WOFF2**, and does not handle
variable fonts well. `@fontsource-variable/*` packages ship WOFF2 only → unusable
directly. `@fontsource/*` static packages ship `.woff` (e.g.
`jetbrains-mono-latin-400-normal.woff`), which satori loads fine. On phxagents.dev
the OG cards use JetBrains Mono `.woff` (Inter was variable/woff2-only, so it was
dropped from the card) — the mono look fits the terminal brand anyway.
