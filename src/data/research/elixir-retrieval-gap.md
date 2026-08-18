# Elixir's retrieval gap is a rollout problem, not an access problem

*Independent ecosystem audit — 18 August 2026 — 85 resources · 283 packages · 287 repositories — ~12 min read*

In August 2026 Evil Martians published a [scorecard of 93 Ruby ecosystem resources](https://ruby.evilmartians.com/), measuring whether AI agents can actually reach Ruby's documentation. On the announcement thread, someone asked for the same study for Elixir. This is that study — and the answer is not the one the Ruby findings would lead you to expect.

## Headline figures

- **69.3%** of Hex package download volume is invisible to markdown retrieval
- **1** AI-specific crawler block in the entire ecosystem — Ruby had six
- **26%** of ex_doc packages expose markdown, seven months after it became the default
- **3.5%** of top repositories ship agent rules — a mechanism Ruby has not built

## In brief — five findings

**K01. Elixir is not blocked.** 98% of resources allow AI crawlers and exactly one applies an AI-specific block. The crawler-unblocking campaign Ruby needs would be wasted effort here.

**K02. The tooling already exists; the rollout does not.** ex_doc has emitted markdown and `llms.txt` by default since January 2026, yet only 26% of ex_doc packages expose them — 69.3% of download volume is unreachable as markdown.

**K03. Three distinct causes, all mechanical.** Stale documentation builds (59% of volume), an explicit one-line opt-out in `mix.exs` (6%), and a hardcoded default in `rebar3_ex_doc` that excludes every Erlang package.

**K04. Elixir built the mechanism Ruby is still asking for.** `usage_rules` delivers version-pinned guidance straight into an agent's context with no crawler involved — and only 3.5% of repositories use it.

**K05. Retrieval advantage does not survive the quality gate.** Elixir leads Ruby on four of five retrieval criteria, yet ties it exactly on training-corpus quality. Being reachable and being retained are different things.

## Section 01 — Three layers, not two

Ruby's scorecard measures whether an agent can fetch your docs, and whether they reach the model's weights. Applied to Elixir, that framing produces a table of green checks and misses the layer Elixir is strongest in.

**Layer 1 — Retrieval.** Can an agent fetch your documentation at request time?
Signals: robots · sitemap · llms.txt · content negotiation · .md. Latency: seconds. Serves whatever `latest` says.

**Layer 2 — Training.** Will your documentation reach the model's weights at all?
Signals: Common Crawl · The Stack · quality filters. Latency: months to years. Quality gate 19/93.

**Layer 3 — Injection.** Do your rules arrive in the agent's context with no fetch and no training?
Signals: usage-rules.md · AGENTS.md · MCP. Latency: zero. Pinned to the resolved dependency.

Layer 3 dominates for a library, and the reason is structural rather than aesthetic: it is pinned to the dependency version that was actually resolved. Layer 1 serves whatever `latest` says. Layer 2 serves whatever was true when the crawl ran, routinely a year ago.

> Only Layer 3 can tell an agent **"you are on Phoenix 1.8, here are 1.8's rules."**

That is precisely the failure every Elixir developer recognises when a model writes Phoenix 1.7 idioms into a 1.8 project. It is a Layer 3 problem, and no amount of Layer 1 work will fix it.

## Section 02 — Elixir leads Ruby on four of five retrieval criteria

Eighty-five curated ecosystem resources — core language and runtime docs, frameworks, libraries, tooling, community sites, learning platforms and blogs — scored on the same six criteria Ruby used.

**Table 1 — Retrieval criteria, Elixir versus the published Ruby snapshot**

| Criterion | Elixir (85) | Ruby (93) | Verdict |
| --- | --- | --- | --- |
| robots.txt allows AI | 83 · 98% | 87 · 94% | Elixir ahead |
| Crawlable (AI agent actually served) | 81 · 95% | — | not scored by Ruby |
| Sitemap | 62 · 73% | 56 · 60% | Elixir ahead |
| llms.txt | 33 · 39% | 51 · 55% | Elixir behind |
| Content negotiation | 26 · 31% | 16 · 17% | Elixir ahead |
| .md routes | 27 · 32% | 23 · 25% | Elixir ahead |

The shape of the single gap is more informative than the gap itself.

> Ruby's wins are **hand-written**. Elixir's are **generated**. Each ecosystem did the work the other didn't.

`llms.txt` is a file a human sits down and authors, and 55% of Ruby projects did exactly that. Content negotiation and `.md` routes arrive free from ex_doc, with nobody deciding anything at all.

**Finding.** **Elixir does not need Ruby's crawler-access campaign.** Exactly one resource blocks AI agents specifically: `r/elixir`, where a browser receives 200 and GPTBot receives 403. Two disallow AI agents in robots.txt: Exercism and `r/elixir`. Ruby had six blockers, including RubyDoc.info refusing ccbot, gptbot, claudebot and google-extended.

**Caveat — this cuts against the headline.** A separate audit, run over its own 93-resource list, measured the training-corpus layer and found Elixir clearing the FineWeb-Edu quality gate on **19/93 resources — exactly tied with Ruby**. Leading on four of five retrieval criteria does not mean the corpus keeps your pages. Section 05 covers this.

### Mean score by tier

| Tier | Mean score |
| --- | --- |
| Core | 4.60 |
| Framework | 4.35 |
| Library | 4.13 |
| Tools | 3.50 |
| Blogs | 2.88 |
| Learning | 2.43 |
| Community | 2.08 |

*Score out of 6 · the further from the core, the worse it gets*

**Finding.** **The community tier scoring worst is the expensive one.** Forums, Elixir School, Exercism and the podcasts hold the *idiomatic, problem-shaped* answers — the content that teaches a model to write a language well rather than merely to name it. It is the least retrievable tier in the ecosystem.

Everything Elixir core publishes through a current ex_doc scores a perfect 6/6: the language docs, getting-started, Mix, IEx, Logger, EEx, ExUnit, ExDoc. The toolchain works. That is the whole point.

## Section 03 — Three causes, all of them mechanical

ex_doc v0.40.0, released 20 January 2026, introduced the Markdown formatter and generates `llms.txt` by default. This is precisely the fix Evil Martians ask of rdoc — *"one change that lifts every gem at once."* Elixir shipped it seven months ago.

**Table 2 — 283 Hex packages by 90-day downloads**

| Classification | Packages | Downloads / 90d | Volume | Fix |
| --- | --- | --- | --- | --- |
| Compliant — llms.txt + markdown | 68 | 103,819,142 | 28.8% | — |
| Cause A — explicit formatter opt-out | 19 | 21,175,906 | 5.9% | one line |
| Cause B — stale docs (ex_doc < 0.40.0) | 170 | 212,913,511 | 59.2% | republish |
| Not ex_doc | 26 | 21,998,591 | 6.1% | n/a |
| **Total documented** | **283** | **359,907,150** | **100%** | |

### Cause A — an explicit list silently opts you out

Any project that pinned a `formatters:` list before January 2026 keeps exactly that list. The new default never applies. Nothing warns you, because the option was always legal and still is. The docs build, they look correct, and they are invisible.

```elixir
# mix.exs
defp docs do
  [
-   formatters: ["html", "epub"],
+   formatters: ["html", "markdown", "epub"],
    ...
  ]
end
```

Fourteen of the nineteen were confirmed by reading `mix.exs` directly, including `phoenix`, `oban`, `credo`, `guardian`, `oauth2`, `reactor` and `stripity_stripe`. The controls — ecto, plug, req, elixir — set no `formatters:` key at all, inherit the default, and score. Same ex_doc version, opposite outcome, one line of difference.

**Scale.** **Phoenix is the highest-volume opted-out package**, at 4,024,850 downloads per 90 days. The pin predates the Markdown formatter, so this reads as inertia rather than intent — which is exactly why a one-line change fixes it.

### Cause B — stale docs, no code change required

170 packages simply have not republished documentation since January 2026. This is dependency-graph bedrock: `telemetry` (5.67M downloads/90d), `mime` (4.78M), `decimal` (4.76M), `hpax`, `nimble_options`, `phoenix_pubsub`, `websock`. Packages an agent meets constantly and can never read as markdown.

**Testable.** **"Isn't this just stale docs?" — mostly yes, and that is checkable.** `llms.txt` is baked into the docs tarball at build time, not served by the platform: **0 of 225** packages built with a pre-0.40 ex_doc serve it, while **75 of 94** built with a current ex_doc do. A republish genuinely fixes **225 of the 244 non-compliant packages — 92%**. The remaining 19 are not explained by age. That is the whole argument for ordering the republish sweep above the pull requests.

### Cause C — the Erlang side is excluded upstream

Splitting the same 283 packages by build tool exposes a cause invisible in the aggregate.

**Table 3 — Compliance by build tool**

| Build tool | Packages | Compliant | Rate | Downloads / 90d |
| --- | --- | --- | --- | --- |
| mix | 201 | 65 | 32% | 268,912,475 |
| rebar3 | 66 | 2 | 3% | 85,477,837 |

`rebar3_ex_doc` hardcodes its default formatter list to `["-f", "html", "-f", "epub"]`, and its `--formatter` help text offers only *"html" or "epub"* — markdown is never mentioned. Every Erlang package documented through the plugin is excluded regardless of which ex_doc version it pulls in.

Two packages escape by passing the formatter explicitly. `observer_cli` sets `{ex_doc, "--formatter html --formatter markdown --formatter epub"}`. That workaround is proof the capability is present and only the default is wrong.

**Highest leverage in this report.** One default change in `rebar3_ex_doc` would lift roughly **64 packages and about 85 million downloads per 90 days** — the Erlang ecosystem's exact equivalent of the rdoc change Ruby is asking for.

## Section 04 — Elixir built the mechanism Ruby is still asking for

[`usage_rules`](https://hex.pm/packages/usage_rules) has been shipping since May 2025 and draws 223,557 downloads per 90 days. A package ships `usage-rules.md`, or a `usage-rules/` directory, and `mix usage_rules.sync` consolidates the rules of your actually-resolved dependencies into `AGENTS.md`, `CLAUDE.md`, or agent skills.

Ruby's study lists the equivalent — *"establish shared gem/agent convention"* and *"create a unified Rails MCP server"* — under things **to build**. Elixir has had one in production for fifteen months.

**Table 4 — Agent-rule adoption across 287 repositories**

| Signal | Repos | Share |
| --- | --- | --- |
| `usage-rules.md` or `usage-rules/` | 10 | 3.5% |
| `AGENTS.md` | 11 | 3.8% |
| `CLAUDE.md` | 9 | 3.1% |
| `llms.txt` committed in the repo | 0 | 0% |

Shipping agent rules today: `ash`, `igniter`, `reactor`, `spark`, `mimic`, `nebulex`, `ex_phone_number`, `mdex`, `sobelow`, and `phoenix`.

**The inversion.** **Phoenix ships `usage-rules/`** containing `ecto.md`, `elixir.md`, `html.md` and `liveview.md` — and ships no `llms.txt` and no markdown output. It is on the wrong side of Layer 1 and the right side of Layer 3. A pure Layer 1 scorecard grades Phoenix as failing, which is exactly the misleading result a straight port of Ruby's methodology produces.

## Section 05 — Reachable is not the same as retained

The training-corpus layer is the most expensive and least actionable part of Ruby's scorecard, and the primary instrument here does not cover it. A separate audit measured it across its own 93-resource list; those results are reproduced with attribution.

**Table 5 — Training-corpus presence and quality**

| Signal | Elixir | Ruby | Reading |
| --- | --- | --- | --- |
| Common Crawl `CC-MAIN-2026-30` | 89/93 | — | broad presence |
| The Stack v3 (mapped repos) | 77/83 | — | code channel strong |
| FineWeb-Edu quality gate | 19/93 | 19/93 | tied — no advantage |

> Elixir's documentation is broadly present in the open crawl. Only about a fifth of sampled pages clear an open training-quality proxy — **exactly matching Ruby.**

Whatever advantage the retrieval layer confers, it does not survive into corpus retention on this measure. The practical implication is a fourth kind of work, distinct from republishing or one-line changes: **improve the first 300–500 words of important guides** — lead with a concrete problem and a worked explanation rather than navigation and API chrome — then remeasure with the same classifier.

**Attribution & limits.** These three rows come from the separate audit described above and were not re-verified by the instrument behind the rest of this report. Its 93-resource list differs in composition from the 85-resource list used everywhere else, so **the denominators must not be combined**. Common Crawl, The Stack and FineWeb-Edu are open proxies for what a private model vendor ingests — presence is observational and proves nothing about training.

## Section 06 — What to do, ordered by leverage

Ordered by reach relative to effort, not by scorecard column. The first three are mechanical and uncontroversial; together they address the large majority of the measured gap.

**Step 01 — Change the `rebar3_ex_doc` default formatter list.** Add `markdown` to the default alongside html and epub, and mention it in the `--formatter` help. The highest ratio of reach to effort available, and it fixes the tier currently sitting at 3%. *(~64 packages · ~85M downloads/90d · one upstream PR)*

**Step 02 — Run a documentation republish sweep.** Every one of these needs only `mix hex.publish docs` built with a current ex_doc. Best done as a coordinated community push, or by having Hex warn at publish time when docs come from a pre-0.40 ex_doc. *(170 packages · 59.2% of volume · zero code changes)*

**Step 03 — Open the one-line `formatters:` pull requests.** Start with **phoenix**, then oban, credo, guardian, oauth2, reactor, rewrite, stripity_stripe, amqp, digital_token, glob_ex, oban_met, oban_web, opentelemetry_absinthe. *(14 verified · one line each)*

**Step 04 — Publish a site-level `hexdocs.pm/llms.txt`.** An index of every package's `llms.txt`. It does not exist today, and it is the single highest-leverage missing artifact found anywhere in this study — one file that makes the whole package graph discoverable in a single fetch.

**Step 05 — Drive Layer 3 adoption past 3.5%.** The strategic one. If `usage-rules.md` were as ordinary as a README, an agent working in any Elixir project would receive correct, version-pinned idioms with no crawler and no corpus lag. Nothing in Ruby competes with this, and the tooling already ships.

**Step 06 — Raise the opening 300–500 words of the guides that matter.** The one action aimed at Layer 2 rather than Layer 1. Elixir ties Ruby at 19/93 on the FineWeb-Edu gate, so reachability is not the binding constraint there. Lead with a concrete problem and a worked explanation instead of navigation and API chrome, then remeasure.

**Step 07 — Fix the community tier.** Elixir School, Thinking Elixir, ElixirWeekly and the forums average **2.08/6** while holding the ecosystem's most idiomatic content. The cheap wins are sitemaps and `.md` routes, not a rewrite.

**Step 08 — Leave robots.txt alone.** 98% of resources already allow AI crawlers. Importing Ruby's unblocking campaign would address a problem this ecosystem does not have; the effort belongs in steps 01 to 03.

## Section 07 — Method, traps and limits

Every figure is a live HTTP probe plus the public Hex and GitHub APIs, collected on 18 August 2026. No API keys, no paid tooling, nothing that cannot be re-run by anyone reading this. Ruby's comparison figures come from the Evil Martians scorecard, measured June 2026.

**Independence.** This is an independent analysis. It is not affiliated with, commissioned by, or endorsed by the Elixir core team, the Erlang Ecosystem Foundation, or any of the projects named in it.

**Publisher's note.** This report is published on phxagents.dev, which ships an Elixir/Phoenix agent-rules package. The disclosed interest is in a conclusion, not a measurement: Section 06 step 05 argues for wider Layer 3 adoption, and that is the category the package sits in. No measurement here touches it. Being a GitHub-distributed Claude Code plugin rather than a Hex package or a documentation resource, it falls outside all three sampling frames by construction, and appears in none of the 85 resources, 283 packages or 287 repositories.

### Four measurement traps — each makes the ecosystem look worse than it is

If you reproduce this study, these four will change your answer. Each was hit and corrected during this measurement; before-and-after figures are given so you can tell whether your own run is affected.

- **Truncated gzip produces phantom transport errors.** Reading a capped number of bytes from a gzip stream leaves it truncated, and a strict decompressor raises an error that is easily caught as a failed request. Uncorrected this reports *crawlable 8/85* and *sitemap 13/85*; corrected, 81/85 and 62/85. Use an incremental decompressor that tolerates partial streams.
- **Probing `llms.txt` only at the site root.** On documentation hosts the file is namespaced per project (`hexdocs.pm/ecto/llms.txt`), so root-only probing scores those resources as missing: *7% versus 39%* depending on whether every ancestor path is checked. The same applies to content negotiation — a package root may return its `llms.txt` as `text/plain`, so the probe must target a real documentation page or it reports near-zero.
- **Conflating "blocked" with "dead URL".** Without a browser user-agent control, a 404 or blanket bot-protection reads as an AI-specific block. Three of five apparent blocks here turned out not to be AI policy at all. "Blocked" should mean: a browser is served and the AI agent is not.
- **Counting matching lines instead of matches.** Sitemaps are frequently emitted as a single line with no newlines, so a naive line count reports one URL where there are 88.

Two tempting explanations are also wrong, and worth ruling out early: the gap does *not* track ex_doc version (Phoenix runs a current 0.40.3), and it does *not* track the per-package hexdocs subdomain (every package redirects there). The actual cause only becomes visible on reading `mix.exs`.

**The general rule:** a probe that fails closed produces alarming, publishable, wrong numbers — and every trap above fails in the alarming direction. Verify each headline against a hand-measured control before believing it.

### Limits of this study

- The 85 resources are a **curated list, not a census**. Category membership is a judgement call, and adding more blogs would lower the mean.
- The package tier is the **top 300 by 90-day downloads**. Ranking by all-time downloads gives 22% rather than 26%, because it over-weights dormant Erlang transitive dependencies.
- Layer 3 detection reads the **repository root** via the GitHub API, so monorepo packages whose rules file sits in a subdirectory are missed. **3.5% is a floor, not a ceiling.**
- The Layer 2 figures come from a **separate audit over a different 93-resource list** and were not re-verified by the instrument used for everything else here. Its denominators are not interchangeable, and its own retrieval columns are superseded by Table 1.
- `llms.txt` and content negotiation are **the same signal** in Elixir — one formatter emits both, measured at 50/50 agreement on a balanced sample. In Ruby they are independent, because each project solved them separately.
- MCP availability (Tidewave, ElixirLS, `usage_rules.search_docs`) is named but **not measured**.
- No claim is made here about **whether models actually write better Elixir** as a result. That is the outcome metric and the honest next study. Ruby's work does not measure it either — the widely-quoted "0 out of 1,267 solutions across 13 models" is Chad Fowler's `whichlang` benchmark, which measures language *choice*, not correctness.

## Colophon — 18 August 2026

### How this report was made

The measurements were produced by **two AI coding agents — Claude Code and Amp** — each running its own instrumentation over its own resource list, then cross-checking the other's figures. That redundancy was not ceremonial. The two disagreed on several results, and **every disagreement was settled by re-measuring rather than by averaging**; a number of the figures published here changed as a consequence, and the four measurement traps documented in Section 07 are what the process caught.

| | |
| --- | --- |
| Measurement & analysis | Claude Code · Amp |
| Direction & editorial | Oliver Kriška |
| Instruments | private in-house tooling — built for recurring SEO, AEO and GEO audits across a portfolio of sites |
| Collected | 18 August 2026 — live HTTP probes, Hex API, GitHub API |

### Sources & prior art

- ruby.evilmartians.com — Ruby LLM visibility scorecard, Evil Martians / Irina Nazarova
- github.com/chad/whichlang — origin of the 0/1,267 figure
- ex_doc CHANGELOG v0.40.0 and lib/mix/tasks/docs.ex
- github.com/ash-project/usage_rules · hex.pm/packages/usage_rules
- github.com/starbelly/rebar3_ex_doc — src/rebar3_ex_doc.erl
- github.com/mjrusso/hex2txt — third-party hex package to llms.txt converter
- hex.pm API · GitHub API · live HTTP probes

**The instruments are proprietary; the findings are not.** Every figure in this report is a live HTTP request or a public API call, and Section 07 describes the method in enough detail to reproduce the study with nothing more than a scripting language and an internet connection — no API keys and no paid tooling. The underlying data — the 85-resource scorecard, the 283-package census and the 287-repository agent-rules scan — is available on request.
