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

export default defineConfig({
  site: 'https://phxagents.dev',
  // Astro 7 changed the default to 'jsx', which strips newline-only whitespace
  // between inline elements (JSX semantics) — that glued words like
  // "dedicated<a>…" in prose. `true` restores v6 HTML whitespace collapsing.
  compressHTML: true,
  integrations: [sitemap()],
  markdown: {
    // Astro 7: remark/rehype plugins run through the `unified` processor from
    // @astrojs/markdown-remark (the old `markdown.rehypePlugins` shorthand is
    // deprecated). shikiConfig stays at the markdown level — it's applied by
    // Astro's syntax highlighter, not the unified processor.
    processor: unified({ rehypePlugins: [rehypeShiftHeadings] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      langAlias: { heex: 'html', eex: 'html', sface: 'html' },
    },
  },
});
