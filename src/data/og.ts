import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const FONT_URLS = {
  inter400:
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
  inter700:
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf',
  mono700:
    'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-700-normal.ttf',
};

let fontCache: { inter400: ArrayBuffer; inter700: ArrayBuffer; mono700: ArrayBuffer } | null = null;

async function loadFonts() {
  if (fontCache) return fontCache;
  const [inter400, inter700, mono700] = await Promise.all([
    fetch(FONT_URLS.inter400).then((r) => r.arrayBuffer()),
    fetch(FONT_URLS.inter700).then((r) => r.arrayBuffer()),
    fetch(FONT_URLS.mono700).then((r) => r.arrayBuffer()),
  ]);
  fontCache = { inter400, inter700, mono700 };
  return fontCache;
}

interface OgInput {
  title: string;
  description?: string;
  kind?: 'page' | 'skill' | 'agent';
}

const BG = '#0a1014';
const ACCENT = '#4f98a3';
const ACCENT_HIGH = '#b3dde4';
const TEXT = '#f1f7f9';
const MUTED = 'rgba(241, 247, 249, 0.65)';

function template({ title, description, kind = 'page' }: OgInput) {
  const kindLabel = kind === 'skill' ? 'SKILL' : kind === 'agent' ? 'AGENT' : '';
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background: BG,
        backgroundImage:
          'radial-gradient(ellipse 800px 400px at 80% 0%, rgba(79,152,163,0.18), transparent 70%)',
        fontFamily: 'Inter',
        color: TEXT,
        position: 'relative',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, #01696f, ${ACCENT})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '24px',
                    fontFamily: 'JetBrains Mono',
                  },
                  children: 'P',
                },
              },
              { type: 'span', props: { children: 'phxagents' } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '1000px',
            },
            children: [
              kindLabel
                ? {
                    type: 'div',
                    props: {
                      style: {
                        fontFamily: 'JetBrains Mono',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: ACCENT_HIGH,
                        letterSpacing: '0.1em',
                      },
                      children: kindLabel,
                    },
                  }
                : null,
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: title.length > 40 ? '64px' : '76px',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.1,
                    color: TEXT,
                  },
                  children: title,
                },
              },
              description
                ? {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '26px',
                        lineHeight: 1.4,
                        color: MUTED,
                        maxWidth: '900px',
                      },
                      children:
                        description.length > 180
                          ? description.slice(0, 177) + '…'
                          : description,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'JetBrains Mono',
              fontSize: '20px',
              color: MUTED,
            },
            children: [
              { type: 'span', props: { children: 'phxagents.dev' } },
              {
                type: 'span',
                props: {
                  style: { color: ACCENT_HIGH },
                  children: 'Iron Laws · Specialist Agents',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '6px',
              background: `linear-gradient(90deg, #01696f, ${ACCENT}, ${ACCENT_HIGH})`,
            },
          },
        },
      ],
    },
  };
}

export async function renderOG(input: OgInput): Promise<Buffer> {
  const fonts = await loadFonts();
  const svg = await satori(template(input) as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: fonts.inter400, weight: 400, style: 'normal' },
      { name: 'Inter', data: fonts.inter700, weight: 700, style: 'normal' },
      { name: 'JetBrains Mono', data: fonts.mono700, weight: 700, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();
  return Buffer.from(png);
}
