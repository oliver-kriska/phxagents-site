import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const PLUGIN_BASE = path.join(ROOT, 'plugin-source', 'plugins', 'elixir-phoenix');

function safeReadDir(p) {
  try {
    return fs.readdirSync(p);
  } catch {
    return [];
  }
}

function readFrontmatterName(filePath, fallback) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^name:\s*(.+)$/m);
    return match ? match[1].trim() : fallback;
  } catch {
    return fallback;
  }
}

function readFrontmatterModel(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^model:\s*(opus|sonnet|haiku)/m);
    return match ? match[1] : 'sonnet';
  } catch {
    return 'sonnet';
  }
}

function buildSkillEntries() {
  const skillsDir = path.join(PLUGIN_BASE, 'skills');
  return safeReadDir(skillsDir)
    .filter((name) => fs.existsSync(path.join(skillsDir, name, 'SKILL.md')))
    .map((name) => {
      const display = readFrontmatterName(
        path.join(skillsDir, name, 'SKILL.md'),
        name
      );
      return { dirname: name, label: display, link: `/skills/${name}/` };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildAgentEntries() {
  const agentsDir = path.join(PLUGIN_BASE, 'agents');
  return safeReadDir(agentsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const filePath = path.join(agentsDir, f);
      const display = readFrontmatterName(filePath, slug);
      const model = readFrontmatterModel(filePath);
      return { slug, label: display, model, link: `/agents/${slug}/` };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function buildSkillsSidebar() {
  const all = buildSkillEntries();
  if (all.length === 0) {
    return [{ label: 'All skills', link: '/skills/' }];
  }

  const groups = { phx: [], lv: [], ecto: [], reference: [] };
  for (const skill of all) {
    const prefix = skill.label.includes(':') ? skill.label.split(':')[0] : 'reference';
    (groups[prefix] || groups.reference).push({
      label: skill.label,
      link: skill.link,
    });
  }

  const items = [{ label: 'All skills', link: '/skills/' }];
  if (groups.phx.length) {
    items.push({ label: `phx: workflow (${groups.phx.length})`, items: groups.phx, collapsed: true });
  }
  if (groups.lv.length) {
    items.push({ label: `lv: liveview (${groups.lv.length})`, items: groups.lv, collapsed: true });
  }
  if (groups.ecto.length) {
    items.push({ label: `ecto: (${groups.ecto.length})`, items: groups.ecto, collapsed: true });
  }
  if (groups.reference.length) {
    items.push({
      label: `reference (${groups.reference.length})`,
      items: groups.reference,
      collapsed: true,
    });
  }
  return items;
}

export function buildAgentsSidebar() {
  const all = buildAgentEntries();
  if (all.length === 0) {
    return [{ label: 'All agents', link: '/agents/' }];
  }

  const groups = { Orchestrators: [], Specialists: [], Mechanical: [] };
  for (const agent of all) {
    const tier =
      agent.model === 'opus'
        ? 'Orchestrators'
        : agent.model === 'haiku'
        ? 'Mechanical'
        : 'Specialists';
    groups[tier].push({ label: agent.label, link: agent.link });
  }

  const items = [{ label: 'All agents', link: '/agents/' }];
  for (const tier of ['Orchestrators', 'Specialists', 'Mechanical']) {
    if (groups[tier].length) {
      items.push({
        label: `${tier} (${groups[tier].length})`,
        items: groups[tier],
        collapsed: true,
      });
    }
  }
  return items;
}
