import { UserInfoCard } from '../../../entities/github-user/ui/UserInfoCard';
import type { Settings } from '../../../shared/types/settings';

import { useReviewerSearch } from '../model/useReviewerSearch';
import { ReviewerHeader } from './ReviewerHeader';
import { ReviewerResult } from './ReviewerResult';
import { ReviewerRoulette } from './ReviewerRoulette';

type ReviewerSearchProps = {
  settings: Settings;
};

export function ReviewerSearch({ settings }: ReviewerSearchProps) {
  const {
    contributors,
    filteredCandidates,
    loading,
    error,
    selectedReviewer,
    isAnimating,
    animatedList,
    offsetIndex,
    itemHeight,
    visibleItems,
    centerIndex,
    handleFindReviewer,
  } = useReviewerSearch(settings);

  return (
    <>
      <div className="cards-grid cards-grid--two">
        <UserInfoCard title="Current user" value={settings.login.trim()} />
        <UserInfoCard
          title="Selected reviewer"
          value={selectedReviewer?.login || ''}
          success
        />
      </div>

      <section className="card">
        <ReviewerHeader
          contributorsCount={contributors.length}
          filteredCount={filteredCandidates.length}
          loading={loading}
          isAnimating={isAnimating}
          onFind={handleFindReviewer}
        />

        {error ? <div className="error">{error}</div> : null}

        <ReviewerRoulette
          list={animatedList}
          offsetIndex={offsetIndex}
          itemHeight={itemHeight}
          visibleItems={visibleItems}
          centerIndex={centerIndex}
        />

        <ReviewerResult reviewer={selectedReviewer} />
      </section>
    </>
  );
}