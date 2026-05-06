interface CategoryOption {
    id: string;
    name_ar: string;
    name_en: string;
    is_active: boolean;
  }
  
  interface PreferenceCategoriesSectionProps {
    options: CategoryOption[];
    selectedIds: string[];
    onToggle: (categoryId: string) => void;
  }
  
  export default function PreferenceCategoriesSection({
    options,
    selectedIds,
    onToggle,
  }: PreferenceCategoriesSectionProps) {
    return (
      <section className="investor-preference-section">
        <div className="investor-preference-section__header">
          <h2 className="investor-preference-section__title">القطاعات المفضلة</h2>
          <p className="investor-preference-section__subtitle">
            اختر المجالات التي ترغب في مشاهدة المشاريع المرتبطة بها أولاً.
          </p>
        </div>
  
        <div className="investor-preference-chip-grid">
          {options.length === 0 ? (
            <div className="investor-preference-empty">لا توجد قطاعات متاحة حالياً.</div>
          ) : (
            options.map((option: CategoryOption) => {
              const isSelected = selectedIds.includes(option.id);
  
              return (
                <button
                  key={option.id}
                  type="button"
                  className={
                    isSelected
                      ? "investor-preference-chip investor-preference-chip--active"
                      : "investor-preference-chip"
                  }
                  onClick={() => onToggle(option.id)}
                >
                  {option.name_ar}
                </button>
              );
            })
          )}
        </div>
      </section>
    );
  }