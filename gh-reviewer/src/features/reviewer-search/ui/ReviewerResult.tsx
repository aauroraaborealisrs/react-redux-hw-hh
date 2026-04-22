import type { GithubUser } from '../../../shared/types/github';
import type { ReviewerMode } from '../../../shared/types/settings';

type ReviewerResultProps = {
    reviewer: GithubUser | null;
    mode: ReviewerMode;
};

export function ReviewerResult({ reviewer, mode }: ReviewerResultProps) {
    if (!reviewer) {
        return null;
    }

    return (
        <div className="result">
            <div className="result-label">{mode === 'contributions' ? 'Top contributor' : 'Result'}</div>

            <img src={reviewer.avatar_url} alt={reviewer.login} className="result-avatar" />

            <div className="result-login">@{reviewer.login}</div>
            <div className="result-meta">contributions: {reviewer.contributions ?? '—'}</div>

            <a href={reviewer.html_url} target="_blank" rel="noreferrer">
                GitHub
            </a>
        </div>
    );
}
