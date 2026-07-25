import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSkillIdentity } from '../lib/skillNames';

export const GET: APIRoute = async () => {
  const skills = await getCollection('skills');
  const agents = await getCollection('agents');

  const items: {
    type: 'skill' | 'agent' | 'page';
    name: string;
    desc: string;
    url: string;
    group: string;
  }[] = [
    ...skills.map((entry) => {
      const slug = entry.id.replace(/\/SKILL$/i, '');
      const identity = getSkillIdentity(slug, entry.data.name);
      return {
        type: 'skill' as const,
        name: identity.claudeName,
        desc: entry.data.description,
        url: `/skills/${slug}/`,
        group: identity.group,
      };
    }),
    ...agents.map((entry) => ({
      type: 'agent' as const,
      name: entry.data.name,
      desc: entry.data.description,
      url: `/agents/${entry.id}/`,
      group: 'agent',
    })),
    {
      type: 'page' as const,
      name: 'Install',
      desc: 'Install phxagents for Claude Code, Amp, Codex, Pi, or OpenCode.',
      url: '/install/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Runtime compatibility',
      desc: 'Compare supported and deferred phxagents capabilities across five AI coding runtimes.',
      url: '/compatibility/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Catalog',
      desc: 'All skills and agents, searchable and filterable.',
      url: '/catalog/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Install for Amp',
      desc: 'Install and use all phxagents skills as Amp Agent Skills.',
      url: '/install/amp/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Install for Codex',
      desc: 'Install phxagents as a native Codex skills plugin.',
      url: '/install/codex/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Install for Pi',
      desc: 'Install phxagents through Pi’s native Git package support.',
      url: '/install/pi/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Install for OpenCode',
      desc: 'Install the generated phxagents skill tree for OpenCode.',
      url: '/install/opencode/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Iron Laws',
      desc: 'Non-negotiable rules that prevent the bugs Elixir tests don\'t catch.',
      url: '/iron-laws/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Tidewave MCP',
      desc: 'Use Tidewave runtime introspection with phxagents in a running Phoenix application.',
      url: '/tidewave-mcp/',
      group: 'docs',
    },
    {
      type: 'page' as const,
      name: 'Changelog',
      desc: 'Release notes for the phxagents plugin.',
      url: '/changelog/',
      group: 'docs',
    },
  ];

  items.sort((a, b) => a.name.localeCompare(b.name));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
