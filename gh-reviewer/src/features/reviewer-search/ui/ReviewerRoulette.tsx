import type { GithubUser } from '../../../shared/types/github';

type ReviewerRouletteProps = {
    list: GithubUser[];
    offsetIndex: number;
    itemHeight: number;
    visibleItems: number;
    centerIndex: number;
};

function getSlotUser(list: GithubUser[], offsetIndex: number, slotIndex: number): GithubUser | null {
    if (list.length === 0) {
        return null;
    }

    const userIndex = (offsetIndex + slotIndex) % list.length;
    return list[userIndex] ?? null;
}

export function ReviewerRoulette({ list, offsetIndex, itemHeight, visibleItems, centerIndex }: ReviewerRouletteProps) {
    if (list.length === 0) {
        return null;
    }

    const slots = Array.from({ length: visibleItems }, (_, slotIndex) => {
        const user = getSlotUser(list, offsetIndex, slotIndex);

        return {
            key: `slot-${slotIndex}`,
            user,
            isCenter: slotIndex === centerIndex,
        };
    });

    return (
        <div className="reviewer-roulette-wrap">
            <div
                className="reviewer-roulette reviewer-roulette--slots"
                style={{ height: `${itemHeight * visibleItems}px` }}
            >
                <div className="reviewer-roulette__fade reviewer-roulette__fade--top" />
                <div className="reviewer-roulette__fade reviewer-roulette__fade--bottom" />

                <div className="reviewer-roulette__slots">
                    {slots.map(({ key, user, isCenter }) => {
                        if (!user) {
                            return null;
                        }

                        return (
                            <div
                                key={key}
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
