import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, type OgInput } from '../../lib/og';
import { stats } from '../../data/stats';
import { researchReports } from '../../data/research';
import { origin } from '../../data/origin';
import { hookDocPages } from '../../lib/hookDocs';
import { getSkillIdentity } from '../../lib/skillNames';
import { getAddonAgents, getAddonSkills } from '../../lib/addonEntries';
import { getPagePlugins, getPlugin, getPlugins, RUNTIME_LABELS, STATUS_LABELS } from '../../lib/plugins';

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
  const [addonSkills, addonAgents] = await Promise.all([getAddonSkills(), getAddonAgents()]);

  const paths: OgPath[] = [
    {
      slug: 'home',
      // Leads with the site's own opinion, as the home hero does.
      data: {
        title: 'Plausible Elixir is not idiomatic Phoenix.',
        subtitle: `One playbook for ${getPlugin('elixir-phoenix').runtimes.length} AI coding runtimes.`,
        kind: 'docs',
        badge: `v${stats.version}`,
        meta: `${stats.skills} skills · ${stats.agents} agents · ${stats.hooks} hooks · ${stats.ironLaws} Iron Laws`,
        // The counts mix scopes, so say which ones are Claude Code only.
        scope: 'Skills run in every runtime. Agents and hooks are Claude Code only.',
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
      slug: 'plugins',
      data: {
        title: 'Plugins',
        // Counted as on the page: namespaces re-expose core commands, so they
        // are not plugins in their own right.
        subtitle: `${getPlugins()
          .filter((p) => p.role !== 'namespace')
          .map((p) => p.displayName)
          .join(', ')}, plus ${getPlugins()
          .filter((p) => p.role === 'namespace')
          .map((p) => p.id)
          .join(' and ')} compatibility namespaces.`,
        kind: 'docs',
      },
    },
    // Add-on cards lead with what a reader should know before installing:
    // maturity in the badge, size as a fact line, scope in plain words.
    ...getPagePlugins().map((plugin) => ({
      slug: plugin.docsUrl.replace(/^\/|\/$/g, ''),
      data: {
        title: plugin.displayName,
        subtitle: plugin.description,
        kind: 'docs' as const,
        badge: `${STATUS_LABELS[plugin.status]} plugin`,
        badgeTone: plugin.status === 'experimental' ? ('warn' as const) : plugin.status === 'mvp' ? ('info' as const) : ('accent' as const),
        meta: [
          `${plugin.skills} ${plugin.skills === 1 ? 'skill' : 'skills'}`,
          `${plugin.agents} ${plugin.agents === 1 ? 'agent' : 'agents'}`,
          `v${plugin.version}`,
        ].join(' · '),
        scope: [
          plugin.runtimes.map((r) => RUNTIME_LABELS[r]).join(', ') + (plugin.runtimes.length === 1 ? ' only' : ''),
          ...(plugin.dependencies.length ? [`requires ${plugin.dependencies.join(', ')}`] : []),
        ].join(' · '),
      },
    })),
    // Add-on entries say which plugin they come from, since a slug such as
    // `verify` also exists in phx.
    ...[...addonSkills, ...addonAgents].map((item) => ({
      slug: item.url.replace(/^\/|\/$/g, ''),
      data: {
        title: item.displayName,
        titleStyle: item.isCommand ? ('command' as const) : ('identifier' as const),
        subtitle: item.description,
        kind: item.kind,
        badge: `${item.plugin.prefix} ${item.kind}`,
      },
    })),
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
        title: 'Tidewave MCP setup for Phoenix',
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
    // The origin essay is measurement about the plugin itself, so its card uses
    // the same evidence variant as a research report. Evidence cards carry no
    // subtitle: the room goes to labels that stay readable in a feed.
    {
      slug: 'origin',
      data: {
        title: origin.title,
        kind: 'research',
        badge: 'origin',
        stats: origin.heroStats.map((stat) => ({
          value: stat.value,
          label: stat.cardLabel,
          tone: stat.tone,
        })),
        footnote: origin.sample,
      },
    },
    // Research cards trade the description for the report's own headline
    // figures, so a link preview arrives carrying findings.
    ...researchReports.map((report) => ({
      slug: `research/${report.slug}`,
      data: {
        title: report.title,
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
          titleStyle: identity.isCommand ? ('command' as const) : ('identifier' as const),
          subtitle: entry.data.description as string,
          kind: 'skill' as const,
        },
      };
    }),
    ...agents.map((entry) => ({
      slug: `agents/${entry.id}`,
      data: {
        title: entry.data.name as string,
        titleStyle: 'identifier' as const,
        subtitle: entry.data.description as string,
        kind: 'agent' as const,
      },
    })),
  ];

  // The footer shows the page's own route; the fallback card has no single page.
  const pathFor = (slug: string) => (slug === 'home' ? '/' : slug === 'default' ? undefined : `/${slug}/`);
  return paths.map((p) => ({
    params: { slug: p.slug },
    props: { data: { path: pathFor(p.slug), ...p.data } },
  }));
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
