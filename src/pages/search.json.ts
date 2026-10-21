import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pageItems } from '../data/pages';
import { getSkillIdentity } from '../lib/skillNames';
import { getAddonAgents, getAddonSkills } from '../lib/addonEntries';

export const GET: APIRoute = async () => {
  const skills = await getCollection('skills');
  const agents = await getCollection('agents');
  const [addonSkills, addonAgents] = await Promise.all([getAddonSkills(), getAddonAgents()]);

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
    // Add-on entries are grouped by plugin id so the palette can tell
    // /rewrite:verify from /phx:verify.
    ...[...addonSkills, ...addonAgents].map((item) => ({
      type: item.kind,
      name: item.isCommand ? item.displayName.slice(1) : item.displayName,
      desc: item.description,
      url: item.url,
      group: item.plugin.id,
    })),
    ...pageItems.map(({ llmsSection: _, ...item }) => item),
  ];

  items.sort((a, b) => a.name.localeCompare(b.name));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
