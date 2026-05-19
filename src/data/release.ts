interface Release {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  body: string;
}

const REPO = 'oliver-kriska/claude-elixir-phoenix';
const RELEASE_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const REPO_URL = `https://api.github.com/repos/${REPO}`;

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

let releasePromise: Promise<Release | null> | null = null;
let starsPromise: Promise<number | null> | null = null;

export function getLatestRelease(): Promise<Release | null> {
  if (!releasePromise) {
    releasePromise = (async () => {
      try {
        const res = await fetch(RELEASE_URL, { headers: authHeaders() });
        if (!res.ok) {
          console.warn(`[release] GitHub API ${res.status} — no release widget`);
          return null;
        }
        return (await res.json()) as Release;
      } catch (err) {
        console.warn('[release] fetch failed:', err);
        return null;
      }
    })();
  }
  return releasePromise;
}

export function getStargazersCount(): Promise<number | null> {
  if (!starsPromise) {
    starsPromise = (async () => {
      try {
        const res = await fetch(REPO_URL, { headers: authHeaders() });
        if (!res.ok) {
          console.warn(`[stars] GitHub API ${res.status} — no star count`);
          return null;
        }
        const data = (await res.json()) as { stargazers_count?: number };
        return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
      } catch (err) {
        console.warn('[stars] fetch failed:', err);
        return null;
      }
    })();
  }
  return starsPromise;
}

export function formatStars(n: number | null): string {
  if (n == null) return '—';
  if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
