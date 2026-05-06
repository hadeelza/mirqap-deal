export type ProjectAIPreviewReason = {
    feature: string;
    feature_value: string | number | null;
    contribution_value: string | number | null;
    effect_direction: string | null;
    explanation: string | null;
  };
  
  export type ProjectAIPreview = {
    riskClass: string;
    riskScorePercentage: number;
    predictedRiskScore: number;
    confidenceLevel: string;
    advisorySummary: string;
    recommendations: string[];
    warnings: string[];
    probabilities: Record<string, number>;
    topReasons: ProjectAIPreviewReason[];
    modelVersion: string;
    rawPayload: Record<string, unknown>;
  };
  
  type ProjectAIPreviewCardProps = {
    preview: ProjectAIPreview | null;
    isLoading: boolean;
    errorMessage: string;
  };
  
  function formatProbability(value: number) {
    return `${(value * 100).toFixed(1)}%`;
  }
  
  export default function ProjectAIPreviewCard({
    preview,
    isLoading,
    errorMessage,
  }: ProjectAIPreviewCardProps) {
    if (isLoading) {
      return (
        <section className="project-create-section">
          <div className="project-create-section__header">
            <h3>المعاينة الذكية</h3>
            <p>جاري تحليل المشروع عبر المودل الحقيقي...</p>
          </div>
        </section>
      );
    }
  
    if (errorMessage) {
      return (
        <section className="project-create-section">
          <div className="project-create-section__header">
            <h3>المعاينة الذكية</h3>
            <p>تم حفظ المشروع، لكن تعذر جلب التقييم الذكي حالياً.</p>
          </div>
  
          <div className="project-create-error">{errorMessage}</div>
        </section>
      );
    }
  
    if (!preview) {
      return (
        <section className="project-create-section">
          <div className="project-create-section__header">
            <h3>المعاينة الذكية</h3>
            <p>سيظهر هنا ملخص الذكاء الاصطناعي بعد حفظ المشروع أو إرساله للمراجعة.</p>
          </div>
        </section>
      );
    }
  
    return (
      <section className="project-create-section">
        <div className="project-create-section__header">
          <h3>المعاينة الذكية</h3>
          <p>نتيجة أولية من المودل الحقيقي للمشروع الحالي.</p>
        </div>
  
        <div className="project-ai-preview-grid">
          <div className="project-ai-preview-stat">
            <span>تصنيف المخاطر</span>
            <strong>{preview.riskClass}</strong>
          </div>
  
          <div className="project-ai-preview-stat">
            <span>نسبة المخاطر</span>
            <strong>{preview.riskScorePercentage.toFixed(2)}%</strong>
          </div>
  
          <div className="project-ai-preview-stat">
            <span>السكور الفعلي</span>
            <strong>{preview.predictedRiskScore.toFixed(4)}</strong>
          </div>
  
          <div className="project-ai-preview-stat">
            <span>مستوى الثقة</span>
            <strong>{preview.confidenceLevel}</strong>
          </div>
        </div>
  
        <div className="project-ai-preview-block">
          <h4>الملخص</h4>
          <p>{preview.advisorySummary}</p>
        </div>
  
        <div className="project-ai-preview-block">
          <h4>الاحتمالات</h4>
          <div className="project-ai-preview-probabilities">
            {Object.entries(preview.probabilities).map(([key, value]) => (
              <div key={key} className="project-ai-preview-probability">
                <span>{key}</span>
                <strong>{formatProbability(value)}</strong>
              </div>
            ))}
          </div>
        </div>
  
        <div className="project-ai-preview-columns">
          <div className="project-ai-preview-block">
            <h4>أهم الأسباب</h4>
            {preview.topReasons.length > 0 ? (
              <div className="project-ai-preview-list">
                {preview.topReasons.map((reason, index) => (
                  <div key={`${reason.feature}-${index}`} className="project-ai-preview-list__item">
                    <strong>{reason.feature}</strong>
                    <p>{reason.explanation || "لا يوجد شرح إضافي."}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="project-create-empty">لا توجد أسباب متاحة حالياً.</div>
            )}
          </div>
  
          <div className="project-ai-preview-block">
            <h4>التوصيات</h4>
            {preview.recommendations.length > 0 ? (
              <div className="project-ai-preview-list">
                {preview.recommendations.map((item, index) => (
                  <div key={`${item}-${index}`} className="project-ai-preview-list__item">
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="project-create-empty">لا توجد توصيات حالياً.</div>
            )}
          </div>
        </div>
  
        <div className="project-ai-preview-block">
          <h4>التحذيرات</h4>
          {preview.warnings.length > 0 ? (
            <div className="project-ai-preview-list">
              {preview.warnings.map((item, index) => (
                <div key={`${item}-${index}`} className="project-ai-preview-list__item">
                  <p>{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="project-create-empty">لا توجد تحذيرات حالياً.</div>
          )}
        </div>
  
        <div className="project-ai-preview-footer">إصدار المودل: {preview.modelVersion}</div>
      </section>
    );
  }