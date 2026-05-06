import { Link } from "react-router-dom";

export type OfferDetailsViewModel = {
  offerId: string;
  projectId: string;
  projectTitle: string;
  companyName: string;
  entrepreneurName: string;
  entrepreneurEmail: string | null;
  entrepreneurPhone: string | null;
  offerAmountSar: number | null;
  equityPercentage: number | null;
  expectedReturns: string | null;
  specialConditions: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  startupStage: string | null;
  confidenceLevel: string | null;
  investmentStatus: string | null;
  deal: {
    id: string;
    status: string;
    contactSharedAt: string | null;
    closedAt: string | null;
    closeNote: string | null;
  } | null;
};

type OfferDetailsCardProps = {
  data: OfferDetailsViewModel;
};

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

function getStatusLabel(status: string) {
  if (status === "pending") {
    return "قيد الانتظار";
  }

  if (status === "accepted") {
    return "مقبول";
  }

  if (status === "rejected") {
    return "مرفوض";
  }

  if (status === "negotiating") {
    return "تفاوض";
  }

  if (status === "withdrawn") {
    return "مسحوب";
  }

  return status;
}

function getStatusClass(status: string) {
  if (status === "accepted") {
    return "status-pill status-pill--success";
  }

  if (status === "rejected") {
    return "status-pill status-pill--danger";
  }

  if (status === "negotiating") {
    return "status-pill status-pill--warning";
  }

  if (status === "pending") {
    return "status-pill status-pill--info";
  }

  return "status-pill";
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

export default function OfferDetailsCard({ data }: OfferDetailsCardProps) {
  return (
    <div className="offer-details-card">
      <div className="offer-details-card__head">
        <div>
          <h1 className="offer-details-card__title">تفاصيل العرض الاستثماري</h1>
          <p className="offer-details-card__subtitle">
            {data.projectTitle} — {data.companyName}
          </p>
        </div>

        <span className={getStatusClass(data.status)}>{getStatusLabel(data.status)}</span>
      </div>

      <div className="offer-details-card__grid">
        <div className="offer-details-panel">
          <h3>بيانات العرض</h3>
          <div className="offer-details-panel__list">
            <div>
              <span>قيمة العرض</span>
              <strong>{formatMoney(data.offerAmountSar)}</strong>
            </div>
            <div>
              <span>نسبة الملكية</span>
              <strong>{data.equityPercentage !== null ? `${data.equityPercentage}%` : "—"}</strong>
            </div>
            <div>
              <span>تاريخ الإرسال</span>
              <strong>{formatDate(data.createdAt)}</strong>
            </div>
            <div>
              <span>آخر تحديث</span>
              <strong>{formatDate(data.updatedAt)}</strong>
            </div>
            <div>
              <span>تاريخ الرد</span>
              <strong>{formatDate(data.respondedAt)}</strong>
            </div>
          </div>
        </div>

        <div className="offer-details-panel">
          <h3>بيانات المشروع</h3>
          <div className="offer-details-panel__list">
            <div>
              <span>المشروع</span>
              <strong>{data.projectTitle}</strong>
            </div>
            <div>
              <span>اسم الجهة</span>
              <strong>{data.companyName}</strong>
            </div>
            <div>
              <span>المرحلة</span>
              <strong>{getStageLabel(data.startupStage)}</strong>
            </div>
            <div>
              <span>مستوى الجاهزية</span>
              <strong>{getConfidenceLabel(data.confidenceLevel)}</strong>
            </div>
            <div>
              <span>حالة الاستثمار</span>
              <strong>{getInvestmentStatusLabel(data.investmentStatus)}</strong>
            </div>
          </div>
        </div>

        <div className="offer-details-panel">
          <h3>بيانات رائد الأعمال</h3>
          <div className="offer-details-panel__list">
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

        <div className="offer-details-panel">
          <h3>الصفقة المرتبطة</h3>
          <div className="offer-details-panel__list">
            <div>
              <span>حالة الصفقة</span>
              <strong>{data.deal?.status || "لا توجد صفقة حالياً"}</strong>
            </div>
            <div>
              <span>تاريخ مشاركة التواصل</span>
              <strong>{formatDate(data.deal?.contactSharedAt ?? null)}</strong>
            </div>
            <div>
              <span>تاريخ الإغلاق</span>
              <strong>{formatDate(data.deal?.closedAt ?? null)}</strong>
            </div>
          </div>
        </div>
      </div>

      {data.expectedReturns ? (
        <div className="offer-details-block">
          <h3>العوائد المتوقعة</h3>
          <p>{data.expectedReturns}</p>
        </div>
      ) : null}

      {data.specialConditions ? (
        <div className="offer-details-block">
          <h3>الشروط الخاصة</h3>
          <p>{data.specialConditions}</p>
        </div>
      ) : null}

      {data.message ? (
        <div className="offer-details-block">
          <h3>رسالة العرض</h3>
          <p>{data.message}</p>
        </div>
      ) : null}

      {data.deal?.closeNote ? (
        <div className="offer-details-block">
          <h3>ملاحظة الإغلاق</h3>
          <p>{data.deal.closeNote}</p>
        </div>
      ) : null}

      <div className="offer-details-card__actions">
        <Link to="/investor/offers" className="btn btn--secondary">
          العودة إلى العروض
        </Link>

        <Link to={`/investor/explore/${data.projectId}`} className="btn btn--primary">
          عرض المشروع
        </Link>
        {data.deal ? (
    <Link to={`/investor/deals/${data.deal.id}`} className="btn btn--ghost">
      عرض الصفقة
    </Link>
  ) : null}
      </div>
    </div>
  );
}