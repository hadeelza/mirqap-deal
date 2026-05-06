interface TechnologyOption {
    id: string;
    name_ar: string;
    name_en: string;
    is_active: boolean;
  }
  
  interface PreferenceTechnologiesSectionProps {
    options: TechnologyOption[];
    selectedIds: string[];
    onToggle: (technologyId: string) => void;
  }
  
  export default function PreferenceTechnologiesSection({
    options,
    selectedIds,
    onToggle,
  }: PreferenceTechnologiesSectionProps) {
    return (
      <section className="investor-preference-section">
        <div className="investor-preference-section__header">
          <h2 className="investor-preference-section__title">التقنيات المفضلة</h2>
          <p className="investor-preference-section__subtitle">
            اختر التقنيات التي ترغب في رؤية المشاريع المرتبطة بها بشكل أكبر.
          </p>
        </div>
  
        <div className="investor-preference-chip-grid">
          {options.length === 0 ? (
            <div className="investor-preference-empty">لا توجد تقنيات متاحة حالياً.</div>
          ) : (
            options.map((option: TechnologyOption) => {
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