type ReasonItem = {
    feature: string;
    explanation: string;
    contributionValue: number | null;
    effectDirection: string | null;
  };
  
  type SimulationReasonsDiffCardProps = {
    beforeReasons: ReasonItem[];
    afterReasons: ReasonItem[];
  };
  
  export default function SimulationReasonsDiffCard({
    beforeReasons,
    afterReasons,
  }: SimulationReasonsDiffCardProps) {
    return (
      <section className="entrepreneur-ai-card">
        <div className="entrepreneur-ai-card__header">
          <h2>الفروقات في الأسباب</h2>
        </div>
  
        <div className="entrepreneur-simulation-reasons-grid">
          <div className="entrepreneur-simulation-reasons-column">
            <h3>قبل التعديل</h3>
  
            {!beforeReasons.length ? (
              <div className="entrepreneur-empty-mini">لا توجد أسباب محفوظة.</div>
            ) : (
              beforeReasons.map((item, index) => (
                <article
                  key={`${item.feature}-${index}-before`}
                  className="entrepreneur-ai-factor-item"
                >
                  <div className="entrepreneur-ai-factor-item__top">
                    <h3>{item.feature}</h3>
                  </div>
                  <p>{item.explanation}</p>
                </article>
              ))
            )}
          </div>
  
          <div className="entrepreneur-simulation-reasons-column">
            <h3>بعد التعديل</h3>
  
            {!afterReasons.length ? (
              <div className="entrepreneur-empty-mini">لا توجد أسباب محفوظة.</div>
            ) : (
              afterReasons.map((item, index) => (
                <article
                  key={`${item.feature}-${index}-after`}
                  className="entrepreneur-ai-factor-item"
                >
                  <div className="entrepreneur-ai-factor-item__top">
                    <h3>{item.feature}</h3>
                  </div>
                  <p>{item.explanation}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    );
  }