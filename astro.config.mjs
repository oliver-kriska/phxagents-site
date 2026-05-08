// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import { buildSkillsSidebar, buildAgentsSidebar } from './src/lib/sidebar.mjs';

export default defineConfig({
  site: 'https://phxagents.dev',
  integrations: [
    starlight({
      title: 'phxagents',
      description:
        'Iron Laws and specialist agents for Elixir/Phoenix in Claude Code, Codex, OpenCode, and Pi.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/oliver-kriska/claude-elixir-phoenix',
        },
      ],
      customCss: ['./src/styles/custom.css'],
      plugins: [starlightLlmsTxt()],
      expressiveCode: {
        shiki: {
          // heex/eex aren't bundled with Shiki — alias to html for syntax similarity.
          // Phoenix's official docs (hexdocs) use the same approach.
          langAlias: {
            heex: 'html',
            eex: 'html',
            sface: 'html',
          },
        },
      },
      head: [
        {
          tag: 'script',
          attrs: {
            src: 'https://plausible.io/js/pa-s0rqHNTu3UMuNx6RHUnTD.js',
            async: true,
          },
        },
        {
          tag: 'script',
          content:
            'window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()',
        },
      ],
      components: {
        Footer: './src/components/Footer.astro',
      },
      sidebar: [
        {
          label: 'Start',
          items: [
            { label: 'Overview', slug: 'index' },
            { label: 'Install', slug: 'install' },
          ],
        },
        {
          label: 'Skills',
          items: buildSkillsSidebar(),
        },
        {
          label: 'Agents',
          items: buildAgentsSidebar(),
        },
        {
          label: 'Iron Laws',
          link: '/iron-laws/',
        },
        {
          label: 'Changelog',
          link: '/changelog/',
        },
      ],
    }),
  ],
});
