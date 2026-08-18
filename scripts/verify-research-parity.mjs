#!/usr/bin/env node
/**
 * Research reports are published twice: as a designed `.astro` page and as the
 * raw Markdown twin served at /research/<slug>.md (and embedded in
 * /llms-full.txt). Two hand-maintained copies drift, and for a report whose
 * whole argument is "the .md route is what agents actually read", a twin that
 * quietly disagrees with the page would be worse than no twin at all.
 *
 * This runs after `astro build` and diffs the two rendered artifacts:
 *   - every figure in the HTML must appear in the Markdown, and vice versa
 *   - the twin must exist and be non-trivial
 *
 * It reads dist/, not source, so CSS values, Astro expressions and inline
 * styles are already gone.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');
const SLUGS = fs.existsSync(path.join(DIST, 'research'))
  ? fs
      .readdirSync(path.join(DIST, 'research'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

/** Strip script/style, then tags, then decode the few entities we emit. */
function htmlToText(html) {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lbrace;/g, '{')
    .replace(/&rbrace;/g, '}')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#x27;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Multi-character figures only. Bare single digits are dropped because the
 * Markdown adds list markers ("1.", "2.") and the HTML generates its K0n / step
 * numbering from CSS counters — neither is data, and both would be pure noise.
 */
function figures(text) {
  const counts = new Map();
  for (const match of text.match(/\d[\d,]*(?:\.\d+)*%?/g) ?? []) {
    if (match.length < 2) continue;
    counts.set(match, (counts.get(match) ?? 0) + 1);
  }
  return counts;
}

function diff(a, b) {
  const missing = [];
  for (const [figure, count] of a) {
    const other = b.get(figure) ?? 0;
    if (other < count) missing.push(`${figure}${count - other > 1 ? ` ×${count - other}` : ''}`);
  }
  return missing;
}

let failed = false;

for (const slug of SLUGS) {
  const htmlPath = path.join(DIST, 'research', slug, 'index.html');
  const mdPath = path.join(DIST, 'research', `${slug}.md`);

  if (!fs.existsSync(mdPath)) {
    console.error(`✗ ${slug}: no Markdown twin at /research/${slug}.md`);
    failed = true;
    continue;
  }

  const md = fs.readFileSync(mdPath, 'utf-8');
  if (md.length < 2000) {
    console.error(`✗ ${slug}: Markdown twin is only ${md.length} bytes — looks truncated`);
    failed = true;
    continue;
  }

  // The page carries site chrome (nav, footer) that the Markdown has no reason
  // to repeat, so compare only the report body.
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const bodyStart = html.indexOf('<article class="report">');
  const bodyEnd = html.lastIndexOf('</article>');
  if (bodyStart === -1 || bodyEnd === -1) {
    console.error(`✗ ${slug}: could not locate <article class="report"> in the built page`);
    failed = true;
    continue;
  }

  const pageFigures = figures(htmlToText(html.slice(bodyStart, bodyEnd)));
  const mdFigures = figures(md);

  const missingFromMd = diff(pageFigures, mdFigures);
  const missingFromPage = diff(mdFigures, pageFigures);

  if (missingFromMd.length > 0 || missingFromPage.length > 0) {
    console.error(`✗ ${slug}: page and Markdown twin disagree`);
    if (missingFromMd.length > 0) {
      console.error(`  on the page, absent from the .md: ${missingFromMd.join(', ')}`);
    }
    if (missingFromPage.length > 0) {
      console.error(`  in the .md, absent from the page: ${missingFromPage.join(', ')}`);
    }
    failed = true;
    continue;
  }

  console.log(
    `✓ ${slug}: ${pageFigures.size} distinct figures match across /research/${slug}/ and /research/${slug}.md`
  );
}

if (failed) {
  console.error(
    '\nResearch parity check failed. Update src/data/research/<slug>.md and the .astro page together.'
  );
  process.exit(1);
}
