#!/usr/bin/env node
/**
 * The marketplace ships more than the phx plugin, and the site now documents
 * every plugin in it. Each add-on's skills and agents fan out into several
 * outputs (a detail page, its Markdown twin, a catalog card, a search entry,
 * an llms.txt line, an OG card), and a file added upstream that misses one of
 * them is a page nobody can reach — or one an agent cannot find.
 *
 * This checks the built site against the plugin source:
 *   - every marketplace plugin is presented on /plugins/
 *   - every add-on with a README page has one at /plugins/<id>/
 *   - every add-on skill and agent on disk has all six outputs
 *   - neither /llms-full.txt nor any HTML page carries a repository-relative
 *     link, which resolves to a 404 once it leaves the plugin repository
 *
 * It reads dist/, so it runs after `astro build`. The registry is imported
 * from src/lib/plugins.ts (Node 22 strips its types).
 */

import fs from 'node:fs';
import path from 'node:path';
import { getPlugins } from '../src/lib/plugins.ts';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SOURCE = path.join(ROOT, 'plugin-source', 'plugins');

const errors = [];
const fail = (message) => errors.push(message);
const read = (rel) => {
  const file = path.join(DIST, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null;
};
const dirEntries = (p) => (fs.existsSync(p) ? fs.readdirSync(p) : []);

/**
 * A CommonMark closing fence: the opener's character, at least as long, and
 * nothing but whitespace after it. A line such as ```bash inside a fence is
 * content, not a close.
 * @param {string} line
 * @param {string} fence
 */
function isFenceClose(line, fence) {
  const close = line.match(/^\s{0,3}(`{3,}|~{3,})\s*$/);
  return !!close && close[1][0] === fence[0] && close[1].length >= fence.length;
}

if (!fs.existsSync(DIST)) {
  console.error('✗ dist/ is missing — run `astro build` first.');
  process.exit(1);
}

const plugins = getPlugins();
const overview = read('plugins/index.html');
const catalog = read('catalog/index.html') ?? '';
const llms = read('llms.txt') ?? '';
const search = JSON.parse(read('search.json') ?? '[]');
const searchUrls = new Set(search.map((item) => item.url));

if (!overview) fail('dist/plugins/index.html is missing');

let entries = 0;
for (const plugin of plugins) {
  if (overview && !overview.includes(plugin.displayName)) {
    fail(`/plugins/ does not present ${plugin.id} (expected "${plugin.displayName}")`);
  }
  if (plugin.hasPage && !read(`plugins/${plugin.id}/index.html`)) {
    fail(`${plugin.id} has no README page at /plugins/${plugin.id}/`);
  }
  if (!plugin.inCatalog) continue;

  const pluginDir = path.join(SOURCE, plugin.dir);
  const skills = dirEntries(path.join(pluginDir, 'skills')).filter((s) =>
    fs.existsSync(path.join(pluginDir, 'skills', s, 'SKILL.md'))
  );
  const agents = dirEntries(path.join(pluginDir, 'agents'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  for (const [kind, slugs] of [
    ['skills', skills],
    ['agents', agents],
  ]) {
    for (const slug of slugs) {
      entries++;
      const url = `/plugins/${plugin.id}/${kind}/${slug}/`;
      const missing = [];
      if (!read(`plugins/${plugin.id}/${kind}/${slug}/index.html`)) missing.push('page');
      if (!read(`plugins/${plugin.id}/${kind}/${slug}.md`)) missing.push('Markdown twin');
      if (!fs.existsSync(path.join(DIST, 'og', `plugins/${plugin.id}/${kind}/${slug}.png`))) {
        missing.push('OG card');
      }
      if (!catalog.includes(`href="${url}"`)) missing.push('catalog card');
      if (!searchUrls.has(url)) missing.push('search entry');
      if (!llms.includes(`https://phxagents.dev${url}`)) missing.push('llms.txt line');
      if (missing.length > 0) fail(`${url} is missing: ${missing.join(', ')}`);
    }
  }
}

// ── Repository-relative links in the full text export ────────────────────────
const full = read('llms-full.txt');
if (!full) {
  fail('dist/llms-full.txt is missing');
} else {
  let fence = null;
  const relative = [];
  for (const line of full.split('\n')) {
    const opener = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (isFenceClose(line, fence)) fence = null;
      continue;
    }
    if (opener) {
      fence = opener[1];
      continue;
    }
    const prose = line.split(/`+[^`]*`+/).join(' ');
    for (const [, href] of prose.matchAll(/\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g)) {
      if (!/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(href)) relative.push(href);
    }
  }
  if (relative.length > 0) {
    fail(
      `/llms-full.txt has ${relative.length} repository-relative link(s), e.g. ${[...new Set(relative)]
        .slice(0, 5)
        .join(', ')}. Map them in src/lib/upstreamLinks.mjs.`
    );
  }
}

// ── Repository-relative links in the HTML pages ──────────────────────────────
// Upstream Markdown links by repo-relative path; on a published page those
// resolve against the page URL. Every one should have been mapped or sent to
// GitHub by rehypeUpstreamDocLinks.
const htmlFiles = fs.readdirSync(DIST, { recursive: true }).filter((f) => f.endsWith('.html'));
const relativeHtml = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(DIST, file), 'utf-8');
  for (const [, href] of html.matchAll(/href="(\.{1,2}\/[^"]*|[^"#/:?][^":]*\.md(?:#[^"]*)?)"/g)) {
    relativeHtml.push(`${file}: ${href}`);
  }
}
if (relativeHtml.length > 0) {
  fail(
    `${relativeHtml.length} repository-relative link(s) in built HTML, e.g. ${relativeHtml
      .slice(0, 5)
      .join('; ')}. Map them in src/lib/upstreamLinks.mjs.`
  );
}

if (errors.length > 0) {
  console.error('✗ Plugin documentation parity check failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `✓ plugins: ${plugins.length} marketplace plugins presented, ${entries} add-on skills and agents ` +
    'each have a page, Markdown twin, OG card, catalog card, search entry and llms.txt line; ' +
    'no repository-relative links in /llms-full.txt or the HTML'
);
