import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import {
    clearGithubError,
    fetchContributorsThunk,
    setGithubError,
} from '../../../entities/github-user/model/githubSlice';
import type { GithubUser } from '../../../entities/github-user/model/types';
import { parseBlacklist } from '../../../shared/lib/blacklist/parseBlacklist';
import { validateRepo } from '../../../shared/lib/repo/validateRepo';
import type { Settings } from '../../../shared/types/settings';

import {
    resetReviewerState,
    setAnimatedList,
    setIsAnimating,
    setOffsetIndex,
    setSelectedReviewer,
} from './reviewerSlice';

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

function pickWinner(candidates: GithubUser[], mode: 'random' | 'contributions'): GithubUser | null {
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
    const dispatch = useAppDispatch();

    const repoKey = settings.repo.trim();

    const contributors = useAppSelector((state) => state.github.contributorsByRepo[repoKey]?.contributors ?? []);
    const loading = useAppSelector((state) => state.github.loading);
    const error = useAppSelector((state) => state.github.error);

    const selectedReviewer = useAppSelector((state) => state.reviewer.selectedReviewer);
    const isAnimating = useAppSelector((state) => state.reviewer.isAnimating);
    const animatedList = useAppSelector((state) => state.reviewer.animatedList);
    const offsetIndex = useAppSelector((state) => state.reviewer.offsetIndex);

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

    useEffect(
        () => () => {
            clearAnimation();
        },
        [clearAnimation]
    );

    useEffect(() => {
        clearAnimation();
        dispatch(resetReviewerState());
        dispatch(clearGithubError());
    }, [settings.mode, settings.repo, settings.login, settings.blacklist, clearAnimation, dispatch]);

    const runAnimation = useCallback(
        (candidates: GithubUser[]) => {
            clearAnimation();
            dispatch(setSelectedReviewer(null));

            const winner = pickWinner(candidates, settings.mode);

            if (!winner) {
                dispatch(setIsAnimating(false));
                return;
            }

            const visibleList = buildVisibleList(candidates);
            const maxOffset = Math.max(0, visibleList.length - VISIBLE_ITEMS);

            if (settings.mode === 'contributions') {
                dispatch(setAnimatedList([]));
                dispatch(setOffsetIndex(0));
                dispatch(setSelectedReviewer(winner));
                dispatch(setIsAnimating(false));
                return;
            }

            dispatch(setAnimatedList(visibleList));
            dispatch(setIsAnimating(true));

            let currentIndex = 0;
            let direction = 1;
            let ticks = 0;
            const totalTicks = 10;

            dispatch(setOffsetIndex(currentIndex));

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

                dispatch(setOffsetIndex(currentIndex));

                if (ticks >= totalTicks) {
                    clearAnimation();

                    const winnerIndex = visibleList.findIndex((user) => user.login === winner.login);
                    const finalOffset = Math.min(Math.max(0, winnerIndex - CENTER_INDEX), maxOffset);

                    dispatch(setOffsetIndex(finalOffset));
                    dispatch(setSelectedReviewer(winner));
                    dispatch(setIsAnimating(false));
                }
            }, 100);
        },
        [clearAnimation, dispatch, settings.mode]
    );

    const handleFindReviewer = useCallback(async () => {
        dispatch(clearGithubError());
        clearAnimation();
        dispatch(resetReviewerState());

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
            const resultAction = await dispatch(fetchContributorsThunk(repo));

            if (fetchContributorsThunk.rejected.match(resultAction)) {
                return;
            }

            users = resultAction.payload.contributors;
        }

        if (users.length === 0) {
            dispatch(setGithubError('У репозитория нет доступных контрибьюторов'));
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
            dispatch(setGithubError('После фильтрации не осталось кандидатов'));
            return;
        }

        runAnimation(candidates);
    }, [clearAnimation, contributors, dispatch, runAnimation, settings.blacklist, settings.login, settings.repo]);

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
