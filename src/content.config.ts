import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const PLUGIN_BASE = './plugin-source/plugins/elixir-phoenix';

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema(),
});

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
      featured: z.boolean().optional(),
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
      tools: z.string().optional(),
      featured: z.boolean().optional(),
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

export const collections = { docs, skills, agents, references };
