type TimelineItem = {
  title: string;
  date: string;
  description: string;
};

type OfferReviewData = {
  offerId: string;
  projectId: string;
  projectTitle: string;
  projectShortPitch: string;
  investorId: string;
  investorName: string;
  investorPhone: string | null;
  investorOrganization: string;
  investorType: string;
  investorBio: string;
  amount: number | null;
  equity: number | null;
  expectedReturns: string;
  specialConditions: string;
  message: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  dealId: string | null;
  dealStatus: string | null;
  timeline: TimelineItem[];
};

type OfferReviewCardProps = {
  offer: OfferReviewData;
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

function formatDate(value: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

function formatInvestorType(value: string) {
  switch (value) {
    case "angel":
      return "مستثمر ملاك";
    case "individual":
      return "مستثمر فردي";
    case "institution":
      return "مؤسسة";
    case "incubator":
      return "حاضنة";
    case "accelerator":
      return "مسرعة";
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

export default function OfferReviewCard({ offer }: OfferReviewCardProps) {
  return (
    <section className="entrepreneur-review-grid">
      <article className="entrepreneur-review-card">
        <div className="entrepreneur-review-card__header">
          <div>
            <h2>تفاصيل العرض</h2>
            <p>راجع بيانات العرض الاستثمارية كاملة قبل اتخاذ القرار.</p>
          </div>

          <span className={statusClass(offer.status)}>{formatStatus(offer.status)}</span>
        </div>

        <div className="entrepreneur-review-card__stats">
          <div>
            <span>قيمة العرض</span>
            <strong>{formatMoney(offer.amount)}</strong>
          </div>
          <div>
            <span>نسبة الحصة</span>
            <strong>{offer.equity !== null ? `${offer.equity}%` : "غير محدد"}</strong>
          </div>
          <div>
            <span>تاريخ الإرسال</span>
            <strong>{formatDate(offer.createdAt)}</strong>
          </div>
          <div>
            <span>تاريخ الرد</span>
            <strong>{formatDate(offer.respondedAt)}</strong>
          </div>
        </div>

        <div className="entrepreneur-review-card__content">
          <div className="entrepreneur-review-section">
            <h3>العائد المتوقع</h3>
            <p>{offer.expectedReturns || "لا يوجد نص مضاف."}</p>
          </div>

          <div className="entrepreneur-review-section">
            <h3>الشروط الخاصة</h3>
            <p>{offer.specialConditions || "لا توجد شروط خاصة."}</p>
          </div>

          <div className="entrepreneur-review-section">
            <h3>رسالة المستثمر</h3>
            <p>{offer.message || "لا توجد رسالة إضافية."}</p>
          </div>
        </div>
      </article>

      <article className="entrepreneur-review-card">
        <div className="entrepreneur-review-card__header">
          <div>
            <h2>ملخص المستثمر</h2>
            <p>عرض مختصر عن صاحب العرض.</p>
          </div>
        </div>

        <div className="entrepreneur-review-card__list">
          <div>
            <span>الاسم</span>
            <strong>{offer.investorName}</strong>
          </div>
          <div>
            <span>نوع المستثمر</span>
            <strong>{formatInvestorType(offer.investorType)}</strong>
          </div>
          <div>
            <span>الجهة</span>
            <strong>{offer.investorOrganization || "بدون جهة"}</strong>
          </div>
          <div>
            <span>الهاتف</span>
            <strong>{offer.investorPhone || "غير متوفر"}</strong>
          </div>
        </div>

        <div className="entrepreneur-review-section">
          <h3>نبذة المستثمر</h3>
          <p>{offer.investorBio || "لا توجد نبذة تعريفية."}</p>
        </div>
      </article>

      <article className="entrepreneur-review-card">
        <div className="entrepreneur-review-card__header">
          <div>
            <h2>ملخص المشروع</h2>
            <p>المشروع المرتبط بهذا العرض.</p>
          </div>
        </div>

        <div className="entrepreneur-review-card__list">
          <div>
            <span>اسم المشروع</span>
            <strong>{offer.projectTitle}</strong>
          </div>
          <div>
            <span>رقم الصفقة الحالية</span>
            <strong>{offer.dealId || "لا توجد صفقة بعد"}</strong>
          </div>
          <div>
            <span>حالة الصفقة</span>
            <strong>{offer.dealStatus || "لا توجد"}</strong>
          </div>
        </div>

        <div className="entrepreneur-review-section">
          <h3>الوصف المختصر</h3>
          <p>{offer.projectShortPitch || "لا يوجد وصف مختصر."}</p>
        </div>
      </article>

      <article className="entrepreneur-review-card entrepreneur-review-card--full">
        <div className="entrepreneur-review-card__header">
          <div>
            <h2>النشاط الزمني</h2>
            <p>ملخص زمني لما حدث على هذا العرض.</p>
          </div>
        </div>

        {!offer.timeline.length ? (
          <div className="entrepreneur-empty-mini">لا توجد أحداث زمنية إضافية.</div>
        ) : (
          <div className="entrepreneur-review-timeline">
            {offer.timeline.map((item, index) => (
              <div key={`${item.title}-${index}`} className="entrepreneur-review-timeline__item">
                <div className="entrepreneur-review-timeline__dot" />
                <div className="entrepreneur-review-timeline__content">
                  <h3>{item.title}</h3>
                  <small>{item.date}</small>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}