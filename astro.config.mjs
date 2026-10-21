// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import fs from 'node:fs';
import path from 'node:path';
import { githubHref, upstreamRoute } from './src/lib/upstreamLinks.mjs';

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

/**
 * Map links inside upstream-owned Markdown to their public site routes. The map
 * itself lives in src/lib/upstreamLinks.mjs, shared with the /llms-full.txt
 * export so the HTML and text copies of a document link to the same places.
 * A relative link the map does not know (an add-on README pointing at eval
 * results elsewhere in the repo) goes to that file on GitHub instead of
 * resolving against the page URL into a 404.
 */
function rehypeUpstreamDocLinks() {
  const sourceRoots = [path.resolve('plugin-source'), fs.realpathSync(path.resolve('plugin-source'))];
  /** @param {string | undefined} file */
  const repoPathOf = (file) => {
    const root = file && sourceRoots.find((r) => file.startsWith(r + path.sep));
    return root ? path.relative(root, file).split(path.sep).join('/') : null;
  };
  /** @param {any} node @param {string | null} repoPath */
  const rewrite = (node, repoPath) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const href = node.properties?.href;
      if (typeof href === 'string') {
        const route = upstreamRoute(href) ?? (repoPath ? githubHref(href, repoPath) : null);
        if (route) node.properties.href = route;
      }
    }
    if (node.children) for (const child of node.children) rewrite(child, repoPath);
  };
  return (/** @type {any} */ tree, /** @type {any} */ file) => {
    rewrite(tree, repoPathOf(file?.path));
  };
}

/**
 * github-light colours variables, markdown list markers and diffs `#E36209`,
 * 3.49:1 on its white canvas. Every other token in the theme clears 4.5:1, so
 * the one colour is swapped for a darker orange of the same hue (4.83:1)
 * rather than changing themes. The dark palette (`--shiki-dark`) is untouched.
 * @type {import('shiki').ShikiTransformer}
 */
const shikiAaLightTokens = {
  name: 'phxagents:aa-light-tokens',
  span(node) {
    const style = node.properties?.style;
    if (typeof style === 'string') {
      node.properties.style = style.replace(/(^|;)color:#e36209/i, '$1color:#B35900');
    }
  },
};

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
      transformers: [shikiAaLightTokens],
    },
  },
});
