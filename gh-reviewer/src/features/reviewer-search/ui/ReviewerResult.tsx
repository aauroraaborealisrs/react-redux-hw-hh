import type { GithubUser } from '../../../entities/github-user/model/types';

type ReviewerResultProps = {
    reviewer: GithubUser | null;
};

export function ReviewerResult({ reviewer }: ReviewerResultProps) {
    if (!reviewer) {
        return null;
    }

    return (
        <div className="result">
            <div className="result-label">Result</div>

            <img src={reviewer.avatar_url} alt={reviewer.login} className="result-avatar" />

            <div className="result-login">@{reviewer.login}</div>
            <div className="result-meta">contributions: {reviewer.contributions ?? '—'}</div>
            <a href={reviewer.html_url} target="_blank" rel="noreferrer">
                GitHub
            </a>
        </div>
    );
}
