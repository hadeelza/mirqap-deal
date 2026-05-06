import { Link } from "react-router-dom";

type StartupStage = "idea" | "mvp_seed" | null;
type ConfidenceLevel = "concept" | "prototype" | "mvp" | "early_market" | null;
type RiskLevel = "low" | "medium" | "high" | null;
type CustomerFocus = "b2b" | "b2c" | "b2g" | "marketplace" | "other" | null;
type InvestmentStatus = "open" | "in_negotiation" | "funded" | "closed" | null;
type FundingStage = "bootstrapped" | "friends_family" | "pre_seed" | "seed" | null;

export interface ExploreProjectCardData {
  projectId: string;
  title: string;
  companyName: string;
  shortPitch: string;
  categoryName: string;
  categoryId: string;
  startupStage: StartupStage;
  confidenceLevel: ConfidenceLevel;
  customerFocus: CustomerFocus;
  fundingStage: FundingStage;
  investmentStatus: InvestmentStatus;
  capitalSeekingSar: number | null;
  publishedAt: string | null;
  createdAt: string | null;
  technologyIds: string[];
  technologyNames: string[];
  riskLevel: RiskLevel;
  riskScore: number | null;
  aiSummary: string;
  isInterested: boolean;
  matchScore: number;
}

interface InvestorProjectCardProps {
  project: ExploreProjectCardData;
}

export default function InvestorProjectCard({ project }: InvestorProjectCardProps) {
  const summaryText =
    project.aiSummary.trim() || "وصف مختصر للمشروع متاح داخل الصفحة التفصيلية.";

  return (
    <article className="investor-project-card">
      <div className="investor-project-card__header">
        <div>
          <div className="investor-project-card__topline">
            <span className="investor-project-card__category">{project.categoryName}</span>
            {project.isInterested ? (
              <span className="investor-project-card__interest-flag">مهتم به</span>
            ) : null}
          </div>

          <h3 className="investor-project-card__title">{project.title}</h3>

          {project.companyName ? (
            <p className="investor-project-card__company">{project.companyName}</p>
          ) : null}
        </div>

        <div className="investor-project-card__score-box">
          <span>الملاءمة</span>
          <strong>{project.matchScore}</strong>
        </div>
      </div>

      <p className="investor-project-card__pitch">{project.shortPitch || "لا يوجد وصف مختصر متاح."}</p>

      <div className="investor-project-card__meta">
        <span>{getStartupStageLabel(project.startupStage)}</span>
        <span>{getConfidenceLabel(project.confidenceLevel)}</span>
        <span>{getInvestmentStatusLabel(project.investmentStatus)}</span>
        <span>{getCustomerFocusLabel(project.customerFocus)}</span>
        <span>{getFundingStageLabel(project.fundingStage)}</span>
      </div>

      <div className="investor-project-card__risk-row">
        <span className={getRiskBadgeClassName(project.riskLevel)}>
          {getRiskLabel(project.riskLevel)}
        </span>

        <span className="investor-project-card__risk-score">
          {project.riskScore !== null ? `Risk Score: ${project.riskScore.toFixed(2)}` : "Risk Score: —"}
        </span>
      </div>

      <div className="investor-project-card__ai-box">
        <span className="investor-project-card__ai-label">AI Summary</span>
        <p className="investor-project-card__ai-text">{summaryText}</p>
      </div>

      <div className="investor-project-card__technologies">
        {project.technologyNames.length > 0 ? (
          project.technologyNames.slice(0, 4).map((name: string) => (
            <span key={name} className="investor-project-card__tech-tag">
              {name}
            </span>
          ))
        ) : (
          <span className="investor-project-card__tech-tag investor-project-card__tech-tag--muted">
            بدون تقنيات محددة
          </span>
        )}
      </div>

      <div className="investor-project-card__footer">
        <div className="investor-project-card__amount">
          <span>رأس المال المطلوب</span>
          <strong>{formatCurrency(project.capitalSeekingSar)}</strong>
        </div>

        <div className="investor-project-card__actions">
          <Link to={`/investor/explore/${project.projectId}`} className="btn btn--secondary">
            عرض التفاصيل
          </Link>
          <Link to={`/investor/offers/submit/${project.projectId}`} className="btn btn--primary">
            تقديم عرض
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "غير محدد";
  }

  return new Intl.NumberFormat("ar-SA").format(value) + " ريال";
}

function getStartupStageLabel(value: StartupStage): string {
  if (value === "idea") return "Idea";
  if (value === "mvp_seed") return "MVP / Seed";
  return "مرحلة غير محددة";
}

function getConfidenceLabel(value: ConfidenceLevel): string {
  if (value === "concept") return "Concept";
  if (value === "prototype") return "Prototype";
  if (value === "mvp") return "MVP";
  if (value === "early_market") return "Early Market";
  return "Confidence غير محدد";
}

function getCustomerFocusLabel(value: CustomerFocus): string {
  if (value === "b2b") return "B2B";
  if (value === "b2c") return "B2C";
  if (value === "b2g") return "B2G";
  if (value === "marketplace") return "Marketplace";
  if (value === "other") return "Other";
  return "شريحة عميل غير محددة";
}

function getFundingStageLabel(value: FundingStage): string {
  if (value === "bootstrapped") return "Bootstrapped";
  if (value === "friends_family") return "Friends & Family";
  if (value === "pre_seed") return "Pre-Seed";
  if (value === "seed") return "Seed";
  return "تمويل غير محدد";
}

function getInvestmentStatusLabel(value: InvestmentStatus): string {
  if (value === "open") return "Open";
  if (value === "in_negotiation") return "In Negotiation";
  if (value === "funded") return "Funded";
  if (value === "closed") return "Closed";
  return "حالة غير محددة";
}

function getRiskLabel(value: RiskLevel): string {
  if (value === "low") return "Low Risk";
  if (value === "medium") return "Medium Risk";
  if (value === "high") return "High Risk";
  return "Risk غير متاح";
}

function getRiskBadgeClassName(value: RiskLevel): string {
  if (value === "low") return "investor-project-card__risk-badge investor-project-card__risk-badge--low";
  if (value === "medium") return "investor-project-card__risk-badge investor-project-card__risk-badge--medium";
  if (value === "high") return "investor-project-card__risk-badge investor-project-card__risk-badge--high";
  return "investor-project-card__risk-badge";
}