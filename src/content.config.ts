import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

// Canonical narrative documentation sourced from the plugin repository. Keeping
// this as a collection means a missing upstream file fails the Amp page build
// instead of falling back to a stale, hand-maintained copy in this repository.
const upstreamDocs = defineCollection({
  loader: glob({
    pattern: 'amp.md',
    base: './plugin-source/docs',
  }),
  schema: z.object({}).passthrough(),
});

export const collections = { skills, agents, references, upstreamDocs };
