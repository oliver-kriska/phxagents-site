import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pageItems, type PageSection } from '../data/pages';
import { getSkillIdentity, type SkillGroup } from '../lib/skillNames';

const pageSections: PageSection[] = ['Getting started', 'Runtime guides', 'Documentation'];
const skillGroups: { key: SkillGroup; label: string }[] = [
  { key: 'phx', label: 'Phoenix workflows · phx:' },
  { key: 'lv', label: 'LiveView · lv:' },
  { key: 'ecto', label: 'Ecto · ecto:' },
  { key: 'reference', label: 'Reference skills' },
];

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('astro.config.mjs must define site to generate absolute llms.txt URLs');

  const skills = await getCollection('skills');
  const agents = await getCollection('agents');
  const absoluteUrl = (url: string) => new URL(url, site).href;
  const lines = [
    '# phxagents',
    '',
    '> Elixir & Phoenix skills, agents, and commands for AI coding agents — one canonical skill set across Claude Code, Amp, Codex, Pi, and OpenCode.',
    '',
  ];

  for (const section of pageSections) {
    lines.push(`## ${section}`, '');
    for (const item of pageItems.filter((page) => page.llmsSection === section)) {
      lines.push(`- [${item.name}](${absoluteUrl(item.url)}): ${item.desc}`);
    }
    lines.push('');
  }

  const skillItems = skills.map((entry) => {
    const slug = entry.id.replace(/\/SKILL$/i, '');
    const identity = getSkillIdentity(slug, entry.data.name);
    return {
      name: identity.claudeName,
      description: entry.data.description,
      url: absoluteUrl(`/skills/${slug}/`),
      group: identity.group,
    };
  });

  lines.push('## Skills', '');
  for (const group of skillGroups) {
    const items = skillItems
      .filter((item) => item.group === group.key)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (items.length === 0) continue;

    lines.push(`### ${group.label}`, '');
    for (const item of items) {
      lines.push(`- [${item.name}](${item.url}): ${item.description}`);
    }
    lines.push('');
  }

  lines.push('## Agents', '');
  for (const entry of [...agents].sort((a, b) => a.data.name.localeCompare(b.data.name))) {
    lines.push(
      `- [${entry.data.name}](${absoluteUrl(`/agents/${entry.id}/`)}): ${entry.data.description}`
    );
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
