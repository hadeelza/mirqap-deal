import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import OfferReviewCard from "../components/OfferReviewCard";
import OfferResponseActions from "../components/OfferResponseActions";

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
  short_pitch: string | null;
};

type UserRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

type InvestorProfileRow = {
  user_id: string;
  investor_type: string;
  organization_name: string | null;
  bio: string | null;
};

type DealRow = {
  id: string;
  status: string;
  created_at: string;
  contact_shared_at: string | null;
};

type ProjectActionRow = {
  id: string;
  action_type: string;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type TimelineItem = {
  title: string;
  date: string;
  description: string;
};

type OfferReviewData = {
  offerId: string;
  projectId: string;
  projectTitle: string;
  projectShortPitch: string;
  investorId: string;
  investorName: string;
  investorPhone: string | null;
  investorOrganization: string;
  investorType: string;
  investorBio: string;
  amount: number | null;
  equity: number | null;
  expectedReturns: string;
  specialConditions: string;
  message: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  dealId: string | null;
  dealStatus: string | null;
  timeline: TimelineItem[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatOfferStatus(value: string) {
  switch (value) {
    case "accepted":
      return "تم قبول العرض";
    case "rejected":
      return "تم رفض العرض";
    case "negotiating":
      return "تم تحويل العرض إلى تفاوض";
    case "withdrawn":
      return "تم سحب العرض";
    default:
      return "تم إنشاء العرض";
  }
}

export default function OfferReviewPage() {
  const { appUser, isLoading } = useAuthUser();
  const { offerId } = useParams();

  const [offer, setOffer] = useState<OfferReviewData | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadOffer() {
      if (!appUser || appUser.role !== "entrepreneur" || !offerId) {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const { data: offerRow, error: offerError } = await supabase
          .from("investment_offers")
          .select(
            "id,project_id,investor_id,entrepreneur_id,offer_amount_sar,equity_percentage,expected_returns,special_conditions,message,status,created_at,updated_at,responded_at"
          )
          .eq("id", offerId)
          .eq("entrepreneur_id", appUser.id)
          .maybeSingle();

        if (offerError) {
          throw offerError;
        }

        if (!offerRow) {
          setOffer(null);
          return;
        }

        const safeOffer = offerRow as OfferRow;

        const [
          projectResponse,
          userResponse,
          profileResponse,
          dealResponse,
          actionsResponse,
        ] = await Promise.all([
          supabase
            .from("projects")
            .select("id,title,short_pitch")
            .eq("id", safeOffer.project_id)
            .maybeSingle(),
          supabase
            .from("users")
            .select("id,full_name,phone")
            .eq("id", safeOffer.investor_id)
            .maybeSingle(),
          supabase
            .from("investor_profiles")
            .select("user_id,investor_type,organization_name,bio")
            .eq("user_id", safeOffer.investor_id)
            .maybeSingle(),
          supabase
            .from("deals")
            .select("id,status,created_at,contact_shared_at")
            .eq("offer_id", safeOffer.id)
            .maybeSingle(),
          supabase
            .from("project_actions")
            .select("id,action_type,note,metadata,created_at")
            .eq("project_id", safeOffer.project_id)
            .order("created_at", { ascending: true }),
        ]);

        const project = (projectResponse.data ?? null) as ProjectRow | null;
        const investor = (userResponse.data ?? null) as UserRow | null;
        const profile = (profileResponse.data ?? null) as InvestorProfileRow | null;
        const deal = (dealResponse.data ?? null) as DealRow | null;
        const projectActions = (actionsResponse.data ?? []) as ProjectActionRow[];

        const relatedActions = projectActions.filter((item: ProjectActionRow) => {
          const metadata = item.metadata;
          if (!metadata || typeof metadata !== "object") {
            return false;
          }

          return String(metadata.offer_id ?? "") === safeOffer.id;
        });

        const timeline: TimelineItem[] = [
          {
            title: "إنشاء العرض",
            date: formatDate(safeOffer.created_at),
            description: "تم إرسال عرض استثماري جديد على المشروع.",
          },
          ...relatedActions.map((item: ProjectActionRow) => ({
            title: item.action_type,
            date: formatDate(item.created_at),
            description: item.note || "تم تسجيل نشاط على العرض.",
          })),
        ];

        if (safeOffer.responded_at) {
          timeline.push({
            title: "تحديث حالة العرض",
            date: formatDate(safeOffer.responded_at),
            description: formatOfferStatus(safeOffer.status),
          });
        }

        if (deal) {
          timeline.push({
            title: "إنشاء صفقة",
            date: formatDate(deal.created_at),
            description: "تم إنشاء سجل صفقة مرتبط بهذا العرض.",
          });
        }

        setOffer({
          offerId: safeOffer.id,
          projectId: safeOffer.project_id,
          projectTitle: project?.title || "مشروع",
          projectShortPitch: project?.short_pitch || "",
          investorId: safeOffer.investor_id,
          investorName: investor?.full_name?.trim() || "مستثمر",
          investorPhone: investor?.phone || null,
          investorOrganization: profile?.organization_name?.trim() || "بدون جهة",
          investorType: profile?.investor_type || "individual",
          investorBio: profile?.bio?.trim() || "",
          amount: safeOffer.offer_amount_sar,
          equity: safeOffer.equity_percentage,
          expectedReturns: safeOffer.expected_returns?.trim() || "",
          specialConditions: safeOffer.special_conditions?.trim() || "",
          message: safeOffer.message?.trim() || "",
          status: safeOffer.status,
          createdAt: safeOffer.created_at,
          respondedAt: safeOffer.responded_at,
          dealId: deal?.id || null,
          dealStatus: deal?.status || null,
          timeline,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل العرض.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadOffer();
  }, [appUser, offerId]);

  async function handleRespond(nextStatus: "accepted" | "rejected" | "negotiating") {
    if (!appUser || !offer) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSubmitting(true);

      const now = new Date().toISOString();

      const { error: updateOfferError } = await supabase
        .from("investment_offers")
        .update({
          status: nextStatus,
          responded_at: now,
          updated_at: now,
        })
        .eq("id", offer.offerId);

      if (updateOfferError) {
        throw updateOfferError;
      }

      if (nextStatus === "accepted" || nextStatus === "negotiating") {
        const { error: projectUpdateError } = await supabase
          .from("projects")
          .update({
            investment_status: "in_negotiation",
            updated_at: now,
          })
          .eq("id", offer.projectId);

        if (projectUpdateError) {
          throw projectUpdateError;
        }
      }

      let createdDealId = offer.dealId;

      if (nextStatus === "accepted" && !offer.dealId) {
        const { data: insertedDeal, error: dealError } = await supabase
          .from("deals")
          .insert({
            project_id: offer.projectId,
            offer_id: offer.offerId,
            investor_id: offer.investorId,
            entrepreneur_id: appUser.id,
            status: "open",
            created_at: now,
            updated_at: now,
          })
          .select("id")
          .single();

        if (dealError) {
          throw dealError;
        }

        createdDealId = insertedDeal.id as string;
      }

      const actionType =
        nextStatus === "accepted"
          ? "offer_accepted"
          : nextStatus === "rejected"
            ? "offer_rejected"
            : "saved";

      const actionNote =
        nextStatus === "accepted"
          ? "تم قبول العرض وإنشاء صفقة"
          : nextStatus === "rejected"
            ? "تم رفض العرض"
            : "تم تحويل العرض إلى تفاوض";

      const { error: actionError } = await supabase.from("project_actions").insert({
        project_id: offer.projectId,
        actor_id: appUser.id,
        action_type: actionType,
        note: actionNote,
        metadata: {
          offer_id: offer.offerId,
          response_status: nextStatus,
          deal_id: createdDealId,
        },
        created_at: now,
      });

      if (actionError) {
        throw actionError;
      }

      const notificationRows = [
        {
          recipient_id: offer.investorId,
          type: "offer_response",
          title:
            nextStatus === "accepted"
              ? "تم قبول عرضك"
              : nextStatus === "rejected"
                ? "تم رفض عرضك"
                : "تم تحويل عرضك إلى تفاوض",
          body:
            nextStatus === "accepted"
              ? `تم قبول عرضك على مشروع ${offer.projectTitle}.`
              : nextStatus === "rejected"
                ? `تم رفض عرضك على مشروع ${offer.projectTitle}.`
                : `تم تحويل عرضك على مشروع ${offer.projectTitle} إلى تفاوض.`,
          ref_type: "offer",
          ref_id: offer.offerId,
          is_read: false,
          created_at: now,
        },
      ];

      if (nextStatus === "accepted" && createdDealId) {
        notificationRows.push({
          recipient_id: offer.investorId,
          type: "deal_created",
          title: "تم إنشاء صفقة جديدة",
          body: `تم إنشاء صفقة جديدة مرتبطة بعرضك على مشروع ${offer.projectTitle}.`,
          ref_type: "deal",
          ref_id: createdDealId,
          is_read: false,
          created_at: now,
        });
      }

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationRows);

      if (notificationError) {
        throw notificationError;
      }

      const newTimeline: TimelineItem[] = [
        ...(offer.timeline ?? []),
        {
          title:
            nextStatus === "accepted"
              ? "قبول العرض"
              : nextStatus === "rejected"
                ? "رفض العرض"
                : "تحويل إلى تفاوض",
          date: formatDate(now),
          description: actionNote,
        },
      ];

      if (nextStatus === "accepted" && createdDealId && !offer.dealId) {
        newTimeline.push({
          title: "إنشاء صفقة",
          date: formatDate(now),
          description: "تم إنشاء صفقة جديدة مرتبطة بهذا العرض.",
        });
      }

      setOffer((current) =>
        current
          ? {
              ...current,
              status: nextStatus,
              respondedAt: now,
              dealId: createdDealId,
              dealStatus: nextStatus === "accepted" ? "open" : current.dealStatus,
              timeline: newTimeline,
            }
          : current
      );

      setSuccessMessage(
        nextStatus === "accepted"
          ? "تم قبول العرض بنجاح."
          : nextStatus === "rejected"
            ? "تم رفض العرض بنجاح."
            : "تم تحويل العرض إلى تفاوض بنجاح."
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تحديث حالة العرض.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل مراجعة العرض...</div>
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

  if (errorMessage && !offer) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">{errorMessage}</div>
      </section>
    );
  }

  if (!offer) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">العرض غير موجود.</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">مراجعة العرض</h1>
          <p className="entrepreneur-page__subtitle">
            راجع تفاصيل العرض والمستثمر والمشروع ثم اتخذ القرار المناسب.
          </p>
        </div>
      </div>

      <OfferReviewCard offer={offer} />

      <OfferResponseActions
        offerId={offer.offerId}
        projectId={offer.projectId}
        status={offer.status}
        dealId={offer.dealId}
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        errorMessage={offer ? errorMessage : ""}
        onAccept={async () => handleRespond("accepted")}
        onReject={async () => handleRespond("rejected")}
        onNegotiate={async () => handleRespond("negotiating")}
      />
    </section>
  );
}