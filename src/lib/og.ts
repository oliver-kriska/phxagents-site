import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

/**
 * Build-time Open Graph card generator.
 *
 * satori lays out a flexbox tree and emits an SVG whose glyphs are vector
 * <path>s, so sharp can rasterize it to PNG with no system-font dependency.
 * Used by the `/og/[...slug].png` endpoint to produce dist/og/<slug>.png for
 * every page.
 *
 * The cards follow DESIGN.md in the light theme: Inter for anything a person
 * reads, JetBrains Mono only for machine text (commands, identifiers, counts,
 * versions, paths), kind color confined to the badge, and no decoration.
 * satori needs static fonts (no variable font, no woff2) and hex colors (no
 * oklch), hence @fontsource/inter and the hex palette below.
 */

const ROOT = process.cwd();
const readFont = (pkg: string, file: string) =>
  fs.readFileSync(path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files', file));

// Loaded once at module init, reused for every card.
const FONTS = [
  { name: 'Inter', data: readFont('inter', 'inter-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: readFont('inter', 'inter-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: readFont('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: readFont('jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
];

const SANS = 'Inter';
const MONO = 'JetBrains Mono';

// Hex forms of the light-theme tokens in global.css.
const BG = '#f8fafd'; // --bg
const SURFACE = '#ffffff'; // --surface
const FG = '#121c23'; // --fg
const FG_SOFT = '#343f47'; // --fg-soft
const MUTED = '#606b72'; // --muted
const BORDER = '#d9dfe3'; // --border

// The site's pill variants: -soft fill, -fg text, a 25% hue border.
const PILL = {
  accent: { bg: '#e2f9e2', border: '#b0ddb5', fg: '#003401' },
  violet: { bg: '#f3edff', border: '#d3c4f0', fg: '#734ac3' },
  warn: { bg: '#ffeecd', border: '#f3d6a1', fg: '#915200' },
  info: { bg: '#e1f5ff', border: '#b2dcf2', fg: '#00619b' },
} as const;
export type OgTone = keyof typeof PILL;

// Semantic tones for evidence figures, so a figure keeps the same reading on
// the card as on the page it links to.
const TONE = {
  good: '#045e17',
  warn: '#915200',
  crit: '#b32228',
} as const;

// The site's .brand-mark: a 135° green→violet square with a bg-colored
// triangle cut out of it. It never changes color by kind.
const BRAND_MARK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#1c882d"/><stop offset="1" stop-color="#734ac3"/></linearGradient></defs>` +
      `<rect width="26" height="26" rx="6" fill="url(#g)"/>` +
      `<path transform="translate(6 6) scale(0.875)" d="M2 12 L8 2 L14 12 L11 12 L8 7 L5 12 Z" fill="${BG}"/>` +
      `</svg>`
  );

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const PAD_X = 72;
const CONTENT_W = OG_WIDTH - PAD_X * 2;

export type OgKind = 'skill' | 'agent' | 'docs' | 'research';

export interface OgStat {
  /** The measured figure, verbatim from the report. */
  value: string;
  /** What it measures; may wrap to two lines in its half-width cell. */
  label: string;
  tone?: keyof typeof TONE;
}

export interface OgInput {
  /** The big card title — page name (e.g. "/phx:plan", "elixir-reviewer"). */
  title: string;
  /**
   * How the title is set: `command` (mono, with a prompt: `/phx:plan`),
   * `identifier` (mono, no prompt: `elixir-reviewer`), or `prose` (Inter).
   */
  titleStyle?: 'command' | 'identifier' | 'prose';
  /** Short supporting line, usually the description. */
  subtitle?: string;
  /** Drives the badge color. */
  kind?: OgKind;
  /** Badge text; defaults to the kind. */
  badge?: string;
  /** Badge color when it says something other than the kind (plugin status). */
  badgeTone?: OgTone;
  /** A mono line of machine facts under the description: `6 skills · 7 agents · v0.1.0`. */
  meta?: string;
  /** A readable scope line the reader needs before acting: `Claude Code only · requires elixir-phoenix`. */
  scope?: string;
  /**
   * Research cards replace the description with the report's own headline
   * figures — a preview that carries findings rather than a description.
   */
  stats?: OgStat[];
  /** The page's own path, shown in the footer (`/plugins/rewrite/`). */
  path?: string;
  /** Overrides the right-hand footer line (research uses the sample sizes). */
  footnote?: string;
}

function toneFor(kind: OgKind): OgTone {
  if (kind === 'skill') return 'accent';
  if (kind === 'agent') return 'warn';
  return 'violet';
}

// Prose titles may take two lines rather than shrinking; mono titles are one
// unbreakable token, so they scale to fit the line instead.
function titleSize(title: string, style: OgInput['titleStyle'], compact: boolean): number {
  const max = compact ? 60 : 72;
  if (style === 'command' || style === 'identifier') {
    const chars = title.length + (style === 'command' ? 2 : 0);
    return Math.min(max, Math.floor(CONTENT_W / (chars * 0.6)));
  }
  const n = title.length;
  if (n <= 26) return max;
  if (n <= 52) return compact ? 54 : 64;
  return 48;
}

// Too long: end on the last sentence or clause that fits, else the last whole
// word, so a card never ends "set the c…".
function clamp(text: string, max = 116): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const stop = Math.max(t.lastIndexOf('. ', max), t.lastIndexOf(': ', max));
  if (stop > max * 0.4) return t.slice(0, stop) + '.';
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.—-]+$/, '') + '…';
}

// Tiny hyperscript helper so the tree reads top-to-bottom without JSX.
function el(type: string, style: Record<string, unknown>, children?: unknown): any {
  return { type, props: { style, children } };
}

const none = () => el('div', { display: 'none' });

/**
 * The report's headline figures as a 2×2 evidence panel. Two columns keep the
 * labels at a size that still reads when a feed shrinks the card to ~500px.
 * Cell widths are fixed because satori has no grid and `1fr` cannot be relied
 * on to divide the content box evenly.
 */
function evidence(stats: OgStat[]): any {
  const cells = stats.slice(0, 4);
  const cellW = Math.floor((CONTENT_W - 2) / 2);
  const rows = [cells.slice(0, 2), cells.slice(2, 4)].filter((r) => r.length);
  return el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      marginTop: 24,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      backgroundColor: SURFACE,
    },
    rows.map((row, r) =>
      el(
        'div',
        { display: 'flex', borderTop: r === 0 ? '0' : `1px solid ${BORDER}` },
        row.map((stat, i) =>
          el(
            'div',
            {
              display: 'flex',
              flexDirection: 'column',
              width: cellW,
              padding: '14px 24px 16px',
              borderLeft: i === 0 ? '0' : `1px solid ${BORDER}`,
            },
            [
              el(
                'div',
                {
                  display: 'flex',
                  fontFamily: MONO,
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: stat.tone ? TONE[stat.tone] : FG,
                },
                stat.value
              ),
              el(
                'div',
                { display: 'flex', fontSize: 28, lineHeight: 1.25, marginTop: 6, color: FG_SOFT },
                stat.label
              ),
            ]
          )
        )
      )
    )
  );
}

function card(input: OgInput) {
  const { title, subtitle, kind = 'docs', badge, badgeTone, meta, scope, stats, path: pagePath, footnote } = input;
  const titleStyle = input.titleStyle ?? 'prose';
  const isMono = titleStyle !== 'prose';
  const hasStats = Array.isArray(stats) && stats.length > 0;
  const pill = PILL[badgeTone ?? toneFor(kind)];
  const size = titleSize(title, titleStyle, hasStats);
  const extras = Boolean(meta || scope);

  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: `56px ${PAD_X}px 48px`,
      backgroundColor: BG,
      color: FG,
      fontFamily: SANS,
    },
    [
      // Header: brand mark + wordmark, kind badge
      el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
        el('div', { display: 'flex', alignItems: 'center' }, [
          { type: 'img', props: { src: BRAND_MARK, width: 40, height: 40, style: { marginRight: 14 } } },
          el('div', { display: 'flex', fontSize: 30, fontWeight: 600, letterSpacing: -0.5, color: FG }, 'phxagents'),
          el('div', { display: 'flex', fontSize: 30, fontWeight: 400, letterSpacing: -0.5, color: MUTED }, '.dev'),
        ]),
        el(
          'div',
          {
            display: 'flex',
            backgroundColor: pill.bg,
            border: `1.5px solid ${pill.border}`,
            borderRadius: 999,
            padding: '7px 18px',
            fontFamily: MONO,
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: 1.2,
            color: pill.fg,
          },
          (badge ?? kind).toUpperCase()
        ),
      ]),

      // Main: title, then a description, facts and scope, or the evidence panel
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el('div', { display: 'flex', alignItems: 'baseline' }, [
          titleStyle === 'command'
            ? el(
                'div',
                { display: 'flex', fontFamily: MONO, fontSize: size, fontWeight: 700, color: MUTED, marginRight: size * 0.35 },
                '›'
              )
            : none(),
          el(
            'div',
            {
              display: 'flex',
              maxWidth: CONTENT_W,
              fontFamily: isMono ? MONO : SANS,
              fontSize: size,
              fontWeight: isMono ? 700 : 600,
              letterSpacing: isMono ? -0.01 * size : -0.025 * size,
              lineHeight: 1.08,
              textWrap: 'balance',
              color: FG,
            },
            title
          ),
        ]),
        subtitle
          ? el(
              'div',
              {
                display: 'flex',
                maxWidth: CONTENT_W,
                fontSize: hasStats ? 26 : 31,
                lineHeight: 1.38,
                marginTop: hasStats ? 14 : 22,
                color: FG_SOFT,
              },
              clamp(subtitle, hasStats || extras ? 64 : 120)
            )
          : none(),
        meta
          ? el(
              'div',
              { display: 'flex', fontFamily: MONO, fontSize: 25, fontWeight: 500, marginTop: 26, color: FG },
              meta
            )
          : none(),
        scope ? el('div', { display: 'flex', fontSize: 28, marginTop: 12, color: FG }, scope) : none(),
        hasStats ? evidence(stats!) : none(),
      ]),

      // Footer: this page's path, then the tagline or the report's sample
      el(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${BORDER}`,
          paddingTop: 22,
          fontSize: 21,
          color: MUTED,
        },
        [
          el('div', { display: 'flex', fontFamily: MONO, fontWeight: 500 }, pagePath ?? ''),
          el('div', { display: 'flex' }, footnote ?? 'Elixir & Phoenix for AI editors'),
        ]
      ),
    ]
  );
}

/** Render an OG card to a PNG buffer. */
export async function renderOgImage(input: OgInput): Promise<Buffer> {
  const svg = await satori(card(input), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: FONTS,
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
