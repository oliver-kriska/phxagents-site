import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

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
      const group = entry.data.name.includes(':')
        ? entry.data.name.split(':')[0]
        : 'reference';
      return {
        type: 'skill' as const,
        name: entry.data.name,
        desc: entry.data.description,
        url: `/skills/${slug}/`,
        group,
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
      desc: 'How to install the phxagents plugin in Claude Code.',
      url: '/install/',
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
      name: 'Iron Laws',
      desc: 'Non-negotiable rules that prevent the bugs Elixir tests don\'t catch.',
      url: '/iron-laws/',
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
