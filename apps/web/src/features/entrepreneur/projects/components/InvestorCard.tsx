type MatchStatus = "match" | "neutral" | "no_match";

export type BrowseInvestorItem = {
  id: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  organizationName: string;
  investorType: string;
  bio: string;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  isDiscoverable: boolean;
  minTicketSar: number | null;
  maxTicketSar: number | null;
  matchScore: number;
  matchLabel: string;
  categoryFit: MatchStatus;
  stageFit: MatchStatus;
  riskFit: MatchStatus;
  technologyFit: MatchStatus;
  ticketFit: MatchStatus;
  overlapCount: number;
};

type InvestorCardProps = {
  investor: BrowseInvestorItem;
};

function formatInvestorType(value: string) {
  switch (value) {
    case "angel":
      return "مستثمر ملاك";
    case "individual":
      return "مستثمر فردي";
    case "institution":
      return "مؤسسة استثمارية";
    case "incubator":
      return "حاضنة";
    case "accelerator":
      return "مسرعة";
    default:
      return value;
  }
}

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

function fitLabel(status: MatchStatus) {
  switch (status) {
    case "match":
      return "مناسب";
    case "neutral":
      return "عام";
    case "no_match":
      return "غير مطابق";
    default:
      return "عام";
  }
}

function fitClassName(status: MatchStatus) {
  switch (status) {
    case "match":
      return "status-chip status-chip--success";
    case "neutral":
      return "status-chip status-chip--soft";
    case "no_match":
      return "status-chip status-chip--danger";
    default:
      return "status-chip status-chip--soft";
  }
}

export default function InvestorCard({ investor }: InvestorCardProps) {
  return (
    <article className="entrepreneur-investor-card">
      <div className="entrepreneur-investor-card__top">
        <div className="entrepreneur-investor-card__identity">
          <div className="entrepreneur-investor-card__avatar">
            {investor.avatarUrl ? (
              <img src={investor.avatarUrl} alt={investor.fullName} />
            ) : (
              <span>{investor.fullName.charAt(0)}</span>
            )}
          </div>

          <div>
            <h3>{investor.fullName}</h3>
            <p>{investor.organizationName}</p>
          </div>
        </div>

        <div className="entrepreneur-investor-card__match">
          <span className="entrepreneur-investor-card__score">{investor.matchScore}%</span>
          <small>{investor.matchLabel}</small>
        </div>
      </div>

      <div className="entrepreneur-investor-card__meta">
        <span className="status-chip status-chip--slate">{formatInvestorType(investor.investorType)}</span>
        <span className={investor.isDiscoverable ? "status-chip status-chip--success" : "status-chip status-chip--danger"}>
          {investor.isDiscoverable ? "قابل للاكتشاف" : "غير قابل للاكتشاف"}
        </span>
      </div>

      <p className="entrepreneur-investor-card__bio">
        {investor.bio || "لا توجد نبذة تعريفية لهذا المستثمر."}
      </p>

      <div className="entrepreneur-investor-card__tickets">
        <div>
          <span>أدنى تذكرة</span>
          <strong>{formatMoney(investor.minTicketSar)}</strong>
        </div>
        <div>
          <span>أعلى تذكرة</span>
          <strong>{formatMoney(investor.maxTicketSar)}</strong>
        </div>
      </div>

      <div className="entrepreneur-investor-card__fits">
        <span className={fitClassName(investor.categoryFit)}>التصنيف: {fitLabel(investor.categoryFit)}</span>
        <span className={fitClassName(investor.stageFit)}>المرحلة: {fitLabel(investor.stageFit)}</span>
        <span className={fitClassName(investor.riskFit)}>المخاطر: {fitLabel(investor.riskFit)}</span>
        <span className={fitClassName(investor.technologyFit)}>
          التقنية: {investor.technologyFit === "match" ? `تداخل ${investor.overlapCount}` : fitLabel(investor.technologyFit)}
        </span>
        <span className={fitClassName(investor.ticketFit)}>التذكرة: {fitLabel(investor.ticketFit)}</span>
      </div>

      <div className="entrepreneur-investor-card__links">
        {investor.websiteUrl ? (
          <a href={investor.websiteUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
            الموقع
          </a>
        ) : null}

        {investor.linkedinUrl ? (
          <a href={investor.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
            لينكدإن
          </a>
        ) : null}
      </div>
    </article>
  );
}