interface Release {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  body: string;
}

const REPO = 'oliver-kriska/claude-elixir-phoenix';
const URL = `https://api.github.com/repos/${REPO}/releases/latest`;

export async function getLatestRelease(): Promise<Release | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(URL, { headers });
    if (!res.ok) {
      console.warn(`[release] GitHub API ${res.status} — no release widget`);
      return null;
    }
    return (await res.json()) as Release;
  } catch (err) {
    console.warn('[release] fetch failed:', err);
    return null;
  }
}
