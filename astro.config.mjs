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
 * Wrap every rendered markdown `<table>` in a keyboard-scrollable region so
 * skill/agent tables can scroll horizontally on narrow viewports instead of
 * forcing the whole page wider. The outer shell carries a mobile visual cue
 * without placing it inside the scrolling region.
 */
function rehypeWrapTables() {
  const wrap = (/** @type {any} */ node) => {
    if (!node.children) return;
    node.children = node.children.map((/** @type {any} */ child) => {
      if (child.type === 'element' && child.tagName === 'table') {
        return {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-region'] },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['table-scroll-hint'],
                ariaHidden: 'true',
              },
              children: [{ type: 'text', value: 'Scroll horizontally to view all columns' }],
            },
            {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['table-wrap'],
                tabIndex: 0,
                role: 'region',
                ariaLabel: 'Scrollable table',
              },
              children: [child],
            },
          ],
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

/** Map links between canonical runtime guides to their public site routes. */
function rehypeUpstreamDocLinks() {
  const routes = {
    'runtime-support.md': '/compatibility/',
    'amp.md': '/install/amp/',
    'codex.md': '/install/codex/',
    'pi.md': '/install/pi/',
    'opencode.md': '/install/opencode/',
    '../README.md#claude-code': '/install/#claude-code',
  };
  const rewrite = (/** @type {any} */ node) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const href = node.properties?.href;
      if (typeof href === 'string' && routes[href]) {
        node.properties.href = routes[href];
      } else if (href === '../README.md') {
        node.properties.href =
          'https://github.com/oliver-kriska/claude-elixir-phoenix/blob/main/README.md';
      }
    }
    if (node.children) for (const child of node.children) rewrite(child);
  };
  return (/** @type {any} */ tree) => {
    rewrite(tree);
  };
}

export default defineConfig({
  site: 'https://phxagents.dev',
  redirects: {
    '/amp': '/install/amp/',
  },
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
