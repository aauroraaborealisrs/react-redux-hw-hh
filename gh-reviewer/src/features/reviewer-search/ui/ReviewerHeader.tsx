type ReviewerHeaderProps = {
  contributorsCount: number;
  filteredCount: number;
  loading: boolean;
  isAnimating: boolean;
  onFind: () => void;
};

export function ReviewerHeader({
  contributorsCount,
  filteredCount,
  loading,
  isAnimating,
  onFind,
}: ReviewerHeaderProps) {
  return (
    <div className="action-row">
      <div>
        <h2>Search reviewer</h2>
        <p>
          Contributors in the repo: {contributorsCount} After filters:{' '}
          {filteredCount}
        </p>
      </div>

      <button
        type="button"
        onClick={onFind}
        disabled={loading || isAnimating}
      >
        {loading ? 'Loading...' : isAnimating ? 'Searching...' : 'Find'}
      </button>
    </div>
  );
}