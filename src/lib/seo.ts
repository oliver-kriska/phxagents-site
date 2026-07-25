/**
 * SERP text for skill/agent detail pages.
 *
 * Plugin frontmatter `description` is written for Claude's skill router, not for
 * a human scanning search results: it ends in a "Use when …" clause addressed to
 * the model and routinely runs past 240 chars, where Google renders ~160. The
 * detail routes shipped that string straight into <title>/<meta description>.
 *
 * These helpers derive SERP text from the same frontmatter rather than
 * hand-writing 77 strings, so the derived-never-duplicated rule still holds and
 * new plugin skills need no site-side edit. The visible page lede and the
 * TechArticle JSON-LD keep rendering the raw description unchanged — only the
 * search snippet is rewritten.
 *
 * See .claude/research/2026-07-17-gsc-serp-snippets.md.
 */

/** Google renders roughly this much of a description before truncating. */
const MAX_DESCRIPTION = 160;

/**
 * A clause aimed at the model rather than the reader, anchored to the start of
 * the string or a sentence boundary.
 *
 * Anchoring matters: the marker must follow ". " so that module names like
 * `Ecto.Query` or `AshPhoenix.Form` are never mistaken for sentence ends. The
 * markers are deliberately narrow — only openers that actually occur in the
 * plugin's frontmatter — so an unmatched description passes through untouched.
 */
const DIRECTIVE_CLAUSE =
  /(?:^|\.\s+)(?:Use\b|NOT for\b|Skip for\b|Trigger on\b|Internal use\b)/i;

/** Trim to `max` on a word boundary, adding an ellipsis when text is dropped. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;—-]+$/, '')}…`;
}

/**
 * Human-facing meta description derived from a plugin `description`.
 *
 * Drops the trailing model-facing clause and clamps to what Google will show.
 * Falls back to the raw text when a description is *only* a directive (e.g.
 * `full`, which opens with "Use for large features …") — a clamped real sentence
 * beats an empty snippet.
 */
export function serpDescription(raw: string): string {
  const match = DIRECTIVE_CLAUSE.exec(raw);
  const lead = match && match.index > 0 ? raw.slice(0, match.index).trim() : '';
  const text = lead || raw.trim();
  return clamp(text.endsWith('.') ? text : `${text}.`, MAX_DESCRIPTION);
}

/**
 * SERP title for a detail page.
 *
 * The bare name ("oban — phxagents") tells a cold searcher nothing about what
 * the page is; phxagents is not a term they know, but Claude Code is. Naming the
 * artifact lets the right reader self-select and the wrong one skip it.
 */
export function serpTitle(displayName: string, kind: 'skill' | 'agent'): string {
  return kind === 'skill'
    ? `${displayName} skill for AI coding agents — phxagents`
    : `${displayName} agent for Claude Code — phxagents`;
}
