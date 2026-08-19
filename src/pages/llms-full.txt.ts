import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getMarkdownTitle, getRawBody } from '../lib/rawContent';
import { getSkillIdentity } from '../lib/skillNames';
import { researchReports } from '../data/research';
import { hookDocBySlug } from '../lib/hookDocs';

interface FullEntry {
  source: string;
  title: string;
  body: string;
}

function renderEntry(entry: FullEntry): string {
  const body = entry.body.endsWith('\n') ? entry.body : entry.body + '\n';
  return `<!-- source: ${entry.source} -->\n## ${entry.title}\n${body}\n---\n`;
}

export const GET: APIRoute = async () => {
  const [skills, agents, upstreamDocs, hookDocs] = await Promise.all([
    getCollection('skills'),
    getCollection('agents'),
    getCollection('upstreamDocs'),
    getCollection('hookDocs'),
  ]);

  const skillEntries: FullEntry[] = skills.map((entry) => {
    const slug = entry.id.replace(/\/SKILL$/i, '');
    return {
      source: `skills/${slug}/SKILL.md`,
      title: getSkillIdentity(slug, entry.data.name).claudeName,
      body: getRawBody(entry),
    };
  });
  const agentEntries: FullEntry[] = agents.map((entry) => ({
    source: `agents/${entry.id}.md`,
    title: entry.data.name,
    body: getRawBody(entry),
  }));
  const upstreamEntries: FullEntry[] = upstreamDocs.map((entry) => {
    const body = getRawBody(entry);
    return {
      source: `docs/${entry.id}.md`,
      title: getMarkdownTitle(body, entry.id),
      body,
    };
  });

  // Hook docs live at three different depths in the plugin repository, so the
  // source path comes from the registry rather than from a path template.
  const hookEntries: FullEntry[] = hookDocs.map((entry) => {
    const body = getRawBody(entry);
    return {
      source: hookDocBySlug.get(entry.id)?.sourcePath ?? `${entry.id}.md`,
      title: getMarkdownTitle(body, entry.id),
      body,
    };
  });

  // Site-owned long-form research. Not plugin-derived, so it has no collection —
  // but an agent fetching the full corpus should get the whole body, not just
  // the /llms.txt link entry.
  const researchEntries: FullEntry[] = researchReports.map((report) => ({
    source: `research/${report.slug}.md`,
    title: getMarkdownTitle(report.body, report.name),
    body: report.body,
  }));

  skillEntries.sort((a, b) => a.title.localeCompare(b.title));
  agentEntries.sort((a, b) => a.title.localeCompare(b.title));
  upstreamEntries.sort((a, b) => a.title.localeCompare(b.title));
  hookEntries.sort((a, b) => a.title.localeCompare(b.title));
  researchEntries.sort((a, b) => a.title.localeCompare(b.title));

  const body = [
    '# phxagents — full documentation',
    '',
    '> Canonical phxagents skills, agents, runtime guides, hook documentation, and research. Per-skill reference appendices are intentionally excluded.',
    '',
    ...[
      ...skillEntries,
      ...agentEntries,
      ...upstreamEntries,
      ...hookEntries,
      ...researchEntries,
    ].map(renderEntry),
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
