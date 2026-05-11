interface RepoStats {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  description: string | null;
}

const REPO = 'oliver-kriska/claude-elixir-phoenix';
const URL = `https://api.github.com/repos/${REPO}`;

export async function getRepoStats(): Promise<RepoStats | null> {
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
      console.warn(`[repo] GitHub API ${res.status} — no repo badge`);
      return null;
    }
    const data = (await res.json()) as RepoStats;
    return {
      stargazers_count: data.stargazers_count ?? 0,
      forks_count: data.forks_count ?? 0,
      open_issues_count: data.open_issues_count ?? 0,
      html_url: data.html_url,
      description: data.description ?? null,
    };
  } catch (err) {
    console.warn('[repo] fetch failed:', err);
    return null;
  }
}
