import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import type { DashboardNotificationCard } from "../pages/EntrepreneurDashboardPage";

type RecentNotificationsSectionProps = {
  notifications: DashboardNotificationCard[];
};

function formatDate(value: string) {
  if (!value) return "غير محدد";

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function RecentNotificationsSection({
  notifications,
}: RecentNotificationsSectionProps) {
  return (
    <div className="panel-section-card">
      <div className="panel-section-card__header">
        <div>
          <h3 className="panel-section-card__title">أحدث الإشعارات</h3>
          <p className="panel-section-card__subtitle">آخر التحديثات المتعلقة بمشاريعك وعروضك.</p>
        </div>

        <Link to={ROUTES.entrepreneur.notifications} className="panel-section-card__link">
          عرض الكل
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="panel-empty-box">لا توجد إشعارات حالياً.</div>
      ) : (
        <div className="entrepreneur-notifications-list">
          {notifications.map((item) => (
            <Link
              key={item.id}
              to={`${ROUTES.entrepreneur.notifications}/${item.id}`}
              className={`entrepreneur-notification-item ${item.isRead ? "" : "is-unread"}`}
            >
              <div className="entrepreneur-notification-item__top">
                <strong>{item.title}</strong>
                {!item.isRead ? <span className="entrepreneur-notification-item__dot" /> : null}
              </div>

              <p>{item.body}</p>

              <div className="entrepreneur-notification-item__date">
                {formatDate(item.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}