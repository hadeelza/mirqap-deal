interface ProjectWarningsCardProps {
    warnings: string[];
    recommendations: string[];
    disclaimer: string;
  }
  
  export default function ProjectWarningsCard({
    warnings,
    recommendations,
    disclaimer,
  }: ProjectWarningsCardProps) {
    return (
      <section className="project-details-section">
        <div className="project-details-section__header">
          <h2>التحذيرات والتوصيات</h2>
        </div>
  
        <div className="project-warnings-grid">
          <div className="project-warnings-box">
            <h3>Warnings</h3>
            {warnings.length === 0 ? (
              <p>لا توجد تحذيرات حالياً.</p>
            ) : (
              <ul>
                {warnings.map((item: string, index: number) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
  
          <div className="project-warnings-box">
            <h3>Recommendations</h3>
            {recommendations.length === 0 ? (
              <p>لا توجد توصيات حالياً.</p>
            ) : (
              <ul>
                {recommendations.map((item: string, index: number) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
  
        {disclaimer ? (
          <div className="project-disclaimer-box">
            <h3>تنبيه</h3>
            <p>{disclaimer}</p>
          </div>
        ) : null}
      </section>
    );
  }