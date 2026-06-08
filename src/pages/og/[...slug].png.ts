import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, type OgInput } from '../../lib/og';
import { stats } from '../../data/stats';

/**
 * Build-time Open Graph images. One PNG per page at dist/og/<slug>.png.
 * The slug mirrors the page path (home → og/home.png, /skills/plan/ →
 * og/skills/plan.png), so Default.astro can derive the og:image URL from
 * the request pathname. `default` is the fallback for any non-enumerated page.
 */

interface OgPath {
  slug: string;
  data: OgInput;
}

export async function getStaticPaths() {
  const skills = await getCollection('skills');
  const agents = await getCollection('agents');

  const paths: OgPath[] = [
    { slug: 'home', data: { title: 'phxagents', subtitle: stats.description, kind: 'docs' } },
    { slug: 'default', data: { title: 'phxagents', subtitle: stats.description, kind: 'docs' } },
    {
      slug: 'install',
      data: {
        title: 'Install phxagents',
        subtitle: `Add ${stats.skills} skills and ${stats.agents} agents to your AI editor in 30 seconds.`,
        kind: 'docs',
      },
    },
    {
      slug: 'catalog',
      data: { title: 'Catalog', subtitle: 'All skills and agents, searchable and filterable.', kind: 'docs' },
    },
    {
      slug: 'iron-laws',
      data: {
        title: 'Iron Laws',
        subtitle: `${stats.ironLaws} non-negotiable rules that prevent the bugs Elixir tests don't catch.`,
        kind: 'docs',
      },
    },
    {
      slug: 'changelog',
      data: { title: 'Changelog', subtitle: 'Release notes for the phxagents plugin.', kind: 'docs' },
    },
    {
      slug: 'tidewave-mcp',
      data: {
        title: 'Tidewave MCP for Phoenix',
        subtitle: 'Runtime debugging, live SQL, and Ecto introspection for Claude Code via Tidewave MCP.',
        kind: 'docs',
      },
    },
    ...skills.map((entry) => {
      const slug = entry.id.replace(/\/SKILL$/i, '');
      const name = entry.data.name as string;
      return {
        slug: `skills/${slug}`,
        data: {
          title: name.includes(':') ? `/${name}` : name,
          subtitle: entry.data.description as string,
          kind: 'skill' as const,
        },
      };
    }),
    ...agents.map((entry) => ({
      slug: `agents/${entry.id}`,
      data: {
        title: entry.data.name as string,
        subtitle: entry.data.description as string,
        kind: 'agent' as const,
      },
    })),
  ];

  return paths.map((p) => ({ params: { slug: p.slug }, props: { data: p.data } }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage((props as { data: OgInput }).data);
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
