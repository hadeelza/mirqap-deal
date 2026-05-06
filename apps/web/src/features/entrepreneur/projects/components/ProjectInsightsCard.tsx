import type { ProjectEvaluationView } from "./project-details.types";

type ProjectInsightsCardProps = {
  evaluation: ProjectEvaluationView | null;
};

function formatRiskLevel(value: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  switch (value) {
    case "low":
      return "منخفضة";
    case "medium":
      return "متوسطة";
    case "high":
      return "مرتفعة";
    default:
      return value;
  }
}

function formatScore(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatDirection(value: string | null) {
  switch (value) {
    case "increases_prediction":
      return "يرفع التقييم";
    case "decreases_prediction":
      return "يخفف التقييم";
    default:
      return "تأثير مباشر";
  }
}

export default function ProjectInsightsCard({ evaluation }: ProjectInsightsCardProps) {
  if (!evaluation) {
    return (
      <section className="entrepreneur-detail-card">
        <div className="entrepreneur-section-heading">
          <h2>تحليل الذكاء الاصطناعي</h2>
        </div>
        <div className="entrepreneur-empty-mini">لا يوجد تقييم محفوظ لهذا المشروع حتى الآن.</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-detail-card">
      <div className="entrepreneur-section-heading">
        <h2>تحليل الذكاء الاصطناعي</h2>
      </div>

      <div className="entrepreneur-ai-stats">
        <div className="entrepreneur-ai-stat">
          <span>مستوى المخاطر</span>
          <strong>{formatRiskLevel(evaluation.riskLevel)}</strong>
        </div>

        <div className="entrepreneur-ai-stat">
          <span>درجة المخاطر</span>
          <strong>{formatScore(evaluation.riskScore)}</strong>
        </div>

        <div className="entrepreneur-ai-stat">
          <span>مستوى الثقة</span>
          <strong>{evaluation.confidenceLevel || "غير متوفر"}</strong>
        </div>
      </div>

      <div className="entrepreneur-description-card entrepreneur-description-card--full">
        <h3>ملخص AI</h3>
        <p>{evaluation.aiSummary?.trim() || "لا يوجد ملخص متاح."}</p>
      </div>

      {evaluation.probabilities.length ? (
        <div className="entrepreneur-probabilities">
          {evaluation.probabilities.map((item) => (
            <div key={item.label} className="entrepreneur-probability-item">
              <div className="entrepreneur-probability-item__top">
                <span>{item.label}</span>
                <strong>{(item.value * 100).toFixed(2)}%</strong>
              </div>
              <div className="entrepreneur-probability-bar">
                <span style={{ width: `${Math.max(item.value * 100, 4)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {evaluation.topReasons.length ? (
        <div className="entrepreneur-reasons-list">
          {evaluation.topReasons.map((reason, index) => (
            <article key={`${reason.feature}-${index}`} className="entrepreneur-reason-card">
              <div className="entrepreneur-reason-card__top">
                <h3>{reason.feature}</h3>
                <span>{formatDirection(reason.effectDirection)}</span>
              </div>
              <p>{reason.explanation}</p>
            </article>
          ))}
        </div>
      ) : null}

      {evaluation.recommendations.length ? (
        <div className="entrepreneur-description-card entrepreneur-description-card--full">
          <h3>التوصيات</h3>
          <ul className="entrepreneur-bullets">
            {evaluation.recommendations.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {evaluation.warnings.length ? (
        <div className="entrepreneur-description-card entrepreneur-description-card--full entrepreneur-warning-card">
          <h3>التنبيهات</h3>
          <ul className="entrepreneur-bullets">
            {evaluation.warnings.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}