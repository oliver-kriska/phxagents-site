import { execFileSync } from 'node:child_process';
import path from 'node:path';

const pluginRoot = path.join(process.cwd(), 'plugin-source');
let historyChecked = false;
const dates = new Map<string, string>();

function git(args: string[]): string {
  return execFileSync('git', ['-C', pluginRoot, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function hasFullHistory(): boolean {
  if (historyChecked) return true;
  if (git(['rev-parse', '--is-shallow-repository']) === 'true') return false;
  historyChecked = true;
  return true;
}

function fallbackDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString();
  if (typeof value !== 'string') return undefined;

  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

export function getPluginSourceDate(sourcePath: string, fallback?: unknown): string {
  const cached = dates.get(sourcePath);
  if (cached) return cached;

  const frontmatterDate = fallbackDate(fallback);
  if (!hasFullHistory()) {
    if (frontmatterDate) return frontmatterDate;
    throw new Error(
      'plugin-source has shallow Git history; per-page dateModified values require a full clone'
    );
  }

  const changedAt = git(['log', '-1', '--format=%cI', '--', sourcePath]);
  const date = changedAt || frontmatterDate;
  if (!date) throw new Error(`Cannot derive dateModified for plugin-source/${sourcePath}`);

  dates.set(sourcePath, date);
  return date;
}
