import type { GithubUser } from '../../../entities/github-user/model/types';

type ReviewerRouletteProps = {
    list: GithubUser[];
    offsetIndex: number;
    itemHeight: number;
    visibleItems: number;
    centerIndex: number;
};

export function ReviewerRoulette({ list, offsetIndex, itemHeight, visibleItems, centerIndex }: ReviewerRouletteProps) {
    if (list.length === 0) {
        return null;
    }

    return (
        <div className="reviewer-roulette-wrap">
            <div className="reviewer-roulette" style={{ height: `${itemHeight * visibleItems}px` }}>
                <div className="reviewer-roulette__fade reviewer-roulette__fade--top" />
                <div className="reviewer-roulette__fade reviewer-roulette__fade--bottom" />

                <div
                    className="reviewer-roulette__track"
                    style={{
                        transform: `translateY(-${offsetIndex * itemHeight}px)`,
                    }}
                >
                    {list.map((user, index) => {
                        const isCenter = index === offsetIndex + centerIndex;

                        return (
                            <div
                                key={`${user.id}-${index}`}
                                className={`reviewer-roulette__item ${isCenter ? 'is-active' : ''}`}
                                style={{ height: `${itemHeight}px` }}
                            >
                                <img src={user.avatar_url} alt={user.login} className="reviewer-roulette__avatar" />

                                <div className="reviewer-roulette__content">
                                    <div className="reviewer-roulette__login">@{user.login}</div>
                                    <div className="reviewer-roulette__meta">
                                        contributions: {user.contributions ?? '—'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div
                    className="reviewer-roulette__selector"
                    style={{
                        top: `${centerIndex * itemHeight}px`,
                        height: `${itemHeight}px`,
                    }}
                />
            </div>
        </div>
    );
}
