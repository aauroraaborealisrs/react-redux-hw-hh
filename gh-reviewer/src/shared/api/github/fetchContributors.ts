import type { GithubUser } from '../../types/github';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const MAX_PAGES = 10;

function getErrorMessage(response: Response, data: unknown): string {
    if (response.status === 404) {
        return 'Репозиторий не найден или нет доступа';
    }

    if (response.status === 403) {
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');

        if (remaining === '0') {
            const resetText = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'позже';

            return `Превышен лимит GitHub API. Попробуй после ${resetText}`;
        }

        return 'Доступ к репозиторию запрещён';
    }

    if (response.status >= 500) {
        return 'Ошибка GitHub API. Попробуй позже';
    }

    if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
        if (
            data.message.includes(
                'The history or contributor list is too large to list contributors for this repository via the API'
            )
        ) {
            return 'Репозиторий слишком большой: GitHub API не может отдать список контрибьюторов';
        }

        return data.message;
    }

    return 'Ошибка запроса к GitHub API';
}

export async function fetchContributors(repo: string, signal?: AbortSignal): Promise<GithubUser[]> {
    const [owner, repoName] = repo.split('/');
    const result: GithubUser[] = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
        let response: Response;

        try {
            response = await fetch(
                `${GITHUB_API_BASE}/repos/${owner}/${repoName}/contributors?per_page=100&page=${page}`,
                {
                    headers: {
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': GITHUB_API_VERSION,
                    },
                    signal,
                }
            );
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw error;
            }

            throw new Error('Сетевая ошибка. Проверь интернет и попробуй снова');
        }

        if (response.status === 204) {
            return [];
        }

        let data: unknown;

        try {
            data = await response.json();
        } catch {
            throw new Error('Не удалось прочитать ответ GitHub API');
        }

        if (!response.ok) {
            throw new Error(getErrorMessage(response, data));
        }

        if (!Array.isArray(data)) {
            throw new Error('Некорректный ответ GitHub API');
        }

        result.push(...(data as GithubUser[]));

        if (data.length < 100) {
            break;
        }

        if (page === MAX_PAGES) {
            console.warn('Contributors list truncated due to MAX_PAGES limit');
        }
    }

    return result;
}
