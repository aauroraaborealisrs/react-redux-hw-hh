import type { GithubUser } from '../../../entities/github-user/model/types';

const GITHUB_API_BASE = 'https://api.github.com';

export async function fetchContributors(repo: string): Promise<GithubUser[]> {
  const [owner, repoName] = repo.split('/');
  const result: GithubUser[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repoName}/contributors?per_page=100&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      },
    );

    const data: unknown = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Репозиторий не найден или нет доступа');
      }

      if (response.status === 403) {
        const remaining = response.headers.get('x-ratelimit-remaining');

        if (remaining === '0') {
          throw new Error('Превышен лимит GitHub API');
        }
      }

      if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof data.message === 'string'
      ) {
        throw new Error(data.message);
      }

      throw new Error('Ошибка GitHub API');
    }

    if (!Array.isArray(data)) {
      throw new Error('Некорректный ответ GitHub API');
    }

    result.push(...(data as GithubUser[]));

    if (data.length < 100) {
      break;
    }

    page += 1;
  }

  return result;
}