import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { hookDocIdForPath } from './lib/hookDocs';

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
    .passthrough(),
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
    .passthrough(),
});

const references = defineCollection({
  loader: glob({
    pattern: '*/references/*.md',
    base: `${PLUGIN_BASE}/skills`,
  }),
  schema: z.object({}).passthrough(),
});

// Canonical runtime documentation sourced from the plugin repository. Keeping
// these as a collection means a missing upstream guide fails the site build
// instead of falling back to a stale, hand-maintained copy in this repository.
const upstreamDocs = defineCollection({
  loader: glob({
    pattern: '{amp,codex,pi,opencode,dsh,runtime-support}.md',
    base: './plugin-source/docs',
  }),
  schema: z.object({}).passthrough(),
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
  schema: z.object({}).passthrough(),
});

export const collections = { skills, agents, references, upstreamDocs, hookDocs };
