// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

/**
 * Demote every in-content heading by one level (h1→h2 … h5→h6; h6 stays h6).
 *
 * Each skill/agent body starts with its own `# Title` and uses `##`/`###` for
 * sections. The detail-page layout already renders the page title as the single
 * visible <h1>, so leaving the body headings as-is produces two <h1>s per page
 * (an SEO problem). Shifting them down a level means the layout <h1> is the only
 * <h1>, while the body keeps its relative heading hierarchy.
 *
 * Runs on the rehype (HTML) AST, so it only touches real heading *elements* —
 * never `#` comments inside fenced code blocks. The companion CSS in
 * DocsLayout.astro is shifted by the same +1 so the rendering is unchanged.
 */
function rehypeShiftHeadings() {
  const shift = (/** @type {any} */ node) => {
    if (node.type === 'element' && /^h[1-5]$/.test(node.tagName)) {
      node.tagName = 'h' + (Number(node.tagName.charAt(1)) + 1);
    }
    if (node.children) for (const child of node.children) shift(child);
  };
  return (/** @type {any} */ tree) => {
    shift(tree);
  };
}

/**
 * Wrap every rendered markdown `<table>` in `<div class="table-wrap">` so
 * skill/agent tables can scroll horizontally on narrow viewports instead of
 * forcing the whole page wider (same pattern as the hand-authored tables in
 * install.astro / tidewave-mcp.astro — see DocsLayout.astro's matching CSS).
 */
function rehypeWrapTables() {
  const wrap = (/** @type {any} */ node) => {
    if (!node.children) return;
    node.children = node.children.map((/** @type {any} */ child) => {
      if (child.type === 'element' && child.tagName === 'table') {
        return {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [child],
        };
      }
      wrap(child);
      return child;
    });
  };
  return (/** @type {any} */ tree) => {
    wrap(tree);
  };
}

/**
 * The canonical Amp guide lives in plugin-source/docs/amp.md, where its README
 * link is relative to the plugin repository. On the site that relative URL
 * would point at a page that does not exist, so map only that source link to
 * its public GitHub destination. Other links, including Amp's manual, remain
 * untouched.
 */
function rehypeUpstreamDocLinks() {
  const rewrite = (/** @type {any} */ node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      node.properties?.href === '../README.md'
    ) {
      node.properties.href =
        'https://github.com/oliver-kriska/claude-elixir-phoenix/blob/main/README.md';
    }
    if (node.children) for (const child of node.children) rewrite(child);
  };
  return (/** @type {any} */ tree) => {
    rewrite(tree);
  };
}

export default defineConfig({
  site: 'https://phxagents.dev',
  // Astro 7 changed the default to 'jsx', which strips newline-only whitespace
  // between inline elements (JSX semantics) — that glued words like
  // "dedicated<a>…" in prose. `true` restores v6 HTML whitespace collapsing.
  compressHTML: true,
  build: {
    // Default 'auto' only inlines stylesheets under ~4KB; this site's shared
    // layout + per-page bundles all sit above that, so every page shipped two
    // render-blocking <link rel="stylesheet"> tags. Inlining trades cross-page
    // CSS caching (82 pages share Default.css) for removing that render-block
    // on every page — worth it here since the total CSS is small and gzips well.
    inlineStylesheets: 'always',
  },
  integrations: [sitemap()],
  markdown: {
    // Astro 7: remark/rehype plugins run through the `unified` processor from
    // @astrojs/markdown-remark (the old `markdown.rehypePlugins` shorthand is
    // deprecated). shikiConfig stays at the markdown level — it's applied by
    // Astro's syntax highlighter, not the unified processor.
    processor: unified({
      rehypePlugins: [rehypeShiftHeadings, rehypeWrapTables, rehypeUpstreamDocLinks],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      langAlias: { heex: 'html', eex: 'html', sface: 'html' },
    },
  },
});
