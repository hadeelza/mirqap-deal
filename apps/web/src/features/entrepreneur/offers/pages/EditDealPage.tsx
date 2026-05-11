import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import EditDealForm, { type EditDealFormValues } from "../components/EditDealForm";

type DealRow = {
  id: string;
  project_id: string;
  offer_id: string;
  investor_id: string;
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
};

type ProjectRow = {
  id: string;
  title: string;
};

type UserRow = {
  id: string;
  full_name: string | null;
};

type LoadedDealData = {
  dealId: string;
  offerId: string;
  projectId: string;
  investorId: string;
  projectTitle: string;
  investorName: string;
};

const initialValues: EditDealFormValues = {
  status: "open",
  contactSharedAt: "",
  closeNote: "",
};

function toInputDateTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  if (!value.trim()) {
    return null;
  }

  return new Date(value).toISOString();
}

function buildNotificationBody(status: string, projectTitle: string) {
  switch (status) {
    case "contact_shared":
      return `تم تحديث الصفقة الخاصة بمشروع ${projectTitle} إلى حالة: تم تبادل التواصل.`;
    case "closed":
      return `تم إغلاق الصفقة الخاصة بمشروع ${projectTitle}.`;
    case "cancelled":
      return `تم إلغاء الصفقة الخاصة بمشروع ${projectTitle}.`;
    case "in_progress":
      return `تم تحديث الصفقة الخاصة بمشروع ${projectTitle} إلى حالة: قيد التنفيذ.`;
    default:
      return `تم تحديث الصفقة الخاصة بمشروع ${projectTitle}.`;
  }
}

function buildActionNote(status: string, closeNote: string) {
  const statusText =
    status === "open"
      ? "تم تحديث الصفقة إلى مفتوحة"
      : status === "in_progress"
        ? "تم تحديث الصفقة إلى قيد التنفيذ"
        : status === "contact_shared"
          ? "تم تحديث الصفقة إلى تم تبادل التواصل"
          : status === "closed"
            ? "تم إغلاق الصفقة"
            : "تم إلغاء الصفقة";

  return closeNote.trim() ? `${statusText} - ${closeNote.trim()}` : statusText;
}

export default function EditDealPage() {
  const { appUser, isLoading } = useAuthUser();
  const { dealId } = useParams();

  const [dealData, setDealData] = useState<LoadedDealData | null>(null);
  const [values, setValues] = useState<EditDealFormValues>(initialValues);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadDeal() {
      if (!appUser || appUser.role !== "entrepreneur" || !dealId) {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const { data: dealRow, error: dealError } = await supabase
          .from("deals")
          .select(
            "id,project_id,offer_id,investor_id,entrepreneur_id,status,contact_shared_at,closed_at,close_note,created_at,updated_at"
          )
          .eq("id", dealId)
          .eq("entrepreneur_id", appUser.id)
          .maybeSingle();

        if (dealError) {
          throw dealError;
        }

        if (!dealRow) {
          setDealData(null);
          return;
        }

        const safeDeal = dealRow as DealRow;

        const [{ data: offerRow }, { data: projectRow }, { data: investorRow }] = await Promise.all([
          supabase.from("investment_offers").select("id").eq("id", safeDeal.offer_id).maybeSingle(),
          supabase.from("projects").select("id,title").eq("id", safeDeal.project_id).maybeSingle(),
          supabase.from("users").select("id,full_name").eq("id", safeDeal.investor_id).maybeSingle(),
        ]);

        const safeOffer = (offerRow ?? null) as OfferRow | null;
        const safeProject = (projectRow ?? null) as ProjectRow | null;
        const safeInvestor = (investorRow ?? null) as UserRow | null;

        setDealData({
          dealId: safeDeal.id,
          offerId: safeOffer?.id || safeDeal.offer_id,
          projectId: safeDeal.project_id,
          investorId: safeDeal.investor_id,
          projectTitle: safeProject?.title || "مشروع",
          investorName: safeInvestor?.full_name?.trim() || "مستثمر",
        });

        setValues({
          status: safeDeal.status || "open",
          contactSharedAt: toInputDateTime(safeDeal.contact_shared_at),
          closeNote: safeDeal.close_note || "",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل بيانات الصفقة.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadDeal();
  }, [appUser, dealId]);

  function handleChange<K extends keyof EditDealFormValues>(
    field: K,
    value: EditDealFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveDeal(nextStatus?: "closed" | "cancelled") {
    if (!appUser || !dealData || !dealId) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSubmitting(true);

      const now = new Date().toISOString();
      const finalStatus = nextStatus || values.status;

      let contactSharedAt = toIsoDateTime(values.contactSharedAt);
      if (finalStatus === "contact_shared" && !contactSharedAt) {
        contactSharedAt = now;
      }

      const shouldClose = finalStatus === "closed" || finalStatus === "cancelled";

      const { error: updateDealError } = await supabase
        .from("deals")
        .update({
          status: finalStatus,
          contact_shared_at: contactSharedAt,
          close_note: values.closeNote.trim() || null,
          closed_at: shouldClose ? now : null,
          updated_at: now,
        })
        .eq("id", dealId)
        .eq("entrepreneur_id", appUser.id);

      if (updateDealError) {
        throw updateDealError;
      }

      const actionNote = buildActionNote(finalStatus, values.closeNote);

      const { error: actionError } = await supabase.from("project_actions").insert({
        project_id: dealData.projectId,
        actor_id: appUser.id,
        action_type: "saved",
        note: actionNote,
        metadata: {
          deal_id: dealId,
          offer_id: dealData.offerId,
          deal_status: finalStatus,
          source: "edit_deal_page",
        },
        created_at: now,
      });

      if (actionError) {
        throw actionError;
      }

      const { error: notificationError } = await supabase.from("notifications").insert({
        recipient_id: dealData.investorId,
        type: "system",
        title:
          finalStatus === "closed"
            ? "تم إغلاق الصفقة"
            : finalStatus === "cancelled"
              ? "تم إلغاء الصفقة"
              : "تم تحديث الصفقة",
        body: buildNotificationBody(finalStatus, dealData.projectTitle),
        ref_type: "deal",
        ref_id: dealId,
        is_read: false,
        created_at: now,
      });

      if (notificationError) {
        throw notificationError;
      }

      setValues((current) => ({
        ...current,
        status: finalStatus,
        contactSharedAt:
          finalStatus === "contact_shared" && !current.contactSharedAt
            ? toInputDateTime(now)
            : current.contactSharedAt,
      }));

      setSuccessMessage(
        finalStatus === "closed"
          ? "تم إغلاق الصفقة بنجاح."
          : finalStatus === "cancelled"
            ? "تم إلغاء الصفقة بنجاح."
            : "تم تحديث الصفقة بنجاح."
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تحديث الصفقة.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل الصفقة...</div>
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

  if (!dealData) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">الصفقة غير موجودة.</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">إدارة الصفقة</h1>
          <p className="entrepreneur-page__subtitle">
            حدّث حالة الصفقة وسجل تاريخ التواصل وأضف ملاحظات الإغلاق أو الإلغاء عند الحاجة.
          </p>
        </div>

        <div className="entrepreneur-page__header-actions">
          <Link to={`/entrepreneur/offers/${dealData.offerId}`} className="btn btn--ghost">
            العودة إلى العرض
          </Link>
          <Link to={`/entrepreneur/chats?dealId=${dealData.dealId}`} className="btn btn--ghost">
            فتح المحادثة
          </Link>
        </div>
      </div>

      {successMessage ? <div className="entrepreneur-page__success">{successMessage}</div> : null}
      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <EditDealForm
        dealId={dealData.dealId}
        offerId={dealData.offerId}
        projectTitle={dealData.projectTitle}
        investorName={dealData.investorName}
        values={values}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSave={async () => saveDeal()}
        onCloseDeal={async () => saveDeal("closed")}
        onCancelDeal={async () => saveDeal("cancelled")}
      />
    </section>
  );
}