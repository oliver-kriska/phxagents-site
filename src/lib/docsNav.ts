import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLUGIN_BASE = path.join(ROOT, 'plugin-source', 'plugins', 'elixir-phoenix');

export interface NavItem {
  name: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface DocsNav {
  skills: NavGroup[];
  agents: NavGroup[];
}

function readFrontmatterName(filePath: string): string | null {
  try {
    const head = fs.readFileSync(filePath, 'utf-8').slice(0, 2000);
    const m = head.match(/^name:\s*["']?([^"'\n]+)["']?\s*$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

function readFrontmatterModel(filePath: string): string | null {
  try {
    const head = fs.readFileSync(filePath, 'utf-8').slice(0, 2000);
    const m = head.match(/^model:\s*["']?([^"'\n]+)["']?\s*$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

function safeReadDir(p: string): string[] {
  try {
    return fs.readdirSync(p);
  } catch {
    return [];
  }
}

function loadSkills(): NavItem[] {
  const dir = path.join(PLUGIN_BASE, 'skills');
  const items: NavItem[] = [];
  for (const slug of safeReadDir(dir)) {
    const skillFile = path.join(dir, slug, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    const name = readFrontmatterName(skillFile) ?? slug;
    items.push({ name, href: `/skills/${slug}/` });
  }
  return items;
}

function loadAgents(): NavItem[] {
  const dir = path.join(PLUGIN_BASE, 'agents');
  const items: NavItem[] = [];
  for (const f of safeReadDir(dir)) {
    if (!f.endsWith('.md')) continue;
    const file = path.join(dir, f);
    const slug = f.replace(/\.md$/, '');
    const name = readFrontmatterName(file) ?? slug;
    const model = readFrontmatterModel(file) ?? 'sonnet';
    items.push({ name: `${name}\x00${model}`, href: `/agents/${slug}/` });
  }
  return items;
}

function groupSkills(skills: NavItem[]): NavGroup[] {
  const phx: NavItem[] = [];
  const lv: NavItem[] = [];
  const ecto: NavItem[] = [];
  const refs: NavItem[] = [];
  for (const s of skills) {
    if (s.name.startsWith('phx:')) phx.push(s);
    else if (s.name.startsWith('lv:')) lv.push(s);
    else if (s.name.startsWith('ecto:')) ecto.push(s);
    else refs.push(s);
  }
  const sortByName = (a: NavItem, b: NavItem) => a.name.localeCompare(b.name);
  phx.sort(sortByName);
  lv.sort(sortByName);
  ecto.sort(sortByName);
  refs.sort(sortByName);
  const groups: NavGroup[] = [];
  if (phx.length) groups.push({ label: 'Phoenix · /phx:', items: phx });
  if (lv.length) groups.push({ label: 'LiveView · /lv:', items: lv });
  if (ecto.length) groups.push({ label: 'Ecto · /ecto:', items: ecto });
  if (refs.length) groups.push({ label: 'References', items: refs });
  return groups;
}

function groupAgents(agents: NavItem[]): NavGroup[] {
  const opus: NavItem[] = [];
  const sonnet: NavItem[] = [];
  const haiku: NavItem[] = [];
  for (const a of agents) {
    const [name, model] = a.name.split('\x00');
    const clean: NavItem = { name, href: a.href };
    if (model === 'opus') opus.push(clean);
    else if (model === 'haiku') haiku.push(clean);
    else sonnet.push(clean);
  }
  const sortByName = (a: NavItem, b: NavItem) => a.name.localeCompare(b.name);
  opus.sort(sortByName);
  sonnet.sort(sortByName);
  haiku.sort(sortByName);
  const groups: NavGroup[] = [];
  if (opus.length) groups.push({ label: 'Orchestrators · opus', items: opus });
  if (sonnet.length) groups.push({ label: 'Specialists · sonnet', items: sonnet });
  if (haiku.length) groups.push({ label: 'Mechanical · haiku', items: haiku });
  return groups;
}

let cached: DocsNav | null = null;
export function getDocsNav(): DocsNav {
  if (cached) return cached;
  cached = {
    skills: groupSkills(loadSkills()),
    agents: groupAgents(loadAgents()),
  };
  return cached;
}
