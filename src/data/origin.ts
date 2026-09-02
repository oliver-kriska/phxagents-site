import fs from 'node:fs';
import path from 'node:path';

/**
 * The origin story — site-owned, like `data/research.ts` and unlike the skill
 * and agent collections, which are derived from `plugin-source/`.
 *
 * The prose lives in a real `.md` file so the Markdown is the artifact rather
 * than a serialization of the page: `/origin.md` serves it verbatim and the
 * `.astro` page renders the same file. There is no second copy to drift.
 *
 * Uses process.cwd() for the same reason as data/stats.ts: Astro always runs
 * from the project root, while import.meta.url moves around under Vite.
 */

const ROOT = process.cwd();
const ORIGIN_PATH = path.join(ROOT, 'src', 'data', 'origin.md');

export type OriginTone = 'good' | 'warn' | 'crit';

export interface OriginStat {
  /** The measured figure, verbatim. */
  value: string;
  /** Full label, as the page's hero strip shows it. */
  label: string;
  /** Compressed form for the OG card, whose cells are only ~230px wide. */
  cardLabel: string;
  tone: OriginTone;
}

function readBody(): string {
  const body = fs.readFileSync(ORIGIN_PATH, 'utf-8');
  if (body.trim() === '') throw new Error(`Empty origin body: ${ORIGIN_PATH}`);
  return body;
}

function readHeadline(body: string): string {
  const match = body.match(/^#\s+(.+)$/m);
  if (!match) throw new Error('Origin body has no H1 headline');
  return match[1].trim();
}

/**
 * The page renders its own <h1> from `headline`, so the body it renders drops
 * the leading H1 to avoid a duplicate. `/origin.md` still serves the file whole.
 */
function stripHeadline(body: string): string {
  return body.replace(/^#\s+.+$/m, '').trimStart();
}

const originBody = readBody();

export const origin = {
  /** Nav and search label. Deliberately shorter than the piece's own headline. */
  name: 'Origin',
  /** Hero title and OG card title. */
  title: 'How this was actually built',
  /** Shown in the `<title>`; kept under ~60 chars so it survives a SERP. */
  seoTitle: 'How phxagents was actually built — phxagents',
  description:
    'Every file in this plugin started as generated output. What the sessions, the tests and the eval framework measured afterwards, including the parts that did not survive.',
  /** What the piece measures, as one line. Shown under the hero and on the card. */
  sample: '1,351 sessions · 51 skills · 26 Iron Laws',
  datePublished: '2026-09-02',
  /**
   * The piece's headline figures, rendered by both the page hero and the Open
   * Graph card so a shared preview cannot quote a number the page no longer
   * carries.
   */
  heroStats: [
    {
      value: '0 of 160',
      label: 'sessions where the auto-loading rules I wrote ever fired',
      cardLabel: 'sessions where auto-loading ever fired',
      tone: 'crit',
    },
    {
      value: '34 of 51',
      label: 'skills that route perfectly against the judge, in the lab',
      cardLabel: 'skills routing perfectly in the lab',
      tone: 'good',
    },
    {
      value: '12',
      label: 'working skills with no evidence of ever having run in real work',
      cardLabel: 'working skills that never ran for real',
      tone: 'crit',
    },
    {
      value: '27.4%',
      label: 'of the hints the routing hook injected were actually followed',
      cardLabel: 'of injected hints were followed',
      tone: 'warn',
    },
  ] satisfies OriginStat[],
  /** Markdown body, verbatim — served at /origin.md. */
  body: originBody,
  /** Body as the page renders it, with the duplicate H1 removed. */
  renderBody: stripHeadline(originBody),
  /** The piece's own H1 — its thesis. Derived from the body, never retyped. */
  headline: readHeadline(originBody),
};
