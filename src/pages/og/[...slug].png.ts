import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, type OgInput } from '../../lib/og';
import { stats } from '../../data/stats';
import { getSkillIdentity } from '../../lib/skillNames';

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
    {
      slug: 'home',
      data: {
        title: 'phxagents v3',
        subtitle: `${stats.skills} Phoenix skills: full Claude Code plugin plus generated editions for Amp, Codex, Pi, and OpenCode.`,
        kind: 'docs',
      },
    },
    { slug: 'default', data: { title: 'phxagents', subtitle: stats.description, kind: 'docs' } },
    {
      slug: 'install',
      data: {
        title: 'Install phxagents',
        subtitle: `Elixir and Phoenix skills for Claude Code, Amp, Codex, Pi, and OpenCode.`,
        kind: 'docs',
      },
    },
    {
      slug: 'compatibility',
      data: {
        title: 'Runtime compatibility',
        subtitle: 'Compare installation, invocation, adapted workflows, and deferred capabilities across five AI coding runtimes.',
        kind: 'docs',
      },
    },
    ...[
      ['amp', 'Amp Agent Skills'],
      ['codex', 'Codex skills plugin'],
      ['pi', 'Pi skills package'],
      ['opencode', 'OpenCode skills'],
    ].map(([runtime, label]) => ({
      slug: `install/${runtime}`,
      data: {
        title: `Install for ${runtime === 'opencode' ? 'OpenCode' : runtime === 'codex' ? 'Codex' : runtime === 'amp' ? 'Amp' : 'Pi'}`,
        subtitle: `Install all ${stats.skills} canonical phxagents skills as a generated ${label}.`,
        kind: 'docs' as const,
      },
    })),
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
        subtitle: 'Runtime debugging, live SQL, and Ecto introspection for phxagents across supported MCP clients.',
        kind: 'docs',
      },
    },
    {
      slug: 'amp',
      data: {
        title: 'Install for Amp',
        subtitle: 'Moved to phxagents.dev/install/amp/.',
        kind: 'docs',
      },
    },
    ...skills.map((entry) => {
      const slug = entry.id.replace(/\/SKILL$/i, '');
      const name = entry.data.name as string;
      const identity = getSkillIdentity(slug, name);
      return {
        slug: `skills/${slug}`,
        data: {
          title: identity.isCommand ? `/${identity.claudeName}` : name,
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
