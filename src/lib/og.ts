import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

/**
 * Build-time Open Graph card generator.
 *
 * satori lays out a flexbox tree using embedded JetBrains Mono (the brand mono
 * font) and emits an SVG whose glyphs are vector <path>s — so sharp can
 * rasterize it to PNG with no system-font dependency. Used by the
 * `/og/[...slug].png` endpoint to produce dist/og/<slug>.png for every page.
 *
 * Note: satori only understands a CSS subset (hex/rgb, no oklch), so the brand
 * palette below is the hex form of the site's dark theme.
 */

const ROOT = process.cwd();
const FONT_DIR = path.join(
  ROOT,
  'node_modules',
  '@fontsource',
  'jetbrains-mono',
  'files'
);

const readFont = (file: string) => fs.readFileSync(path.join(FONT_DIR, file));

// Loaded once at module init, reused for every card.
const FONTS = [
  { name: 'JetBrains Mono', data: readFont('jetbrains-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: readFont('jetbrains-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: readFont('jetbrains-mono-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
];

// Brand palette (hex form of the dark theme tokens in global.css).
const BG = '#0e1117';
const FG = '#e6edf3';
const FG_SOFT = '#9aa7b4';
const MUTED = '#6e7b8a';
const BORDER = '#283039';
const ACCENT = '#2dd4a7'; // teal — skills + default
const AMBER = '#e3b341'; // agents
const VIOLET = '#a78bfa'; // docs + research

// Semantic tones for research stat strips. Hex forms of the dark-theme
// --accent-fg / --warn-fg / --rp-crit tokens, so a figure keeps the same
// reading on the card as it has on the page it links to.
const TONE = {
  good: '#9be39d',
  warn: '#e9ab2b',
  crit: '#ff8e86',
} as const;

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgKind = 'skill' | 'agent' | 'docs' | 'research';

export interface OgStat {
  /** The measured figure, verbatim from the report. */
  value: string;
  /** What it measures — kept short enough to survive the cell width. */
  label: string;
  tone?: keyof typeof TONE;
}

export interface OgInput {
  /** The big card title — page name (e.g. "/phx:plan", "elixir-reviewer"). */
  title: string;
  /** Short supporting line, usually the description. */
  subtitle?: string;
  /** Drives the accent color + the corner label. */
  kind?: OgKind;
  /**
   * Research cards replace the subtitle block with the report's own headline
   * figures — a preview that carries findings rather than a description.
   */
  stats?: OgStat[];
  /** Overrides the right-hand footer line (research uses the sample sizes). */
  footnote?: string;
}

function accentFor(kind: OgKind): string {
  if (kind === 'agent') return AMBER;
  if (kind === 'docs' || kind === 'research') return VIOLET;
  return ACCENT;
}

function titleSize(title: string): number {
  const n = title.length;
  if (n <= 16) return 70;
  if (n <= 24) return 58;
  if (n <= 34) return 48;
  if (n <= 46) return 40;
  return 34;
}

function clamp(text: string, max = 116): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

// Tiny hyperscript helper so the tree reads top-to-bottom without JSX.
function el(type: string, style: Record<string, unknown>, children?: unknown): any {
  return { type, props: { style, children } };
}

/**
 * A miniature of the report page's own hero strip: four measured figures in
 * their semantic tones. Cell widths are fixed because satori resolves layout
 * without a real cascade, so `1fr` columns cannot be relied on to divide the
 * 1056px content box evenly.
 */
function statStrip(stats: OgStat[]): any {
  const cells = stats.slice(0, 4);
  return el(
    'div',
    {
      display: 'flex',
      marginTop: 30,
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
    },
    cells.map((stat, i) =>
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          width: Math.floor(1054 / cells.length),
          padding: '18px 20px 20px',
          borderRight: i === cells.length - 1 ? '0' : `1px solid ${BORDER}`,
        },
        [
          el(
            'div',
            {
              display: 'flex',
              fontSize: 42,
              fontWeight: 700,
              lineHeight: 1.1,
              color: stat.tone ? TONE[stat.tone] : FG,
            },
            stat.value
          ),
          el(
            'div',
            { display: 'flex', fontSize: 16, fontWeight: 400, lineHeight: 1.4, marginTop: 10, color: FG_SOFT },
            stat.label
          ),
        ]
      )
    )
  );
}

function card({ title, subtitle, kind = 'docs', stats, footnote }: OgInput) {
  const accent = accentFor(kind);
  const hasStats = Array.isArray(stats) && stats.length > 0;
  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: BG,
      backgroundImage: `radial-gradient(900px 460px at 86% -12%, ${accent}22, transparent 60%)`,
      color: FG,
      fontFamily: 'JetBrains Mono',
    },
    [
      // Top accent strip
      el('div', { width: '100%', height: 10, backgroundColor: accent }),
      // Body
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
          padding: '58px 72px',
        },
        [
          // Header: brand + kind label
          el(
            'div',
            { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
            [
              el('div', { display: 'flex', alignItems: 'center' }, [
                el('div', {
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: accent,
                  marginRight: 16,
                }),
                el('div', { display: 'flex', fontSize: 28, fontWeight: 700, color: FG }, 'phxagents'),
                el('div', { display: 'flex', fontSize: 28, fontWeight: 500, color: MUTED }, '.dev'),
              ]),
              el(
                'div',
                {
                  display: 'flex',
                  border: `1px solid ${accent}`,
                  borderRadius: 999,
                  padding: '6px 18px',
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: 2,
                  color: accent,
                },
                kind.toUpperCase()
              ),
            ]
          ),
          // Main: title, then either a description or the report's figures
          el('div', { display: 'flex', flexDirection: 'column' }, [
            el('div', { display: 'flex', alignItems: 'flex-start' }, [
              el('div', { display: 'flex', fontSize: titleSize(title), fontWeight: 700, color: accent, marginRight: 18 }, '›'),
              el(
                'div',
                { display: 'flex', fontSize: titleSize(title), fontWeight: 700, color: FG, lineHeight: 1.08 },
                title
              ),
            ]),
            subtitle
              ? el(
                  'div',
                  {
                    display: 'flex',
                    fontSize: hasStats ? 22 : 27,
                    fontWeight: 400,
                    color: FG_SOFT,
                    lineHeight: 1.45,
                    marginTop: hasStats ? 18 : 24,
                    maxWidth: 980,
                  },
                  clamp(subtitle, hasStats ? 78 : 116)
                )
              : el('div', { display: 'flex' }, ''),
            hasStats ? statStrip(stats!) : el('div', { display: 'flex' }, ''),
          ]),
          // Footer: url + tagline
          el(
            'div',
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 24,
              fontSize: 19,
              color: MUTED,
            },
            [
              el('div', { display: 'flex' }, 'phxagents.dev'),
              el('div', { display: 'flex' }, footnote ?? 'Elixir & Phoenix for AI editors'),
            ]
          ),
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
