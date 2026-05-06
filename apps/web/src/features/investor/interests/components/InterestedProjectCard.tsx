import { Link } from "react-router-dom";

export type InterestedProjectItem = {
  interestId: string;
  projectId: string;
  title: string;
  companyName: string;
  shortPitch: string;
  startupStage: string | null;
  confidenceLevel: string | null;
  investmentStatus: string | null;
  riskLevel: string | null;
  riskScore: number | null;
  aiSummary: string | null;
  interestedAt: string;
};

type InterestedProjectCardProps = {
  item: InterestedProjectItem;
  onRemove: (interestId: string) => void;
  removingId: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatRiskScore(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  const score = value <= 1 ? value * 100 : value;
  return `${score.toFixed(1)}%`;
}

function getRiskBadgeClass(riskLevel: string | null) {
  if (riskLevel === "low") {
    return "risk-badge risk-badge--low";
  }

  if (riskLevel === "medium") {
    return "risk-badge risk-badge--medium";
  }

  if (riskLevel === "high") {
    return "risk-badge risk-badge--high";
  }

  return "risk-badge";
}

function getRiskLabel(riskLevel: string | null) {
  if (riskLevel === "low") {
    return "منخفضة";
  }

  if (riskLevel === "medium") {
    return "متوسطة";
  }

  if (riskLevel === "high") {
    return "مرتفعة";
  }

  return "غير متوفر";
}

function getStageLabel(value: string | null) {
  if (value === "idea") {
    return "فكرة";
  }

  if (value === "mvp_seed") {
    return "MVP / Seed";
  }

  return value || "غير محدد";
}

function getConfidenceLabel(value: string | null) {
  if (!value) {
    return "غير محدد";
  }

  if (value === "concept") {
    return "مفهوم";
  }

  if (value === "prototype") {
    return "نموذج أولي";
  }

  if (value === "mvp") {
    return "MVP";
  }

  if (value === "early_market") {
    return "سوق مبكر";
  }

  return value;
}

function getInvestmentStatusLabel(value: string | null) {
  if (value === "open") {
    return "مفتوح";
  }

  if (value === "in_negotiation") {
    return "قيد التفاوض";
  }

  if (value === "funded") {
    return "ممول";
  }

  if (value === "closed") {
    return "مغلق";
  }

  return value || "غير محدد";
}

export default function InterestedProjectCard({
  item,
  onRemove,
  removingId,
}: InterestedProjectCardProps) {
  return (
    <article className="interest-card">
      <div className="interest-card__top">
        <div>
          <h3 className="interest-card__title">{item.title}</h3>
          <p className="interest-card__company">{item.companyName}</p>
        </div>

        <span className={getRiskBadgeClass(item.riskLevel)}>{getRiskLabel(item.riskLevel)}</span>
      </div>

      <p className="interest-card__pitch">{item.shortPitch || "لا يوجد وصف مختصر لهذا المشروع."}</p>

      <div className="interest-card__meta">
        <span>المرحلة: {getStageLabel(item.startupStage)}</span>
        <span>مستوى الجاهزية: {getConfidenceLabel(item.confidenceLevel)}</span>
        <span>حالة الاستثمار: {getInvestmentStatusLabel(item.investmentStatus)}</span>
        <span>درجة المخاطر: {formatRiskScore(item.riskScore)}</span>
        <span>تاريخ الاهتمام: {formatDate(item.interestedAt)}</span>
      </div>

      {item.aiSummary ? <p className="interest-card__summary">{item.aiSummary}</p> : null}

      <div className="interest-card__actions">
        <Link to={`/investor/explore/${item.projectId}`} className="btn btn--primary">
          عرض التفاصيل
        </Link>

        <Link to={`/investor/offers/submit/${item.projectId}`} className="btn btn--secondary">
          تقديم عرض
        </Link>

        <button
          type="button"
          className="btn btn--ghost-danger"
          disabled={removingId === item.interestId}
          onClick={() => onRemove(item.interestId)}
        >
          {removingId === item.interestId ? "جارٍ الحذف..." : "إزالة من الاهتمامات"}
        </button>
      </div>
    </article>
  );
}