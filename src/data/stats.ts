import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const PLUGIN_BASE = path.join(ROOT, 'plugin-source', 'plugins', 'elixir-phoenix');

function safeReadJson<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function safeReadDir(p: string): string[] {
  try {
    return fs.readdirSync(p);
  } catch {
    return [];
  }
}

function countSkills(): number {
  const skillsDir = path.join(PLUGIN_BASE, 'skills');
  return safeReadDir(skillsDir).filter((name) => {
    return fs.existsSync(path.join(skillsDir, name, 'SKILL.md'));
  }).length;
}

function countAgents(): number {
  const agentsDir = path.join(PLUGIN_BASE, 'agents');
  return safeReadDir(agentsDir).filter((f) => f.endsWith('.md')).length;
}

function countReferences(): number {
  const skillsDir = path.join(PLUGIN_BASE, 'skills');
  let total = 0;
  for (const name of safeReadDir(skillsDir)) {
    const refDir = path.join(skillsDir, name, 'references');
    total += safeReadDir(refDir).filter((f) => f.endsWith('.md')).length;
  }
  return total;
}

function countIronLaws(): number {
  const claudeMd = path.join(PLUGIN_BASE, '..', '..', 'CLAUDE.md');
  try {
    const content = fs.readFileSync(claudeMd, 'utf-8');
    const match = content.match(/(\d+)\.\s+\*\*[A-Z@]/g);
    return match ? match.length : 0;
  } catch {
    return 0;
  }
}

interface PluginManifest {
  version?: string;
  description?: string;
  keywords?: string[];
}

const manifest = safeReadJson<PluginManifest>(
  path.join(PLUGIN_BASE, '.claude-plugin', 'plugin.json'),
  {}
);

export const stats = {
  skills: countSkills(),
  agents: countAgents(),
  references: countReferences(),
  ironLaws: countIronLaws(),
  version: manifest.version ?? '0.0.0',
  description:
    manifest.description ??
    'Iron Laws and specialist agents for Elixir/Phoenix.',
  keywords: manifest.keywords ?? [],
};
