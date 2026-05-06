import { Link } from "react-router-dom";

export type DealDetailsViewModel = {
  dealId: string;
  projectId: string;
  offerId: string;
  status: string;
  contactSharedAt: string | null;
  closedAt: string | null;
  closeNote: string | null;
  createdAt: string;
  updatedAt: string;
  projectTitle: string;
  companyName: string;
  entrepreneurName: string;
  entrepreneurEmail: string | null;
  entrepreneurPhone: string | null;
  offerAmountSar: number | null;
  equityPercentage: number | null;
  offerStatus: string;
  offerCreatedAt: string;
  offerRespondedAt: string | null;
};

type DealInfoCardProps = {
  data: DealDetailsViewModel;
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function getOfferStatusLabel(value: string) {
  if (value === "pending") {
    return "قيد الانتظار";
  }

  if (value === "accepted") {
    return "مقبول";
  }

  if (value === "rejected") {
    return "مرفوض";
  }

  if (value === "negotiating") {
    return "تفاوض";
  }

  if (value === "withdrawn") {
    return "مسحوب";
  }

  return value;
}

export default function DealInfoCard({ data }: DealInfoCardProps) {
  return (
    <div className="deal-details-card">
      <div className="deal-details-card__head">
        <div>
          <h1 className="deal-details-card__title">تفاصيل الصفقة</h1>
          <p className="deal-details-card__subtitle">
            {data.projectTitle} — {data.companyName}
          </p>
        </div>

        <span className={getDealStatusClass(data.status)}>{getDealStatusLabel(data.status)}</span>
      </div>

      <div className="deal-details-card__grid">
        <div className="deal-details-panel">
          <h3>بيانات الصفقة</h3>
          <div className="deal-details-panel__list">
            <div>
              <span>الحالة</span>
              <strong>{getDealStatusLabel(data.status)}</strong>
            </div>
            <div>
              <span>تاريخ إنشاء الصفقة</span>
              <strong>{formatDate(data.createdAt)}</strong>
            </div>
            <div>
              <span>آخر تحديث</span>
              <strong>{formatDate(data.updatedAt)}</strong>
            </div>
            <div>
              <span>تاريخ تبادل التواصل</span>
              <strong>{formatDate(data.contactSharedAt)}</strong>
            </div>
            <div>
              <span>تاريخ الإغلاق</span>
              <strong>{formatDate(data.closedAt)}</strong>
            </div>
          </div>
        </div>

        <div className="deal-details-panel">
          <h3>المشروع المرتبط</h3>
          <div className="deal-details-panel__list">
            <div>
              <span>اسم المشروع</span>
              <strong>{data.projectTitle}</strong>
            </div>
            <div>
              <span>اسم الجهة</span>
              <strong>{data.companyName}</strong>
            </div>
          </div>
        </div>

        <div className="deal-details-panel">
          <h3>العرض المرتبط</h3>
          <div className="deal-details-panel__list">
            <div>
              <span>قيمة العرض</span>
              <strong>{formatMoney(data.offerAmountSar)}</strong>
            </div>
            <div>
              <span>نسبة الملكية</span>
              <strong>{data.equityPercentage !== null ? `${data.equityPercentage}%` : "—"}</strong>
            </div>
            <div>
              <span>حالة العرض</span>
              <strong>{getOfferStatusLabel(data.offerStatus)}</strong>
            </div>
            <div>
              <span>تاريخ إرسال العرض</span>
              <strong>{formatDate(data.offerCreatedAt)}</strong>
            </div>
            <div>
              <span>تاريخ الرد على العرض</span>
              <strong>{formatDate(data.offerRespondedAt)}</strong>
            </div>
          </div>
        </div>

        <div className="deal-details-panel">
          <h3>رائد الأعمال</h3>
          <div className="deal-details-panel__list">
            <div>
              <span>الاسم</span>
              <strong>{data.entrepreneurName}</strong>
            </div>
            <div>
              <span>البريد الإلكتروني</span>
              <strong>{data.entrepreneurEmail || "—"}</strong>
            </div>
            <div>
              <span>رقم الجوال</span>
              <strong>{data.entrepreneurPhone || "—"}</strong>
            </div>
          </div>
        </div>
      </div>

      {data.closeNote ? (
        <div className="deal-details-block">
          <h3>ملاحظة الإغلاق</h3>
          <p>{data.closeNote}</p>
        </div>
      ) : null}

      <div className="deal-details-card__actions">
        <Link to="/investor/deals" className="btn btn--secondary">
          العودة إلى الصفقات
        </Link>

        <Link to={`/investor/offers/${data.offerId}`} className="btn btn--primary">
          عرض تفاصيل العرض
        </Link>

        <Link to="/investor/chats" className="btn btn--ghost">
          الانتقال إلى المحادثات
        </Link>
      </div>
    </div>
  );
}