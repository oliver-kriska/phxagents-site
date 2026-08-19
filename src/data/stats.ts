import fs from 'node:fs';
import path from 'node:path';

// Use process.cwd() — Astro always runs from project root in both dev and build.
// import.meta.url is unreliable here because Vite bundles modules to different paths.
const ROOT = process.cwd();
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

/** Hook scripts on disk — the honest count, not the registration count. */
function countHooks(): number {
  const scriptsDir = path.join(PLUGIN_BASE, 'hooks', 'scripts');
  return safeReadDir(scriptsDir).filter((f) => f.endsWith('.sh')).length;
}

/**
 * Distinct Claude Code lifecycle events the plugin registers for. Several
 * scripts are registered more than once under different `if` matchers, so this
 * counts event keys rather than hook entries.
 */
function countHookEvents(): number {
  const hooksJson = safeReadJson<{ hooks?: Record<string, unknown> }>(
    path.join(PLUGIN_BASE, 'hooks', 'hooks.json'),
    {}
  );
  return Object.keys(hooksJson.hooks ?? {}).length;
}

function countIronLaws(): number {
  const claudeMd = path.join(PLUGIN_BASE, '..', '..', 'CLAUDE.md');
  try {
    const content = fs.readFileSync(claudeMd, 'utf-8');
    // Carve out the Iron Laws section between its heading and the next ## heading.
    // Using indexOf avoids JS regex `\Z` pitfall (it's literal 'Z' in JS, not EOI).
    const start = content.indexOf('## Iron Laws Enforcement');
    if (start === -1) return 0;
    const rest = content.slice(start);
    const nextHeading = rest.slice(1).match(/\n## (?!#)/);
    const section = nextHeading ? rest.slice(0, nextHeading.index! + 1) : rest;
    // Match numbered law items at line start: `N. **TITLE`
    const laws = section.match(/^\d+\.\s+\*\*[A-Z@]/gm);
    return laws ? laws.length : 0;
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
  hooks: countHooks(),
  hookEvents: countHookEvents(),
  version: manifest.version ?? '0.0.0',
  description:
    manifest.description ??
    'Iron Laws and specialist agents for Elixir/Phoenix.',
  keywords: manifest.keywords ?? [],
};
