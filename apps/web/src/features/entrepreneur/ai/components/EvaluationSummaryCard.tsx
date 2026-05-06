type ProbabilityItem = {
    label: string;
    value: number;
  };
  
  type EvaluationSummaryCardProps = {
    riskClass: string;
    riskScorePercentage: number;
    predictedRiskScore: number;
    confidenceLevel: string;
    advisorySummary: string;
    probabilities: ProbabilityItem[];
  };
  
  function formatPercent(value: number) {
    return `${value.toFixed(2)}%`;
  }
  
  function formatScore(value: number) {
    return value.toFixed(4);
  }
  
  export default function EvaluationSummaryCard({
    riskClass,
    riskScorePercentage,
    predictedRiskScore,
    confidenceLevel,
    advisorySummary,
    probabilities,
  }: EvaluationSummaryCardProps) {
    return (
      <section className="entrepreneur-ai-card">
        <div className="entrepreneur-ai-card__header">
          <h2>ملخص التقييم</h2>
        </div>
  
        <div className="entrepreneur-ai-summary-grid">
          <div className="entrepreneur-ai-summary-item">
            <span>تصنيف المخاطر</span>
            <strong>{riskClass}</strong>
          </div>
  
          <div className="entrepreneur-ai-summary-item">
            <span>نسبة المخاطر</span>
            <strong>{formatPercent(riskScorePercentage)}</strong>
          </div>
  
          <div className="entrepreneur-ai-summary-item">
            <span>السكور المتوقع</span>
            <strong>{formatScore(predictedRiskScore)}</strong>
          </div>
  
          <div className="entrepreneur-ai-summary-item">
            <span>مستوى الثقة</span>
            <strong>{confidenceLevel}</strong>
          </div>
        </div>
  
        <div className="entrepreneur-ai-text-card">
          <h3>الملخص الاستشاري</h3>
          <p>{advisorySummary}</p>
        </div>
  
        <div className="entrepreneur-ai-probabilities">
          {probabilities.map((item) => (
            <div key={item.label} className="entrepreneur-ai-probability-item">
              <div className="entrepreneur-ai-probability-item__top">
                <span>{item.label}</span>
                <strong>{formatPercent(item.value * 100)}</strong>
              </div>
              <div className="entrepreneur-ai-probability-item__bar">
                <span style={{ width: `${Math.max(item.value * 100, 4)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }