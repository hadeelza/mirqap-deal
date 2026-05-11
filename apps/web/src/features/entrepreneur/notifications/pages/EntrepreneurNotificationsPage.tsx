import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import EntrepreneurNotificationsList, {
  type EntrepreneurNotificationListItem,
} from "../components/EntrepreneurNotificationsList";

type NotificationRow = {
  id: string;
  recipient_id: string;
  type: string;
  title: string | null;
  body: string | null;
  ref_type: string | null;
  ref_id: string | null;
  is_read: boolean | null;
  created_at: string;
};

function getNotificationTargetPath(refType: string | null, refId: string | null) {
  if (!refType || !refId) {
    return null;
  }

  const normalized = refType.toLowerCase();

  if (normalized === "offer") {
    return `/entrepreneur/offers/${refId}`;
  }

  if (normalized === "deal") {
    return `/entrepreneur/deals/${refId}/edit`;
  }

  if (normalized === "project") {
    return `/entrepreneur/projects/${refId}`;
  }

  if (normalized === "chat") {
    return `/entrepreneur/chats/${refId}`;
  }

  return null;
}

export default function EntrepreneurNotificationsPage() {
  const { appUser, isLoading } = useAuthUser();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<EntrepreneurNotificationListItem[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    async function loadNotifications() {
      if (!appUser || appUser.role !== "entrepreneur") {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const { data: rows, error } = await supabase
          .from("notifications")
          .select("id,recipient_id,type,title,body,ref_type,ref_id,is_read,created_at")
          .eq("recipient_id", appUser.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const safeRows = (rows ?? []) as NotificationRow[];

        setNotifications(
          safeRows.map((row: NotificationRow) => ({
            id: row.id,
            title: row.title?.trim() || "إشعار",
            body: row.body?.trim() || "",
            type: row.type,
            refType: row.ref_type,
            refId: row.ref_id,
            isRead: Boolean(row.is_read),
            createdAt: row.created_at,
            targetPath: getNotificationTargetPath(row.ref_type, row.ref_id),
          }))
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل الإشعارات.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadNotifications();
  }, [appUser]);

  async function handleMarkAsRead(notificationId: string) {
    try {
      setMarkingId(notificationId);

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        throw error;
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تحديث حالة الإشعار.";
      setErrorMessage(message);
    } finally {
      setMarkingId(null);
    }
  }

  async function handleQuickOpen(notification: EntrepreneurNotificationListItem) {
    try {
      if (!notification.isRead) {
        await handleMarkAsRead(notification.id);
      }

      if (notification.targetPath) {
        navigate(notification.targetPath);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر فتح العنصر المرتبط.";
      setErrorMessage(message);
    }
  }

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !normalizedSearch ||
        notification.title.toLowerCase().includes(normalizedSearch) ||
        notification.body.toLowerCase().includes(normalizedSearch);

      const matchesRead =
        readFilter === "all" ||
        (readFilter === "read" && notification.isRead) ||
        (readFilter === "unread" && !notification.isRead);

      const matchesType = typeFilter === "all" || notification.type === typeFilter;

      return matchesSearch && matchesRead && matchesType;
    });
  }, [notifications, search, readFilter, typeFilter]);

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل الإشعارات...</div>
      </section>
    );
  }

  if (!appUser || appUser.role !== "entrepreneur") {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">تعذر التحقق من حساب رائد الأعمال.</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">الإشعارات</h1>
          <p className="entrepreneur-page__subtitle">
            جميع الإشعارات المهمة المتعلقة بمشاريعك وعروضك وصفقاتك ورسائلك.
          </p>
        </div>
      </div>

      <section className="entrepreneur-toolbar">
        <div className="entrepreneur-toolbar__search">
          <label htmlFor="entrepreneur-notifications-search">البحث</label>
          <input
            id="entrepreneur-notifications-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث في عنوان الإشعار أو الوصف"
          />
        </div>

        <div className="entrepreneur-toolbar__filters">
          <div>
            <label htmlFor="entrepreneur-notifications-read-filter">الحالة</label>
            <select
              id="entrepreneur-notifications-read-filter"
              value={readFilter}
              onChange={(event) => setReadFilter(event.target.value)}
            >
              <option value="all">الكل</option>
              <option value="unread">غير مقروء</option>
              <option value="read">مقروء</option>
            </select>
          </div>

          <div>
            <label htmlFor="entrepreneur-notifications-type-filter">النوع</label>
            <select
              id="entrepreneur-notifications-type-filter"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">الكل</option>
              <option value="offer_received">عرض مستلم</option>
              <option value="offer_response">رد على عرض</option>
              <option value="deal_created">صفقة جديدة</option>
              <option value="message_received">رسالة جديدة</option>
              <option value="ai_ready">نتيجة AI</option>
              <option value="system">نظام</option>
              <option value="project_review">مراجعة مشروع</option>
            </select>
          </div>
        </div>
      </section>

      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <EntrepreneurNotificationsList
        notifications={filteredNotifications}
        markingId={markingId}
        onMarkAsRead={handleMarkAsRead}
        onQuickOpen={handleQuickOpen}
      />
    </section>
  );
}