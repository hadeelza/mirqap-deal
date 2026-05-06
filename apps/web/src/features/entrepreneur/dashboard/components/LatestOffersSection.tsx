import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import type { DashboardOfferCard } from "../pages/EntrepreneurDashboardPage";

type LatestOffersSectionProps = {
  offers: DashboardOfferCard[];
};

function formatDate(value: string) {
  if (!value) return "غير محدد";

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number | null) {
  if (value === null) return "غير محدد";

  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function mapOfferStatus(value: string) {
  if (value === "pending") return "قيد الانتظار";
  if (value === "accepted") return "مقبول";
  if (value === "rejected") return "مرفوض";
  if (value === "negotiating") return "تفاوض";
  if (value === "withdrawn") return "مسحوب";
  return value;
}

function mapOfferStatusClass(value: string) {
  if (value === "accepted") return "status-pill status-pill--success";
  if (value === "rejected") return "status-pill status-pill--danger";
  if (value === "negotiating") return "status-pill status-pill--warning";
  return "status-pill status-pill--neutral";
}

export default function LatestOffersSection({ offers }: LatestOffersSectionProps) {
  return (
    <div className="panel-section-card">
      <div className="panel-section-card__header">
        <div>
          <h3 className="panel-section-card__title">أحدث العروض</h3>
          <p className="panel-section-card__subtitle">العروض الاستثمارية الأخيرة على مشاريعك.</p>
        </div>

        <Link to={ROUTES.entrepreneur.offers} className="panel-section-card__link">
          عرض الكل
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="panel-empty-box">لا توجد عروض مستلمة حتى الآن.</div>
      ) : (
        <div className="entrepreneur-offers-list">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              to={`${ROUTES.entrepreneur.offers}/${offer.id}`}
              className="entrepreneur-offer-item"
            >
              <div className="entrepreneur-offer-item__top">
                <strong>{offer.projectTitle}</strong>
                <span className={mapOfferStatusClass(offer.status)}>
                  {mapOfferStatus(offer.status)}
                </span>
              </div>

              <div className="entrepreneur-offer-item__body">
                <span>المستثمر: {offer.investorName}</span>
                <span>القيمة: {formatMoney(offer.amount)}</span>
                <span>النسبة: {offer.equity !== null ? `${offer.equity}%` : "غير محددة"}</span>
              </div>

              <div className="entrepreneur-offer-item__date">
                {formatDate(offer.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}