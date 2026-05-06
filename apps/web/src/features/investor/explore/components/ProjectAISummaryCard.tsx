interface ProjectAISummaryCardProps {
    aiSummary: string;
    advisorySummary: string;
    modelVersion: string;
    generatedAt: string;
  }
  
  export default function ProjectAISummaryCard({
    aiSummary,
    advisorySummary,
    modelVersion,
    generatedAt,
  }: ProjectAISummaryCardProps) {
    return (
      <section className="project-ai-card">
        <div className="project-ai-card__header">
          <h2>AI Summary</h2>
          <div className="project-ai-card__meta">
            {modelVersion ? <span>{modelVersion}</span> : null}
            {generatedAt ? <span>{generatedAt}</span> : null}
          </div>
        </div>
  
        <div className="project-ai-card__body">
          <div className="project-ai-card__block">
            <h3>الملخص المختصر</h3>
            <p>{aiSummary || "لا يوجد ملخص AI محفوظ حالياً."}</p>
          </div>
  
          <div className="project-ai-card__block">
            <h3>الملخص الاستشاري</h3>
            <p>{advisorySummary || "لا يوجد ملخص استشاري متاح حالياً."}</p>
          </div>
        </div>
      </section>
    );
  }