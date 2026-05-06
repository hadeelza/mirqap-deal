type InvestorType = "angel" | "individual" | "institution" | "incubator" | "accelerator";

interface InvestorProfileCardProps {
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  accountStatus: string | null;
  isVerified: boolean | null;
  investorType: InvestorType | null;
  organizationName: string | null;
  bio: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
}

const investorTypeLabels: Record<InvestorType, string> = {
  angel: "مستثمر ملاك",
  individual: "مستثمر فردي",
  institution: "جهة استثمارية",
  incubator: "حاضنة أعمال",
  accelerator: "مسرعة أعمال",
};

const accountStatusLabels: Record<string, string> = {
  pending: "قيد الاستكمال",
  active: "نشط",
  suspended: "موقوف",
};

function getInitials(name: string) {
  const cleaned = name.trim();
  if (!cleaned) {
    return "م";
  }

  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 1);
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`;
}

function renderLink(url: string | null, fallback: string) {
  if (!url) {
    return <span className="investor-profile-card__empty">{fallback}</span>;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="investor-profile-card__link">
      {url}
    </a>
  );
}

export default function InvestorProfileCard({
  fullName,
  email,
  phone,
  avatarUrl,
  accountStatus,
  isVerified,
  investorType,
  organizationName,
  bio,
  websiteUrl,
  linkedinUrl,
}: InvestorProfileCardProps) {
  const statusLabel = accountStatus ? accountStatusLabels[accountStatus] ?? accountStatus : "غير محدد";
  const investorTypeLabel = investorType ? investorTypeLabels[investorType] : "غير محدد";

  return (
    <article className="investor-profile-card">
      <div className="investor-profile-card__hero">
        <div className="investor-profile-card__avatar-wrapper">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="investor-profile-card__avatar-image" />
          ) : (
            <div className="investor-profile-card__avatar">{getInitials(fullName)}</div>
          )}
        </div>

        <div className="investor-profile-card__hero-content">
          <h2 className="investor-profile-card__name">{fullName}</h2>
          <p className="investor-profile-card__email">{email}</p>

          <div className="investor-profile-card__badges">
            <span className="investor-profile-card__badge">{statusLabel}</span>
            <span
              className={
                isVerified
                  ? "investor-profile-card__badge investor-profile-card__badge--success"
                  : "investor-profile-card__badge investor-profile-card__badge--muted"
              }
            >
              {isVerified ? "موثق" : "غير موثق"}
            </span>
          </div>
        </div>
      </div>

      <div className="investor-profile-card__section">
        <h3 className="investor-profile-card__section-title">معلومات الحساب</h3>

        <div className="investor-profile-card__grid">
          <div className="investor-profile-card__item">
            <span className="investor-profile-card__label">رقم الجوال</span>
            <strong className="investor-profile-card__value">{phone || "غير مضاف"}</strong>
          </div>

          <div className="investor-profile-card__item">
            <span className="investor-profile-card__label">نوع المستثمر</span>
            <strong className="investor-profile-card__value">{investorTypeLabel}</strong>
          </div>

          <div className="investor-profile-card__item">
            <span className="investor-profile-card__label">الجهة / المنظمة</span>
            <strong className="investor-profile-card__value">
              {organizationName || "غير مضافة"}
            </strong>
          </div>

          <div className="investor-profile-card__item">
            <span className="investor-profile-card__label">حالة الحساب</span>
            <strong className="investor-profile-card__value">{statusLabel}</strong>
          </div>
        </div>
      </div>

      <div className="investor-profile-card__section">
        <h3 className="investor-profile-card__section-title">نبذة تعريفية</h3>
        <p className="investor-profile-card__bio">
          {bio || "لا توجد نبذة تعريفية محفوظة."}
        </p>
      </div>

      <div className="investor-profile-card__section">
        <h3 className="investor-profile-card__section-title">الروابط</h3>

        <div className="investor-profile-card__links">
          <div className="investor-profile-card__item">
            <span className="investor-profile-card__label">الموقع الإلكتروني</span>
            <div className="investor-profile-card__value">{renderLink(websiteUrl, "غير مضاف")}</div>
          </div>

          <div className="investor-profile-card__item">
            <span className="investor-profile-card__label">LinkedIn</span>
            <div className="investor-profile-card__value">{renderLink(linkedinUrl, "غير مضاف")}</div>
          </div>
        </div>
      </div>
    </article>
  );
}