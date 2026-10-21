import fs from 'node:fs';
import path from 'node:path';

// Every plugin in the upstream marketplace, read at build time like stats.ts.
// Versions, descriptions, dependencies and skill/agent counts come from the
// plugin repository; only the presentation facts it has no field for (role,
// release status, runtimes, where the docs live) are recorded here. A plugin
// added upstream without an entry in PLUGIN_META fails the build rather than
// shipping a marketplace the site silently under-describes.

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'plugin-source');
const REPO_URL = 'https://github.com/oliver-kriska/claude-elixir-phoenix';

/** `core` is the main plugin, `namespace` re-exposes its commands, `addon` ships its own skills. */
export type PluginRole = 'core' | 'namespace' | 'addon';
export type PluginStatus = 'stable' | 'compatibility' | 'mvp' | 'experimental';
export type RuntimeId = 'claude-code' | 'amp' | 'codex' | 'pi' | 'opencode' | 'dsh';

/**
 * How a plugin's skills are invoked. `namespaced` is Claude Code's default
 * (`/rewrite:verify`); `bare` is for plugins whose upstream docs use the short
 * form (`/catchup`, `/ketchup`).
 */
type CommandStyle = 'namespaced' | 'bare';

interface PluginMeta {
  role: PluginRole;
  status: PluginStatus;
  runtimes: RuntimeId[];
  /** Site page that documents the plugin. */
  docsUrl: string;
  /** Rendered from the plugin's README at /plugins/<id>/. */
  hasPage: boolean;
  /** Its skills and agents get their own catalog entries and detail pages. */
  inCatalog: boolean;
  commandStyle: CommandStyle;
  /** For `namespace` plugins: the marketplace id whose skills it re-exposes. */
  aliasOf?: string;
}

const PLUGIN_META: Record<string, PluginMeta> = {
  'elixir-phoenix': {
    role: 'core',
    status: 'stable',
    runtimes: ['claude-code', 'amp', 'codex', 'pi', 'opencode', 'dsh'],
    docsUrl: '/install/',
    hasPage: false,
    // Already covered by the skills/agents collections at /skills/ and /agents/.
    inCatalog: false,
    commandStyle: 'namespaced',
  },
  ecto: {
    role: 'namespace',
    status: 'compatibility',
    runtimes: ['claude-code'],
    docsUrl: '/catalog/?group=ecto',
    hasPage: false,
    inCatalog: false,
    commandStyle: 'namespaced',
    aliasOf: 'elixir-phoenix',
  },
  lv: {
    role: 'namespace',
    status: 'compatibility',
    runtimes: ['claude-code'],
    docsUrl: '/catalog/?group=lv',
    hasPage: false,
    inCatalog: false,
    commandStyle: 'namespaced',
    aliasOf: 'elixir-phoenix',
  },
  catchup: {
    role: 'addon',
    status: 'mvp',
    runtimes: ['claude-code'],
    docsUrl: '/plugins/catchup/',
    hasPage: true,
    inCatalog: true,
    commandStyle: 'bare',
  },
  rewrite: {
    role: 'addon',
    status: 'experimental',
    runtimes: ['claude-code'],
    docsUrl: '/plugins/rewrite/',
    hasPage: true,
    inCatalog: true,
    commandStyle: 'namespaced',
  },
};

export interface PluginInfo extends PluginMeta {
  /** Marketplace id, used in install commands and site URLs: `elixir-phoenix`, `rewrite`. */
  id: string;
  /** Directory under plugin-source/plugins/. */
  dir: string;
  /** Manifest name, the Claude Code command prefix: `phx`, `rewrite`. */
  prefix: string;
  displayName: string;
  version: string;
  description: string;
  category: string;
  keywords: string[];
  /** Marketplace ids this plugin depends on (manifest and marketplace entry merged). */
  dependencies: string[];
  skills: number;
  agents: number;
  marketplace: string;
  /** Claude Code commands that install it, dependencies first. */
  install: string[];
  sourceUrl: string;
  readmeUrl: string;
}

interface MarketplaceEntry {
  name: string;
  source: string;
  description?: string;
  category?: string;
  dependencies?: string[];
}

interface Manifest {
  name?: string;
  displayName?: string;
  version?: string;
  description?: string;
  keywords?: string[];
  dependencies?: string[];
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
}

function safeReadDir(p: string): string[] {
  try {
    return fs.readdirSync(p);
  } catch {
    return [];
  }
}

function countSkills(pluginDir: string): number {
  const dir = path.join(pluginDir, 'skills');
  return safeReadDir(dir).filter((s) => fs.existsSync(path.join(dir, s, 'SKILL.md'))).length;
}

function countAgents(pluginDir: string): number {
  return safeReadDir(path.join(pluginDir, 'agents')).filter((f) => f.endsWith('.md')).length;
}

/** The core plugin installs by bare name (as /install/ documents); the rest by `name@marketplace`. */
function installName(id: string, marketplace: string): string {
  return PLUGIN_META[id]?.role === 'core' ? id : `${id}@${marketplace}`;
}

let cached: PluginInfo[] | null = null;

/** All marketplace plugins in upstream order. */
export function getPlugins(): PluginInfo[] {
  if (cached) return cached;

  const marketplace = readJson<{ name: string; plugins: MarketplaceEntry[] }>(
    path.join(SOURCE, '.claude-plugin', 'marketplace.json')
  );
  const repo = REPO_URL.replace('https://github.com/', '');

  cached = marketplace.plugins.map((entry): PluginInfo => {
    const meta = PLUGIN_META[entry.name];
    if (!meta) {
      throw new Error(
        `Marketplace plugin "${entry.name}" has no PLUGIN_META entry in src/lib/plugins.ts`
      );
    }
    const dir = path.basename(entry.source);
    const pluginDir = path.join(SOURCE, 'plugins', dir);
    const manifest = readJson<Manifest>(path.join(pluginDir, '.claude-plugin', 'plugin.json'));
    const dependencies = [
      ...new Set([...(manifest.dependencies ?? []), ...(entry.dependencies ?? [])]),
    ];
    // The core plugin pulls in its own namespace dependencies; an add-on's
    // direct dependencies are spelled out, as its README does.
    const installDeps = meta.role === 'addon' ? dependencies : [];

    return {
      ...meta,
      id: entry.name,
      dir,
      prefix: manifest.name ?? entry.name,
      displayName: manifest.displayName ?? entry.name,
      version: manifest.version ?? '0.0.0',
      description: manifest.description ?? entry.description ?? '',
      category: entry.category ?? 'development',
      keywords: manifest.keywords ?? [],
      dependencies,
      skills: countSkills(pluginDir),
      agents: countAgents(pluginDir),
      marketplace: marketplace.name,
      install: [
        `/plugin marketplace add ${repo}`,
        ...installDeps.map((dep) => `/plugin install ${installName(dep, marketplace.name)}`),
        `/plugin install ${installName(entry.name, marketplace.name)}`,
      ],
      sourceUrl: `${REPO_URL}/tree/main/plugins/${dir}`,
      readmeUrl: `${REPO_URL}/blob/main/plugins/${dir}/README.md`,
    };
  });

  return cached;
}

export function getPlugin(id: string): PluginInfo {
  const plugin = getPlugins().find((p) => p.id === id);
  if (!plugin) throw new Error(`Unknown plugin "${id}"`);
  return plugin;
}

/** Add-ons whose skills and agents the catalog lists alongside phx. */
export function getCatalogPlugins(): PluginInfo[] {
  return getPlugins().filter((p) => p.inCatalog);
}

/** Add-ons with their own README-rendered page at /plugins/<id>/. */
export function getPagePlugins(): PluginInfo[] {
  return getPlugins().filter((p) => p.hasPage);
}

export interface AddonSkillIdentity {
  /** As typed in Claude Code, without the leading slash: `rewrite:verify`, `catchup`. */
  claudeName: string;
  isCommand: boolean;
}

/** Command name for an add-on skill. Non-invocable skills are references, not commands. */
export function getAddonSkillIdentity(
  plugin: PluginInfo,
  slug: string,
  userInvocable: boolean
): AddonSkillIdentity {
  if (!userInvocable) return { claudeName: slug, isCommand: false };
  const claudeName = plugin.commandStyle === 'bare' ? slug : `${plugin.prefix}:${slug}`;
  return { claudeName, isCommand: true };
}

export const STATUS_LABELS: Record<PluginStatus, string> = {
  stable: 'Stable',
  compatibility: 'Compatibility namespace',
  mvp: 'MVP',
  experimental: 'Experimental',
};

export const RUNTIME_LABELS: Record<RuntimeId, string> = {
  'claude-code': 'Claude Code',
  amp: 'Amp',
  codex: 'Codex',
  pi: 'Pi',
  opencode: 'OpenCode',
  dsh: 'DeepSeek Harness',
};
