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
        <h2>Поиск ревьюера</h2>
        <p>
          Загружено контрибьюторов: {contributorsCount} · После фильтрации:{' '}
          {filteredCount}
        </p>
      </div>

      <button
        type="button"
        onClick={onFind}
        disabled={loading || isAnimating}
      >
        {loading ? 'Загрузка...' : isAnimating ? 'Выбираем...' : 'Найти ревьюера'}
      </button>
    </div>
  );
}