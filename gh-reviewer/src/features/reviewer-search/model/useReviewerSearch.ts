import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import {
    clearGithubError,
    fetchContributorsThunk,
    setGithubError,
} from '../../../entities/github-user/model/githubSlice';
import { parseBlacklist } from '../../../shared/lib/blacklist/parseBlacklist';
import { validateRepo } from '../../../shared/lib/repo/validateRepo';
import { filterCandidates } from '../../../shared/lib/reviewer/filterCandidates';
import type { GithubUser } from '../../../shared/types/github';
import type { Settings } from '../../../shared/types/settings';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);
const EMPTY_CONTRIBUTORS: GithubUser[] = [];

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

function pickWinner(candidates: GithubUser[], mode: 'random' | 'contributions'): GithubUser | null {
    if (candidates.length === 0) {
        return null;
    }

    if (mode === 'contributions') {
        return pickTopContributor(candidates);
    }

    return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

export function useReviewerSearch(settings: Settings): UseReviewerSearchResult {
    const dispatch = useAppDispatch();

    const repoKey = settings.repo.trim();

    const contributors = useAppSelector(
        (state) => state.github.contributorsByRepo[repoKey]?.contributors ?? EMPTY_CONTRIBUTORS
    );
    const loading = useAppSelector((state) => state.github.loading);
    const error = useAppSelector((state) => state.github.error);

    const [selectedReviewer, setSelectedReviewer] = useState<GithubUser | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animatedList, setAnimatedList] = useState<GithubUser[]>([]);
    const [offsetIndex, setOffsetIndex] = useState(0);

    const intervalRef = useRef<number | null>(null);
    const requestRef = useRef<{ abort: () => void } | null>(null);

    const blacklistSet = useMemo(() => new Set(parseBlacklist(settings.blacklist)), [settings.blacklist]);

    const filteredCandidates = useMemo(
        () =>
            filterCandidates({
                users: contributors,
                currentLogin: settings.login,
                blacklistSet,
            }),
        [contributors, settings.login, blacklistSet]
    );

    const clearAnimation = useCallback(() => {
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const abortRequest = useCallback(() => {
        if (requestRef.current) {
            requestRef.current.abort();
            requestRef.current = null;
        }
    }, []);

    useEffect(
        () => () => {
            clearAnimation();
            abortRequest();
        },
        [clearAnimation, abortRequest]
    );

    useEffect(() => {
        clearAnimation();
        abortRequest();
        setAnimatedList([]);
        setOffsetIndex(0);
        setIsAnimating(false);
        setSelectedReviewer(null);
        dispatch(clearGithubError());
    }, [settings.mode, settings.repo, settings.login, settings.blacklist, clearAnimation, abortRequest, dispatch]);

    const runAnimation = useCallback(
        (candidates: GithubUser[]) => {
            clearAnimation();
            setSelectedReviewer(null);

            const winner = pickWinner(candidates, settings.mode);

            if (!winner) {
                setIsAnimating(false);
                return;
            }

            if (settings.mode === 'contributions') {
                setAnimatedList([]);
                setOffsetIndex(0);
                setSelectedReviewer(winner);
                setIsAnimating(false);
                return;
            }

            setAnimatedList(candidates);
            setIsAnimating(true);

            let currentIndex = 0;
            let direction = 1;
            let ticks = 0;
            const totalTicks = 10;
            const maxOffset = Math.max(0, candidates.length - 1);

            setOffsetIndex(currentIndex);

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

                if (ticks >= totalTicks) {
                    clearAnimation();

                    const winnerIndex = candidates.findIndex((user) => user.login === winner.login);
                    const finalIndex = winnerIndex >= 0 ? winnerIndex : 0;

                    setOffsetIndex(finalIndex);
                    setSelectedReviewer(winner);
                    setIsAnimating(false);
                }
            }, 100);
        },
        [clearAnimation, settings.mode]
    );

    const handleFindReviewer = useCallback(async () => {
        dispatch(clearGithubError());
        abortRequest();
        clearAnimation();
        setAnimatedList([]);
        setOffsetIndex(0);
        setIsAnimating(false);
        setSelectedReviewer(null);

        const login = settings.login.trim();
        const repo = settings.repo.trim();

        if (!login) {
            dispatch(setGithubError('Укажи login текущего пользователя'));
            return;
        }

        if (!repo) {
            dispatch(setGithubError('Укажи repo'));
            return;
        }

        if (!validateRepo(repo)) {
            dispatch(setGithubError('repo должен быть в формате owner/repo'));
            return;
        }

        let users = contributors;

        if (users.length === 0) {
            const promise = dispatch(fetchContributorsThunk(repo));
            requestRef.current = promise;

            const resultAction = await promise;
            requestRef.current = null;

            if (fetchContributorsThunk.rejected.match(resultAction)) {
                if (resultAction.payload === 'aborted') {
                    return;
                }

                return;
            }

            users = resultAction.payload.contributors;
        }

        if (users.length === 0) {
            dispatch(setGithubError('У репозитория нет доступных контрибьюторов'));
            return;
        }

        const candidates = filterCandidates({
            users,
            currentLogin: login,
            blacklistSet,
        });

        if (candidates.length === 0) {
            dispatch(setGithubError('После фильтрации не осталось кандидатов'));
            return;
        }

        runAnimation(candidates);
    }, [
        abortRequest,
        blacklistSet,
        clearAnimation,
        contributors,
        dispatch,
        runAnimation,
        settings.login,
        settings.repo,
    ]);

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
