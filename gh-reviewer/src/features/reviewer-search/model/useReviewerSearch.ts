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

export function useReviewerSearch(
  settings: Settings,
): UseReviewerSearchResult {
  const [contributors, setContributors] = useState<GithubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [_currentCandidate, setCurrentCandidate] =
    useState<GithubUser | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<GithubUser | null>(
    null,
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedList, setAnimatedList] = useState<GithubUser[]>([]);
  const [offsetIndex, setOffsetIndex] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const blacklist = useMemo(
    () => parseBlacklist(settings.blacklist),
    [settings.blacklist],
  );

  const filteredCandidates = useMemo(() => {
    const currentUser = settings.login.trim().toLowerCase();
    const blacklistSet = new Set(blacklist);

    return contributors.filter((user) => {
      const candidateLogin = user.login.toLowerCase();

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

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => {
      clearAnimation();
    }, [clearAnimation]);

  const buildAnimatedList = useCallback((candidates: GithubUser[]) => {
    if (candidates.length === 0) {
      return [];
    }

    const repeats = Math.max(8, Math.ceil(30 / candidates.length));

    return Array.from({ length: repeats }, () => candidates).flat();
  }, []);

  const runAnimation = useCallback(
    (candidates: GithubUser[]) => {
      clearAnimation();
      setIsAnimating(true);
      setSelectedReviewer(null);

      const rouletteList = buildAnimatedList(candidates);
      setAnimatedList(rouletteList);

      const minStart = CENTER_INDEX;
      const maxStart = rouletteList.length - VISIBLE_ITEMS;
      const startIndex = Math.min(minStart, Math.max(0, maxStart));

      setOffsetIndex(startIndex);
      setCurrentCandidate(rouletteList[startIndex + CENTER_INDEX] ?? null);

      const winnerIndexInsideCandidates = Math.floor(
        Math.random() * candidates.length,
      );

      const safeStopBase = Math.min(
        rouletteList.length - VISIBLE_ITEMS,
        Math.max(10, Math.floor(rouletteList.length * 0.7)),
      );

      let stopIndex = safeStopBase;

      while (
        stopIndex + CENTER_INDEX < rouletteList.length &&
        rouletteList[stopIndex + CENTER_INDEX]?.login !==
          candidates[winnerIndexInsideCandidates].login
      ) {
        stopIndex += 1;
      }

      if (stopIndex + CENTER_INDEX >= rouletteList.length) {
        stopIndex = Math.max(0, rouletteList.length - VISIBLE_ITEMS);
      }

      let currentIndex = startIndex;

      intervalRef.current = window.setInterval(() => {
        currentIndex += 1;

        if (currentIndex > stopIndex) {
          currentIndex = stopIndex;
        }

        setOffsetIndex(currentIndex);
        setCurrentCandidate(rouletteList[currentIndex + CENTER_INDEX] ?? null);
      }, 85);

      timeoutRef.current = window.setTimeout(() => {
        clearAnimation();
        setIsAnimating(false);

        const winner = rouletteList[stopIndex + CENTER_INDEX] ?? null;

        setOffsetIndex(stopIndex);
        setCurrentCandidate(winner);
        setSelectedReviewer(winner);
      }, 3200);
    },
    [buildAnimatedList, clearAnimation],
  );

  const handleFindReviewer = useCallback(async () => {
    setError('');
    setSelectedReviewer(null);
    setCurrentCandidate(null);
    setIsAnimating(false);
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

      const blacklistSet = new Set(parseBlacklist(settings.blacklist));
      const currentUser = login.toLowerCase();

      const candidates = users.filter((user) => {
        const candidateLogin = user.login.toLowerCase();

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