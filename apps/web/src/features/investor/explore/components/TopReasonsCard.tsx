interface TopReasonItem {
    feature: string;
    featureValue: string;
    contributionValue: string;
    effectDirection: string;
    explanation: string;
  }
  
  interface TopReasonsCardProps {
    reasons: TopReasonItem[];
  }
  
  export default function TopReasonsCard({ reasons }: TopReasonsCardProps) {
    return (
      <section className="project-details-section">
        <div className="project-details-section__header">
          <h2>أهم الأسباب المؤثرة</h2>
        </div>
  
        {reasons.length === 0 ? (
          <div className="project-empty-box">لا توجد أسباب تفسيرية متاحة حالياً.</div>
        ) : (
          <div className="project-reasons-list">
            {reasons.map((item: TopReasonItem, index: number) => (
              <div key={`${item.feature}-${index}`} className="project-reason-card">
                <div className="project-reason-card__head">
                  <h3>{item.feature}</h3>
                  <span>{item.effectDirection}</span>
                </div>
  
                <div className="project-reason-card__meta">
                  <span>القيمة: {item.featureValue}</span>
                  <span>التأثير: {item.contributionValue}</span>
                </div>
  
                <p>{item.explanation || "لا يوجد شرح إضافي."}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }