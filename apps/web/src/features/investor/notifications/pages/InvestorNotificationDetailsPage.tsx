import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";

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

type ProjectSummaryRow = {
  id: string;
  title: string | null;
  company_name: string | null;
  investment_status: string | null;
};

type OfferProjectRow = {
  title: string | null;
  company_name: string | null;
};

type OfferSummaryRow = {
  id: string;
  status: string | null;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
  project: OfferProjectRow | OfferProjectRow[] | null;
};

type DealProjectRow = {
  title: string | null;
  company_name: string | null;
};

type DealSummaryRow = {
  id: string;
  status: string | null;
  contact_shared_at: string | null;
  project: DealProjectRow | DealProjectRow[] | null;
};

type ChatProjectRow = {
  id: string;
  title: string | null;
  company_name: string | null;
};

type ChatEntrepreneurRow = {
  full_name: string | null;
};

type ChatSummaryRow = {
  id: string;
  project: ChatProjectRow | ChatProjectRow[] | null;
  entrepreneur: ChatEntrepreneurRow | ChatEntrepreneurRow[] | null;
};

type RelatedSummary = {
  title: string;
  subtitle: string;
  details: string[];
  targetPath: string | null;
};

function normalizeSingle<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
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

async function loadRelatedSummary(
  refType: string | null,
  refId: string | null
): Promise<RelatedSummary | null> {
  if (!refType || !refId) {
    return null;
  }

  if (refType === "project") {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, company_name, investment_status")
      .eq("id", refId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as ProjectSummaryRow;

    return {
      title: row.title ?? "المشروع المرتبط",
      subtitle: row.company_name ?? "جهة غير محددة",
      details: [`حالة الاستثمار: ${row.investment_status ?? "غير محددة"}`],
      targetPath: ROUTES.investor.projectDetails(row.id),
    };
  }

  if (refType === "offer") {
    const { data, error } = await supabase
      .from("investment_offers")
      .select(`
        id,
        status,
        offer_amount_sar,
        equity_percentage,
        project:projects (
          title,
          company_name
        )
      `)
      .eq("id", refId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as OfferSummaryRow;
    const project = normalizeSingle(row.project);

    return {
      title: project?.title ?? "العرض المرتبط",
      subtitle: project?.company_name ?? "جهة غير محددة",
      details: [
        `حالة العرض: ${row.status ?? "غير محددة"}`,
        `قيمة العرض: ${row.offer_amount_sar ?? 0} ر.س`,
        `نسبة الملكية: ${row.equity_percentage ?? 0}%`,
      ],
      targetPath: ROUTES.investor.offerDetails(row.id),
    };
  }

  if (refType === "deal") {
    const { data, error } = await supabase
      .from("deals")
      .select(`
        id,
        status,
        contact_shared_at,
        project:projects (
          title,
          company_name
        )
      `)
      .eq("id", refId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as DealSummaryRow;
    const project = normalizeSingle(row.project);

    return {
      title: project?.title ?? "الصفقة المرتبطة",
      subtitle: project?.company_name ?? "جهة غير محددة",
      details: [
        `حالة الصفقة: ${row.status ?? "غير محددة"}`,
        `تاريخ مشاركة التواصل: ${
          row.contact_shared_at ? formatDateTime(row.contact_shared_at) : "غير متوفر"
        }`,
      ],
      targetPath: ROUTES.investor.dealDetails(row.id),
    };
  }

  if (refType === "chat") {
    const { data, error } = await supabase
      .from("chats")
      .select(`
        id,
        project:projects (
          id,
          title,
          company_name
        ),
        entrepreneur:users!chats_entrepreneur_id_fkey (
          full_name
        )
      `)
      .eq("id", refId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as ChatSummaryRow;
    const project = normalizeSingle(row.project);
    const entrepreneur = normalizeSingle(row.entrepreneur);

    return {
      title: project?.title ?? "المحادثة المرتبطة",
      subtitle: entrepreneur?.full_name ?? "رائد أعمال",
      details: [`المشروع: ${project?.company_name ?? "غير محدد"}`],
      targetPath: ROUTES.investor.chatDetails(row.id),
    };
  }

  return null;
}

export default function InvestorNotificationDetailsPage() {
  const { notificationId } = useParams<{ notificationId: string }>();
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [notification, setNotification] = useState<NotificationRow | null>(null);
  const [relatedSummary, setRelatedSummary] = useState<RelatedSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!appUser?.id || !notificationId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function bootstrap() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("notifications")
          .select("id, type, title, body, ref_type, ref_id, is_read, created_at")
          .eq("id", notificationId)
          .eq("recipient_id", appUser?.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("الإشعار المطلوب غير موجود.");
        }

        const row = data as NotificationRow;

        if (!row.is_read) {
          await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", row.id);
        }

        const summary = await loadRelatedSummary(row.ref_type, row.ref_id);

        if (isMounted) {
          setNotification({ ...row, is_read: true });
          setRelatedSummary(summary);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل تفاصيل الإشعار حالياً.";

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

    return () => {
      isMounted = false;
    };
  }, [appUser?.id, notificationId]);

  const relatedButtonLabel = useMemo(() => {
    if (!notification?.ref_type) {
      return "فتح العنصر المرتبط";
    }

    switch (notification.ref_type) {
      case "offer":
        return "فتح تفاصيل العرض";
      case "deal":
        return "فتح تفاصيل الصفقة";
      case "chat":
        return "فتح المحادثة";
      case "project":
        return "فتح المشروع";
      default:
        return "فتح العنصر المرتبط";
    }
  }, [notification?.ref_type]);

  if (isAuthLoading || isLoading) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>جاري تحميل الإشعار</h2>
          <p>يتم الآن تحميل تفاصيل الإشعار والعنصر المرتبط به.</p>
        </div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>تعذر الوصول للإشعار</h2>
          <p>يجب تسجيل الدخول أولاً.</p>
        </div>
      </section>
    );
  }

  if (errorMessage || !notification) {
    return (
      <section className="investor-page">
        <div className="investor-empty-card">
          <h2>تعذر عرض الإشعار</h2>
          <p>{errorMessage || "الإشعار المطلوب غير موجود."}</p>
          <Link to={ROUTES.investor.notifications} className="btn btn--primary">
            العودة إلى الإشعارات
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="investor-page">
      <div className="investor-page__header">
        <div>
          <Link
            to={ROUTES.investor.notifications}
            className="investor-chat-details__back"
          >
            ← العودة إلى الإشعارات
          </Link>
          <h1 className="investor-page__title">تفاصيل الإشعار</h1>
          <p className="investor-page__subtitle">
            عرض تفاصيل الإشعار والعنصر المرتبط به.
          </p>
        </div>
      </div>

      <div className="investor-notification-details">
        <article className="investor-notification-details__card">
          <div className="investor-notification-details__meta">
            <span className="investor-notification-card__type">
              {getTypeLabel(notification.type)}
            </span>
            <span className="investor-notification-card__state">مقروء</span>
          </div>

          <h2>{notification.title ?? "إشعار"}</h2>
          <p>{notification.body ?? ""}</p>

          <div className="investor-notification-details__date">
            <strong>تاريخ الإشعار:</strong> {formatDateTime(notification.created_at)}
          </div>
        </article>

        <article className="investor-notification-details__card">
          <h3>العنصر المرتبط</h3>

          {relatedSummary ? (
            <>
              <div className="investor-notification-details__summary">
                <strong>{relatedSummary.title}</strong>
                <span>{relatedSummary.subtitle}</span>
              </div>

              <ul className="investor-notification-details__list">
                {relatedSummary.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>

              {relatedSummary.targetPath ? (
                <div className="investor-notification-details__actions">
                  <Link to={relatedSummary.targetPath} className="btn btn--primary">
                    {relatedButtonLabel}
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <p className="investor-page__subtitle">
              لا توجد تفاصيل إضافية متاحة لهذا الإشعار حالياً.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}