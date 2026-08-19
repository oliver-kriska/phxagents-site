#!/usr/bin/env node
/**
 * The hook documentation is upstream-owned prose that states its own headline
 * numbers ("23 hooks across 10 lifecycle events"). The plugin's CLAUDE.md
 * requires HOOKS.md to be updated in the same commit as any hook change and
 * states that this website renders from it — which makes a stale HOOKS.md a
 * stale public page, and the number in the prose the thing most likely to be
 * forgotten when a script is added.
 *
 * This checks the claim against the filesystem before the site ships it:
 *   - the count in HOOKS.md matches the scripts actually on disk
 *   - every script on disk is registered in hooks.json, and vice versa
 *   - the lifecycle-event count matches the events hooks.json registers
 *   - every group doc the site routes to exists upstream, and every upstream
 *     group doc has a route (a new deep dive must not go unpublished)
 *
 * It reads plugin-source directly rather than dist/, so it can run before or
 * after `astro build`.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLUGIN = path.join(ROOT, 'plugin-source');
const HOOKS_DIR = path.join(PLUGIN, 'plugins', 'elixir-phoenix', 'hooks');
const HOOKS_MD = path.join(PLUGIN, 'HOOKS.md');

const errors = [];
const notes = [];

function fail(message) {
  errors.push(message);
}

if (!fs.existsSync(HOOKS_MD)) {
  console.error('✗ plugin-source/HOOKS.md is missing — clone or link the plugin source.');
  process.exit(1);
}

const hooksMd = fs.readFileSync(HOOKS_MD, 'utf-8');

// ── Scripts on disk vs registered in hooks.json ──────────────────────────────
const scripts = fs
  .readdirSync(path.join(HOOKS_DIR, 'scripts'))
  .filter((f) => f.endsWith('.sh'))
  .map((f) => f.replace(/\.sh$/, ''))
  .sort();

const hooksJson = JSON.parse(fs.readFileSync(path.join(HOOKS_DIR, 'hooks.json'), 'utf-8'));
const events = Object.keys(hooksJson.hooks ?? {});
const registered = [
  ...new Set(
    (JSON.stringify(hooksJson).match(/scripts\/[a-z0-9-]+\.sh/g) ?? []).map((m) =>
      m.replace(/^scripts\//, '').replace(/\.sh$/, '')
    )
  ),
].sort();

const unregistered = scripts.filter((s) => !registered.includes(s));
const missing = registered.filter((s) => !scripts.includes(s));
if (unregistered.length > 0) {
  fail(`scripts on disk with no hooks.json registration: ${unregistered.join(', ')}`);
}
if (missing.length > 0) {
  fail(`hooks.json registers scripts that do not exist: ${missing.join(', ')}`);
}

// ── The headline numbers stated in the prose ─────────────────────────────────
const claim = hooksMd.match(/\*\*(\d+)\s+hooks?\s+across\s+(\d+)\s+lifecycle events\*\*/i);
if (!claim) {
  fail(
    'HOOKS.md no longer states "**N hooks across M lifecycle events**" — the site derives its ' +
      'headline counts from the filesystem, but this check can no longer confirm the prose agrees.'
  );
} else {
  const [, claimedHooks, claimedEvents] = claim.map(Number);
  if (claimedHooks !== scripts.length) {
    fail(
      `HOOKS.md claims ${claimedHooks} hooks but ${scripts.length} scripts exist in ` +
        `plugins/elixir-phoenix/hooks/scripts/. Update the prose upstream.`
    );
  }
  if (claimedEvents !== events.length) {
    fail(
      `HOOKS.md claims ${claimedEvents} lifecycle events but hooks.json registers ` +
        `${events.length} (${events.join(', ')}). Update the prose upstream.`
    );
  }
  if (claimedHooks === scripts.length && claimedEvents === events.length) {
    notes.push(`${scripts.length} hooks across ${events.length} lifecycle events`);
  }
}

// ── Every group doc is routed, every route has a group doc ───────────────────
const routedGroups = [
  'safety-gates',
  'code-quality',
  'failure-recovery',
  'context-injection',
  'session-lifecycle',
  'workflow-state',
];
const upstreamGroups = fs
  .readdirSync(path.join(HOOKS_DIR, 'docs'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''))
  .sort();

const unpublished = upstreamGroups.filter((g) => !routedGroups.includes(g));
const dangling = routedGroups.filter((g) => !upstreamGroups.includes(g));
if (unpublished.length > 0) {
  fail(
    `upstream hook deep dives with no site route: ${unpublished.join(', ')}. ` +
      'Add them to src/lib/hookDocs.ts and to HOOK_GROUPS in astro.config.mjs.'
  );
}
if (dangling.length > 0) {
  fail(`src/lib/hookDocs.ts routes to missing upstream docs: ${dangling.join(', ')}`);
}

if (errors.length > 0) {
  console.error('✗ Hook documentation parity check failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `✓ hooks: ${notes.join('; ')}, ${upstreamGroups.length} group docs published, ` +
    'prose counts match the scripts on disk'
);
