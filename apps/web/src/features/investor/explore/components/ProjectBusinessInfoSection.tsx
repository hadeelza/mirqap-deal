interface ProjectBusinessInfoSectionProps {
    problemDescription: string;
    solutionDescription: string;
    differentiation: string;
    traction: string;
    risks: string;
    exitStrategy: string;
    customerFocus: string;
    founderMotivation: string;
    fundingStage: string;
    teamSize: number | null;
    marketSizeM: number | null;
    competitorsCount: number | null;
    monthlyRevenueSar: number | null;
    postMoneyValuationSar: number | null;
    technologies: string[];
  }
  
  export default function ProjectBusinessInfoSection({
    problemDescription,
    solutionDescription,
    differentiation,
    traction,
    risks,
    exitStrategy,
    customerFocus,
    founderMotivation,
    fundingStage,
    teamSize,
    marketSizeM,
    competitorsCount,
    monthlyRevenueSar,
    postMoneyValuationSar,
    technologies,
  }: ProjectBusinessInfoSectionProps) {
    return (
      <section className="project-details-section">
        <div className="project-details-section__header">
          <h2>معلومات المشروع</h2>
        </div>
  
        <div className="project-business-grid">
          <div className="project-business-card">
            <h3>وصف المشكلة</h3>
            <p>{problemDescription || "غير متوفر"}</p>
          </div>
  
          <div className="project-business-card">
            <h3>الحل المقترح</h3>
            <p>{solutionDescription || "غير متوفر"}</p>
          </div>
  
          <div className="project-business-card">
            <h3>التميّز التنافسي</h3>
            <p>{differentiation || "غير متوفر"}</p>
          </div>
  
          <div className="project-business-card">
            <h3>التحقق والجرّ</h3>
            <p>{traction || "غير متوفر"}</p>
          </div>
  
          <div className="project-business-card">
            <h3>المخاطر المذكورة</h3>
            <p>{risks || "غير متوفر"}</p>
          </div>
  
          <div className="project-business-card">
            <h3>استراتيجية الخروج</h3>
            <p>{exitStrategy || "غير متوفر"}</p>
          </div>
        </div>
  
        <div className="project-metrics-grid">
          <div className="project-metric-box">
            <span>نوع العملاء</span>
            <strong>{customerFocus}</strong>
          </div>
  
          <div className="project-metric-box">
            <span>دافع المؤسس</span>
            <strong>{founderMotivation}</strong>
          </div>
  
          <div className="project-metric-box">
            <span>مرحلة التمويل</span>
            <strong>{fundingStage}</strong>
          </div>
  
          <div className="project-metric-box">
            <span>حجم الفريق</span>
            <strong>{teamSize ?? "—"}</strong>
          </div>
  
          <div className="project-metric-box">
            <span>حجم السوق بالمليون</span>
            <strong>{marketSizeM ?? "—"}</strong>
          </div>
  
          <div className="project-metric-box">
            <span>عدد المنافسين</span>
            <strong>{competitorsCount ?? "—"}</strong>
          </div>
  
          <div className="project-metric-box">
            <span>الإيراد الشهري</span>
            <strong>
              {monthlyRevenueSar !== null
                ? `${new Intl.NumberFormat("ar-SA").format(monthlyRevenueSar)} ريال`
                : "—"}
            </strong>
          </div>
  
          <div className="project-metric-box">
            <span>التقييم بعد الاستثمار</span>
            <strong>
              {postMoneyValuationSar !== null
                ? `${new Intl.NumberFormat("ar-SA").format(postMoneyValuationSar)} ريال`
                : "—"}
            </strong>
          </div>
        </div>
  
        <div className="project-tech-section">
          <h3>التقنيات المستخدمة</h3>
          <div className="project-tech-tags">
            {technologies.length > 0 ? (
              technologies.map((item: string) => (
                <span key={item} className="project-tech-tag">
                  {item}
                </span>
              ))
            ) : (
              <span className="project-tech-tag project-tech-tag--muted">
                لا توجد تقنيات محددة
              </span>
            )}
          </div>
        </div>
      </section>
    );
  }