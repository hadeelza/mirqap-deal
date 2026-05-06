type SortOption = "newest" | "lowest_risk" | "best_match";

interface ProjectsSortBarProps {
  sortBy: SortOption;
  onChange: (value: SortOption) => void;
  totalCount: number;
  visibleCount: number;
}

export default function ProjectsSortBar({
  sortBy,
  onChange,
  totalCount,
  visibleCount,
}: ProjectsSortBarProps) {
  return (
    <section className="investor-explore-sortbar">
      <div className="investor-explore-sortbar__stats">
        <strong>{totalCount}</strong>
        <span>نتيجة</span>
        <span className="investor-explore-sortbar__divider">•</span>
        <span>المعروض حالياً: {visibleCount}</span>
      </div>

      <div className="investor-explore-sortbar__control">
        <label htmlFor="projects-sort-by">الترتيب</label>
        <select
          id="projects-sort-by"
          value={sortBy}
          onChange={(event) => onChange(event.target.value as SortOption)}
        >
          <option value="best_match">الأعلى ملاءمة</option>
          <option value="lowest_risk">الأقل مخاطرة</option>
          <option value="newest">الأحدث</option>
        </select>
      </div>
    </section>
  );
}