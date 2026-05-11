import { Link } from "react-router-dom";

export type EntrepreneurNotificationListItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  refType: string | null;
  refId: string | null;
  isRead: boolean;
  createdAt: string;
  targetPath: string | null;
};

type EntrepreneurNotificationsListProps = {
  notifications: EntrepreneurNotificationListItem[];
  markingId: string | null;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onQuickOpen: (notification: EntrepreneurNotificationListItem) => Promise<void>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatType(value: string) {
  switch (value) {
    case "offer_received":
      return "عرض مستلم";
    case "offer_response":
      return "رد على عرض";
    case "deal_created":
      return "صفقة جديدة";
    case "message_received":
      return "رسالة جديدة";
    case "ai_ready":
      return "نتيجة ذكاء اصطناعي";
    case "project_review":
      return "مراجعة مشروع";
    case "system":
      return "نظام";
    default:
      return value;
  }
}

function typeClassName(value: string) {
  switch (value) {
    case "offer_received":
      return "status-chip status-chip--gold";
    case "offer_response":
      return "status-chip status-chip--blue";
    case "deal_created":
      return "status-chip status-chip--success";
    case "message_received":
      return "status-chip status-chip--slate";
    case "ai_ready":
      return "status-chip status-chip--soft";
    case "project_review":
      return "status-chip status-chip--danger";
    default:
      return "status-chip status-chip--soft";
  }
}

export default function EntrepreneurNotificationsList({
  notifications,
  markingId,
  onMarkAsRead,
  onQuickOpen,
}: EntrepreneurNotificationsListProps) {
  if (!notifications.length) {
    return (
      <div className="entrepreneur-empty-state">
        <h3>لا توجد إشعارات</h3>
        <p>لم يتم العثور على إشعارات مطابقة حالياً.</p>
      </div>
    );
  }

  return (
    <div className="entrepreneur-notifications-list">
      {notifications.map((notification) => (
        <article
          key={notification.id}
          className={
            notification.isRead
              ? "entrepreneur-notification-card"
              : "entrepreneur-notification-card entrepreneur-notification-card--unread"
          }
        >
          <div className="entrepreneur-notification-card__top">
            <div className="entrepreneur-notification-card__heading">
              <h3>{notification.title}</h3>
              <p>{notification.body}</p>
            </div>

            <div className="entrepreneur-notification-card__meta">
              <span className={typeClassName(notification.type)}>{formatType(notification.type)}</span>
              <span
                className={
                  notification.isRead
                    ? "status-chip status-chip--soft"
                    : "status-chip status-chip--success"
                }
              >
                {notification.isRead ? "مقروء" : "غير مقروء"}
              </span>
            </div>
          </div>

          <div className="entrepreneur-notification-card__footer">
            <div className="entrepreneur-notification-card__date">
              <span>التاريخ</span>
              <strong>{formatDate(notification.createdAt)}</strong>
            </div>

            <div className="entrepreneur-notification-card__actions">
              {!notification.isRead ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={markingId === notification.id}
                  onClick={() => void onMarkAsRead(notification.id)}
                >
                  {markingId === notification.id ? "جارٍ التحديث..." : "تعليم كمقروء"}
                </button>
              ) : null}

              <Link
                to={`/entrepreneur/notifications/${notification.id}`}
                className="btn btn--ghost btn--sm"
              >
                التفاصيل
              </Link>

              {notification.targetPath ? (
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => void onQuickOpen(notification)}
                >
                  فتح العنصر المرتبط
                </button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}