export type OfferProjectSummary = {
    id: string;
    title: string;
    companyName: string | null;
    shortPitch: string | null;
    categoryName: string;
    startupStage: string | null;
    fundingStage: string | null;
    investmentStatus: string | null;
    capitalSeekingSar: number | null;
    postMoneyValuationSar: number | null;
  };
  
  type OfferProjectSummaryCardProps = {
    project: OfferProjectSummary;
  };
  
  function formatMoney(value: number | null): string {
    if (value === null || Number.isNaN(value)) {
      return "غير محدد";
    }
  
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  function mapLabel(value: string | null): string {
    if (!value) {
      return "غير محدد";
    }
  
    const labels: Record<string, string> = {
      idea: "فكرة",
      mvp_seed: "MVP / Seed",
      bootstrapped: "تمويل ذاتي",
      friends_family: "الأصدقاء والعائلة",
      pre_seed: "Pre-Seed",
      seed: "Seed",
      open: "مفتوح",
      in_negotiation: "قيد التفاوض",
      funded: "ممول",
      closed: "مغلق",
    };
  
    return labels[value] || value;
  }
  
  export default function OfferProjectSummaryCard({
    project,
  }: OfferProjectSummaryCardProps) {
    return (
      <aside className="offer-project-summary-card">
        <div className="offer-project-summary-card__header">
          <span className="offer-project-summary-card__eyebrow">ملخص المشروع</span>
          <h2>{project.title}</h2>
          <p>{project.companyName || "بدون اسم جهة محدد"}</p>
        </div>
  
        <div className="offer-project-summary-card__content">
          <div className="offer-project-summary-card__item">
            <span>التصنيف</span>
            <strong>{project.categoryName}</strong>
          </div>
  
          <div className="offer-project-summary-card__item">
            <span>مرحلة المشروع</span>
            <strong>{mapLabel(project.startupStage)}</strong>
          </div>
  
          <div className="offer-project-summary-card__item">
            <span>مرحلة التمويل</span>
            <strong>{mapLabel(project.fundingStage)}</strong>
          </div>
  
          <div className="offer-project-summary-card__item">
            <span>الحالة الاستثمارية</span>
            <strong>{mapLabel(project.investmentStatus)}</strong>
          </div>
  
          <div className="offer-project-summary-card__item">
            <span>التمويل المطلوب</span>
            <strong>{formatMoney(project.capitalSeekingSar)}</strong>
          </div>
  
          <div className="offer-project-summary-card__item">
            <span>التقييم بعد الاستثمار</span>
            <strong>{formatMoney(project.postMoneyValuationSar)}</strong>
          </div>
        </div>
  
        <div className="offer-project-summary-card__pitch">
          <h3>الملخص</h3>
          <p>{project.shortPitch || "لا يوجد ملخص مختصر متاح لهذا المشروع حالياً."}</p>
        </div>
      </aside>
    );
  }