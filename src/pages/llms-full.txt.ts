import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getMarkdownTitle, getRawBody } from '../lib/rawContent';
import { getSkillIdentity } from '../lib/skillNames';
import { researchReports } from '../data/research';
import { origin } from '../data/origin';
import { hookDocBySlug } from '../lib/hookDocs';
import { getAddonAgents, getAddonSkills } from '../lib/addonEntries';
import { getPlugin } from '../lib/plugins';
import { rebaseMarkdownLinks } from '../lib/upstreamLinks.mjs';

interface FullEntry {
  source: string;
  title: string;
  body: string;
  /**
   * Path inside the plugin repository, for plugin-owned bodies. Their relative
   * links are written for the repo and are rebased against it; site-owned
   * bodies (research, origin) leave it unset.
   */
  repoPath?: string;
}

function renderEntry(entry: FullEntry): string {
  const body = entry.body.endsWith('\n') ? entry.body : entry.body + '\n';
  return `<!-- source: ${entry.source} -->\n## ${entry.title}\n${body}\n---\n`;
}

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('astro.config.mjs must define site to rebase /llms-full.txt links');

  const [skills, agents, upstreamDocs, hookDocs, pluginReadmes, addonSkills, addonAgents] =
    await Promise.all([
      getCollection('skills'),
      getCollection('agents'),
      getCollection('upstreamDocs'),
      getCollection('hookDocs'),
      getCollection('pluginReadmes'),
      getAddonSkills(),
      getAddonAgents(),
    ]);

  const skillEntries: FullEntry[] = skills.map((entry) => {
    const slug = entry.id.replace(/\/SKILL$/i, '');
    return {
      source: `skills/${slug}/SKILL.md`,
      repoPath: `plugins/elixir-phoenix/skills/${slug}/SKILL.md`,
      title: getSkillIdentity(slug, entry.data.name).claudeName,
      body: getRawBody(entry),
    };
  });
  const agentEntries: FullEntry[] = agents.map((entry) => ({
    source: `agents/${entry.id}.md`,
    repoPath: `plugins/elixir-phoenix/agents/${entry.id}.md`,
    title: entry.data.name,
    body: getRawBody(entry),
  }));
  const upstreamEntries: FullEntry[] = upstreamDocs.map((entry) => {
    const body = getRawBody(entry);
    return {
      source: `docs/${entry.id}.md`,
      repoPath: `docs/${entry.id}.md`,
      title: getMarkdownTitle(body, entry.id),
      body,
    };
  });

  // Hook docs live at three different depths in the plugin repository, so the
  // source path comes from the registry rather than from a path template.
  const hookEntries: FullEntry[] = hookDocs.map((entry) => {
    const body = getRawBody(entry);
    const source = hookDocBySlug.get(entry.id)?.sourcePath ?? `${entry.id}.md`;
    return {
      source,
      repoPath: source,
      title: getMarkdownTitle(body, entry.id),
      body,
    };
  });

  // Add-on plugins (rewrite, catchup): the README that documents each one,
  // then its skills and agents, titled as they are invoked.
  const pluginEntries: FullEntry[] = pluginReadmes.map((entry) => {
    const plugin = getPlugin(entry.id);
    const source = `plugins/${plugin.dir}/README.md`;
    return { source, repoPath: source, title: plugin.displayName, body: getRawBody(entry) };
  });
  const addonEntries: FullEntry[] = [...addonSkills, ...addonAgents].map((item) => ({
    source: item.sourcePath,
    repoPath: item.sourcePath,
    title: item.displayName,
    body: getRawBody(item.entry),
  }));

  // Site-owned long-form research. Not plugin-derived, so it has no collection —
  // but an agent fetching the full corpus should get the whole body, not just
  // the /llms.txt link entry.
  const researchEntries: FullEntry[] = researchReports.map((report) => ({
    source: `research/${report.slug}.md`,
    title: getMarkdownTitle(report.body, report.name),
    body: report.body,
  }));

  // The origin essay is site-owned long-form too, and carries the method behind
  // every count above it. Same treatment as a research report.
  const originEntry: FullEntry = {
    source: 'origin.md',
    title: getMarkdownTitle(origin.body, origin.name),
    body: origin.body,
  };

  skillEntries.sort((a, b) => a.title.localeCompare(b.title));
  agentEntries.sort((a, b) => a.title.localeCompare(b.title));
  upstreamEntries.sort((a, b) => a.title.localeCompare(b.title));
  hookEntries.sort((a, b) => a.title.localeCompare(b.title));
  researchEntries.sort((a, b) => a.title.localeCompare(b.title));
  pluginEntries.sort((a, b) => a.title.localeCompare(b.title));

  const body = [
    '# phxagents — full documentation',
    '',
    '> Canonical phxagents skills, agents, runtime guides, hook documentation, the add-on plugins (their READMEs, skills and agents), the origin essay, and research. Per-skill reference appendices are intentionally excluded. Links that the plugin repository writes as relative paths point at their published page or at the file on GitHub.',
    '',
    ...[
      ...skillEntries,
      ...agentEntries,
      ...upstreamEntries,
      ...hookEntries,
      ...pluginEntries,
      ...addonEntries,
      ...researchEntries,
      originEntry,
    ]
      .map((entry) =>
        entry.repoPath ? { ...entry, body: rebaseMarkdownLinks(entry.body, entry.repoPath, site) } : entry
      )
      .map(renderEntry),
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
