const SITE = 'https://phxagents.dev';

export interface OgMetaInput {
  slug: string;
  title: string;
  description?: string;
}

export function ogHead({ slug, title, description }: OgMetaInput) {
  const url = `${SITE}/og/${slug}.png`;
  return [
    { tag: 'meta', attrs: { property: 'og:image', content: url } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    { tag: 'meta', attrs: { property: 'og:title', content: title } },
    ...(description
      ? [{ tag: 'meta', attrs: { property: 'og:description', content: description } }]
      : []),
    { tag: 'meta', attrs: { property: 'og:type', content: 'article' } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: url } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: title } },
    ...(description
      ? [{ tag: 'meta', attrs: { name: 'twitter:description', content: description } }]
      : []),
  ];
}
