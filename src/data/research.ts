import fs from 'node:fs';
import path from 'node:path';

/**
 * Site-owned research reports.
 *
 * Unlike skills/agents these are not derived from `plugin-source/` — they are
 * written here. Each report keeps its prose in a real `.md` file so the Markdown
 * is the artifact, not a serialization of the page: `/research/<slug>.md` serves
 * it verbatim and `/llms-full.txt` embeds it, exactly like the plugin-derived
 * collections. The `.astro` page is the presentation layer over the same figures.
 *
 * `scripts/verify-research-parity.mjs` (run as part of `npm run build:local`)
 * diffs every figure in the rendered HTML against the Markdown, so the two
 * cannot drift apart silently.
 *
 * Uses process.cwd() for the same reason as data/stats.ts: Astro always runs
 * from the project root, while import.meta.url moves around under Vite.
 */

const ROOT = process.cwd();
const RESEARCH_DIR = path.join(ROOT, 'src', 'data', 'research');

export type ResearchTone = 'good' | 'warn' | 'crit';

export interface ResearchStat {
  /** The measured figure, verbatim. */
  value: string;
  /** Full label, as the page's hero strip shows it. */
  label: string;
  /** Compressed form for the OG card, whose cells are only ~230px wide. */
  cardLabel: string;
  tone: ResearchTone;
}

export interface ResearchReport {
  slug: string;
  /** Nav/search label. Deliberately shorter than the report's own headline. */
  name: string;
  /** Short display headline — the page's hero title and the OG card title. */
  title: string;
  /** What was measured, as one line. Shown under the hero and on the card. */
  sample: string;
  description: string;
  /** Shown in the `<title>`; kept under ~60 chars so it survives a SERP. */
  seoTitle: string;
  datePublished: string;
  /**
   * The report's headline figures, rendered by both the page hero and the
   * Open Graph card so a shared preview cannot quote a number the page no
   * longer carries.
   */
  heroStats: ResearchStat[];
  /** Markdown body, verbatim — served at /research/<slug>.md. */
  body: string;
  /** The report's own H1 — its thesis. Derived from the body, never retyped. */
  headline: string;
}

function readBody(slug: string): string {
  const file = path.join(RESEARCH_DIR, `${slug}.md`);
  const body = fs.readFileSync(file, 'utf-8');
  if (body.trim() === '') throw new Error(`Empty research body: ${file}`);
  return body;
}

function readHeadline(body: string, slug: string): string {
  const match = body.match(/^#\s+(.+)$/m);
  if (!match) throw new Error(`Research body has no H1 headline: ${slug}`);
  return match[1].trim();
}

const reportBody = readBody('elixir-retrieval-gap');

export const researchReports: ResearchReport[] = [
  {
    slug: 'elixir-retrieval-gap',
    name: 'Elixir SEO/AIO research',
    title: "Elixir's retrieval gap",
    sample: '85 resources · 283 packages · 287 repositories',
    description:
      'Independent SEO/AEO/GEO audit of 85 Elixir ecosystem resources, 283 Hex packages and 287 repositories — why 69.3% of Hex download volume is invisible to markdown retrieval.',
    seoTitle: "Elixir's retrieval gap: an ecosystem audit — phxagents",
    datePublished: '2026-08-18',
    heroStats: [
      {
        value: '69.3%',
        label: 'of Hex package download volume is invisible to markdown retrieval',
        cardLabel: 'of Hex download volume is invisible to markdown',
        tone: 'crit',
      },
      {
        value: '1',
        label: 'AI-specific crawler block in the entire ecosystem — Ruby had six',
        cardLabel: 'AI-specific crawler block ecosystem-wide',
        tone: 'good',
      },
      {
        value: '26%',
        label: 'of ex_doc packages expose markdown, seven months after it became the default',
        cardLabel: 'of ex_doc packages expose markdown',
        tone: 'warn',
      },
      {
        value: '3.5%',
        label: 'of top repositories ship agent rules — a mechanism Ruby has not built',
        cardLabel: 'of top repositories ship agent rules',
        tone: 'warn',
      },
    ],
    body: reportBody,
    headline: readHeadline(reportBody, 'elixir-retrieval-gap'),
  },
];

export function getResearchReport(slug: string): ResearchReport {
  const report = researchReports.find((entry) => entry.slug === slug);
  if (!report) throw new Error(`Unknown research report: ${slug}`);
  return report;
}
