import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import OfferDetailsCard, { type OfferDetailsViewModel } from "../components/OfferDetailsCard";
import OfferTimeline, { type OfferTimelineEvent } from "../components/OfferTimeline";

type OfferRow = {
  id: string;
  project_id: string;
  investor_id: string;
  entrepreneur_id: string;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
  expected_returns: string | null;
  special_conditions: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  company_name: string;
  startup_stage: string | null;
  confidence_level: string | null;
  investment_status: string | null;
};

type UserRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

type DealRow = {
  id: string;
  status: string;
  contact_shared_at: string | null;
  closed_at: string | null;
  close_note: string | null;
};

type ActionRow = {
  id: string;
  action_type: string;
  note: string | null;
  created_at: string;
};

export default function OfferDetailsPage() {
  const { offerId = "" } = useParams();
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [details, setDetails] = useState<OfferDetailsViewModel | null>(null);
  const [timelineActions, setTimelineActions] = useState<ActionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!appUser || appUser.role !== "investor" || !offerId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setPageError("");

        const offerResponse = await supabase
          .from("investment_offers")
          .select(
            "id, project_id, investor_id, entrepreneur_id, offer_amount_sar, equity_percentage, expected_returns, special_conditions, message, status, created_at, updated_at, responded_at"
          )
          .eq("id", offerId)
          .eq("investor_id", appUser.id)
          .maybeSingle();

        if (offerResponse.error) {
          throw offerResponse.error;
        }

        const offer = offerResponse.data as OfferRow | null;

        if (!offer) {
          setDetails(null);
          setIsLoading(false);
          return;
        }

        const [projectResponse, userResponse, dealResponse, actionsResponse] = await Promise.all([
          supabase
            .from("projects")
            .select("id, title, company_name, startup_stage, confidence_level, investment_status")
            .eq("id", offer.project_id)
            .maybeSingle(),
          supabase
            .from("users")
            .select("id, full_name, email, phone")
            .eq("id", offer.entrepreneur_id)
            .maybeSingle(),
          supabase
            .from("deals")
            .select("id, status, contact_shared_at, closed_at, close_note")
            .eq("offer_id", offer.id)
            .maybeSingle(),
          supabase
            .from("project_actions")
            .select("id, action_type, note, created_at")
            .eq("project_id", offer.project_id)
            .in("action_type", ["offer_sent", "offer_accepted", "offer_rejected"])
            .order("created_at", { ascending: true }),
        ]);

        if (projectResponse.error) {
          throw projectResponse.error;
        }

        if (userResponse.error) {
          throw userResponse.error;
        }

        if (dealResponse.error) {
          throw dealResponse.error;
        }

        if (actionsResponse.error) {
          throw actionsResponse.error;
        }

        const project = projectResponse.data as ProjectRow | null;
        const entrepreneur = userResponse.data as UserRow | null;
        const deal = dealResponse.data as DealRow | null;
        const actions = (actionsResponse.data ?? []) as ActionRow[];

        setDetails({
          offerId: offer.id,
          projectId: offer.project_id,
          projectTitle: project?.title ?? "مشروع غير متوفر",
          companyName: project?.company_name ?? "—",
          entrepreneurName: entrepreneur?.full_name ?? "—",
          entrepreneurEmail: entrepreneur?.email ?? null,
          entrepreneurPhone: entrepreneur?.phone ?? null,
          offerAmountSar: offer.offer_amount_sar,
          equityPercentage: offer.equity_percentage,
          expectedReturns: offer.expected_returns,
          specialConditions: offer.special_conditions,
          message: offer.message,
          status: offer.status,
          createdAt: offer.created_at,
          updatedAt: offer.updated_at,
          respondedAt: offer.responded_at,
          startupStage: project?.startup_stage ?? null,
          confidenceLevel: project?.confidence_level ?? null,
          investmentStatus: project?.investment_status ?? null,
          deal: deal
            ? {
                id: deal.id,
                status: deal.status,
                contactSharedAt: deal.contact_shared_at,
                closedAt: deal.closed_at,
                closeNote: deal.close_note,
              }
            : null,
        });

        setTimelineActions(actions);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل تفاصيل العرض حالياً.";
        setPageError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadPage();
  }, [appUser, offerId]);

  const timeline = useMemo<OfferTimelineEvent[]>(() => {
    if (!details) {
      return [];
    }

    const events: OfferTimelineEvent[] = [
      {
        key: `offer-created-${details.offerId}`,
        title: "إرسال العرض",
        description: "تم إرسال العرض الاستثماري على المشروع.",
        date: details.createdAt,
        tone: "default",
      },
    ];

    if (details.respondedAt && details.status === "accepted") {
      events.push({
        key: `offer-accepted-${details.offerId}`,
        title: "قبول العرض",
        description: "تم قبول العرض من الطرف الآخر.",
        date: details.respondedAt,
        tone: "success",
      });
    }

    if (details.respondedAt && details.status === "rejected") {
      events.push({
        key: `offer-rejected-${details.offerId}`,
        title: "رفض العرض",
        description: "تم رفض العرض من الطرف الآخر.",
        date: details.respondedAt,
        tone: "danger",
      });
    }

    if (details.respondedAt && details.status === "negotiating") {
      events.push({
        key: `offer-negotiating-${details.offerId}`,
        title: "الدخول في التفاوض",
        description: "تم تحويل العرض إلى حالة تفاوض.",
        date: details.respondedAt,
        tone: "warning",
      });
    }

    timelineActions.forEach((action: ActionRow) => {
      if (action.action_type === "offer_sent") {
        return;
      }

      if (action.action_type === "offer_accepted") {
        events.push({
          key: action.id,
          title: "تحديث حالة العرض",
          description: action.note || "تم تسجيل قبول العرض ضمن سجل المشروع.",
          date: action.created_at,
          tone: "success",
        });
      }

      if (action.action_type === "offer_rejected") {
        events.push({
          key: action.id,
          title: "تحديث حالة العرض",
          description: action.note || "تم تسجيل رفض العرض ضمن سجل المشروع.",
          date: action.created_at,
          tone: "danger",
        });
      }
    });

    if (details.deal) {
      events.push({
        key: `deal-created-${details.deal.id}`,
        title: "إنشاء صفقة",
        description: "تم إنشاء صفقة مرتبطة بهذا العرض.",
        date: details.updatedAt,
        tone: "success",
      });

      if (details.deal.contactSharedAt) {
        events.push({
          key: `deal-contact-${details.deal.id}`,
          title: "مشاركة معلومات التواصل",
          description: "تمت مشاركة معلومات التواصل بين الطرفين.",
          date: details.deal.contactSharedAt,
          tone: "success",
        });
      }

      if (details.deal.closedAt) {
        events.push({
          key: `deal-closed-${details.deal.id}`,
          title: "إغلاق الصفقة",
          description: details.deal.closeNote || "تم إغلاق الصفقة.",
          date: details.deal.closedAt,
          tone: "default",
        });
      }
    }

    return events.sort((a: OfferTimelineEvent, b: OfferTimelineEvent) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [details, timelineActions]);

  if (isAuthLoading || isLoading) {
    return <div className="page-loading">جارٍ تحميل تفاصيل العرض...</div>;
  }

  if (!appUser || appUser.role !== "investor") {
    return <div className="page-error">تعذر التحقق من حساب المستثمر الحالي.</div>;
  }

  if (pageError) {
    return <div className="page-error">{pageError}</div>;
  }

  if (!details) {
    return (
      <div className="page-empty">
        <h2>العرض غير موجود</h2>
        <p>تعذر العثور على العرض المطلوب أو أنك لا تملك صلاحية الوصول إليه.</p>
      </div>
    );
  }

  return (
    <section className="investor-page offer-details-page">
      <OfferDetailsCard data={details} />
      <OfferTimeline events={timeline} />
    </section>
  );
}