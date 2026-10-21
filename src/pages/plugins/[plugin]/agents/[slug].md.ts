import type { APIRoute } from 'astro';
import { getAddonAgents } from '../../../../lib/addonEntries';
import { getRawBody } from '../../../../lib/rawContent';

interface Props {
  body: string;
}

export async function getStaticPaths() {
  const entries = await getAddonAgents();

  return entries.map((item) => ({
    params: { plugin: item.plugin.id, slug: item.slug },
    props: { body: getRawBody(item.entry) },
  }));
}

export const GET: APIRoute<Props> = ({ props }) =>
  new Response(props.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
