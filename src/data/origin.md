# How this was actually built

![Research, code, and session transcripts being measured and refined into a working system](/origin-calibration-workbench.jpg)

Every file in this plugin started as generated output. I am not going to pretend
otherwise. The repository makes that obvious.

What I want to write down is why I started, because that part gets skipped and it
is the part that decides whether any of this is worth your time.

The method, before the story. The model generated everything first. I pointed it
at three things it did not have, current ecosystem research, my own Phoenix
codebases, and my own session history. Then I deleted whatever did not survive
real use.

## The model is good, that is not the problem

I use Claude Code daily on production Phoenix applications. By 12 February 2026,
the day before the first public commit, I had already put 1,048 sessions and
54,934 messages through it. I am not a light user and I am not an AI skeptic.

The problem was never that the model cannot code. It was what I wrote at the time
about the general-purpose workflow I was using:

> What I like is that it looks into the problem and does the analysis. But now
> and then I feel it puts in things from other languages, and more complicated
> solution designs than how they are done in Elixir.

Now and then. That is the whole problem in three words. A model that codes well
one day and badly the next. A colleague who is excellent most of the time and
occasionally turns up drunk. The average is fine. The variance is what costs you
the afternoon.

You cannot fix variance by asking nicely.

## What I actually wanted, and why it is not linting

At that time I was using EveryInc's compound-engineering-plugin. Genuinely good
general-purpose workflow. But its reviewers were hard-coded for other stacks. A
Rails reviewer, a TypeScript reviewer, a Python reviewer. For Elixir, nothing.

So I asked whether to fork it. The advice came back as **NEFORKOVAŤ**, do not
fork, with real numbers: 20 to 40 hours up front, around 5 hours a month of
maintenance, 15 to 20 agent files to rewrite, against an upstream moving at 97
commits. It listed four Elixir plugins that already existed and told me to
combine those instead.

Reasonable analysis. Wrong question. It took me one more message to say what I
actually meant:

> Formatting, dialyzer, specs, those I take as static things a mix task catches.
> Or quokka, which fixes the code directly. But I am talking about the decisions.
> Which libraries to use, what module structure, what components.

The answer came back in one line, and it is still the thesis of this plugin: a
**decision layer during planning**, not static analysis.

Every tool on that list was real. Linting and compile hooks. Architecture docs
and ADRs. OTP patterns. TDD gates. All useful. None of them sat inside the
planning workflow deciding which Hex package, or whether this is a context or a
GenServer, a stream or an assign.

## What skills are for, if you don't like skills

This is the part I would want to read if someone showed me this plugin and I
didn't want it.

A skill is a markdown file the model pulls into its context when it judges the
file relevant. That is the whole mechanism, and it is why the objection to them
is reasonable. Skills do not make the model smarter. They do not teach Claude
Elixir. Claude knew enough Elixir that syntax was never my problem, and adding
a document about pattern matching to its context would not have improved that.

What they do is narrow it.

A general model carries every framework, every language, every convention it has
ever read. Ask it to plan a Phoenix feature and it has to decide, silently, which
of those mental models applies. Most of the time it picks right. Sometimes it
reaches for a pattern from another stack. The knowledge was never missing, the
focus was.

So the plugin is mostly not about how code should be written. It is about how
work should be done. What to check before proposing a library. When to read
HexDocs instead of guessing. Which order to do things in. Where to stop and ask.
Workflow, not style.

Subagents do the same thing for context. When a research task runs in its own
agent, the main conversation never sees the 40 files it read. It sees the
conclusion. That keeps the parent conversation small enough to reason well. It
does not necessarily reduce your total token bill, and with a wide fan-out it can
increase it. My own note when I designed the first audit was exactly this, spawn
multiple subagents "aby sa nezašpinil context", so the context does not get dirty.

If you already hold all of this in your head and apply it consistently at 11pm,
you do not need any of this. I do not apply it consistently at 11pm.

## The generated version came first

In the conversation I started on the evening of 3 February, the same one where I
decided not to fork, Claude generated the first version of the plugin. Agents,
skills, a manifest, a zip file I could download. One sitting.

The generated version came first. The evidence did not.

What I typed next is the whole method, before I had a name for it:

> Split it into own reports, at least 5 or more. And make deep research for each
> one and own md file so we have big source of data for makind decision how to
> change plugin.

Ten came back, one each: Elixir and BEAM, Phoenix, LiveView, Ecto, the testing
ecosystem, plugin architecture, agent design, Oban, deployment, security. All of
them in the same conversation, after the files already existed. The plugin was
then rebuilt out of them.

## What I pointed it at

Here is the part that actually decides whether a plugin like this is worth
anything, and it is not the file count.

If you ask a model to write Elixir skills, it writes you a textbook. Correct,
generic, and useless, because the model already knows that material. It does not
need a document telling it what a changeset is.

The reports were the first of the three. The other two were mine, and they are
the ones a model cannot get anywhere else.

**My code.** On day one I built an agent whose only job was to read real
Phoenix codebases, read-only, and answer three questions. What patterns repeat
here. What are this codebase's conventions. And the one that mattered: where do I
make mistakes that a review agent would catch.

I should be exact about what was mine here, because the page is about not taking
the model's word for things. Asking whether to point Claude Code at my own
projects was mine. The answer suggested my conventions "should become Iron Laws
in the plugin", and that sentence is the model's, not mine. The name was not mine
either. Iron Laws had come back earlier in the same conversation, inside a report
about other people's Elixir plugins, and I kept it because it was the right
length for a rule a reviewer, human or script, can answer yes or no about. What I
contributed was the target. Not a style guide. Three production Phoenix
applications, read back to me. The laws that survive today have been rewritten
since, most of them by an actual bug, but the mechanism started here.

The first references it produced were about OAuth account linking, rate limiting
with composite keys, and when to use `with` versus a pipeline. That last one
exists, in the commit message's own words, to address "AI avoiding idioms". Not a
gap in my knowledge. A gap in the model's behaviour, found by looking.

**My sessions.** Two days later I built a different pipeline, one that
reads Claude Code transcripts instead of code. A script to pull sessions apart, a
second to condense them, and a skill to run the whole thing over batches of my
own history.

The question that pipeline asks about a skill is not "is this well written". It
is: did it fire, did it help, and did I have to correct it afterwards. Those are
three different failures and only the last one is visible while you are working.

That is the whole method, and the division of labour in it matters. The model
generates candidates. The ten research reports supply current ecosystem guidance,
because what the model remembers about Hex and Phoenix is not necessarily what is
true this year. My codebases supply local conventions. My sessions supply
behavioural evidence about what actually goes wrong. The model is the generator,
not the source of truth. Take away any of the three evidence inputs and you get
something that reads well and does nothing, which is precisely what I had on 4
February.

## Then I had it audited against real code

Before any of it was public I had it audited. I asked for the prompt rather than
writing it, and the line everyone quotes back to me from that audit, that it
should be brutally honest because the plugin needs to survive real-world use, is
the model's sentence in a prompt the model drafted. Mine was the constraint, and
I wrote it in Slovak: run it over my other projects, `bez uprav v nich`, without
changing anything in them, and split it across subagents `aby sa nezaspinil
context`, so the context does not get dirty. Read-only over real client code, in
clean context. That part I meant literally.

One phase of it pointed at four of my own production codebases, read-only. A CRE
platform, an AI writing tool, a wedding SaaS, an older Phoenix 1.7 app. Not to
prove it worked, but to find where it did not fit. It came back with specifics I
could not argue with:

- Surface components were not supported at all,
- Ash was not supported at all,
- the codebase with the most mature custom patterns got the least value,
- the older application used Phoenix 1.7, and none of the scope patterns applied.

It also produced fit scores per project, which I am not quoting, because that was
AI grading AI. The gaps were the real output. Ash took four months to close.
Surface still has no dedicated support today.

The audit also carried the question I actually cared about, and that one was
mine. I had asked for it in my own words days earlier, when I asked that the
skills and agents be usable automatically, so that in ordinary work Claude Code
would decide for itself, `aha riesime bug`, we are solving a bug, and start a
tracing subagent on its own. That is the whole product in one sentence, and it is
the one thing I could not settle by reasoning about it.

## What the sessions found

The answer arrived the same day, a few hours later, and it was more precise than
I expected.

The explicit command worked. `/phx:audit` spawned its five named agents exactly
as designed. Automatic activation did not. On an ordinary natural-language task
Claude used one generic Explore agent, loaded no plugin skill, no named agent and
no reference file, and said so plainly when I asked it: "I did not use any
skills, just direct tool calls and the one Explore agent."

The audit's own verdict was feature-complete but activation-deficient. Eight days
before anyone else could install it.

The session pipeline had a second question to answer. I pointed it at activation. It
started with 37 sessions, then another 100. By the evening of 6 February the
corpus was 137, and by 10 February it was 160.

Auto-loading appeared in zero of them. Not rarely. Zero out of 160.

All of that happened before the first public commit on 13 February. It is why the
plugin was already at version 2.0 the day anyone else could install it. It did
not ship smaller. It shipped at 189 tracked files against 152 a week before,
because the
deleting and the building were happening at the same time.

Whether the rules were any good did not matter. They were never consulted.

Anyone can generate a pile of skills in an afternoon, and reading them tells you
nothing. Mine looked complete and never fired. You have to measure.

Much later I ran the same question over a far bigger sample, 400 sessions in a
deep analysis, and the prose routing rules in my `CLAUDE.md` were firing at
roughly zero percent there too. Same answer, bigger corpus, months of writing
documentation in between.

The fix was structural. Anything that had to be *seen* stopped being prose and
became a hook, a shell script the harness runs on its own schedule whether the
model asks for it or not. `route-intent.sh` watches for PR URLs and stack traces.
`inject-iron-laws.sh` puts the rules into every subagent, because subagents start
without the parent conversation and cannot reliably read plugin reference files
at runtime.

Then I measured the fix, because a before number with no after number is a story,
not a result. Across the 527 Elixir sessions I have run since the hook shipped in
June, measured at the end of August:

- the routing hook fired in 123 of them, **23.3%**,
- of the 157 hints it injected, **27.4%** were followed by the command,
- those 43 follow-throughs landed in 32 of the 527 sessions, about **6%**,
  because a session sometimes took more than one hint.

I want to be careful about what that six percent is, because it is tempting to
put it next to the zero and call it progress. It is not the same measurement. The
zero was about the model activating rules on its own. The six percent is a
visible suggestion that a human then acted on. Every one of those 43
follow-throughs was me typing the command myself. Not once did Claude route
autonomously.

So the honest version is narrower than an improvement. Prose was invisible.
Hooks are at least seen. And one of the three categories, the Tidewave page
context hint, converts at **9%**. That one is still bad and it is in the plugin
today.

These are my sessions. I have no visibility into anyone else's.

## Nine days of deleting things

Back in February, the zero is what most of the deleting was for. The repository
ran for nine days before anything was public, and a lot of what happened in them
was subtraction. By the end of day one it held 14 skills, 13 agents and 33
reference files. The next day I wrote "Mám pocit, že to všetko máme, ale je to
rozlietané", I feel we have it all but it is scattered. The answer came back that
there were 84 components and no orchestration layer, and the commit the following
morning was the one that added the flow this plugin still runs on.

Three deletions from that week say more than any feature list.

On 6 February one commit removed a whole workflow phase, collapsed the state
machine from eight states to five, and cut `CLAUDE.md` from about 885 lines to
about 499. It deleted twice as much as it added. Three hours later another commit
removed three named sections of `CLAUDE.md` for having "zero usage in 137
sessions". Not because they read badly. Because I had gone and looked.

Then, two days before launch, I reviewed one of my own pull requests three times
and the third round found a hook I had written making raw HTTP calls to
`localhost:4000` to reimplement something the agent could already do natively
through MCP. Hardcoded port, and with two Phoenix apps running it could happily
report on the wrong one. I deleted it that morning.

Subtraction is most of what those nine days were, and it is what decides whether
you have a tool or a pile of files.

What survived got arranged into one flow:

brainstorm → plan → work → review → compound

The filesystem is the state machine. Plans are markdown with checkboxes, progress
survives a crashed session, and the compound phase saves every solved problem as
a searchable doc so the same bug does not get investigated twice.

## How a session becomes a skill

The session pipeline is easy to describe and easy to doubt. Here is one turn of
it I can trace end to end, from a session to the thing it changed.

On 12 February I ran the pipeline over seven sessions of my own real work. Each
transcript went through a template with the same six questions: what happened,
how did I work, where was the friction, which plugin skill would have helped,
what should change, was this efficient. One detail I insisted on was recording
which plugin version each session had actually used, because I update the plugin
locally and a running session keeps the older copy. Without that the analysis
compares a session against a plugin it never had.

Two findings out of the seven mattered.

In one session I had spent more than thirty manual tool calls tracing code by
hand to understand an Ecto constraint error. In another, a strict validation
change had set off cascading test failures because a factory did not match the
schema's required fields. Neither was a knowledge problem. Both were me doing
mechanical work the plugin should have done.

The next commit added a new Ecto constraint debugging skill with its
own reference of failure patterns, two new Iron Laws covering factories and
`cast_assoc` deduplication, auto-loading rules so touching a factory file pulls
in the testing skill, a compression step so investigations stop flooding the main
context, and complexity detection to route trivial requests to the quick command
instead of the full workflow.

That is the loop. Real work, read back, turned into something that stops the same
half hour from happening again. Not a feature I thought would be nice.

## What the tests found

The same variance problem applies to quality checks. If I ask a model whether a
skill is good, I get an answer that depends on the day.

So the checks moved into code. CI applies deterministic structural checks to
every skill and agent, on completeness, safety, clarity and more, and a change
does not land until they pass.

Routing gets its own suite, and that one is worth describing in full.

Each skill has a fixture file sitting next to the eval code, one JSON per skill,
51 of them. Inside are prompts a person might really type, split two ways. 269
that should reach this skill, 233 that should not. The Ecto constraint skill has
to fire on "Unique constraint error on users email" and stay quiet on "How do I
add a unique constraint to my schema?", because in the second one nothing is
broken yet. Same noun, different job. Writing the negative half is most of the
work.

The judge is Haiku. It gets all 51 descriptions and one prompt, and it answers
with up to three skill names or with none. So a skill scores a hit when it
appears anywhere in that answer, and a miss when it appears on a prompt that was
never its own. Each skill has to clear 75% of its own fixture. A full pass takes
about an hour and depends on which model is judging, so it sits deliberately
outside the deterministic gate.

When a prompt routes wrong, a script says why by comparing it against the
descriptions, with no model in that part. It separates a description that missed
a word the prompt used, from one that collides with a neighbour's top keywords,
from one that says what the skill is and never says when to use it. Three
different repairs, and I kept losing track of which one I was doing.

On the last full run, in July, 34 of the 51 skills scored a perfect 100% and the
average was 95.3%. Nothing fell below the gate. Three skills sit exactly on it, and two
of those are `ecto-patterns` and `liveview-patterns`, the two reference skills a
Phoenix developer touches most. Neither one ever misses its own prompt. Both lose
by being named second on somebody else's. `ecto-patterns` gets pulled into "Scan
my codebase for N+1 queries and fix them" behind the skill that owns it, and
`liveview-patterns` gets pulled into "Write ExUnit tests for my live view's
handle_event" behind the testing skill. They shadow each other too. The broadest
descriptions bleed.

That is also how I caught the worst thing in this repo.

I built the eval framework, the scores were good, and then I looked at the test
set. **38 of 42 test files leaked the answer.** Prompts carried annotations like
"use perf instead", so the judge was rewarded for following hints instead of
routing.

I stripped 209 of those annotations and re-ran everything. The average held at
91% across the 42 fixture files that existed then. What changed was the
composition, from hint-following to a clean routing baseline. That is the number
I wanted, and I only know the difference because I checked the test set instead
of the score. It is still a model judging prompt fixtures, so that 91% belongs to
that judge and that test set, not to your codebase.

Then, while measuring the routing hook for this page, I did it again. My first
query returned 100% follow-through until I noticed the hint text itself contains
the command string, so every session matched trivially. Same trap, same project,
twice.

The 27.4% you read above is what survived that catch. Without it I would have
published a hundred percent that meant nothing.

I don't think that says the tooling is clean. I think it says the only thing
protecting you is checking.

It is also why I run the same work through more than one agent, Claude Code
mostly, then Amp, Codex, Pi and OpenCode. It is how I find out whether a problem
is mine or the model's.

## Every Iron Law is a scar

The 26 Iron Laws are not a style guide. Most of them are one bug, compressed:

- **Check changeset errors before UI debugging.** A form saved, no error
  appeared, nothing persisted. I debugged the viewport, the JS hooks, the
  payload. It was `{:error, changeset}` the whole time.
- **Match `{:error, %Ecto.Changeset{}}` explicitly.** A bare `{:error, _}`
  swallows the changeset, so the form re-renders with no validation errors and
  the user sees a silent no-op.
- **Capture locale before spawning.** Gettext locale lives in the process
  dictionary, so a background task loading grid data never inherited it. Tooltips,
  activity labels and dates all quietly came back in English.

Enforcement lives in three places, hooks, a judge agent, and subagent injection,
because one was not enough.

And the part that matters more than the list. **These hooks are fallible and they
deliberately fail open.** A broken hook means the guard is off, never that your
session is stuck. They are defense in depth, not a sandbox and not a permission
boundary. Do not install this and assume you are protected.

## The bugs I did not find myself

The strongest evidence is not mine, and it is not that the advice is good. It is
that this escaped my own feedback loop and other people found what I missed:

- review agents could not write their own findings files, fixed in under three
  days,
- a plan's progress was written into an unrelated plan, fixed the same day,
- hooks fired in non-Elixir projects, fixed in two days,
- `--force-with-lease` was blocked as if it were a force push, fixed overnight.

Three people outside my head, four separate reports, hitting things my own
testing missed.

One of those reports is still my favourite thing anyone has sent me, because it
quoted my own plugin back at me:

> "Agent didn't write the file. Let me read its output to extract findings." Is it
> also happening to you? Cheers!

The flagship review command was structurally broken. The agents were told to
write findings files and did not have the tool to do it. It took a stranger to
notice.

## One thing it caught that everything else missed

Every number so far measures the process. Whether a hook fired, whether a test
set was honest, whether a skill was ever used. None of them answers the question
a sceptic actually has, which is whether anything is better for it. I have one
result for that, and it is one result, not a study.

On a branch in a codebase I work in daily, everything was green. Compiled clean
with warnings as errors, formatted, strict Credo with no issues, requirements at
eight of eight, Iron Laws at zero violations, and 85 tests passing across the
five files in scope. Then I ran the plugin's own review over it. The verdict came
back as requires changes, with one blocker across all five forms.

After an address lookup returned no match, the field cleared and the message said
so. But if a save landed before that clearing reached the browser, the form still
carried the previously selected address in a hidden field, and it saved that.
The review traced it to a helper with a clause for the case where the lookup
succeeded and no clause for the case where it did not. Wrong address, written
quietly, to a record somebody had just corrected.

The regression tests on that branch are now named after the exact scenario, and
it merged. That is one prevented data-integrity defect. It is not a productivity
number and I am not going to inflate it into one. What it is, is the workflow
finding something after every deterministic check I own had already passed.

It is client code, so you get the shape and not the link, which is exactly the
kind of claim I have spent this page telling you not to take on trust.

## What I claim, and what I don't

My family house was built by Slovak workers who worked on Borovička, the local
juniper brandy, at 100%. It was expensive to bring up to standard afterwards. We
live well in it.

Generated code works similarly. The first version stands up. What it costs you
is everything after.

So the claim here is narrow. Generation is where this started, measurement
against reality is why it is still here. What one sitting cannot produce is six
months of documented failures, reverted experiments, and fixes shipped against
real reports from real people.

Current state, as of v3.1.0, end of August 2026: 51 skills, 26 specialist agents,
23 hooks, 26 Iron Laws, 37 releases, and 26 issues filed by 16 people who are not
me.

That list is the least interesting thing on this page, so here is the same
instrument pointed at it. Across the 1,351 Elixir sessions I still have
transcripts for, 19 of those 51 skills have ever been invoked. Thirteen more are
preloaded by an agent, so they reach the model without being called. That leaves
19 that have never run either way. Seven are onboarding commands I would never
point at myself. The other twelve are working skills with no evidence of ever
having run, and six of those twelve have been in the plugin since the first
commit. I nearly published 4,856 for that first number, because I counted
transcript files, subagents included, instead of distinct sessions.

That is the zero out of 160 arriving again from a different direction.

One of the twelve is the Ecto constraint skill I traced earlier on this page. I
built it out of a real session and a real half hour I had wasted, and it has not
run since. On the routing judge it scores 90%. The auto-loading rule from that
same commit is dead too, for the reason you already read. Of the two Iron Laws
it added, the one about factories is not in the list any more. The one about
`cast_assoc` deduplication is, and it reaches the model on every subagent spawn,
because a script puts it there whether anything chooses it or not. Same commit,
same evidence, same author. Of those four, the only part still arriving is the
part nobody has to choose. That is the argument for hooks, made at my own
expense.

Both of those numbers are right, because they answer different questions. The
judge is told it is testing routing and asked outright which skills to load. A
real session gets the same 51 descriptions in its listing and is never asked. I
only learned those were two questions because I had built both instruments and
they disagreed.

I don't know which of the twelve are useful to somebody else and which are dead
weight, because I measured my sessions and nobody else's. What changed is that I
now know which twelve to ask about.

Start with `/phx:review` on a branch you already understand. If it tells you
something you didn't know, keep it. If it doesn't, you lost ten minutes and I
would genuinely like to hear which part missed.
