import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GithubUser } from '../../../entities/github-user/model/types';
import { fetchContributors } from '../../../shared/api/github/fetchContributors';
import { parseBlacklist } from '../../../shared/lib/blacklist/parseBlacklist';
import { validateRepo } from '../../../shared/lib/repo/validateRepo';
import type { Settings } from '../../../shared/types/settings';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

type UseReviewerSearchResult = {
    contributors: GithubUser[];
    filteredCandidates: GithubUser[];
    loading: boolean;
    error: string;
    selectedReviewer: GithubUser | null;
    isAnimating: boolean;
    animatedList: GithubUser[];
    offsetIndex: number;
    itemHeight: number;
    visibleItems: number;
    centerIndex: number;
    handleFindReviewer: () => Promise<void>;
};

function pickTopContributor(candidates: GithubUser[]): GithubUser | null {
    if (candidates.length === 0) {
        return null;
    }

    return candidates.reduce((topCandidate, currentCandidate) => {
        const topContributions = topCandidate.contributions ?? 0;
        const currentContributions = currentCandidate.contributions ?? 0;

        if (currentContributions > topContributions) {
            return currentCandidate;
        }

        return topCandidate;
    });
}

function pickWinner(candidates: GithubUser[], mode: Settings['mode']): GithubUser | null {
    if (candidates.length === 0) {
        return null;
    }

    if (mode === 'contributions') {
        return pickTopContributor(candidates);
    }

    return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

function buildVisibleList(candidates: GithubUser[]): GithubUser[] {
    if (candidates.length === 0) {
        return [];
    }

    if (candidates.length >= VISIBLE_ITEMS) {
        return candidates;
    }

    const result: GithubUser[] = [];
    let index = 0;

    while (result.length < VISIBLE_ITEMS) {
        result.push(candidates[index % candidates.length]);
        index += 1;
    }

    return result;
}

export function useReviewerSearch(settings: Settings): UseReviewerSearchResult {
    const [contributors, setContributors] = useState<GithubUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [_currentCandidate, setCurrentCandidate] = useState<GithubUser | null>(null);
    const [selectedReviewer, setSelectedReviewer] = useState<GithubUser | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animatedList, setAnimatedList] = useState<GithubUser[]>([]);
    const [offsetIndex, setOffsetIndex] = useState(0);

    const intervalRef = useRef<number | null>(null);

    const blacklist = useMemo(() => parseBlacklist(settings.blacklist), [settings.blacklist]);

    const filteredCandidates = useMemo(() => {
        const currentUser = settings.login.trim().toLowerCase();
        const blacklistSet = new Set(blacklist);

        return contributors.filter((user) => {
            const candidateLogin = user.login.toLowerCase();

            if (user.type === 'Bot' || candidateLogin.endsWith('[bot]')) {
                return false;
            }

            if (candidateLogin === currentUser) {
                return false;
            }

            if (blacklistSet.has(candidateLogin)) {
                return false;
            }

            return true;
        });
    }, [blacklist, contributors, settings.login]);

    const clearAnimation = useCallback(() => {
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            clearAnimation();
        };
    }, [clearAnimation]);

    useEffect(() => {
        clearAnimation();
        setAnimatedList([]);
        setOffsetIndex(0);
        setIsAnimating(false);
        setCurrentCandidate(null);
        setSelectedReviewer(null);
        setError('');
    }, [settings.mode, clearAnimation]);

    const runAnimation = useCallback(
        (candidates: GithubUser[]) => {
            clearAnimation();
            setSelectedReviewer(null);

            const winner = pickWinner(candidates, settings.mode);

            if (!winner) {
                setIsAnimating(false);
                return;
            }

            const visibleList = buildVisibleList(candidates);
            const maxOffset = Math.max(0, visibleList.length - VISIBLE_ITEMS);

            if (settings.mode === 'contributions') {
                setAnimatedList([]);
                setOffsetIndex(0);
                setCurrentCandidate(winner);
                setSelectedReviewer(winner);
                setIsAnimating(false);
                return;
            }

            setAnimatedList(visibleList);
            setIsAnimating(true);

            let currentIndex = 0;
            let direction = 1;
            let ticks = 0;
            const totalTicks = 10;

            setOffsetIndex(currentIndex);
            setCurrentCandidate(visibleList[currentIndex + CENTER_INDEX] ?? null);

            intervalRef.current = window.setInterval(() => {
                ticks += 1;

                if (maxOffset > 0) {
                    if (currentIndex >= maxOffset) {
                        direction = -1;
                    } else if (currentIndex <= 0) {
                        direction = 1;
                    }

                    currentIndex += direction;
                } else {
                    currentIndex = 0;
                }

                setOffsetIndex(currentIndex);
                setCurrentCandidate(visibleList[currentIndex + CENTER_INDEX] ?? null);

                if (ticks >= totalTicks) {
                    clearAnimation();

                    const winnerIndex = visibleList.findIndex((user) => user.login === winner.login);
                    const finalOffset = Math.min(Math.max(0, winnerIndex - CENTER_INDEX), maxOffset);

                    setOffsetIndex(finalOffset);
                    setCurrentCandidate(winner);
                    setSelectedReviewer(winner);
                    setIsAnimating(false);
                }
            }, 100);
        },
        [clearAnimation, settings.mode]
    );

    const handleFindReviewer = useCallback(async () => {
        setError('');
        setSelectedReviewer(null);
        setCurrentCandidate(null);
        setIsAnimating(false);
        setAnimatedList([]);
        setOffsetIndex(0);
        clearAnimation();

        const login = settings.login.trim();
        const repo = settings.repo.trim();

        if (!login) {
            setError('Укажи login текущего пользователя');
            return;
        }

        if (!repo) {
            setError('Укажи repo');
            return;
        }

        if (!validateRepo(repo)) {
            setError('repo должен быть в формате owner/repo');
            return;
        }

        try {
            setLoading(true);

            const users = await fetchContributors(repo);
            setContributors(users);

            if (users.length === 0) {
                setError('У репозитория нет доступных контрибьюторов');
                return;
            }

            const blacklistSet = new Set(parseBlacklist(settings.blacklist));
            const currentUser = login.toLowerCase();

            const candidates = users.filter((user) => {
                const candidateLogin = user.login.toLowerCase();

                if (user.type === 'Bot' || candidateLogin.endsWith('[bot]')) {
                    return false;
                }

                if (candidateLogin === currentUser) {
                    return false;
                }

                if (blacklistSet.has(candidateLogin)) {
                    return false;
                }

                return true;
            });

            if (candidates.length === 0) {
                setError('После фильтрации не осталось кандидатов');
                return;
            }

            runAnimation(candidates);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    }, [clearAnimation, runAnimation, settings]);

    return {
        contributors,
        filteredCandidates,
        loading,
        error,
        selectedReviewer,
        isAnimating,
        animatedList,
        offsetIndex,
        itemHeight: ITEM_HEIGHT,
        visibleItems: VISIBLE_ITEMS,
        centerIndex: CENTER_INDEX,
        handleFindReviewer,
    };
}
