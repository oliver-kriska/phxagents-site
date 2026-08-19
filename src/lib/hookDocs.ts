/**
 * Registry for the plugin's hook documentation.
 *
 * The prose is upstream-owned — `HOOKS.md` at the plugin repo root, the six
 * per-group deep dives, and the contributor guide. The plugin's own CLAUDE.md
 * requires those files to be updated in the same commit as any hook change and
 * states that this website renders from them, so nothing here duplicates their
 * content: this file only maps each upstream path to a public route and carries
 * the SEO metadata a Markdown body has no place to put.
 *
 * One registry drives the content collection's IDs, the routes, the sidebar,
 * `/search.json`, `/llms.txt`, `/llms-full.txt` and the OG cards, so a page
 * cannot appear in one of them and be missing from another.
 */

const HOOKS_BASE = 'plugins/elixir-phoenix/hooks';

export interface HookDocPage {
  /** Route slug. `overview` is the section index at /hooks/. */
  slug: string;
  /** Path inside the plugin repository, used for GitHub links and git dates. */
  sourcePath: string;
  /** Sidebar and search label. */
  navLabel: string;
  /** Page <h1> and SEO title. */
  title: string;
  description: string;
  /** Lifecycle events this group covers, rendered as the card's metadata. */
  events: string[];
}

export const hookDocPages: HookDocPage[] = [
  {
    slug: 'overview',
    sourcePath: 'HOOKS.md',
    navLabel: 'Hooks',
    title: 'Claude Code hooks for Elixir and Phoenix',
    description:
      'The deterministic layer: shell scripts that always run, across every Claude Code lifecycle event — blocking destructive mix commands, verifying Iron Laws, and injecting context models cannot read themselves.',
    events: [],
  },
  {
    slug: 'safety-gates',
    sourcePath: `${HOOKS_BASE}/docs/safety-gates.md`,
    navLabel: 'Safety gates',
    title: 'Safety gates: the hooks that refuse a command',
    description:
      'The three PreToolUse hooks that stop an action outright — destructive mix commands, the dependency supply-chain gate, and edit-scope freezes — plus the fail-open contract behind them.',
    events: ['PreToolUse'],
  },
  {
    slug: 'code-quality',
    sourcePath: `${HOOKS_BASE}/docs/code-quality.md`,
    navLabel: 'Code quality',
    title: 'Code quality checks after every Elixir edit',
    description:
      'The four PostToolUse hooks that scan what Claude just wrote: seven verified Iron Laws, blame-aware line scanning, debug-statement flagging, and why formatting only ever warns.',
    events: ['PostToolUse'],
  },
  {
    slug: 'failure-recovery',
    sourcePath: `${HOOKS_BASE}/docs/failure-recovery.md`,
    navLabel: 'Failure recovery',
    title: 'Breaking the debugging loop when mix fails',
    description:
      'Two PostToolUseFailure hooks that escalate from per-command hints to a structured critic, consolidating the error history to stop Claude retrying the same failing mix command.',
    events: ['PostToolUseFailure'],
  },
  {
    slug: 'context-injection',
    sourcePath: `${HOOKS_BASE}/docs/context-injection.md`,
    navLabel: 'Context injection',
    title: 'Getting rules into models that cannot read them',
    description:
      'Intent routing on prompt submit and Iron Law injection into every spawned subagent — the two hooks built because prose rules in CLAUDE.md measurably do not fire.',
    events: ['UserPromptSubmit', 'SubagentStart'],
  },
  {
    slug: 'session-lifecycle',
    sourcePath: `${HOOKS_BASE}/docs/session-lifecycle.md`,
    navLabel: 'Session lifecycle',
    title: 'What runs when a Phoenix session opens',
    description:
      'The six SessionStart hooks: directory setup, Tidewave and Ash detection, scratchpad dead ends, plan resume, and branch freshness — all gated on mix.exs.',
    events: ['SessionStart'],
  },
  {
    slug: 'workflow-state',
    sourcePath: `${HOOKS_BASE}/docs/workflow-state.md`,
    navLabel: 'Workflow state',
    title: 'Surviving compaction, API failures and plan drift',
    description:
      'Six hooks that keep the plan workflow coherent across the things that normally destroy it — the plan STOP, compaction re-injection, and the StopFailure breadcrumb.',
    events: ['PostToolUse', 'PreCompact', 'PostCompact', 'StopFailure', 'Stop'],
  },
  {
    slug: 'contributing',
    sourcePath: `${HOOKS_BASE}/README.md`,
    navLabel: 'Writing a hook',
    title: 'Writing a Claude Code hook: output channels and conventions',
    description:
      'Which output channel actually reaches Claude for each of the ten lifecycle events, the seven conventions every hook script follows, and how to add one.',
    events: [],
  },
];

/** Deep dives only — the overview is the section index, the guide is an appendix. */
export const hookGroupPages = hookDocPages.filter(
  (page) => page.slug !== 'overview' && page.slug !== 'contributing'
);

export const hookDocBySlug = new Map(hookDocPages.map((page) => [page.slug, page]));

/** Public route for a hook doc. The overview owns the section root. */
export function hookDocUrl(slug: string): string {
  return slug === 'overview' ? '/hooks/' : `/hooks/${slug}/`;
}

/**
 * Collection IDs are the route slugs, derived from the upstream path so the
 * loader and the registry cannot disagree about which file backs which page.
 */
export function hookDocIdForPath(entryPath: string): string {
  const normalized = entryPath.replace(/^\.\//, '');
  const match = hookDocPages.find(
    (page) => page.sourcePath === normalized || page.sourcePath.endsWith(`/${normalized}`)
  );
  if (match) return match.slug;
  // A new upstream deep dive that this registry has not been taught about yet.
  // Returning a stable ID keeps the build alive; the parity check reports it.
  return normalized.replace(/\.md$/i, '').split('/').pop() ?? normalized;
}
