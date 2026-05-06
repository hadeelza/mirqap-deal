type ReasonItem = {
    feature: string;
    explanation: string;
    contributionValue: number | null;
    effectDirection: string | null;
  };
  
  type CompareState = {
    riskClass: string;
    riskScorePercentage: number;
    topReasons: ReasonItem[];
  };
  
  type SimulationCompareCardProps = {
    before: CompareState;
    after: CompareState;
    summary: string;
    advisorySummary: string;
    deltaScore: number;
  };
  
  function formatPercent(value: number) {
    return `${value.toFixed(2)}%`;
  }
  
  export default function SimulationCompareCard({
    before,
    after,
    summary,
    advisorySummary,
    deltaScore,
  }: SimulationCompareCardProps) {
    return (
      <section className="entrepreneur-ai-card">
        <div className="entrepreneur-ai-card__header">
          <h2>نتيجة المقارنة</h2>
        </div>
  
        <div className="entrepreneur-simulation-compare-grid">
          <div className="entrepreneur-simulation-compare-box">
            <span>قبل التعديل</span>
            <strong>{before.riskClass}</strong>
            <p>{formatPercent(before.riskScorePercentage)}</p>
          </div>
  
          <div className="entrepreneur-simulation-compare-box entrepreneur-simulation-compare-box--highlight">
            <span>فرق السكور</span>
            <strong>{deltaScore.toFixed(4)}</strong>
            <p>قيمة الفرق بين قبل وبعد</p>
          </div>
  
          <div className="entrepreneur-simulation-compare-box">
            <span>بعد التعديل</span>
            <strong>{after.riskClass}</strong>
            <p>{formatPercent(after.riskScorePercentage)}</p>
          </div>
        </div>
  
        <div className="entrepreneur-ai-text-card">
          <h3>الملخص</h3>
          <p>{summary}</p>
        </div>
  
        <div className="entrepreneur-ai-text-card">
          <h3>الملخص الاستشاري</h3>
          <p>{advisorySummary}</p>
        </div>
      </section>
    );
  }