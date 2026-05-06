type StartupStage = "idea" | "mvp_seed";

interface PreferenceStagesSectionProps {
  selectedStages: StartupStage[];
  onToggle: (stage: StartupStage) => void;
}

const stageOptions: Array<{ value: StartupStage; label: string }> = [
  { value: "idea", label: "Idea" },
  { value: "mvp_seed", label: "MVP / Seed" },
];

export default function PreferenceStagesSection({
  selectedStages,
  onToggle,
}: PreferenceStagesSectionProps) {
  return (
    <section className="investor-preference-section">
      <div className="investor-preference-section__header">
        <h2 className="investor-preference-section__title">مراحل المشاريع</h2>
        <p className="investor-preference-section__subtitle">
          اختر المرحلة التي تفضل الاستثمار فيها.
        </p>
      </div>

      <div className="investor-preference-chip-grid">
        {stageOptions.map((option) => {
          const isSelected = selectedStages.includes(option.value);

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