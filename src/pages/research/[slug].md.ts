import type { APIRoute } from 'astro';
import { researchReports } from '../../data/research';

/**
 * Raw-Markdown twin for each research report, mirroring /skills/<slug>.md and
 * /agents/<slug>.md. The Elixir retrieval-gap report argues that `.md` routes
 * are how agents actually get the content; it would be an odd report to publish
 * without one.
 */

interface Props {
  body: string;
}

export function getStaticPaths() {
  return researchReports.map((report) => ({
    params: { slug: report.slug },
    props: { body: report.body },
  }));
}

export const GET: APIRoute<Props> = ({ props }) =>
  new Response(props.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
