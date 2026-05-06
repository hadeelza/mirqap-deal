interface ProjectRiskCardProps {
    riskClass: string;
    riskScorePercentage: number | null;
    predictedRiskScore: number | null;
    confidenceLevel: string;
    riskScoreNote: string;
    probabilities: Array<{ label: string; value: number }>;
  }
  
  export default function ProjectRiskCard({
    riskClass,
    riskScorePercentage,
    predictedRiskScore,
    confidenceLevel,
    riskScoreNote,
    probabilities,
  }: ProjectRiskCardProps) {
    return (
      <section className="project-risk-card">
        <div className="project-risk-card__header">
          <h2>تحليل المخاطر</h2>
          <span className={`project-risk-badge ${getRiskClassName(riskClass)}`}>
            {riskClass || "غير متوفر"}
          </span>
        </div>
  
        <div className="project-risk-grid">
          <div className="project-risk-metric">
            <span>Risk Score %</span>
            <strong>
              {riskScorePercentage !== null ? `${riskScorePercentage.toFixed(2)}%` : "—"}
            </strong>
          </div>
  
          <div className="project-risk-metric">
            <span>Predicted Score</span>
            <strong>
              {predictedRiskScore !== null ? predictedRiskScore.toFixed(4) : "—"}
            </strong>
          </div>
  
          <div className="project-risk-metric">
            <span>AI Confidence</span>
            <strong>{confidenceLevel || "غير متوفر"}</strong>
          </div>
        </div>
  
        {riskScoreNote ? (
          <div className="project-risk-note">
            <p>{riskScoreNote}</p>
          </div>
        ) : null}
  
        <div className="project-probabilities">
          <h3>الاحتمالات</h3>
  
          {probabilities.length === 0 ? (
            <div className="project-empty-box">لا توجد احتمالات متاحة.</div>
          ) : (
            <div className="project-probabilities__list">
              {probabilities.map((item) => (
                <div key={item.label} className="project-probability-item">
                  <div className="project-probability-item__top">
                    <span>{item.label}</span>
                    <strong>{(item.value * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="project-probability-item__bar">
                    <div
                      className="project-probability-item__fill"
                      style={{ width: `${Math.max(0, Math.min(100, item.value * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }
  
  function getRiskClassName(value: string): string {
    if (value.includes("منخفض")) {
      return "project-risk-badge--low";
    }
  
    if (value.includes("متوسط")) {
      return "project-risk-badge--medium";
    }
  
    if (value.includes("مرتفع")) {
      return "project-risk-badge--high";
    }
  
    return "";
  }