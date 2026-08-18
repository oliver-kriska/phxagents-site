export type PageSection = 'Getting started' | 'Runtime guides' | 'Documentation';

export interface PageItem {
  type: 'page';
  name: string;
  desc: string;
  url: string;
  group: 'docs';
  llmsSection: PageSection;
}

export const pageItems: PageItem[] = [
  {
    type: 'page',
    name: 'Install',
    desc: 'Install phxagents for Claude Code, Amp, Codex, Pi, or OpenCode.',
    url: '/install/',
    group: 'docs',
    llmsSection: 'Getting started',
  },
  {
    type: 'page',
    name: 'Runtime compatibility',
    desc: 'Compare supported and deferred phxagents capabilities across five AI coding runtimes.',
    url: '/compatibility/',
    group: 'docs',
    llmsSection: 'Getting started',
  },
  {
    type: 'page',
    name: 'Catalog',
    desc: 'All skills and agents, searchable and filterable.',
    url: '/catalog/',
    group: 'docs',
    llmsSection: 'Documentation',
  },
  {
    type: 'page',
    name: 'Install for Amp',
    desc: 'Install and use all phxagents skills as Amp Agent Skills.',
    url: '/install/amp/',
    group: 'docs',
    llmsSection: 'Runtime guides',
  },
  {
    type: 'page',
    name: 'Install for Codex',
    desc: 'Install phxagents as a native Codex skills plugin.',
    url: '/install/codex/',
    group: 'docs',
    llmsSection: 'Runtime guides',
  },
  {
    type: 'page',
    name: 'Install for Pi',
    desc: 'Install phxagents through Pi’s native Git package support.',
    url: '/install/pi/',
    group: 'docs',
    llmsSection: 'Runtime guides',
  },
  {
    type: 'page',
    name: 'Install for OpenCode',
    desc: 'Install the generated phxagents skill tree for OpenCode.',
    url: '/install/opencode/',
    group: 'docs',
    llmsSection: 'Runtime guides',
  },
  {
    type: 'page',
    name: 'Iron Laws',
    desc: 'Non-negotiable rules that prevent the bugs Elixir tests don\'t catch.',
    url: '/iron-laws/',
    group: 'docs',
    llmsSection: 'Getting started',
  },
  {
    type: 'page',
    name: 'Tidewave MCP',
    desc: 'Use Tidewave runtime introspection with phxagents in a running Phoenix application.',
    url: '/tidewave-mcp/',
    group: 'docs',
    llmsSection: 'Documentation',
  },
  {
    type: 'page',
    name: 'Changelog',
    desc: 'Release notes for the phxagents plugin.',
    url: '/changelog/',
    group: 'docs',
    llmsSection: 'Documentation',
  },
];
