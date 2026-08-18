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

export interface ResearchReport {
  slug: string;
  /** Nav/search label. Deliberately shorter than the report's own headline. */
  name: string;
  description: string;
  /** Shown in the `<title>`; kept under ~60 chars so it survives a SERP. */
  seoTitle: string;
  datePublished: string;
  /** Markdown body, verbatim — served at /research/<slug>.md. */
  body: string;
}

function readBody(slug: string): string {
  const file = path.join(RESEARCH_DIR, `${slug}.md`);
  const body = fs.readFileSync(file, 'utf-8');
  if (body.trim() === '') throw new Error(`Empty research body: ${file}`);
  return body;
}

export const researchReports: ResearchReport[] = [
  {
    slug: 'elixir-retrieval-gap',
    name: 'Elixir SEO/AIO research',
    description:
      'Independent SEO/AEO/GEO audit of 85 Elixir ecosystem resources, 283 Hex packages and 287 repositories — why 69.3% of Hex download volume is invisible to markdown retrieval.',
    seoTitle: "Elixir's retrieval gap: an ecosystem audit — phxagents",
    datePublished: '2026-08-18',
    body: readBody('elixir-retrieval-gap'),
  },
];

export function getResearchReport(slug: string): ResearchReport {
  const report = researchReports.find((entry) => entry.slug === slug);
  if (!report) throw new Error(`Unknown research report: ${slug}`);
  return report;
}
