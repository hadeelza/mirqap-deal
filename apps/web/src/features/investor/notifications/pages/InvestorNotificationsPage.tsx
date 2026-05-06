import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import InvestorNotificationsList, {
  type InvestorNotificationListItem,
} from "../components/InvestorNotificationsList";

type NotificationRow = {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  ref_type: string | null;
  ref_id: string | null;
  is_read: boolean | null;
  created_at: string;
};

function resolveNotificationTargetPath(
  refType: string | null,
  refId: string | null
): string | null {
  if (!refType || !refId) {
    return null;
  }

  switch (refType) {
    case "offer":
      return ROUTES.investor.offerDetails(refId);
    case "deal":
      return ROUTES.investor.dealDetails(refId);
    case "chat":
      return ROUTES.investor.chatDetails(refId);
    case "project":
      return ROUTES.investor.projectDetails(refId);
    default:
      return null;
  }
}

export default function InvestorNotificationsPage() {
  const navigate = useNavigate();
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [items, setItems] = useState<InvestorNotificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!appUser?.id) {
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, ref_type, ref_id, is_read, created_at")
      .eq("recipient_id", appUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const mapped: InvestorNotificationListItem[] = ((data ?? []) as NotificationRow[]).map(
      (row: NotificationRow) => ({
        id: row.id,
        type: row.type,
        title: row.title ?? "إشعار جديد",
        body: row.body ?? "",
        refType: row.ref_type,
        refId: row.ref_id,
        isRead: Boolean(row.is_read),
        createdAt: row.created_at,
        targetPath: resolveNotificationTargetPath(row.ref_type, row.ref_id),
      })
    );

    setItems(mapped);
  }, [appUser?.id]);

  useEffect(() => {
    if (!appUser?.id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function bootstrap() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        await loadNotifications();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل الإشعارات حالياً.";

        if (isMounted) {
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    const channel = supabase
      .channel(`investor-notifications-${appUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${appUser.id}`,
        },
        async () => {
          try {
            await loadNotifications();
          } catch {
            return;
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [appUser?.id, loadNotifications]);

  async function handleMarkAsRead(notificationId: string) {
    try {
      setUpdatingId(notificationId);

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        throw error;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "تعذر تحديث الإشعار حالياً.";
      setErrorMessage(message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleOpenRelated(item: InvestorNotificationListItem) {
    if (!item.isRead) {
      await handleMarkAsRead(item.id);
    }

    if (item.targetPath) {
      navigate(item.targetPath);
      return;
    }

    navigate(ROUTES.investor.notificationDetails(item.id));
  }

  if (isAuthLoading || isLoading) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>جاري تحميل الإشعارات</h2>
          <p>يتم الآن تجهيز قائمة الإشعارات الخاصة بحسابك.</p>
        </div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>تعذر الوصول للإشعارات</h2>
          <p>يجب تسجيل الدخول أولاً لعرض الإشعارات.</p>
        </div>
      </section>
    );
  }

  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <section className="investor-page">
      <div className="investor-page__header">
        <div>
          <h1 className="investor-page__title">الإشعارات</h1>
          <p className="investor-page__subtitle">
            جميع التحديثات المهمة المتعلقة بالعروض والصفقات والرسائل والتحليلات.
          </p>
        </div>

        <div className="investor-notifications-summary">
          <div className="investor-notifications-summary__card">
            <strong>{items.length}</strong>
            <span>إجمالي الإشعارات</span>
          </div>
          <div className="investor-notifications-summary__card">
            <strong>{unreadCount}</strong>
            <span>غير مقروءة</span>
          </div>
        </div>
      </div>

      {errorMessage ? <div className="auth-error">{errorMessage}</div> : null}

      <InvestorNotificationsList
        items={items}
        updatingId={updatingId}
        onMarkAsRead={handleMarkAsRead}
        onOpenRelated={handleOpenRelated}
      />
    </section>
  );
}