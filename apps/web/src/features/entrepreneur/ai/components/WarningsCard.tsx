type WarningsCardProps = {
    warnings: string[];
  };
  
  export default function WarningsCard({ warnings }: WarningsCardProps) {
    return (
      <section className="entrepreneur-ai-card entrepreneur-ai-card--warning">
        <div className="entrepreneur-ai-card__header">
          <h2>التنبيهات</h2>
        </div>
  
        {!warnings.length ? (
          <div className="entrepreneur-empty-mini">لا توجد تنبيهات إضافية.</div>
        ) : (
          <ul className="entrepreneur-ai-bullets">
            {warnings.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        )}
      </section>
    );
  }