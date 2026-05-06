type RiskLevel = "low" | "medium" | "high";

interface PreferenceRiskSectionProps {
  selectedRiskLevels: RiskLevel[];
  onToggle: (riskLevel: RiskLevel) => void;
}

const riskOptions: Array<{ value: RiskLevel; label: string }> = [
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
];

export default function PreferenceRiskSection({
  selectedRiskLevels,
  onToggle,
}: PreferenceRiskSectionProps) {
  return (
    <section className="investor-preference-section">
      <div className="investor-preference-section__header">
        <h2 className="investor-preference-section__title">مستوى المخاطرة</h2>
        <p className="investor-preference-section__subtitle">
          اختر مستويات المخاطرة التي تناسب استراتيجيتك الاستثمارية.
        </p>
      </div>

      <div className="investor-preference-chip-grid">
        {riskOptions.map((option) => {
          const isSelected = selectedRiskLevels.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              className={
                isSelected
                  ? "investor-preference-chip investor-preference-chip--active"
                  : "investor-preference-chip"
              }
              onClick={() => onToggle(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}