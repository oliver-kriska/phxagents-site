import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { getPluginSourceDate } from './sourceDates';

/**
 * The plugin's CHANGELOG.md, split by major version. /changelog/ carries the
 * current major (plus Unreleased); each earlier major gets its own archive page
 * at /changelog/v<major>/, so the page people land on is the one they need and
 * not ~180 KB of every release since 1.0.
 *
 * Upstream follows Keep a Changelog: a preamble, then one `## [x.y.z] - date`
 * section per release, newest first, with no reference-style links, so each
 * section renders on its own.
 */

export interface ChangelogRelease {
  version: string;
  /** ISO date from the heading; absent for Unreleased. */
  date?: string;
  markdown: string;
}

export interface ChangelogMajor {
  major: number;
  /** Route segment and display label: `v3`. */
  label: string;
  url: string;
  releases: ChangelogRelease[];
  /** Newest and oldest release dates in this major. */
  newest: string;
  oldest: string;
}

const SOURCE = 'CHANGELOG.md';
const HEADING = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?\s*$/;

let cached: { preamble: string; majors: ChangelogMajor[] } | null = null;

function load() {
  if (cached) return cached;
  const text = fs.readFileSync(path.join(process.cwd(), 'plugin-source', SOURCE), 'utf-8');

  const lines = text.split('\n');
  const preamble: string[] = [];
  const releases: ChangelogRelease[] = [];
  let current: { version: string; date?: string; lines: string[] } | null = null;
  const flush = () => {
    if (current) releases.push({ version: current.version, date: current.date, markdown: current.lines.join('\n') });
  };
  for (const line of lines) {
    const match = HEADING.exec(line);
    if (match) {
      flush();
      current = { version: match[1], date: match[2], lines: [line] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  flush();

  // Unreleased belongs with the newest major: it is what ships next.
  const byMajor = new Map<number, ChangelogRelease[]>();
  let latest = 0;
  for (const release of releases) {
    const major = Number(release.version.split('.')[0]);
    if (Number.isNaN(major)) continue;
    latest = Math.max(latest, major);
    if (!byMajor.has(major)) byMajor.set(major, []);
    byMajor.get(major)!.push(release);
  }
  const unreleased = releases.filter((r) => Number.isNaN(Number(r.version.split('.')[0])));
  if (unreleased.length) byMajor.get(latest)?.unshift(...unreleased);

  const majors = [...byMajor.entries()]
    .sort(([a], [b]) => b - a)
    .map(([major, list]): ChangelogMajor => {
      const dates = list.map((r) => r.date).filter((d): d is string => Boolean(d)).sort();
      return {
        major,
        label: `v${major}`,
        url: major === latest ? '/changelog/' : `/changelog/v${major}/`,
        releases: list,
        newest: dates.at(-1) ?? '',
        oldest: dates[0] ?? '',
      };
    });

  if (majors.length === 0) throw new Error('CHANGELOG.md has no `## [x.y.z] - date` sections');
  cached = { preamble: preamble.join('\n'), majors };
  return cached;
}

/** Every major, newest first; the first is the one /changelog/ shows. */
export function getChangelogMajors(): ChangelogMajor[] {
  return load().majors;
}

/** "2026-02-19 to 2026-07-20", or the one date when a major has one release day. */
export function changelogSpan(major: ChangelogMajor, separator = ' to '): string {
  return major.oldest === major.newest ? major.newest : `${major.oldest}${separator}${major.newest}`;
}

/** Majors with their own archive page (all but the current one). */
export function getChangelogArchives(): ChangelogMajor[] {
  return load().majors.slice(1);
}

/** The preamble without its `# Changelog` heading (the page supplies its own). */
export function getChangelogPreamble(): string {
  return load().preamble.replace(/^# .*\n/, '').trim();
}

/**
 * dateModified for a changelog page. The current page also carries Unreleased
 * notes, which change between releases, so it takes the file's last commit;
 * an archive is dated by its newest release.
 */
export function changelogDateModified(major: ChangelogMajor): string {
  return major.url === '/changelog/' ? getPluginSourceDate(SOURCE) : major.newest;
}

// Release sections start at `##`, which stays an <h2> under the page's <h1>; a
// stray `#` is demoted so the page keeps one <h1>. Release headings get an id
// (`v3.2.0`) so a single release can be linked. A local Marked instance avoids
// mutating the parser iron-laws.astro uses.
const marked = new Marked({
  walkTokens(token) {
    if (token.type === 'heading' && token.depth === 1) token.depth = 2;
  },
  renderer: {
    heading({ tokens, depth, text }) {
      const inner = this.parser.parseInline(tokens);
      const version = depth === 2 ? /^\[?([0-9][^\]\s]*)\]?/.exec(text)?.[1] : undefined;
      return version
        ? `<h${depth} id="v${version}">${inner}</h${depth}>\n`
        : `<h${depth}>${inner}</h${depth}>\n`;
    },
  },
});

export async function renderChangelog(markdown: string): Promise<string> {
  return marked.parse(markdown);
}
