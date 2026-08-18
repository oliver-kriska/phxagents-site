interface RawContentEntry {
  id: string;
  collection: string;
  body?: string;
}

export function getRawBody(entry: RawContentEntry): string {
  if (entry.body === undefined) {
    throw new Error(`Missing raw body for ${entry.collection}/${entry.id}`);
  }

  return entry.body;
}

export function getMarkdownTitle(body: string, fallback: string): string {
  return body.match(/^#\s+(.+)$/m)?.[1].trim() ?? fallback;
}
