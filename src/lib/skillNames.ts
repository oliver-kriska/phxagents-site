import fs from 'node:fs';
import path from 'node:path';

export type SkillGroup = 'phx' | 'ecto' | 'lv' | 'reference';

export interface SkillIdentity {
  claudeName: string;
  portableName: string;
  group: SkillGroup;
  isCommand: boolean;
}

let portableNames: Map<string, string> | null = null;
let portableWorkflowNames: readonly string[] | null = null;

function getPortableNames(): Map<string, string> {
  if (portableNames) return portableNames;

  const sourcePath = path.join(
    process.cwd(),
    'plugin-source',
    'scripts',
    'port_lib',
    'skill_transforms.py'
  );
  const source = fs.readFileSync(sourcePath, 'utf8');
  const block = source.match(/CANONICAL_PORTABLE_NAMES\s*=\s*\{([\s\S]*?)\n\}/);

  if (!block) {
    throw new Error(`Missing CANONICAL_PORTABLE_NAMES in ${sourcePath}`);
  }

  portableNames = new Map(
    [...block[1].matchAll(/^\s*"([^"]+)":\s*"([^"]+)",?\s*$/gm)].map(
      ([, slug, portableName]) => [slug, portableName]
    )
  );

  if (portableNames.size === 0) {
    throw new Error(`CANONICAL_PORTABLE_NAMES is empty in ${sourcePath}`);
  }

  return portableNames;
}

export function getPortableWorkflowNames(): readonly string[] {
  if (portableWorkflowNames) return portableWorkflowNames;

  // amp.py owns the shared portable-workflow declaration consumed and
  // validated by every generated target. Keep the site on that same source.
  const sourcePath = path.join(
    process.cwd(),
    'plugin-source',
    'scripts',
    'port_lib',
    'amp.py'
  );
  const source = fs.readFileSync(sourcePath, 'utf8');
  const block = source.match(/PORTABLE_WORKFLOWS\s*=\s*\(([\s\S]*?)\n\)/);

  if (!block) {
    throw new Error(`Missing PORTABLE_WORKFLOWS in ${sourcePath}`);
  }

  const names = [...block[1].matchAll(/^\s*"([^"]+)",?\s*$/gm)].map(([, name]) => name);
  if (names.length === 0 || new Set(names).size !== names.length) {
    throw new Error(`PORTABLE_WORKFLOWS is empty or contains duplicates in ${sourcePath}`);
  }

  portableWorkflowNames = names;
  return portableWorkflowNames;
}

export function getSkillIdentity(slug: string, declaredName: string): SkillIdentity {
  const mappedName = getPortableNames().get(slug);

  if (!mappedName) {
    return {
      claudeName: declaredName,
      portableName: declaredName.replaceAll(':', '-'),
      group: 'reference',
      isCommand: false,
    };
  }

  const separator = mappedName.indexOf('-');
  const group = mappedName.slice(0, separator) as SkillGroup;
  if (separator < 1 || !['phx', 'ecto', 'lv'].includes(group)) {
    throw new Error(`Invalid portable command name "${mappedName}" for skill "${slug}"`);
  }

  return {
    claudeName: `${group}:${mappedName.slice(separator + 1)}`,
    portableName: mappedName,
    group,
    isCommand: true,
  };
}
