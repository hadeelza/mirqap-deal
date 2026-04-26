import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";

type RecentInterest = {
  id: string;
  createdAt: string | null;
  projectId: string;
  title: string;
  companyName: string;
  shortPitch: string;
  investmentStatus: string;
  capitalSeekingSar: number | null;
};

type RecentInterestsSectionProps = {
  isLoading?: boolean;
  interests: RecentInterest[];
};

function formatMoney(value: number | null) {
  if (value === null) {
    return "غير محدد";
  }

  return `${new Intl.NumberFormat("ar-SA").format(value)} ر.س`;
}

function formatRelativeDate(value: string | null) {
  if (!value) {
    return "منذ قليل";
  }

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "منذ قليل";
  }

  if (diffHours < 24) {
    return `منذ ${diffHours} ساعة`;
  }

  if (diffDays < 30) {
    return `منذ ${diffDays} يوم`;
  }

  return date.toLocaleDateString("ar-SA");
}

export default function RecentInterestsSection({
  isLoading = false,
  interests,
}: RecentInterestsSectionProps) {
  return (
    <section className="investor-dashboard-card">
      <div className="investor-dashboard-card__header">
        <div>
          <h2>اهتماماتك الأخيرة</h2>
          <p>المشاريع التي حفظتها مؤخراً للمتابعة أو العودة إليها لاحقاً.</p>
        </div>

        <Link to={ROUTES.investor.interests} className="investor-dashboard-card__link">
          عرض الكل
        </Link>
      </div>

      {isLoading ? (
        <div className="investor-list-loading">
          <div className="investor-list-loading__item" />
          <div className="investor-list-loading__item" />
          <div className="investor-list-loading__item" />
        </div>
      ) : null}

      {!isLoading && interests.length === 0 ? (
        <div className="investor-dashboard-empty investor-dashboard-empty--small">
          <p>لم تقم بوضع اهتمام على أي مشروع حتى الآن.</p>
          <Link to={ROUTES.investor.explore} className="btn btn--primary">
            ابدأ الاستكشاف
          </Link>
        </div>
      ) : null}

      {!isLoading && interests.length > 0 ? (
        <div className="investor-interests-list">
          {interests.map((item) => (
            <article key={item.id} className="investor-interests-list__item">
              <div className="investor-interests-list__content">
                <div className="investor-interests-list__head">
                  <div>
                    <h3>{item.title}</h3>
                    <span>{item.companyName}</span>
                  </div>

                  <small>{formatRelativeDate(item.createdAt)}</small>
                </div>

                <p>{item.shortPitch}</p>

                <div className="investor-interests-list__meta">
                  <span>الحالة: {item.investmentStatus}</span>
                  <span>المبلغ المطلوب: {formatMoney(item.capitalSeekingSar)}</span>
                </div>
              </div>

              <div className="investor-interests-list__actions">
                <Link
                  to={`${ROUTES.investor.explore}/${item.projectId}`}
                  className="btn btn--ghost"
                >
                  عرض المشروع
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}