type RecommendationsCardProps = {
    recommendations: string[];
  };
  
  export default function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
    return (
      <section className="entrepreneur-ai-card">
        <div className="entrepreneur-ai-card__header">
          <h2>التوصيات</h2>
        </div>
  
        {!recommendations.length ? (
          <div className="entrepreneur-empty-mini">لا توجد توصيات إضافية.</div>
        ) : (
          <ul className="entrepreneur-ai-bullets">
            {recommendations.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        )}
      </section>
    );
  }