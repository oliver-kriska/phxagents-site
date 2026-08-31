import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, type OgInput } from '../../lib/og';
import { stats } from '../../data/stats';
import { researchReports } from '../../data/research';
import { hookDocPages } from '../../lib/hookDocs';
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

/** Display names for the generated-runtime install pages. */
const OG_RUNTIME_NAMES: Record<string, string> = {
  amp: 'Amp',
  codex: 'Codex',
  pi: 'Pi',
  opencode: 'OpenCode',
  dsh: 'DeepSeek Harness',
};

export async function getStaticPaths() {
  const skills = await getCollection('skills');
  const agents = await getCollection('agents');

  const paths: OgPath[] = [
    {
      slug: 'home',
      data: {
        title: 'phxagents v3',
        subtitle: `${stats.skills} Phoenix skills: full Claude Code plugin plus generated editions for Amp, Codex, Pi, OpenCode, and dsh.`,
        kind: 'docs',
      },
    },
    { slug: 'default', data: { title: 'phxagents', subtitle: stats.description, kind: 'docs' } },
    {
      slug: 'install',
      data: {
        title: 'Install phxagents',
        subtitle: `Elixir and Phoenix skills for Claude Code, Amp, Codex, Pi, OpenCode, and dsh.`,
        kind: 'docs',
      },
    },
    {
      slug: 'compatibility',
      data: {
        title: 'Runtime compatibility',
        subtitle: 'Compare installation, invocation, adapted workflows, and deferred capabilities across six AI coding runtimes.',
        kind: 'docs',
      },
    },
    ...[
      ['amp', 'Amp Agent Skills'],
      ['codex', 'Codex skills plugin'],
      ['pi', 'Pi skills package'],
      ['opencode', 'OpenCode skills'],
      ['dsh', 'DeepSeek Harness skill tree'],
    ].map(([runtime, label]) => ({
      slug: `install/${runtime}`,
      data: {
        title: `Install for ${OG_RUNTIME_NAMES[runtime] ?? runtime}`,
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
    // The overview card leads with the counts; each deep dive carries its own
    // description so a shared link says which group of hooks it opens on.
    ...hookDocPages.map((page) => ({
      slug: page.slug === 'overview' ? 'hooks' : `hooks/${page.slug}`,
      data: {
        title: page.slug === 'overview' ? `${stats.hooks} hooks, ${stats.hookEvents} events` : page.navLabel,
        subtitle:
          page.slug === 'overview'
            ? 'Skills and agents are instructions a model may follow. Hooks are shell scripts that always run.'
            : page.description,
        kind: 'docs' as const,
      },
    })),
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
    {
      slug: 'research',
      data: {
        title: 'Research',
        subtitle:
          'Independent measurement of the Elixir ecosystem — method, limits and raw Markdown published with every report.',
        kind: 'docs',
      },
    },
    // Research cards trade the description for the report's own headline
    // figures, so a link preview arrives carrying findings.
    ...researchReports.map((report) => ({
      slug: `research/${report.slug}`,
      data: {
        title: report.title,
        subtitle: 'Independent ecosystem audit — 18 August 2026',
        kind: 'research' as const,
        stats: report.heroStats.map((stat) => ({
          value: stat.value,
          label: stat.cardLabel,
          tone: stat.tone,
        })),
        footnote: report.sample,
      },
    })),
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
