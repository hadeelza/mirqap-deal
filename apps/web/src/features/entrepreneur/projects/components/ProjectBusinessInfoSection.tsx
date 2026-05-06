import type { EntrepreneurProjectDetailsData } from "./project-details.types";

type ProjectBusinessInfoSectionProps = {
  project: EntrepreneurProjectDetailsData;
};

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "غير محدد";
  }

  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "غير محدد";
  }

  return new Intl.NumberFormat("ar-SA").format(value);
}

function formatEnum(value: string | null) {
  if (!value) {
    return "غير محدد";
  }

  switch (value) {
    case "idea":
      return "فكرة";
    case "mvp_seed":
      return "بذرة / MVP";
    case "concept":
      return "مفهوم";
    case "prototype":
      return "نموذج أولي";
    case "mvp":
      return "MVP";
    case "early_market":
      return "سوق مبكر";
    case "b2b":
      return "B2B";
    case "b2c":
      return "B2C";
    case "b2g":
      return "B2G";
    case "marketplace":
      return "Marketplace";
    case "other":
      return "أخرى";
    case "low":
      return "منخفض";
    case "medium":
      return "متوسط";
    case "high":
      return "مرتفع";
    case "bootstrapped":
      return "تمويل ذاتي";
    case "friends_family":
      return "أصدقاء وعائلة";
    case "pre_seed":
      return "Pre-Seed";
    case "seed":
      return "Seed";
    default:
      return value;
  }
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="entrepreneur-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function ProjectBusinessInfoSection({
  project,
}: ProjectBusinessInfoSectionProps) {
  return (
    <section className="entrepreneur-detail-card">
      <div className="entrepreneur-section-heading">
        <h2>بيانات المشروع</h2>
      </div>

      <div className="entrepreneur-detail-grid">
        <DetailItem label="المرحلة" value={formatEnum(project.startupStage)} />
        <DetailItem label="مستوى الثقة" value={formatEnum(project.confidenceLevel)} />
        <DetailItem label="تركيز العملاء" value={formatEnum(project.customerFocus)} />
        <DetailItem label="حجم الفريق" value={formatNumber(project.teamSize)} />
        <DetailItem label="دافع المؤسس" value={formatEnum(project.founderMotivation)} />
        <DetailItem label="حجم السوق" value={project.marketSizeM !== null ? `${formatNumber(project.marketSizeM)} مليون` : "غير محدد"} />
        <DetailItem label="عدد المنافسين" value={formatNumber(project.competitorsCount)} />
        <DetailItem label="الإيراد الشهري" value={formatMoney(project.monthlyRevenueSar)} />
        <DetailItem label="رأس المال المطلوب" value={formatMoney(project.capitalSeekingSar)} />
        <DetailItem label="التقييم بعد الاستثمار" value={formatMoney(project.postMoneyValuationSar)} />
        <DetailItem label="مرحلة التمويل" value={formatEnum(project.fundingStage)} />
        <DetailItem
          label="التقنيات"
          value={project.technologies.length ? project.technologies.map((item) => item.label).join("، ") : "غير محدد"}
        />
      </div>

      <div className="entrepreneur-description-grid">
        <div className="entrepreneur-description-card">
          <h3>المشكلة</h3>
          <p>{project.problemDescription?.trim() || "لا يوجد وصف."}</p>
        </div>

        <div className="entrepreneur-description-card">
          <h3>الحل</h3>
          <p>{project.solutionDescription?.trim() || "لا يوجد وصف."}</p>
        </div>

        <div className="entrepreneur-description-card">
          <h3>التميّز</h3>
          <p>{project.differentiation?.trim() || "لا يوجد وصف."}</p>
        </div>

        <div className="entrepreneur-description-card">
          <h3>الـ Traction</h3>
          <p>{project.traction?.trim() || "لا يوجد وصف."}</p>
        </div>

        <div className="entrepreneur-description-card">
          <h3>المخاطر</h3>
          <p>{project.risks?.trim() || "لا يوجد وصف."}</p>
        </div>

        <div className="entrepreneur-description-card">
          <h3>استراتيجية الخروج</h3>
          <p>{project.exitStrategy?.trim() || "لا يوجد وصف."}</p>
        </div>
      </div>
    </section>
  );
}