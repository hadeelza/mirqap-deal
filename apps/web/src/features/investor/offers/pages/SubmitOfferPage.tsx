import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import OfferProjectSummaryCard, {
  type OfferProjectSummary,
} from "../components/OfferProjectSummaryCard";
import SubmitOfferForm, {
  type SubmitOfferFormValues,
} from "../components/SubmitOfferForm";

type CategoryJoin = {
  name_ar: string | null;
  name_en: string | null;
};

type ProjectSummaryRow = {
  id: string;
  entrepreneur_id: string;
  title: string;
  company_name: string | null;
  short_pitch: string | null;
  capital_seeking_sar: number | null;
  post_money_valuation_sar: number | null;
  startup_stage: string | null;
  funding_stage: string | null;
  investment_status: string | null;
  approval_status: string | null;
  publication_status: string | null;
  category_id: string | null;
  project_categories: CategoryJoin | CategoryJoin[] | null;
};

type CreatedOfferResult = {
  id: string;
};

function getCategoryName(category: CategoryJoin | CategoryJoin[] | null): string {
  if (Array.isArray(category)) {
    return category[0]?.name_ar || category[0]?.name_en || "غير محدد";
  }

  return category?.name_ar || category?.name_en || "غير محدد";
}

function buildProjectSummary(project: ProjectSummaryRow): OfferProjectSummary {
  return {
    id: project.id,
    title: project.title,
    companyName: project.company_name,
    shortPitch: project.short_pitch,
    categoryName: getCategoryName(project.project_categories),
    startupStage: project.startup_stage,
    fundingStage: project.funding_stage,
    investmentStatus: project.investment_status,
    capitalSeekingSar: project.capital_seeking_sar,
    postMoneyValuationSar: project.post_money_valuation_sar,
  };
}

function validateOfferValues(values: SubmitOfferFormValues): string {
  if (!values.offerAmount || Number(values.offerAmount) <= 0) {
    return "أدخل مبلغ العرض بشكل صحيح.";
  }

  if (!values.equityPercentage || Number(values.equityPercentage) <= 0) {
    return "أدخل نسبة الملكية بشكل صحيح.";
  }

  if (Number(values.equityPercentage) > 100) {
    return "نسبة الملكية يجب أن تكون بين 0 و 100.";
  }

  if (!values.message.trim()) {
    return "أدخل رسالة العرض.";
  }

  return "";
}

export default function SubmitOfferPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const { appUser, isLoading: isLoadingUser } = useAuthUser();

  const [project, setProject] = useState<ProjectSummaryRow | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [createdOfferId, setCreatedOfferId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formValues, setFormValues] = useState<SubmitOfferFormValues>({
    offerAmount: "",
    equityPercentage: "",
    expectedReturns: "",
    specialConditions: "",
    message: "",
  });

  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setPageError("معرف المشروع غير صالح.");
        setIsLoadingProject(false);
        return;
      }

      setIsLoadingProject(true);
      setPageError("");

      const { data, error } = await supabase
        .from("projects")
        .select(
          `
            id,
            entrepreneur_id,
            title,
            company_name,
            short_pitch,
            capital_seeking_sar,
            post_money_valuation_sar,
            startup_stage,
            funding_stage,
            investment_status,
            approval_status,
            publication_status,
            category_id,
            project_categories (
              name_ar,
              name_en
            )
          `
        )
        .eq("id", projectId)
        .single<ProjectSummaryRow>();

      if (error || !data) {
        setPageError("تعذر تحميل بيانات المشروع.");
        setProject(null);
        setIsLoadingProject(false);
        return;
      }

      setProject(data);
      setIsLoadingProject(false);
    }

    void loadProject();
  }, [projectId]);

  const projectSummary = useMemo(() => {
    if (!project) {
      return null;
    }

    return buildProjectSummary(project);
  }, [project]);

  const isProjectOpenForOffers = useMemo(() => {
    if (!project) {
      return false;
    }

    return (
      project.approval_status === "approved" &&
      project.publication_status === "published" &&
      (project.investment_status === "open" || project.investment_status === "in_negotiation")
    );
  }, [project]);

  async function handleSubmit(values: SubmitOfferFormValues) {
    if (!appUser) {
      setSubmitError("تعذر التحقق من حساب المستثمر الحالي.");
      return;
    }

    if (!project) {
      setSubmitError("بيانات المشروع غير متاحة حالياً.");
      return;
    }

    const validationMessage = validateOfferValues(values);

    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    const offerPayload = {
      project_id: project.id,
      investor_id: appUser.id,
      entrepreneur_id: project.entrepreneur_id,
      offer_amount_sar: Number(values.offerAmount),
      equity_percentage: Number(values.equityPercentage),
      expected_returns: values.expectedReturns.trim() || null,
      special_conditions: values.specialConditions.trim() || null,
      message: values.message.trim(),
      status: "pending",
    };

    const { data: createdOffer, error: offerError } = await supabase
      .from("investment_offers")
      .insert(offerPayload)
      .select("id")
      .single<CreatedOfferResult>();

    if (offerError || !createdOffer) {
      setSubmitError("تعذر إرسال العرض الاستثماري حالياً.");
      setIsSubmitting(false);
      return;
    }

    const notificationPromise = supabase.from("notifications").insert({
      recipient_id: project.entrepreneur_id,
      type: "offer_received",
      title: "عرض استثماري جديد",
      body: `تم استلام عرض استثماري جديد على مشروع ${project.title}.`,
      ref_type: "investment_offer",
      ref_id: createdOffer.id,
      is_read: false,
    });

    const actionPromise = supabase.from("project_actions").insert({
      project_id: project.id,
      actor_id: appUser.id,
      action_type: "offer_sent",
      note: "تم إرسال عرض استثماري جديد من مستثمر.",
      metadata: {
        offer_id: createdOffer.id,
        offer_amount_sar: Number(values.offerAmount),
        equity_percentage: Number(values.equityPercentage),
      },
    });

    const sideEffects = await Promise.allSettled([notificationPromise, actionPromise]);

    const hasSideEffectError = sideEffects.some(
      (result) => result.status === "rejected"
    );

    setCreatedOfferId(createdOffer.id);
    setSubmitSuccess(
      hasSideEffectError
        ? "تم إرسال العرض بنجاح."
        : "تم إرسال العرض الاستثماري بنجاح."
    );

    setIsSubmitting(false);
  }

  if (isLoadingUser || isLoadingProject) {
    return (
      <section className="investor-submit-offer-page">
        <div className="investor-submit-offer-page__state">جاري تحميل الصفحة...</div>
      </section>
    );
  }

  if (pageError) {
    return (
      <section className="investor-submit-offer-page">
        <div className="investor-submit-offer-page__state investor-submit-offer-page__state--error">
          {pageError}
        </div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-submit-offer-page">
        <div className="investor-submit-offer-page__state investor-submit-offer-page__state--error">
          تعذر العثور على المستخدم الحالي.
        </div>
      </section>
    );
  }

  if (!project || !projectSummary) {
    return (
      <section className="investor-submit-offer-page">
        <div className="investor-submit-offer-page__state investor-submit-offer-page__state--error">
          المشروع غير متاح.
        </div>
      </section>
    );
  }

  if (!isProjectOpenForOffers) {
    return (
      <section className="investor-submit-offer-page">
        <div className="investor-submit-offer-page__state investor-submit-offer-page__state--error">
          هذا المشروع غير متاح حالياً لاستقبال العروض الاستثمارية.
        </div>
      </section>
    );
  }

  return (
    <section className="investor-submit-offer-page">
      <div className="investor-submit-offer-page__header">
        <div>
          <span className="investor-page-eyebrow">العروض الاستثمارية</span>
          <h1 className="investor-page-title">إرسال عرض استثماري</h1>
          <p className="investor-page-subtitle">
            قدّم عرضًا رسميًا وواضحًا لصاحب المشروع مع تفاصيل المبلغ ونسبة الملكية والشروط.
          </p>
        </div>

        <div className="investor-submit-offer-page__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate(-1)}
          >
            رجوع
          </button>

          <Link to="/investor/offers" className="btn btn--secondary">
            عروضي
          </Link>
        </div>
      </div>

      {submitSuccess ? (
        <div className="investor-submit-offer-success">
          <h2>تم إرسال العرض بنجاح</h2>
          <p>{submitSuccess}</p>

          <div className="investor-submit-offer-success__actions">
            <Link to="/investor/offers" className="btn btn--primary">
              الذهاب إلى عروضي
            </Link>

            <Link to={`/investor/explore/${project.id}`} className="btn btn--ghost">
              العودة إلى المشروع
            </Link>

            {createdOfferId ? (
              <div className="investor-submit-offer-success__hint">
                رقم العرض: {createdOfferId}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="investor-submit-offer-grid">
          <div className="investor-submit-offer-grid__main">
            <SubmitOfferForm
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              errorMessage={submitError}
            />
          </div>

          <div className="investor-submit-offer-grid__side">
            <OfferProjectSummaryCard project={projectSummary} />
          </div>
        </div>
      )}
    </section>
  );
}