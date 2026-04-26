export function Placeholder() { return null; }
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";

type RecentNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string | null;
  linkTo: string;
};

type RecentNotificationsSectionProps = {
  isLoading?: boolean;
  notifications: RecentNotification[];
};

function formatRelativeDate(value: string | null) {
  if (!value) {
    return "الآن";
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

export default function RecentNotificationsSection({
  isLoading = false,
  notifications,
}: RecentNotificationsSectionProps) {
  return (
    <section className="investor-dashboard-card">
      <div className="investor-dashboard-card__header">
        <div>
          <h2>آخر الإشعارات</h2>
          <p>تابع أحدث التنبيهات المرتبطة بالعروض والرسائل والأنشطة المهمة.</p>
        </div>

        <Link to={ROUTES.investor.notifications} className="investor-dashboard-card__link">
          كل الإشعارات
        </Link>
      </div>

      {isLoading ? (
        <div className="investor-list-loading">
          <div className="investor-list-loading__item" />
          <div className="investor-list-loading__item" />
          <div className="investor-list-loading__item" />
        </div>
      ) : null}

      {!isLoading && notifications.length === 0 ? (
        <div className="investor-dashboard-empty investor-dashboard-empty--small">
          <p>لا توجد إشعارات حديثة الآن.</p>
        </div>
      ) : null}

      {!isLoading && notifications.length > 0 ? (
        <div className="investor-notifications-list">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              to={notification.linkTo || ROUTES.investor.notifications}
              className="investor-notifications-list__item"
            >
              <div className="investor-notifications-list__head">
                <strong>{notification.title}</strong>
                {!notification.isRead ? (
                  <span className="investor-notifications-list__dot" />
                ) : null}
              </div>

              <p>{notification.body || "لا يوجد وصف إضافي لهذا الإشعار."}</p>

              <div className="investor-notifications-list__meta">
                <span>{notification.type}</span>
                <span>{formatRelativeDate(notification.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}