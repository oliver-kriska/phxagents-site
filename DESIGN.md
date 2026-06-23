---
name: phxagents.dev
description: The Field Manual — a precise, opinionated, fast documentation + marketing system for the phxagents Elixir/Phoenix plugin.
colors:
  bg: "oklch(98.5% 0.004 250)"
  bg-soft: "oklch(96.5% 0.006 250)"
  surface: "oklch(100% 0 0)"
  surface-2: "oklch(97.5% 0.005 250)"
  fg: "oklch(22% 0.02 240)"
  fg-soft: "oklch(36% 0.02 240)"
  muted: "oklch(52% 0.018 240)"
  border: "oklch(90% 0.008 240)"
  border-strong: "oklch(82% 0.012 240)"
  accent: "oklch(55% 0.16 145)"
  accent-soft: "oklch(96% 0.04 145)"
  accent-fg: "oklch(28% 0.10 145)"
  violet: "oklch(52% 0.18 295)"
  violet-soft: "oklch(96% 0.04 295)"
  warn: "oklch(70% 0.14 75)"
  danger: "oklch(60% 0.20 25)"
  info: "oklch(62% 0.13 240)"
typography:
  display:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "clamp(34px, 4.8vw, 56px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "clamp(24px, 2.8vw, 34px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'cv11', 'ss01'"
  lede:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11.5px"
    fontWeight: 500
    letterSpacing: "0.06em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
components:
  button-primary:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  button-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  pill:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg-soft}"
    rounded: "{rounded.pill}"
    height: "22px"
    padding: "0 8px"
  code-inline:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg}"
    rounded: "{rounded.sm}"
    padding: "1px 5px"
---

# Design System: phxagents.dev

## 1. Overview

**Creative North Star: "The Field Manual"**

phxagents.dev reads like a well-set engineering field manual: a practitioner's reference with strong, stated rules, dense information laid out for fast scanning, and zero ornament that doesn't carry meaning. The product it sells is *enforced discipline* (the Iron Laws, named specialist agents), so the site itself must look engineered, not decorated. Every surface should feel like it was set by someone who cares about the 0.5px and respects the reader's time.

The system is **tech-utility**: a near-white, faintly blue-tinted neutral canvas; a single green signal accent that earns its rare appearances; monospace reserved for the things that are literally code, commands, counts, and labels; and a type scale that gets genuinely large at the hero and stays tight and quiet everywhere else. It is dense by default — 14px body, compact 32px controls, tabular numerals — because the audience is engineers reading reference material, not consumers being courted.

It explicitly rejects the AI-marketing house style: no warm SaaS-cream backgrounds, no gradient-text headlines, no glassmorphism-for-decoration, no hero-metric template, no per-section uppercase eyebrows, and nothing playful or mascot-driven. Warmth and credibility come from precision and specificity, not from soft colors or cute touches. It must also never imply affiliation with the Phoenix Framework or the commercial phoenix.new.

**Key Characteristics:**
- Dense, signal-first layout; whitespace earns its place rather than padding for "elegance".
- One green accent (145°) used sparingly; violet (295°) as a secondary signal only.
- Inter for everything readable, JetBrains Mono for everything machine (commands, counts, labels, code).
- Flat-by-default surfaces: 1px borders + tonal layering, shadows only on floating UI.
- First-class light **and** dark themes; both pass WCAG 2.2 AA independently.

## 2. Colors

A cool, near-neutral canvas (hues 240–250) carrying a single saturated green signal, with violet and three semantic status hues held in reserve.

### Primary
- **Signal Green** (`oklch(55% 0.16 145)`): The one brand accent. Links on hover, focus rings, active-nav indicators, the brand-mark gradient, accent buttons/pills, and the GitHub-stars "loaded" state. Used on ≤10% of any screen — its rarity is what makes it read as *signal*. Dark theme brightens it to `oklch(72% 0.18 145)`. `accent-soft` (`oklch(96% 0.04 145)`) tints backgrounds; `accent-fg` (`oklch(28% 0.10 145)`) is the AA-safe text-on-soft pairing.

### Secondary
- **Signal Violet** (`oklch(52% 0.18 295)`): A second status hue for "coming soon"/alternate-category states and the brand-mark gradient's far stop. Never competes with green for primary emphasis.

### Tertiary
- **Amber Warn** (`oklch(70% 0.14 75)`), **Red Danger** (`oklch(60% 0.20 25)`), **Blue Info** (`oklch(62% 0.13 240)`): Semantic-only. They appear in callouts, pills, and status dots, each with a matching `-soft` tint. Never decorative.

### Neutral
- **Canvas** (`bg oklch(98.5% 0.004 250)` / `bg-soft oklch(96.5% 0.006 250)`): Page background. Faint blue tint toward the brand's own hue family — never warm/cream.
- **Surface** (`surface oklch(100% 0 0)` / `surface-2 oklch(97.5% 0.005 250)`): Raised panels, inputs, code blocks, cards.
- **Ink** (`fg oklch(22% 0.02 240)` / `fg-soft oklch(36% 0.02 240)` / `muted oklch(52% 0.018 240)`): Body, secondary, and tertiary text. `muted` is the floor — never lighter for body copy.
- **Lines** (`border oklch(90% 0.008 240)` / `border-strong oklch(82% 0.012 240)`): Hairline separators and hover-raised edges.

Dark theme inverts the ramp (`bg oklch(16% 0.014 250)` up through `fg oklch(94% 0.008 240)`) and brightens accent/violet/status hues for contrast on dark surfaces.

### Named Rules
**The One Signal Rule.** Green is the only brand accent and appears on ≤10% of any screen. If two things are green, neither reads as the action — pull one back to neutral.

**The Cool-Neutral Rule.** Neutrals are tinted toward blue (hue 240–250), never toward warm/cream. A beige or sand canvas is the AI-marketing tell this brand exists to avoid.

**The Mono-Means-Machine Rule.** Monospace is reserved for things that are literally code: commands, file paths, counts, version strings, kbd hints, labels. Mono as decorative "developer flavor" is forbidden.

## 3. Typography

**Display Font:** Inter Variable (with `system-ui, sans-serif` fallback)
**Body Font:** Inter Variable (same family; hierarchy comes from weight + size, not a second face)
**Label/Mono Font:** JetBrains Mono (with `ui-monospace, Menlo, monospace`)

**Character:** A single humanist-leaning grotesque doing the readable work, paired with one precise monospace for the machine layer. The contrast axis is sans-vs-mono, not two similar sans faces. Inter runs with `cv11` + `ss01` stylistic sets for a slightly more neutral, engineered feel.

### Hierarchy
- **Display** (600, `clamp(34px, 4.8vw, 56px)`, line-height 1.05, tracking -0.025em): Hero headline only. The one place the page gets loud.
- **Headline** (600, `clamp(24px, 2.8vw, 34px)`, tracking -0.02em): Section headings on the landing page.
- **Title** (600, ~30px on doc detail pages / ~20px on cards, line-height 1.25): Page titles and card headings.
- **Lede** (400, 16.5px, line-height 1.55, color `fg-soft`, max-width ~540px): Hero subhead and section intros.
- **Body** (400, 14px, line-height 1.55, `cv11`+`ss01`): All prose. The site is deliberately dense.
- **Label** (500, 11.5px, JetBrains Mono, tracking 0.06em, uppercase): Eyebrows, group labels, meta lines, pill text, kbd hints.

### Named Rules
**The Weight-Not-Family Rule.** Hierarchy comes from Inter's weight and size contrast plus the mono/sans axis. Never introduce a second sans display face.

**The 75ch Rule.** Long-form prose caps at ~65–75ch measure; the lede caps near 540px. Full-width body text is forbidden in reading columns.

## 4. Elevation

Flat by default. Depth is built from **tonal layering** (`bg` → `surface` → `surface-2`) plus 1px borders, not from shadows. Shadows are reserved for genuinely floating UI; using them on resting cards is forbidden because it reads as a 2014 app.

### Shadow Vocabulary
- **Resting hairline** (`--shadow-sm: 0 1px 2px oklch(20% 0.02 240 / 0.04)`): Barely-there lift for subtly raised controls.
- **Floating surface** (`--shadow: 0 4px 16px oklch(20% 0.02 240 / 0.06), 0 1px 2px oklch(20% 0.02 240 / 0.05)`): The Cmd-K search palette, dropdowns, popovers. Dark theme deepens to `0 8px 24px black/0.40`.
- **Backdrop blur**: The sticky nav and search overlay use `backdrop-filter: blur(10px) saturate(140%)` / `blur(2px)`. This is the one sanctioned glass effect — functional (legibility over scrolling content), never decorative.

### Named Rules
**The Flat-At-Rest Rule.** Surfaces are flat at rest: borders + tonal fills do the separating. A shadow only appears when an element genuinely floats above the page (search palette, dropdown) or as a hover/focus response.

## 5. Components

### Buttons
- **Shape:** Gently rounded, 6px radius (`rounded.md`); compact 32px height, `0 12px` padding.
- **Primary:** Inverted — `fg` background, `bg` text (a confident near-black/near-white block). Hover drops opacity to 0.88.
- **Ghost:** `surface` background, 1px `border`; hover shifts to `border-strong`. The default secondary action.
- **Accent:** `accent-soft` fill, `accent-fg` text, accent-tinted border at 30%, weight 600. Reserved for the one true call-to-action per region.
- **Hover / Focus:** 120ms ease on color/border/opacity. `:focus-visible` shows a 2px `accent` outline at 2px offset (keyboard only; never on mouse click).

### Chips / Pills
- **Style:** 999px radius, JetBrains Mono 11px, `surface-2` fill, 1px `border`, optional leading dot in `currentColor`.
- **Variants:** `accent` / `violet` / `warn` / `danger` / `info`, each pairing its hue's `-fg`/hue text with its `-soft` tint and a 25% hue border. Status, not decoration.

### Cards / Containers
- **Corner Style:** 6px (`md`) for tight cards, 10px (`lg`) for larger panels and the search palette.
- **Background:** `surface` or `surface-2`. **Nested cards are forbidden.**
- **Shadow Strategy:** None at rest (see Elevation). Border + tonal fill only.
- **Border:** 1px `border`; hover may raise to `border-strong`.
- **Internal Padding:** ~14–16px.

### Inputs / Fields
- **Style:** 1px `border`, `surface`/`surface-2` fill, 6px radius. Search input itself is borderless inside its bordered panel.
- **Focus:** 2px `accent` outline at 2px offset via `:focus-visible`. Placeholder text must meet 4.5:1 (no faint-gray placeholders).

### Navigation
- **Style:** Sticky 56px bar; `bg` at 90% opacity with `blur(10px) saturate(140%)`; 1px bottom `border`.
- **Links:** 13px, `fg-soft`; hover fills `surface-2` and darkens to `fg`; `aria-current` page is `fg` on `surface-2`.
- **Mobile:** Links collapse into a full-height `mobile-menu` sheet below the bar at ≤900px.

### Callout (signature)
- Grid of `20px icon + content`, soft tonal background per type (`info`/`tip`/`success`/`warn`/`danger`), a full 1px border, and a 3px left accent in the type's hue. **This is the one sanctioned "left-accent" surface** — it is a full-bordered tinted block, not a bare side-stripe. Do not extend the left-stripe pattern to other cards, list items, or alerts.

### Cmd-K Search Palette (signature)
- Centered floating panel (10px radius, `--shadow`, `border-strong`), opens on `/` or the nav button. Mono group labels, mono result names, muted descriptions, 44px-min rows. The site's primary wayfinding; treat it as a first-class surface.

### GitHub Stars Widget (signature)
- Split pill: a `gh-label` segment + a mono, tabular-nums `gh-count` segment that flips to `accent-soft`/`accent-fg` once loaded, with a `warn`-gold star glyph.

## 6. Do's and Don'ts

### Do:
- **Do** keep green to ≤10% of any screen (**The One Signal Rule**). One action reads as *the* action.
- **Do** tint neutrals toward blue (hue 240–250), never toward warm/cream.
- **Do** use JetBrains Mono only for machine content — commands, counts, paths, labels, kbd, code.
- **Do** build depth from 1px borders + tonal `surface` layering; reserve shadows for floating UI (search palette, dropdowns).
- **Do** keep prose at a 65–75ch measure and body at 14px; density is intentional.
- **Do** verify 4.5:1 body contrast (3:1 large) in **both** light and dark themes, including placeholders.
- **Do** show keyboard focus with the 2px accent `:focus-visible` ring, and ship a `prefers-reduced-motion` alternative for every animation.

### Don't:
- **Don't** use gradient text (`background-clip: text` over a gradient). *The hero `<h1> <em>` currently does this — it is design debt to remove, not a pattern to copy. Emphasis comes from weight, size, or a solid color.*
- **Don't** use a warm SaaS-cream/beige/sand background, a hero-metric template, or an endless grid of identical icon + heading + text feature cards.
- **Don't** use glassmorphism decoratively. Blur is only sanctioned for the sticky nav and the search overlay (legibility), never as a card aesthetic.
- **Don't** put a tiny uppercase tracked eyebrow above *every* section, or numbered `01/02/03` markers as default scaffolding. One hero eyebrow is the ceiling.
- **Don't** add side-stripe accents (`border-left` > 1px as the only accent) to cards, list items, or alerts. The callout is the single sanctioned exception (full border + tint + 3px stripe).
- **Don't** nest cards, and don't add resting shadows to cards (reads as a 2014 app).
- **Don't** go playful — no emoji-as-decoration, bouncy/elastic motion, or mascots (the repo's `houston.webp` is not a brand character).
- **Don't** imply any affiliation with the Phoenix Framework or commercial phoenix.new.
