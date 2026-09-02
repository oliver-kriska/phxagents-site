import type { APIRoute } from 'astro';
import { origin } from '../data/origin';

/**
 * Raw-Markdown twin for the origin essay, mirroring /research/<slug>.md and the
 * skill/agent `.md` routes. Serves the file whole — H1 included — because this
 * is the artifact, not a serialization of the page.
 */

export const GET: APIRoute = () =>
  new Response(origin.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
