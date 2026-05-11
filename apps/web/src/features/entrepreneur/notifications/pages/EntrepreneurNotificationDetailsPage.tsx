import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";

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

type OfferRow = {
  id: string;
  project_id: string;
  investor_id: string;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
  status: string;
};

type DealRow = {
  id: string;
  project_id: string;
  investor_id: string;
  status: string;
  contact_shared_at: string | null;
  close_note: string | null;
};

type ChatRow = {
  id: string;
  project_id: string | null;
  investor_id: string;
};

type ProjectRow = {
  id: string;
  title: string;
  short_pitch: string | null;
  approval_status?: string | null;
  publication_status?: string | null;
};

type UserRow = {
  id: string;
  full_name: string | null;
};

type SummaryItem = {
  label: string;
  value: string;
};

type RelatedSummary = {
  heading: string;
  targetPath: string | null;
  items: SummaryItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNotificationType(value: string) {
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

function getTargetPath(refType: string | null, refId: string | null) {
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

export default function EntrepreneurNotificationDetailsPage() {
  const { appUser, isLoading } = useAuthUser();
  const { notificationId } = useParams();

  const [notification, setNotification] = useState<NotificationRow | null>(null);
  const [relatedSummary, setRelatedSummary] = useState<RelatedSummary | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadNotification() {
      if (!appUser || appUser.role !== "entrepreneur" || !notificationId) {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const { data: notificationRow, error: notificationError } = await supabase
          .from("notifications")
          .select("id,recipient_id,type,title,body,ref_type,ref_id,is_read,created_at")
          .eq("id", notificationId)
          .eq("recipient_id", appUser.id)
          .maybeSingle();

        if (notificationError) {
          throw notificationError;
        }

        if (!notificationRow) {
          setNotification(null);
          return;
        }

        const safeNotification = notificationRow as NotificationRow;
        setNotification(safeNotification);

        if (!safeNotification.is_read) {
          await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", safeNotification.id);

          setNotification({
            ...safeNotification,
            is_read: true,
          });
        }

        const refType = safeNotification.ref_type?.toLowerCase() || "";
        const refId = safeNotification.ref_id;

        if (!refType || !refId) {
          setRelatedSummary(null);
          return;
        }

        if (refType === "offer") {
          const { data: offerRow } = await supabase
            .from("investment_offers")
            .select("id,project_id,investor_id,offer_amount_sar,equity_percentage,status")
            .eq("id", refId)
            .maybeSingle();

          const safeOffer = (offerRow ?? null) as OfferRow | null;

          if (!safeOffer) {
            setRelatedSummary(null);
            return;
          }

          const [{ data: projectRow }, { data: investorRow }] = await Promise.all([
            supabase.from("projects").select("id,title").eq("id", safeOffer.project_id).maybeSingle(),
            supabase.from("users").select("id,full_name").eq("id", safeOffer.investor_id).maybeSingle(),
          ]);

          const safeProject = (projectRow ?? null) as ProjectRow | null;
          const safeInvestor = (investorRow ?? null) as UserRow | null;

          setRelatedSummary({
            heading: "ملخص العرض المرتبط",
            targetPath: getTargetPath("offer", refId),
            items: [
              { label: "المشروع", value: safeProject?.title || "مشروع" },
              { label: "المستثمر", value: safeInvestor?.full_name?.trim() || "مستثمر" },
              { label: "قيمة العرض", value: formatMoney(safeOffer.offer_amount_sar) },
              {
                label: "نسبة الحصة",
                value:
                  safeOffer.equity_percentage !== null
                    ? `${safeOffer.equity_percentage}%`
                    : "غير محدد",
              },
              { label: "الحالة", value: safeOffer.status },
            ],
          });

          return;
        }

        if (refType === "deal") {
          const { data: dealRow } = await supabase
            .from("deals")
            .select("id,project_id,investor_id,status,contact_shared_at,close_note")
            .eq("id", refId)
            .maybeSingle();

          const safeDeal = (dealRow ?? null) as DealRow | null;

          if (!safeDeal) {
            setRelatedSummary(null);
            return;
          }

          const [{ data: projectRow }, { data: investorRow }] = await Promise.all([
            supabase.from("projects").select("id,title").eq("id", safeDeal.project_id).maybeSingle(),
            supabase.from("users").select("id,full_name").eq("id", safeDeal.investor_id).maybeSingle(),
          ]);

          const safeProject = (projectRow ?? null) as ProjectRow | null;
          const safeInvestor = (investorRow ?? null) as UserRow | null;

          setRelatedSummary({
            heading: "ملخص الصفقة المرتبطة",
            targetPath: getTargetPath("deal", refId),
            items: [
              { label: "المشروع", value: safeProject?.title || "مشروع" },
              { label: "المستثمر", value: safeInvestor?.full_name?.trim() || "مستثمر" },
              { label: "الحالة", value: safeDeal.status },
              {
                label: "تاريخ تبادل التواصل",
                value: safeDeal.contact_shared_at ? formatDate(safeDeal.contact_shared_at) : "غير متوفر",
              },
              { label: "ملاحظة الإغلاق", value: safeDeal.close_note || "لا توجد" },
            ],
          });

          return;
        }

        if (refType === "project") {
          const { data: projectRow } = await supabase
            .from("projects")
            .select("id,title,short_pitch,approval_status,publication_status")
            .eq("id", refId)
            .maybeSingle();

          const safeProject = (projectRow ?? null) as ProjectRow | null;

          if (!safeProject) {
            setRelatedSummary(null);
            return;
          }

          setRelatedSummary({
            heading: "ملخص المشروع المرتبط",
            targetPath: getTargetPath("project", refId),
            items: [
              { label: "اسم المشروع", value: safeProject.title },
              { label: "الوصف المختصر", value: safeProject.short_pitch || "لا يوجد" },
              { label: "حالة الاعتماد", value: safeProject.approval_status || "غير محدد" },
              { label: "حالة النشر", value: safeProject.publication_status || "غير محدد" },
            ],
          });

          return;
        }

        if (refType === "chat") {
          const { data: chatRow } = await supabase
            .from("chats")
            .select("id,project_id,investor_id")
            .eq("id", refId)
            .maybeSingle();

          const safeChat = (chatRow ?? null) as ChatRow | null;

          if (!safeChat) {
            setRelatedSummary(null);
            return;
          }

          const [{ data: projectRow }, { data: investorRow }] = await Promise.all([
            safeChat.project_id
              ? supabase.from("projects").select("id,title").eq("id", safeChat.project_id).maybeSingle()
              : Promise.resolve({ data: null }),
            supabase.from("users").select("id,full_name").eq("id", safeChat.investor_id).maybeSingle(),
          ]);

          const safeProject = (projectRow ?? null) as ProjectRow | null;
          const safeInvestor = (investorRow ?? null) as UserRow | null;

          setRelatedSummary({
            heading: "ملخص المحادثة المرتبطة",
            targetPath: getTargetPath("chat", refId),
            items: [
              { label: "المستثمر", value: safeInvestor?.full_name?.trim() || "مستثمر" },
              { label: "المشروع", value: safeProject?.title || "بدون مشروع" },
              { label: "رقم المحادثة", value: safeChat.id },
            ],
          });

          return;
        }

        setRelatedSummary(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل تفاصيل الإشعار.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadNotification();
  }, [appUser, notificationId]);

  const targetPath = useMemo(() => {
    return getTargetPath(notification?.ref_type ?? null, notification?.ref_id ?? null);
  }, [notification]);

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل تفاصيل الإشعار...</div>
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

  if (errorMessage && !notification) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">{errorMessage}</div>
      </section>
    );
  }

  if (!notification) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">الإشعار غير موجود.</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">تفاصيل الإشعار</h1>
          <p className="entrepreneur-page__subtitle">
            اعرض تفاصيل الإشعار وافتح العنصر المرتبط مباشرة.
          </p>
        </div>

        <div className="entrepreneur-page__header-actions">
          <Link to="/entrepreneur/notifications" className="btn btn--ghost">
            العودة للإشعارات
          </Link>

          {targetPath ? (
            <Link to={targetPath} className="btn btn--primary">
              فتح العنصر المرتبط
            </Link>
          ) : null}
        </div>
      </div>

      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <section className="entrepreneur-notification-details-grid">
        <article className="entrepreneur-notification-detail-card">
          <div className="entrepreneur-notification-detail-card__header">
            <h2>{notification.title?.trim() || "إشعار"}</h2>
            <span className="status-chip status-chip--soft">
              {formatNotificationType(notification.type)}
            </span>
          </div>

          <div className="entrepreneur-notification-detail-card__content">
            <div className="entrepreneur-notification-detail-item">
              <span>الحالة</span>
              <strong>{notification.is_read ? "مقروء" : "غير مقروء"}</strong>
            </div>

            <div className="entrepreneur-notification-detail-item">
              <span>التاريخ</span>
              <strong>{formatDate(notification.created_at)}</strong>
            </div>

            <div className="entrepreneur-notification-detail-item entrepreneur-notification-detail-item--full">
              <span>نص الإشعار</span>
              <p>{notification.body?.trim() || "لا يوجد وصف إضافي."}</p>
            </div>

            <div className="entrepreneur-notification-detail-item">
              <span>نوع المرجع</span>
              <strong>{notification.ref_type || "لا يوجد"}</strong>
            </div>

            <div className="entrepreneur-notification-detail-item">
              <span>معرف المرجع</span>
              <strong>{notification.ref_id || "لا يوجد"}</strong>
            </div>
          </div>
        </article>

        <article className="entrepreneur-notification-detail-card">
          <div className="entrepreneur-notification-detail-card__header">
            <h2>{relatedSummary?.heading || "العنصر المرتبط"}</h2>
          </div>

          {!relatedSummary ? (
            <div className="entrepreneur-empty-mini">لا يوجد ملخص مرتبط لهذا الإشعار.</div>
          ) : (
            <div className="entrepreneur-notification-detail-card__content">
              {relatedSummary.items.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className={
                    item.value.length > 60
                      ? "entrepreneur-notification-detail-item entrepreneur-notification-detail-item--full"
                      : "entrepreneur-notification-detail-item"
                  }
                >
                  <span>{item.label}</span>
                  {item.value.length > 60 ? <p>{item.value}</p> : <strong>{item.value}</strong>}
                </div>
              ))}

              {relatedSummary.targetPath ? (
                <div className="entrepreneur-notification-detail-card__actions">
                  <Link to={relatedSummary.targetPath} className="btn btn--primary">
                    فتح الصفحة المرتبطة
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </article>
      </section>
    </section>
  );
}