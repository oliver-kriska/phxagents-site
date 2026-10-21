import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { hookDocIdForPath } from './lib/hookDocs';
import { getCatalogPlugins, getPagePlugins, getPlugins } from './lib/plugins';

const PLUGIN_BASE = './plugin-source/plugins/elixir-phoenix';

const skills = defineCollection({
  loader: glob({
    pattern: '*/SKILL.md',
    base: `${PLUGIN_BASE}/skills`,
  }),
  schema: z
    .object({
      name: z.string(),
      description: z.string(),
      effort: z.string().optional(),
      'argument-hint': z.any().optional(),
      'allowed-tools': z.any().optional(),
      'disable-model-invocation': z.boolean().optional(),
      'user-invocable': z.boolean().optional(),
    })
    .loose(),
});

const agents = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: `${PLUGIN_BASE}/agents`,
  }),
  schema: z
    .object({
      name: z.string(),
      description: z.string(),
      model: z.string().optional(),
      effort: z.string().optional(),
      tools: z.any().optional(),
      disallowedTools: z.any().optional(),
      permissionMode: z.string().optional(),
      maxTurns: z.number().optional(),
      omitClaudeMd: z.boolean().optional(),
    })
    .loose(),
});

const references = defineCollection({
  loader: glob({
    pattern: '*/references/*.md',
    base: `${PLUGIN_BASE}/skills`,
  }),
  schema: z.object({}).loose(),
});

// Canonical runtime documentation sourced from the plugin repository. Keeping
// these as a collection means a missing upstream guide fails the site build
// instead of falling back to a stale, hand-maintained copy in this repository.
const upstreamDocs = defineCollection({
  loader: glob({
    pattern: '{amp,codex,pi,opencode,dsh,runtime-support}.md',
    base: './plugin-source/docs',
  }),
  schema: z.object({}).loose(),
});

// Hook documentation, upstream-owned like the runtime guides but scattered
// across the plugin repository rather than gathered under docs/: the overview
// sits at the repo root, the deep dives under the hooks directory. Loading them
// as a collection means a renamed or deleted upstream file fails the build
// instead of silently publishing a stale copy — which matters more here than
// elsewhere, since the plugin's CLAUDE.md now treats these files as the
// public documentation and requires them to move with every hook change.
const hookDocs = defineCollection({
  loader: glob({
    pattern: [
      'HOOKS.md',
      'plugins/elixir-phoenix/hooks/README.md',
      'plugins/elixir-phoenix/hooks/docs/*.md',
    ],
    base: './plugin-source',
    generateId: ({ entry }) => hookDocIdForPath(entry),
  }),
  schema: z.object({}).loose(),
});

// Add-on plugins from the same marketplace (rewrite, catchup). The plugin
// registry decides which ones get catalog entries and a README page, so a new
// add-on is one PLUGIN_META entry, not a new collection. IDs are
// `<plugin id>/<slug>` because add-on slugs collide with phx ones
// (rewrite's `verify`), and the routes nest them under /plugins/<id>/.
const ADDON_BASE = './plugin-source/plugins';
const pluginIdByDir = new Map(getPlugins().map((p) => [p.dir, p.id]));
const dirGlob = (dirs: string[]) => (dirs.length === 1 ? dirs[0] : `{${dirs.join(',')}}`);
const catalogDirs = dirGlob(getCatalogPlugins().map((p) => p.dir));

function addonId(entry: string, file: RegExp): string {
  const [dir, , name] = entry.split('/');
  const pluginId = pluginIdByDir.get(dir);
  if (!pluginId || !file.test(entry)) throw new Error(`Unexpected add-on plugin file ${entry}`);
  return `${pluginId}/${name.replace(/\.md$/, '')}`;
}

const pluginSkills = defineCollection({
  loader: glob({
    pattern: `${catalogDirs}/skills/*/SKILL.md`,
    base: ADDON_BASE,
    generateId: ({ entry }) => addonId(entry, /\/SKILL\.md$/),
  }),
  schema: z
    .object({
      name: z.string(),
      description: z.string(),
      effort: z.string().optional(),
      'argument-hint': z.any().optional(),
      'user-invocable': z.boolean().optional(),
    })
    .loose(),
});

const pluginAgents = defineCollection({
  loader: glob({
    pattern: `${catalogDirs}/agents/*.md`,
    base: ADDON_BASE,
    generateId: ({ entry }) => addonId(entry, /\/agents\/[^/]+\.md$/),
  }),
  schema: z
    .object({
      name: z.string(),
      description: z.string(),
      model: z.string().optional(),
      effort: z.string().optional(),
      tools: z.any().optional(),
    })
    .loose(),
});

// Each add-on's README is its canonical documentation and becomes
// /plugins/<id>/; the ID is the marketplace id.
const pluginReadmes = defineCollection({
  loader: glob({
    pattern: `${dirGlob(getPagePlugins().map((p) => p.dir))}/README.md`,
    base: ADDON_BASE,
    generateId: ({ entry }) => {
      const pluginId = pluginIdByDir.get(entry.split('/')[0]);
      if (!pluginId) throw new Error(`Unexpected plugin README ${entry}`);
      return pluginId;
    },
  }),
  schema: z.object({}).loose(),
});

export const collections = {
  skills,
  agents,
  references,
  upstreamDocs,
  hookDocs,
  pluginSkills,
  pluginAgents,
  pluginReadmes,
};
