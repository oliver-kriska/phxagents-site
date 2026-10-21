import { getCollection, type CollectionEntry } from 'astro:content';
import { getAddonSkillIdentity, getPlugin, type PluginInfo } from './plugins';

// One normalized view of the add-on plugins' skills and agents, shared by the
// detail routes, the catalog, /search.json, /llms.txt, /llms-full.txt and the
// OG cards so a name or URL cannot be derived two different ways.

export interface AddonEntry {
  kind: 'skill' | 'agent';
  plugin: PluginInfo;
  slug: string;
  /** Frontmatter name. */
  name: string;
  /** As shown and typed: `/rewrite:verify`, `/catchup`, `elixir-way`, `parity-auditor`. */
  displayName: string;
  isCommand: boolean;
  description: string;
  url: string;
  markdownUrl: string;
  /** Path inside the plugin repository. */
  sourcePath: string;
}

export interface AddonSkill extends AddonEntry {
  kind: 'skill';
  entry: CollectionEntry<'pluginSkills'>;
}

export interface AddonAgent extends AddonEntry {
  kind: 'agent';
  entry: CollectionEntry<'pluginAgents'>;
}

function splitId(id: string): [string, string] {
  const [pluginId, slug] = id.split('/');
  return [pluginId, slug];
}

const byDisplayName = (a: AddonEntry, b: AddonEntry) =>
  a.plugin.id.localeCompare(b.plugin.id) || a.displayName.localeCompare(b.displayName);

export async function getAddonSkills(): Promise<AddonSkill[]> {
  const entries = await getCollection('pluginSkills');
  return entries
    .map((entry): AddonSkill => {
      const [pluginId, slug] = splitId(entry.id);
      const plugin = getPlugin(pluginId);
      const identity = getAddonSkillIdentity(plugin, slug, entry.data['user-invocable'] !== false);
      return {
        kind: 'skill',
        entry,
        plugin,
        slug,
        name: entry.data.name,
        displayName: identity.isCommand ? `/${identity.claudeName}` : identity.claudeName,
        isCommand: identity.isCommand,
        description: entry.data.description,
        url: `/plugins/${plugin.id}/skills/${slug}/`,
        markdownUrl: `/plugins/${plugin.id}/skills/${slug}.md`,
        sourcePath: `plugins/${plugin.dir}/skills/${slug}/SKILL.md`,
      };
    })
    .sort(byDisplayName);
}

export async function getAddonAgents(): Promise<AddonAgent[]> {
  const entries = await getCollection('pluginAgents');
  return entries
    .map((entry): AddonAgent => {
      const [pluginId, slug] = splitId(entry.id);
      const plugin = getPlugin(pluginId);
      return {
        kind: 'agent',
        entry,
        plugin,
        slug,
        name: entry.data.name,
        displayName: entry.data.name,
        isCommand: false,
        description: entry.data.description,
        url: `/plugins/${plugin.id}/agents/${slug}/`,
        markdownUrl: `/plugins/${plugin.id}/agents/${slug}.md`,
        sourcePath: `plugins/${plugin.dir}/agents/${slug}.md`,
      };
    })
    .sort(byDisplayName);
}
