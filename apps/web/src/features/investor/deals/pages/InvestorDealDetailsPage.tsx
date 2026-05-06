import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import DealInfoCard, { type DealDetailsViewModel } from "../components/DealInfoCard";
import DealTimeline, { type DealTimelineItem } from "../components/DealTimeline";

type DealRow = {
  id: string;
  project_id: string;
  offer_id: string;
  entrepreneur_id: string;
  status: string;
  contact_shared_at: string | null;
  closed_at: string | null;
  close_note: string | null;
  created_at: string;
  updated_at: string;
};

type OfferRow = {
  id: string;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
  status: string;
  created_at: string;
  responded_at: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  company_name: string;
};

type UserRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

export default function InvestorDealDetailsPage() {
  const { dealId = "" } = useParams();
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [details, setDetails] = useState<DealDetailsViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!appUser || appUser.role !== "investor" || !dealId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setPageError("");

        const dealResponse = await supabase
          .from("deals")
          .select(
            "id, project_id, offer_id, entrepreneur_id, status, contact_shared_at, closed_at, close_note, created_at, updated_at"
          )
          .eq("id", dealId)
          .eq("investor_id", appUser.id)
          .maybeSingle();

        if (dealResponse.error) {
          throw dealResponse.error;
        }

        const deal = dealResponse.data as DealRow | null;

        if (!deal) {
          setDetails(null);
          return;
        }

        const [offerResponse, projectResponse, userResponse] = await Promise.all([
          supabase
            .from("investment_offers")
            .select("id, offer_amount_sar, equity_percentage, status, created_at, responded_at")
            .eq("id", deal.offer_id)
            .maybeSingle(),
          supabase
            .from("projects")
            .select("id, title, company_name")
            .eq("id", deal.project_id)
            .maybeSingle(),
          supabase
            .from("users")
            .select("id, full_name, email, phone")
            .eq("id", deal.entrepreneur_id)
            .maybeSingle(),
        ]);

        if (offerResponse.error) {
          throw offerResponse.error;
        }

        if (projectResponse.error) {
          throw projectResponse.error;
        }

        if (userResponse.error) {
          throw userResponse.error;
        }

        const offer = offerResponse.data as OfferRow | null;
        const project = projectResponse.data as ProjectRow | null;
        const entrepreneur = userResponse.data as UserRow | null;

        setDetails({
          dealId: deal.id,
          projectId: deal.project_id,
          offerId: deal.offer_id,
          status: deal.status,
          contactSharedAt: deal.contact_shared_at,
          closedAt: deal.closed_at,
          closeNote: deal.close_note,
          createdAt: deal.created_at,
          updatedAt: deal.updated_at,
          projectTitle: project?.title ?? "مشروع غير متوفر",
          companyName: project?.company_name ?? "—",
          entrepreneurName: entrepreneur?.full_name ?? "—",
          entrepreneurEmail: entrepreneur?.email ?? null,
          entrepreneurPhone: entrepreneur?.phone ?? null,
          offerAmountSar: offer?.offer_amount_sar ?? null,
          equityPercentage: offer?.equity_percentage ?? null,
          offerStatus: offer?.status ?? "pending",
          offerCreatedAt: offer?.created_at ?? deal.created_at,
          offerRespondedAt: offer?.responded_at ?? null,
        });
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "تعذر تحميل تفاصيل الصفقة حالياً.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPage();
  }, [appUser, dealId]);

  const timeline = useMemo<DealTimelineItem[]>(() => {
    if (!details) {
      return [];
    }

    const items: DealTimelineItem[] = [
      {
        key: `offer-created-${details.offerId}`,
        title: "إرسال العرض الاستثماري",
        description: "تم إرسال العرض الاستثماري المرتبط بهذه الصفقة.",
        date: details.offerCreatedAt,
        tone: "default",
      },
    ];

    if (details.offerRespondedAt) {
      items.push({
        key: `offer-responded-${details.offerId}`,
        title: "تحديث حالة العرض",
        description: `تم تحديث حالة العرض إلى ${details.offerStatus}.`,
        date: details.offerRespondedAt,
        tone: details.offerStatus === "accepted" ? "success" : details.offerStatus === "rejected" ? "danger" : "warning",
      });
    }

    items.push({
      key: `deal-created-${details.dealId}`,
      title: "إنشاء الصفقة",
      description: "تم إنشاء سجل الصفقة داخل المنصة.",
      date: details.createdAt,
      tone: "success",
    });

    if (details.contactSharedAt) {
      items.push({
        key: `deal-contact-${details.dealId}`,
        title: "تبادل معلومات التواصل",
        description: "تمت مشاركة بيانات التواصل بين الطرفين.",
        date: details.contactSharedAt,
        tone: "default",
      });
    }

    if (details.closedAt) {
      items.push({
        key: `deal-closed-${details.dealId}`,
        title: "إغلاق الصفقة",
        description: details.closeNote || "تم إغلاق الصفقة.",
        date: details.closedAt,
        tone: "success",
      });
    }

    return items.sort((a: DealTimelineItem, b: DealTimelineItem) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [details]);

  if (isAuthLoading || isLoading) {
    return <div className="page-loading">جارٍ تحميل تفاصيل الصفقة...</div>;
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
        <h2>الصفقة غير موجودة</h2>
        <p>تعذر العثور على الصفقة المطلوبة أو أنك لا تملك صلاحية الوصول إليها.</p>
      </div>
    );
  }

  return (
    <section className="investor-page deal-details-page">
      <DealInfoCard data={details} />
      <DealTimeline items={timeline} />
    </section>
  );
}