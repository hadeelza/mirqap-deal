import type { ProjectOfferPreview } from "./project-details.types";

type ProjectOffersPreviewSectionProps = {
  offers: ProjectOfferPreview[];
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

export default function ProjectOffersPreviewSection({
  offers,
}: ProjectOffersPreviewSectionProps) {
  return (
    <section className="entrepreneur-detail-card">
      <div className="entrepreneur-section-heading">
        <h2>أحدث العروض المستلمة</h2>
      </div>

      {!offers.length ? (
        <div className="entrepreneur-empty-mini">لا توجد عروض مستلمة لهذا المشروع حتى الآن.</div>
      ) : (
        <div className="entrepreneur-offers-preview">
          {offers.map((offer) => (
            <article key={offer.id} className="entrepreneur-offer-preview-card">
              <div>
                <h3>{offer.investorName}</h3>
                <p>
                  {formatMoney(offer.offerAmountSar)} • {offer.equityPercentage ?? "—"}%
                </p>
              </div>

              <div className="entrepreneur-offer-preview-card__meta">
                <span className="status-chip status-chip--soft">{formatStatus(offer.status)}</span>
                <span>{formatDate(offer.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}