import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOG } from '../../data/og';
import { stats } from '../../data/stats';

interface OgParams {
  slug: string;
}

interface OgProps {
  title: string;
  description?: string;
  kind?: 'page' | 'skill' | 'agent';
}

export const getStaticPaths: GetStaticPaths = async () => {
  const skills = await getCollection('skills');
  const agents = await getCollection('agents');
  const docs = await getCollection('docs');

  const skillPaths = skills.map((entry) => ({
    params: { slug: `skills/${entry.id.replace(/\/skill$/i, '')}` },
    props: {
      title: entry.data.name,
      description: entry.data.description,
      kind: 'skill',
    } satisfies OgProps,
  }));

  const agentPaths = agents.map((entry) => ({
    params: { slug: `agents/${entry.id}` },
    props: {
      title: entry.data.name,
      description: entry.data.description,
      kind: 'agent',
    } satisfies OgProps,
  }));

  const docPaths = docs.map((entry) => {
    const slug = entry.id === 'index' ? 'index' : entry.id;
    const isHome = entry.id === 'index';
    return {
      params: { slug },
      props: {
        title: isHome ? 'phxagents' : (entry.data.title ?? 'phxagents'),
        description: isHome
          ? stats.description
          : (entry.data.description ?? stats.description),
        kind: 'page',
      } satisfies OgProps,
    };
  });

  return [...docPaths, ...skillPaths, ...agentPaths];
};

export const GET: APIRoute<OgProps, OgParams> = async ({ props }) => {
  const png = await renderOG({
    title: props.title,
    description: props.description,
    kind: props.kind,
  });
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
