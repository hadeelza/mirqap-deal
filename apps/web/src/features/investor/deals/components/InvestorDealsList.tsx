import { Link } from "react-router-dom";

export type InvestorDealListItem = {
  id: string;
  projectId: string;
  offerId: string;
  projectTitle: string;
  companyName: string;
  entrepreneurName: string;
  status: string;
  contactSharedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  offerAmountSar: number | null;
  equityPercentage: number | null;
};

type InvestorDealsListProps = {
  items: InvestorDealListItem[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDealStatusLabel(value: string) {
  if (value === "open") {
    return "مفتوحة";
  }

  if (value === "in_progress") {
    return "قيد المتابعة";
  }

  if (value === "contact_shared") {
    return "تم تبادل التواصل";
  }

  if (value === "closed") {
    return "مغلقة";
  }

  if (value === "cancelled") {
    return "ملغاة";
  }

  return value;
}

function getDealStatusClass(value: string) {
  if (value === "closed") {
    return "status-pill status-pill--success";
  }

  if (value === "cancelled") {
    return "status-pill status-pill--danger";
  }

  if (value === "contact_shared") {
    return "status-pill status-pill--info";
  }

  if (value === "in_progress") {
    return "status-pill status-pill--warning";
  }

  return "status-pill";
}

export default function InvestorDealsList({ items }: InvestorDealsListProps) {
  return (
    <div className="deals-list">
      {items.map((item) => (
        <article key={item.id} className="deal-card">
          <div className="deal-card__top">
            <div>
              <h3 className="deal-card__title">{item.projectTitle}</h3>
              <p className="deal-card__company">{item.companyName}</p>
            </div>

            <span className={getDealStatusClass(item.status)}>{getDealStatusLabel(item.status)}</span>
          </div>

          <div className="deal-card__grid">
            <div className="deal-card__meta">
              <span>رائد الأعمال</span>
              <strong>{item.entrepreneurName}</strong>
            </div>

            <div className="deal-card__meta">
              <span>قيمة العرض</span>
              <strong>{formatMoney(item.offerAmountSar)}</strong>
            </div>

            <div className="deal-card__meta">
              <span>نسبة الملكية</span>
              <strong>{item.equityPercentage !== null ? `${item.equityPercentage}%` : "—"}</strong>
            </div>

            <div className="deal-card__meta">
              <span>تاريخ إنشاء الصفقة</span>
              <strong>{formatDate(item.createdAt)}</strong>
            </div>

            <div className="deal-card__meta">
              <span>تاريخ تبادل التواصل</span>
              <strong>{formatDate(item.contactSharedAt)}</strong>
            </div>

            <div className="deal-card__meta">
              <span>تاريخ الإغلاق</span>
              <strong>{formatDate(item.closedAt)}</strong>
            </div>
          </div>

          <div className="deal-card__actions">
            <Link to={`/investor/deals/${item.id}`} className="btn btn--primary">
              تفاصيل الصفقة
            </Link>

            <Link to={`/investor/offers/${item.offerId}`} className="btn btn--secondary">
              تفاصيل العرض
            </Link>

            <Link to={`/investor/explore/${item.projectId}`} className="btn btn--ghost">
              عرض المشروع
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}