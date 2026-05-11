import { Link } from "react-router-dom";

export type ReceivedOfferItem = {
  id: string;
  projectId: string;
  projectTitle: string;
  investorName: string;
  amount: number | null;
  equity: number | null;
  status: string;
  createdAt: string;
};

type ReceivedOffersTableProps = {
  offers: ReceivedOfferItem[];
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatStatus(value: string) {
  switch (value) {
    case "pending":
      return "بانتظار الرد";
    case "accepted":
      return "مقبول";
    case "rejected":
      return "مرفوض";
    case "negotiating":
      return "تفاوض";
    case "withdrawn":
      return "مسحوب";
    default:
      return value;
  }
}

function statusClass(value: string) {
  switch (value) {
    case "accepted":
      return "status-chip status-chip--success";
    case "rejected":
      return "status-chip status-chip--danger";
    case "negotiating":
      return "status-chip status-chip--gold";
    case "withdrawn":
      return "status-chip status-chip--slate";
    default:
      return "status-chip status-chip--soft";
  }
}

export default function ReceivedOffersTable({ offers }: ReceivedOffersTableProps) {
  if (!offers.length) {
    return (
      <div className="entrepreneur-empty-state">
        <h3>لا توجد عروض مطابقة</h3>
        <p>جرّب تغيير البحث أو الفلتر أو افتح مشروعًا آخر.</p>
      </div>
    );
  }

  return (
    <div className="entrepreneur-offers-grid">
      {offers.map((offer) => (
        <article key={offer.id} className="entrepreneur-offer-card">
          <div className="entrepreneur-offer-card__top">
            <div>
              <h3>{offer.projectTitle}</h3>
              <p>{offer.investorName}</p>
            </div>

            <span className={statusClass(offer.status)}>{formatStatus(offer.status)}</span>
          </div>

          <div className="entrepreneur-offer-card__metrics">
            <div>
              <span>قيمة العرض</span>
              <strong>{formatMoney(offer.amount)}</strong>
            </div>

            <div>
              <span>نسبة الحصة</span>
              <strong>{offer.equity !== null ? `${offer.equity}%` : "غير محدد"}</strong>
            </div>

            <div>
              <span>تاريخ العرض</span>
              <strong>{formatDate(offer.createdAt)}</strong>
            </div>
          </div>

          <div className="entrepreneur-offer-card__actions">
            <Link to={`/entrepreneur/offers/${offer.id}`} className="btn btn--primary">
              مراجعة العرض
            </Link>

            <Link to={`/entrepreneur/projects/${offer.projectId}`} className="btn btn--ghost">
              فتح المشروع
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}