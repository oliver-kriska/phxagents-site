import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getRawBody } from '../../lib/rawContent';

interface Props {
  body: string;
}

export async function getStaticPaths() {
  const agents = await getCollection('agents');

  return agents.map((entry) => ({
    params: { slug: entry.id },
    props: { body: getRawBody(entry) },
  }));
}

export const GET: APIRoute<Props> = ({ props }) =>
  new Response(props.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
