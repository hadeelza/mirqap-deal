type TopFactor = {
    feature: string;
    explanation: string;
    contributionValue: number | null;
    effectDirection: string | null;
  };
  
  type TopFactorsCardProps = {
    factors: TopFactor[];
  };
  
  function formatDirection(value: string | null) {
    switch (value) {
      case "increases_prediction":
        return "يرفع مستوى المخاطر";
      case "decreases_prediction":
        return "يخفض مستوى المخاطر";
      default:
        return "تأثير مباشر";
    }
  }
  
  export default function TopFactorsCard({ factors }: TopFactorsCardProps) {
    return (
      <section className="entrepreneur-ai-card">
        <div className="entrepreneur-ai-card__header">
          <h2>أكثر العوامل تأثيرًا</h2>
        </div>
  
        {!factors.length ? (
          <div className="entrepreneur-empty-mini">لا توجد عوامل محفوظة.</div>
        ) : (
          <div className="entrepreneur-ai-factors-list">
            {factors.map((factor, index) => (
              <article key={`${factor.feature}-${index}`} className="entrepreneur-ai-factor-item">
                <div className="entrepreneur-ai-factor-item__top">
                  <h3>{factor.feature}</h3>
                  <span>{formatDirection(factor.effectDirection)}</span>
                </div>
  
                <p>{factor.explanation}</p>
  
                {factor.contributionValue !== null ? (
                  <small>قيمة التأثير: {factor.contributionValue.toFixed(6)}</small>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }