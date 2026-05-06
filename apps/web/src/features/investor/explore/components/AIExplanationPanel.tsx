type ExplanationIntent =
  | "summary"
  | "why_risk"
  | "score_meaning"
  | "top_reasons"
  | "compare_simulation";

interface AIExplanationPanelProps {
  selectedIntent: ExplanationIntent;
  onSelect: (intent: ExplanationIntent) => void;
  content: string;
  isLoading: boolean;
  hasSimulation: boolean;
}

const items: Array<{ key: ExplanationIntent; label: string }> = [
  { key: "summary", label: "اشرح لي النتيجة" },
  { key: "why_risk", label: "لماذا المخاطر بهذا المستوى؟" },
  { key: "score_meaning", label: "ما معنى السكور؟" },
  { key: "top_reasons", label: "ما أهم الأسباب؟" },
  { key: "compare_simulation", label: "قارن قبل وبعد" },
];

export default function AIExplanationPanel({
  selectedIntent,
  onSelect,
  content,
  isLoading,
  hasSimulation,
}: AIExplanationPanelProps) {
  return (
    <section className="project-details-section">
      <div className="project-details-section__header">
        <h2>لوحة الشرح الذكي</h2>
      </div>

      <div className="project-explanation-panel">
        <div className="project-explanation-panel__actions">
          {items.map((item) => {
            const disabled = item.key === "compare_simulation" && !hasSimulation;

            return (
              <button
                key={item.key}
                type="button"
                className={
                  selectedIntent === item.key
                    ? "project-explanation-btn project-explanation-btn--active"
                    : "project-explanation-btn"
                }
                onClick={() => onSelect(item.key)}
                disabled={disabled || isLoading}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="project-explanation-panel__content">
          {isLoading ? (
            <div className="project-empty-box">جاري توليد الشرح...</div>
          ) : (
            <p>{content || "اختر نوع الشرح المطلوب."}</p>
          )}
        </div>
      </div>
    </section>
  );
}