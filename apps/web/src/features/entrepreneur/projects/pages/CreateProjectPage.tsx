import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import ProjectForm, {
  type ProjectCategoryOption,
  type ProjectFormValues,
  type ProjectTechnologyOption,
} from "../components/ProjectForm";
import ProjectFilesUploader, {
  type PendingProjectFile,
  type ProjectFileType,
} from "../components/ProjectFilesUploader";
import ProjectAIPreviewCard, {
  type ProjectAIPreview,
  type ProjectAIPreviewReason,
} from "../components/ProjectAIPreviewCard";

type CreateMode = "draft" | "submit";

type CategoryRow = {
  id: string;
  name_ar: string;
  name_en: string;
};

type TechnologyRow = {
  id: string;
  name_ar: string;
  name_en: string;
};

type AIModelReason = {
  feature?: string;
  feature_value?: string | number | null;
  contribution_value?: string | number | null;
  effect_direction?: string | null;
  explanation?: string | null;
};

type AIModelResponse = {
  risk_class?: string;
  risk_score_percentage?: number;
  predicted_risk_score?: number;
  confidence_level?: string;
  probabilities?: Record<string, number>;
  recommendations?: string[];
  advisory_summary?: string;
  warnings?: string[];
  model_version?: string;
  generated_at?: string;
  top_3_reasons?: AIModelReason[];
  top_features_affecting_prediction?: AIModelReason[];
  [key: string]: unknown;
};

const PROJECT_FILES_BUCKET = "project-files";

const initialValues: ProjectFormValues = {
  title: "",
  companyName: "",
  shortPitch: "",
  categoryId: "",
  startupStage: "idea",
  confidenceLevel: "concept",
  customerFocus: "b2b",
  teamSize: "1",
  founderMotivation: "medium",
  marketSizeM: "0",
  competitorsCount: "0",
  monthlyRevenueSar: "0",
  capitalSeekingSar: "0",
  postMoneyValuationSar: "0",
  fundingStage: "bootstrapped",
  problemDescription: "",
  solutionDescription: "",
  differentiation: "",
  traction: "",
  risks: "",
  exitStrategy: "Acquisition",
  technologyIds: [],
};

function sanitizeFileName(name: string) {
  return name.replace(/\s+/g, "-").replace(/[^\w.-]/g, "");
}

function normalizeValue(value: string) {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

function mapStageToAi(value: ProjectFormValues["startupStage"]) {
  return value === "idea" ? "Idea" : "MVP/Seed";
}

function mapCustomerFocusToAi(value: ProjectFormValues["customerFocus"]) {
  if (value === "b2b" || value === "b2g") {
    return "B2B";
  }

  return "B2C";
}

function mapFounderMotivationToAi(value: ProjectFormValues["founderMotivation"]) {
  if (value === "low") {
    return "Low";
  }

  if (value === "high") {
    return "High";
  }

  return "Medium";
}

function mapFundingStageToAi(value: ProjectFormValues["fundingStage"]) {
  switch (value) {
    case "friends_family":
      return "Friends & Family";
    case "pre_seed":
      return "Pre-Seed";
    case "seed":
      return "Seed";
    default:
      return "Bootstrapped";
  }
}

function mapCategoryToAi(category: ProjectCategoryOption | undefined) {
  const raw = normalizeValue(category?.nameEn || category?.nameAr || "");

  const map: Record<string, string> = {
    fintech: "Fintech",
    healthtech: "HealthTech",
    edtech: "EdTech",
    saas: "SaaS",
    ai: "AI",
    artificialintelligence: "AI",
    cybersecurity: "Cybersecurity",
    cybersecuritysolutions: "Cybersecurity",
    cybersec: "Cybersecurity",
    data: "Data",
    dataplatform: "Data",
    ecommerce: "E-commerce",
    التجارةالإلكترونية: "E-commerce",
    التجارةالالكترونية: "E-commerce",
  };

  return map[raw] || category?.nameEn || "Fintech";
}

function mapTechnologyToAi(technologies: ProjectTechnologyOption[]) {
  const map: Record<string, string> = {
    api: "API",
    ai: "AI",
    automation: "Automation",
    cloud: "Cloud",
    dataanalytics: "Data Analytics",
    analytics: "Data Analytics",
    mobile: "Mobile",
  };

  for (const item of technologies) {
    const raw = normalizeValue(item.nameEn || item.nameAr);
    if (map[raw]) {
      return map[raw];
    }
  }

  return "API";
}

function mapRiskLevelToDb(value: string | undefined) {
  if (value?.includes("منخفض")) {
    return "low";
  }

  if (value?.includes("مرتفع")) {
    return "high";
  }

  return "medium";
}

function formatAiErrorMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "detail" in payload &&
    Array.isArray((payload as { detail?: unknown }).detail)
  ) {
    return (payload as { detail: Array<{ msg?: string; loc?: Array<string | number> }> }).detail
      .map((item) => {
        const path = Array.isArray(item.loc) ? item.loc.join(" > ") : "body";
        return `${path}: ${item.msg || "خطأ في البيانات"}`;
      })
      .join(" | ");
  }

  return "تعذر تنفيذ التقييم الذكي حالياً.";
}

function buildAiPreview(response: AIModelResponse): ProjectAIPreview {
  const reasonsSource = response.top_3_reasons ?? response.top_features_affecting_prediction ?? [];

  const topReasons: ProjectAIPreviewReason[] = reasonsSource.map((item) => ({
    feature: item.feature || "عامل غير معروف",
    feature_value: item.feature_value ?? null,
    contribution_value: item.contribution_value ?? null,
    effect_direction: item.effect_direction ?? null,
    explanation: item.explanation ?? null,
  }));

  return {
    riskClass: response.risk_class || "غير معروف",
    riskScorePercentage: Number(response.risk_score_percentage ?? 0),
    predictedRiskScore: Number(response.predicted_risk_score ?? 0),
    confidenceLevel: response.confidence_level || "غير معروف",
    advisorySummary: response.advisory_summary || "لا يوجد ملخص متاح حالياً.",
    recommendations: Array.isArray(response.recommendations) ? response.recommendations : [],
    warnings: Array.isArray(response.warnings) ? response.warnings : [],
    probabilities: response.probabilities || {},
    topReasons,
    modelVersion: response.model_version || "غير معروف",
    rawPayload: response as Record<string, unknown>,
  };
}

function validateValues(values: ProjectFormValues) {
  if (!values.title.trim()) {
    return "أدخل عنوان المشروع.";
  }

  if (!values.companyName.trim()) {
    return "أدخل اسم الشركة أو الجهة.";
  }

  if (!values.shortPitch.trim()) {
    return "أدخل الوصف المختصر.";
  }

  if (!values.categoryId) {
    return "اختر تصنيف المشروع.";
  }

  if (values.technologyIds.length === 0) {
    return "اختر تقنية واحدة على الأقل.";
  }

  if (!values.problemDescription.trim()) {
    return "أدخل وصف المشكلة.";
  }

  if (!values.solutionDescription.trim()) {
    return "أدخل وصف الحل.";
  }

  if (!values.differentiation.trim()) {
    return "أدخل عوامل التميّز.";
  }

  if (!values.traction.trim()) {
    return "أدخل معلومات الـ traction.";
  }

  if (!values.risks.trim()) {
    return "أدخل المخاطر الحالية.";
  }

  const numericFields = [
    { label: "حجم الفريق", value: values.teamSize },
    { label: "حجم السوق", value: values.marketSizeM },
    { label: "عدد المنافسين", value: values.competitorsCount },
    { label: "الإيراد الشهري", value: values.monthlyRevenueSar },
    { label: "رأس المال المطلوب", value: values.capitalSeekingSar },
    { label: "التقييم بعد الاستثمار", value: values.postMoneyValuationSar },
  ];

  for (const field of numericFields) {
    if (field.value.trim() === "" || Number.isNaN(Number(field.value))) {
      return `قيمة غير صحيحة في حقل: ${field.label}`;
    }
  }

  return "";
}

export default function CreateProjectPage() {
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [categories, setCategories] = useState<ProjectCategoryOption[]>([]);
  const [technologies, setTechnologies] = useState<ProjectTechnologyOption[]>([]);
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [files, setFiles] = useState<PendingProjectFile[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [aiErrorMessage, setAiErrorMessage] = useState("");
  const [aiPreview, setAiPreview] = useState<ProjectAIPreview | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === values.categoryId),
    [categories, values.categoryId]
  );

  const selectedTechnologies = useMemo(
    () => technologies.filter((item) => values.technologyIds.includes(item.id)),
    [technologies, values.technologyIds]
  );

  useEffect(() => {
    async function loadReferenceData() {
      try {
        setIsLoadingPage(true);
        setErrorMessage("");

        const [categoriesResponse, technologiesResponse] = await Promise.all([
          supabase
            .from("project_categories")
            .select("id, name_ar, name_en")
            .eq("is_active", true)
            .order("name_ar", { ascending: true }),
          supabase
            .from("technologies")
            .select("id, name_ar, name_en")
            .eq("is_active", true)
            .order("name_ar", { ascending: true }),
        ]);

        if (categoriesResponse.error) {
          throw new Error(categoriesResponse.error.message);
        }

        if (technologiesResponse.error) {
          throw new Error(technologiesResponse.error.message);
        }

        const categoryRows = (categoriesResponse.data ?? []) as CategoryRow[];
        const technologyRows = (technologiesResponse.data ?? []) as TechnologyRow[];

        setCategories(
          categoryRows.map((item) => ({
            id: item.id,
            nameAr: item.name_ar,
            nameEn: item.name_en,
          }))
        );

        setTechnologies(
          technologyRows.map((item) => ({
            id: item.id,
            nameAr: item.name_ar,
            nameEn: item.name_en,
          }))
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "تعذر تحميل بيانات إنشاء المشروع."
        );
      } finally {
        setIsLoadingPage(false);
      }
    }

    void loadReferenceData();
  }, []);

  function handleChange(field: keyof Omit<ProjectFormValues, "technologyIds">, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleToggleTechnology(technologyId: string) {
    setValues((current) => {
      const exists = current.technologyIds.includes(technologyId);

      return {
        ...current,
        technologyIds: exists
          ? current.technologyIds.filter((item) => item !== technologyId)
          : [...current.technologyIds, technologyId],
      };
    });
  }

  function handleAddFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files;

    if (!selected || selected.length === 0) {
      return;
    }

    const nextFiles: PendingProjectFile[] = Array.from(selected).map((file) => ({
      localId: crypto.randomUUID(),
      file,
      fileType: "other",
    }));

    setFiles((current) => [...current, ...nextFiles]);
    event.target.value = "";
  }

  function handleRemoveFile(localId: string) {
    setFiles((current) => current.filter((item) => item.localId !== localId));
  }

  function handleChangeFileType(localId: string, fileType: ProjectFileType) {
    setFiles((current) =>
      current.map((item) => (item.localId === localId ? { ...item, fileType } : item))
    );
  }

  async function runAiPrediction(projectId: string) {
    const AI_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || "http://127.0.0.1:8000";

    const payload = {
      Stage: mapStageToAi(values.startupStage),
      Category: mapCategoryToAi(selectedCategory),
      Technologies: mapTechnologyToAi(selectedTechnologies),
      CustomerFocus: mapCustomerFocusToAi(values.customerFocus),
      TeamSize: Number(values.teamSize),
      FounderMotivation: mapFounderMotivationToAi(values.founderMotivation),
      MarketSizeM: Number(values.marketSizeM),
      CompetitorsCount: Number(values.competitorsCount),
      MonthlyRevenue: Number(values.monthlyRevenueSar),
      FundingStage: mapFundingStageToAi(values.fundingStage),
      CapitalSeeking: Number(values.capitalSeekingSar),
      PostMoneyValuation: Number(values.postMoneyValuationSar),
      ExitStrategy: values.exitStrategy || "Acquisition",
    };

    const response = await fetch(`${AI_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseBody = (await response.json()) as AIModelResponse | { detail?: unknown };

    if (!response.ok) {
      throw new Error(formatAiErrorMessage(responseBody));
    }

    const aiResponse = responseBody as AIModelResponse;
    const preview = buildAiPreview(aiResponse);

    const { error: evaluationError } = await supabase.from("project_ai_evaluations").insert({
      project_id: projectId,
      model_name: "predict",
      model_version: aiResponse.model_version || "unknown",
      risk_level: mapRiskLevelToDb(aiResponse.risk_class),
      risk_score: Number(aiResponse.predicted_risk_score ?? 0),
      class_probabilities: aiResponse.probabilities || {},
      top_contributing_factors:
        aiResponse.top_3_reasons ?? aiResponse.top_features_affecting_prediction ?? [],
      ai_summary: aiResponse.advisory_summary || "",
      explanation_payload: aiResponse,
    });

    if (evaluationError) {
      throw new Error(evaluationError.message);
    }

    setAiPreview(preview);
  }

  async function uploadProjectFiles(projectId: string) {
    for (let index = 0; index < files.length; index += 1) {
      const item = files[index];
      const safeFileName = sanitizeFileName(item.file.name);
      const storagePath = `${appUser?.id}/${projectId}/${Date.now()}-${index}-${safeFileName}`;

      const uploadResponse = await supabase.storage
        .from(PROJECT_FILES_BUCKET)
        .upload(storagePath, item.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: item.file.type,
        });

      if (uploadResponse.error) {
        throw new Error(uploadResponse.error.message);
      }

      const fileInsertResponse = await supabase.from("project_files").insert({
        project_id: projectId,
        uploaded_by: appUser?.id,
        file_type: item.fileType,
        bucket_name: PROJECT_FILES_BUCKET,
        storage_path: storagePath,
        file_name: item.file.name,
        mime_type: item.file.type || "application/octet-stream",
        file_size: item.file.size,
      });

      if (fileInsertResponse.error) {
        throw new Error(fileInsertResponse.error.message);
      }
    }
  }

  async function handleCreateProject(mode: CreateMode) {
    if (!appUser) {
      setErrorMessage("تعذر العثور على المستخدم الحالي.");
      return;
    }

    const validationMessage = validateValues(values);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setAiErrorMessage("");
      setAiPreview(null);
      setCreatedProjectId("");
      setIsSubmitting(true);

      const approvalStatus = mode === "submit" ? "under_review" : "draft";
      const now = new Date().toISOString();

      const projectInsertResponse = await supabase
        .from("projects")
        .insert({
          entrepreneur_id: appUser.id,
          title: values.title.trim(),
          company_name: values.companyName.trim(),
          short_pitch: values.shortPitch.trim(),
          category_id: values.categoryId,
          startup_stage: values.startupStage,
          confidence_level: values.confidenceLevel,
          customer_focus: values.customerFocus,
          team_size: Number(values.teamSize),
          founder_motivation: values.founderMotivation,
          market_size_m: Number(values.marketSizeM),
          competitors_count: Number(values.competitorsCount),
          monthly_revenue_sar: Number(values.monthlyRevenueSar),
          capital_seeking_sar: Number(values.capitalSeekingSar),
          post_money_valuation_sar: Number(values.postMoneyValuationSar),
          funding_stage: values.fundingStage,
          problem_description: values.problemDescription.trim(),
          solution_description: values.solutionDescription.trim(),
          differentiation: values.differentiation.trim(),
          traction: values.traction.trim(),
          risks: values.risks.trim(),
          exit_strategy: values.exitStrategy.trim(),
          approval_status: approvalStatus,
          publication_status: "private",
          investment_status: "open",
          submitted_at: mode === "submit" ? now : null,
        })
        .select("id")
        .single();

      if (projectInsertResponse.error || !projectInsertResponse.data) {
        throw new Error(projectInsertResponse.error?.message || "تعذر إنشاء المشروع.");
      }

      const projectId = projectInsertResponse.data.id;
      setCreatedProjectId(projectId);

      if (values.technologyIds.length > 0) {
        const technologyRows = values.technologyIds.map((technologyId) => ({
          project_id: projectId,
          technology_id: technologyId,
        }));

        const technologyInsertResponse = await supabase
          .from("project_technologies")
          .insert(technologyRows);

        if (technologyInsertResponse.error) {
          throw new Error(technologyInsertResponse.error.message);
        }
      }

      if (files.length > 0) {
        await uploadProjectFiles(projectId);
      }

      const actionInsertResponse = await supabase.from("project_actions").insert({
        project_id: projectId,
        actor_id: appUser.id,
        action_type: mode === "submit" ? "submitted" : "saved",
        note:
          mode === "submit"
            ? "تم إنشاء المشروع وإرساله إلى مراجعة الإدارة."
            : "تم حفظ المشروع كمسودة.",
        metadata: {
          files_count: files.length,
          technologies_count: values.technologyIds.length,
          approval_status: approvalStatus,
        },
      });

      if (actionInsertResponse.error) {
        throw new Error(actionInsertResponse.error.message);
      }

      try {
        setIsEvaluatingAi(true);
        await runAiPrediction(projectId);
      } catch (aiError) {
        setAiErrorMessage(
          aiError instanceof Error ? aiError.message : "تعذر تنفيذ التقييم الذكي حالياً."
        );
      } finally {
        setIsEvaluatingAi(false);
      }

      setSuccessMessage(
        mode === "submit"
          ? "تم إنشاء المشروع وإرساله للمراجعة بنجاح."
          : "تم حفظ المشروع كمسودة بنجاح."
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "تعذر إنشاء المشروع حالياً.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || isLoadingPage) {
    return <div className="panel-loading-screen">جاري تجهيز صفحة إنشاء المشروع...</div>;
  }

  if (!appUser) {
    return <div className="panel-error-box">تعذر العثور على المستخدم الحالي.</div>;
  }

  return (
    <section className="create-project-page">
      <div className="panel-page-heading">
        <div>
          <h2 className="panel-page-heading__title">إنشاء مشروع جديد</h2>
          <p className="panel-page-heading__subtitle">
            أدخل بيانات المشروع، وأرسلها للمراجعة مع معاينة ذكية أولية من المودل.
          </p>
        </div>
      </div>

      {errorMessage ? <div className="project-create-error">{errorMessage}</div> : null}
      {successMessage ? <div className="project-create-success">{successMessage}</div> : null}

      {createdProjectId ? (
        <div className="project-create-links">
          <Link to={`/entrepreneur/projects/${createdProjectId}`} className="project-create-link-btn">
            عرض تفاصيل المشروع
          </Link>
          <Link to="/entrepreneur/projects" className="project-create-link-btn project-create-link-btn--ghost">
            الذهاب إلى مشاريعي
          </Link>
        </div>
      ) : null}

      <div className="create-project-layout">
        <div className="create-project-layout__main">
          <ProjectForm
            values={values}
            categories={categories}
            technologies={technologies}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            onToggleTechnology={handleToggleTechnology}
            onSaveDraft={() => void handleCreateProject("draft")}
            onSubmitProject={() => void handleCreateProject("submit")}
          />

          <ProjectFilesUploader
            files={files}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onChangeFileType={handleChangeFileType}
          />
        </div>

        <div className="create-project-layout__side">
          <ProjectAIPreviewCard
            preview={aiPreview}
            isLoading={isEvaluatingAi}
            errorMessage={aiErrorMessage}
          />
        </div>
      </div>
    </section>
  );
}