// Links inside upstream-owned Markdown, mapped to where they resolve once
// published here. Plain JS so astro.config.mjs (the HTML rehype pass) and the
// text exports (/llms-full.txt) share one map instead of drifting apart.
//
// The runtime guides and the hook docs are written to be read in the plugin
// repository, so they link to each other by relative path. Left alone those
// resolve to 404s here. Hook group docs are reachable from three different
// depths (the repo-root HOOKS.md, the hooks README, and each other), so every
// spelling of the same target is listed rather than resolved positionally —
// a rewrite that guessed would silently mis-link on the next upstream move.

import path from 'node:path';

export const GH = 'https://github.com/oliver-kriska/claude-elixir-phoenix';

export const HOOK_GROUPS = [
  'safety-gates',
  'code-quality',
  'failure-recovery',
  'context-injection',
  'session-lifecycle',
  'workflow-state',
];

/** @type {Record<string, string>} */
const routes = {
  'runtime-support.md': '/compatibility/',
  'amp.md': '/install/amp/',
  'codex.md': '/install/codex/',
  'pi.md': '/install/pi/',
  'opencode.md': '/install/opencode/',
  'dsh.md': '/install/dsh/',
  '../README.md#claude-code': '/install/#claude-code',
  '../README.md': `${GH}/blob/main/README.md`,
  // Hook overview, as spelled from the hooks directory.
  '../../../HOOKS.md': '/hooks/',
  // Contributor guide, as spelled from HOOKS.md and from a group doc.
  'plugins/elixir-phoenix/hooks/README.md': '/hooks/contributing/',
  '../README.md#output-rules-per-event': '/hooks/contributing/#output-rules-per-event',
  // Not a document — send readers to the scripts themselves.
  'plugins/elixir-phoenix/hooks/scripts/': `${GH}/tree/main/plugins/elixir-phoenix/hooks/scripts`,
};

for (const group of HOOK_GROUPS) {
  // From HOOKS.md at the repo root, from the hooks README, and sibling-relative
  // between group docs — plus the one deep link that carries an anchor.
  routes[`plugins/elixir-phoenix/hooks/docs/${group}.md`] = `/hooks/${group}/`;
  routes[`docs/${group}.md`] = `/hooks/${group}/`;
  routes[`${group}.md`] = `/hooks/${group}/`;
  routes[`docs/${group}.md#fail-open-contract`] = `/hooks/${group}/#fail-open-contract`;
}

/**
 * The site route (or GitHub URL) for an upstream link as spelled, or null when
 * the spelling is not a known cross-document link.
 * @param {string} href
 * @returns {string | null}
 */
export function upstreamRoute(href) {
  return routes[href] ?? null;
}

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i;

/**
 * The GitHub URL for a relative link written inside a plugin-repository
 * document, or null when the link is absolute, an in-page anchor, or climbs
 * out of the repository.
 * @param {string} href
 * @param {string} repoPath path of the containing document inside the plugin repository
 * @returns {string | null}
 */
export function githubHref(href, repoPath) {
  if (ABSOLUTE.test(href)) return null;
  const [target, anchor] = href.split('#', 2);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(repoPath), target));
  if (resolved.startsWith('..')) return null;
  const kind = target.endsWith('/') ? 'tree' : 'blob';
  return `${GH}/${kind}/main/${resolved.replace(/\/$/, '')}${anchor ? `#${anchor}` : ''}`;
}

/**
 * Resolve one link from a plugin-repository document for a standalone text
 * export: known spellings go to their absolute site URL, any other relative
 * link to the file it names on GitHub. Absolute URLs, site-absolute paths and
 * in-page anchors are left alone.
 * @param {string} href
 * @param {string} repoPath path of the containing document inside the plugin repository
 * @param {string | URL} site
 */
export function absoluteUpstreamHref(href, repoPath, site) {
  const route = upstreamRoute(href);
  if (route) return new URL(route, site).href;
  return githubHref(href, repoPath) ?? href;
}

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

/**
 * Rewrite every inline and reference-style Markdown link in `body` with
 * absoluteUpstreamHref, leaving fenced code blocks and code spans untouched.
 * @param {string} body
 * @param {string} repoPath
 * @param {string | URL} site
 */
export function rebaseMarkdownLinks(body, repoPath, site) {
  const fix = (/** @type {string} */ href) => absoluteUpstreamHref(href, repoPath, site);
  let fence = null;
  return body
    .split('\n')
    .map((line) => {
      const opener = line.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (fence) {
        if (isFenceClose(line, fence)) fence = null;
        return line;
      }
      if (opener) {
        fence = opener[1];
        return line;
      }
      const definition = line.match(/^(\s{0,3}\[[^\]]+\]:\s*)(<[^>]+>|\S+)(.*)$/);
      if (definition) {
        const [, lead, rawHref, rest] = definition;
        const href = rawHref.replace(/^<|>$/g, '');
        return `${lead}${fix(href)}${rest}`;
      }
      // Odd-indexed segments are code spans; only prose between them is rewritten.
      return line
        .split(/(`+[^`]*`+)/)
        .map((segment, i) =>
          i % 2 === 1
            ? segment
            : segment.replace(
                /(\]\()(<[^>]+>|[^)\s]+)((?:\s+"[^"]*")?\))/g,
                (_, open, rawHref, close) => `${open}${fix(rawHref.replace(/^<|>$/g, ''))}${close}`
              )
        )
        .join('');
    })
    .join('\n');
}
