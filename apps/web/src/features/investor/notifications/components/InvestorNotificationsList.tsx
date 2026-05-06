import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";

export type InvestorNotificationListItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  refType: string | null;
  refId: string | null;
  targetPath: string | null;
};

type InvestorNotificationsListProps = {
  items: InvestorNotificationListItem[];
  updatingId: string | null;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onOpenRelated: (item: InvestorNotificationListItem) => Promise<void>;
};

function getTypeLabel(type: string) {
  switch (type) {
    case "offer_received":
      return "عرض استثماري";
    case "offer_response":
      return "رد على عرض";
    case "deal_created":
      return "صفقة";
    case "message_received":
      return "رسالة";
    case "ai_ready":
      return "تحليل ذكي";
    case "project_review":
      return "مراجعة مشروع";
    case "system":
      return "إشعار عام";
    default:
      return "إشعار";
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InvestorNotificationsList({
  items,
  updatingId,
  onMarkAsRead,
  onOpenRelated,
}: InvestorNotificationsListProps) {
  if (!items.length) {
    return (
      <div className="investor-empty-card">
        <h2>لا توجد إشعارات حالياً</h2>
        <p>عند وصول أي تحديث جديد سيظهر لك هنا بشكل مباشر.</p>
      </div>
    );
  }

  return (
    <div className="investor-notifications-list">
      {items.map((item) => (
        <article
          key={item.id}
          className={
            item.isRead
              ? "investor-notification-card"
              : "investor-notification-card investor-notification-card--unread"
          }
        >
          <div className="investor-notification-card__top">
            <div className="investor-notification-card__meta">
              <span className="investor-notification-card__type">
                {getTypeLabel(item.type)}
              </span>
              <span className="investor-notification-card__date">
                {formatDateTime(item.createdAt)}
              </span>
            </div>

            <span
              className={
                item.isRead
                  ? "investor-notification-card__state"
                  : "investor-notification-card__state investor-notification-card__state--new"
              }
            >
              {item.isRead ? "مقروء" : "غير مقروء"}
            </span>
          </div>

          <div className="investor-notification-card__content">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>

          <div className="investor-notification-card__actions">
            <Link
              to={ROUTES.investor.notificationDetails(item.id)}
              className="btn btn--secondary"
            >
              عرض التفاصيل
            </Link>

            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void onOpenRelated(item)}
            >
              فتح العنصر المرتبط
            </button>

            {!item.isRead ? (
              <button
                type="button"
                className="btn btn--ghost"
                disabled={updatingId === item.id}
                onClick={() => void onMarkAsRead(item.id)}
              >
                {updatingId === item.id ? "جارٍ التحديث..." : "تحديد كمقروء"}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}