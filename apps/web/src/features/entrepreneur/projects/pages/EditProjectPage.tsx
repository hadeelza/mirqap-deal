import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import EditProjectForm, { type EditProjectFormValues } from "../components/EditProjectForm";
import EditProjectFilesSection, { type ExistingProjectFile } from "../components/EditProjectFilesSection";

const PROJECT_FILES_BUCKET = "project-files";
const AI_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || "http://127.0.0.1:8000";

type CategoryOption = {
  id: string;
  label: string;
};

type TechnologyOption = {
  id: string;
  label: string;
};

type ProjectRow = {
  id: string;
  entrepreneur_id: string;
  title: string;
  company_name: string | null;
  short_pitch: string | null;
  category_id: string | null;
  startup_stage: string | null;
  confidence_level: string | null;
  customer_focus: string | null;
  team_size: number | null;
  founder_motivation: string | null;
  market_size_m: number | null;
  competitors_count: number | null;
  monthly_revenue_sar: number | null;
  capital_seeking_sar: number | null;
  post_money_valuation_sar: number | null;
  funding_stage: string | null;
  problem_description: string | null;
  solution_description: string | null;
  differentiation: string | null;
  traction: string | null;
  risks: string | null;
  exit_strategy: string | null;
  approval_status: string;
};

type CategoryRow = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
};

type TechnologyRow = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
};

type ProjectTechnologyLinkRow = {
  technology_id: string;
};

type ProjectFileRow = {
  id: string;
  file_name: string;
  file_type: string;
  bucket_name: string | null;
  storage_path: string | null;
};

type PredictResponse = {
  risk_class?: string;
  predicted_risk_score?: number;
  probabilities?: Record<string, number>;
  advisory_summary?: string;
  top_3_reasons?: unknown[];
  confidence_level?: string;
  warnings?: string[];
  recommendations?: string[];
};

const initialValues: EditProjectFormValues = {
  title: "",
  companyName: "",
  shortPitch: "",
  categoryId: "",
  startupStage: "idea",
  confidenceLevel: "concept",
  customerFocus: "b2b",
  teamSize: "1",
  founderMotivation: "medium",
  marketSizeM: "",
  competitorsCount: "",
  monthlyRevenueSar: "",
  capitalSeekingSar: "",
  postMoneyValuationSar: "",
  fundingStage: "bootstrapped",
  problemDescription: "",
  solutionDescription: "",
  differentiation: "",
  traction: "",
  risks: "",
  exitStrategy: "",
  selectedTechnologyIds: [],
};

function toNullableNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function inferFileType(fileName: string) {
  const lower = fileName.toLowerCase();

  if (lower.includes("pitch")) {
    return "pitch_deck";
  }

  if (lower.includes("business")) {
    return "business_plan";
  }

  if (lower.includes("financial")) {
    return "financials";
  }

  if (lower.includes("legal")) {
    return "legal";
  }

  if (lower.includes("prototype")) {
    return "prototype";
  }

  return "other";
}

function mapCategoryToModel(label: string) {
  const normalized = label.trim().toLowerCase();

  if (normalized.includes("fintech") || normalized.includes("تقنية مالية")) {
    return "Fintech";
  }

  if (normalized.includes("health") || normalized.includes("صحي")) {
    return "HealthTech";
  }

  if (normalized.includes("education") || normalized.includes("edtech") || normalized.includes("تعليم")) {
    return "EdTech";
  }

  if (normalized.includes("saas")) {
    return "SaaS";
  }

  if (normalized.includes("cyber") || normalized.includes("أمن")) {
    return "Cybersecurity";
  }

  if (normalized.includes("data") || normalized.includes("بيانات")) {
    return "Data";
  }

  if (normalized.includes("commerce") || normalized.includes("تجارة")) {
    return "E-commerce";
  }

  return "AI";
}

function mapTechnologiesToModel(labels: string[]) {
  const mapped = labels.map((label) => {
    const normalized = label.trim().toLowerCase();

    if (normalized.includes("api")) {
      return "API";
    }

    if (normalized.includes("cloud") || normalized.includes("سحابي")) {
      return "Cloud";
    }

    if (normalized.includes("mobile") || normalized.includes("جوال")) {
      return "Mobile";
    }

    if (normalized.includes("automation") || normalized.includes("أتمتة")) {
      return "Automation";
    }

    if (normalized.includes("data") || normalized.includes("analytics") || normalized.includes("تحليل")) {
      return "Data Analytics";
    }

    return "AI";
  });

  const uniqueValues = Array.from(new Set(mapped));
  return uniqueValues[0] || "AI";
}

function mapCustomerFocusToModel(value: string) {
  if (value === "b2b") {
    return "B2B";
  }

  return "B2C";
}

function mapStageToModel(value: string) {
  if (value === "idea") {
    return "Idea";
  }

  return "MVP/Seed";
}

function mapFounderMotivationToModel(value: string) {
  switch (value) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    default:
      return "High";
  }
}

function mapFundingStageToModel(value: string) {
  switch (value) {
    case "friends_family":
      return "Friends/Family";
    case "pre_seed":
      return "Pre-Seed";
    case "seed":
      return "Seed";
    default:
      return "Bootstrapped";
  }
}

function mapRiskClassToDb(value?: string) {
  if (!value) {
    return "medium";
  }

  if (value.includes("منخفض")) {
    return "low";
  }

  if (value.includes("مرتفع")) {
    return "high";
  }

  return "medium";
}

export default function EditProjectPage() {
  const { appUser, isLoading } = useAuthUser();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState<EditProjectFormValues>(initialValues);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [technologies, setTechnologies] = useState<TechnologyOption[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingProjectFile[]>([]);
  const [filesMarkedForDelete, setFilesMarkedForDelete] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [projectApprovalStatus, setProjectApprovalStatus] = useState<string>("draft");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const categoriesMap = useMemo(() => {
    return new Map<string, string>(categories.map((item) => [item.id, item.label]));
  }, [categories]);

  const technologiesMap = useMemo(() => {
    return new Map<string, string>(technologies.map((item) => [item.id, item.label]));
  }, [technologies]);

  useEffect(() => {
    async function loadPage() {
      if (!appUser || appUser.role !== "entrepreneur" || !projectId) {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const [
          projectResponse,
          categoriesResponse,
          technologiesResponse,
          projectTechnologiesResponse,
          projectFilesResponse,
        ] = await Promise.all([
          supabase
            .from("projects")
            .select(
              "id,entrepreneur_id,title,company_name,short_pitch,category_id,startup_stage,confidence_level,customer_focus,team_size,founder_motivation,market_size_m,competitors_count,monthly_revenue_sar,capital_seeking_sar,post_money_valuation_sar,funding_stage,problem_description,solution_description,differentiation,traction,risks,exit_strategy,approval_status"
            )
            .eq("id", projectId)
            .eq("entrepreneur_id", appUser.id)
            .single(),
          supabase.from("project_categories").select("id,name_ar,name_en").eq("is_active", true).order("name_ar"),
          supabase.from("technologies").select("id,name_ar,name_en").eq("is_active", true).order("name_ar"),
          supabase.from("project_technologies").select("technology_id").eq("project_id", projectId),
          supabase
            .from("project_files")
            .select("id,file_name,file_type,bucket_name,storage_path")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false }),
        ]);

        if (projectResponse.error) {
          throw projectResponse.error;
        }

        const safeProject = projectResponse.data as ProjectRow;
        const categoryRows = (categoriesResponse.data ?? []) as CategoryRow[];
        const technologyRows = (technologiesResponse.data ?? []) as TechnologyRow[];
        const projectTechnologyRows = (projectTechnologiesResponse.data ?? []) as ProjectTechnologyLinkRow[];
        const fileRows = (projectFilesResponse.data ?? []) as ProjectFileRow[];

        const mappedCategories: CategoryOption[] = categoryRows.map((item) => ({
          id: item.id,
          label: item.name_ar?.trim() || item.name_en?.trim() || "تصنيف",
        }));

        const mappedTechnologies: TechnologyOption[] = technologyRows.map((item) => ({
          id: item.id,
          label: item.name_ar?.trim() || item.name_en?.trim() || "تقنية",
        }));

        const mappedFiles: ExistingProjectFile[] = fileRows.map((file) => ({
          id: file.id,
          fileName: file.file_name,
          fileType: file.file_type,
          bucketName: file.bucket_name,
          storagePath: file.storage_path,
          publicUrl:
            file.bucket_name && file.storage_path
              ? supabase.storage.from(file.bucket_name).getPublicUrl(file.storage_path).data.publicUrl
              : null,
        }));

        setCategories(mappedCategories);
        setTechnologies(mappedTechnologies);
        setExistingFiles(mappedFiles);
        setProjectApprovalStatus(safeProject.approval_status);

        setValues({
          title: safeProject.title ?? "",
          companyName: safeProject.company_name ?? "",
          shortPitch: safeProject.short_pitch ?? "",
          categoryId: safeProject.category_id ?? "",
          startupStage: safeProject.startup_stage ?? "idea",
          confidenceLevel: safeProject.confidence_level ?? "concept",
          customerFocus: safeProject.customer_focus ?? "b2b",
          teamSize: safeProject.team_size !== null ? String(safeProject.team_size) : "1",
          founderMotivation: safeProject.founder_motivation ?? "medium",
          marketSizeM: safeProject.market_size_m !== null ? String(safeProject.market_size_m) : "",
          competitorsCount: safeProject.competitors_count !== null ? String(safeProject.competitors_count) : "",
          monthlyRevenueSar: safeProject.monthly_revenue_sar !== null ? String(safeProject.monthly_revenue_sar) : "",
          capitalSeekingSar: safeProject.capital_seeking_sar !== null ? String(safeProject.capital_seeking_sar) : "",
          postMoneyValuationSar:
            safeProject.post_money_valuation_sar !== null ? String(safeProject.post_money_valuation_sar) : "",
          fundingStage: safeProject.funding_stage ?? "bootstrapped",
          problemDescription: safeProject.problem_description ?? "",
          solutionDescription: safeProject.solution_description ?? "",
          differentiation: safeProject.differentiation ?? "",
          traction: safeProject.traction ?? "",
          risks: safeProject.risks ?? "",
          exitStrategy: safeProject.exit_strategy ?? "",
          selectedTechnologyIds: projectTechnologyRows.map((item) => item.technology_id),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل بيانات المشروع.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadPage();
  }, [appUser, projectId]);

  function handleChange<K extends keyof EditProjectFormValues>(
    field: K,
    value: EditProjectFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleToggleTechnology(technologyId: string) {
    setValues((current) => {
      const exists = current.selectedTechnologyIds.includes(technologyId);

      return {
        ...current,
        selectedTechnologyIds: exists
          ? current.selectedTechnologyIds.filter((item) => item !== technologyId)
          : [...current.selectedTechnologyIds, technologyId],
      };
    });
  }

  function handleToggleRemoveExisting(fileId: string) {
    setFilesMarkedForDelete((current) =>
      current.includes(fileId)
        ? current.filter((item) => item !== fileId)
        : [...current, fileId]
    );
  }

  function handleAddFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    setNewFiles((current) => [...current, ...Array.from(files)]);
  }

  function handleRemoveNewFile(index: number) {
    setNewFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveProject(options?: { rerunAI?: boolean; resubmit?: boolean }) {
    if (!appUser || !projectId) {
      return;
    }

    if (!values.title.trim() || !values.companyName.trim() || !values.categoryId) {
      setErrorMessage("أكمل الحقول الأساسية المطلوبة أولاً.");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSubmitting(true);

      const now = new Date().toISOString();

      const updatePayload = {
        title: values.title.trim(),
        company_name: values.companyName.trim(),
        short_pitch: values.shortPitch.trim(),
        category_id: values.categoryId,
        startup_stage: values.startupStage,
        confidence_level: values.confidenceLevel,
        customer_focus: values.customerFocus,
        team_size: Number(values.teamSize),
        founder_motivation: values.founderMotivation,
        market_size_m: toNullableNumber(values.marketSizeM),
        competitors_count: toNullableNumber(values.competitorsCount),
        monthly_revenue_sar: toNullableNumber(values.monthlyRevenueSar),
        capital_seeking_sar: toNullableNumber(values.capitalSeekingSar),
        post_money_valuation_sar: toNullableNumber(values.postMoneyValuationSar),
        funding_stage: values.fundingStage,
        problem_description: values.problemDescription.trim(),
        solution_description: values.solutionDescription.trim(),
        differentiation: values.differentiation.trim(),
        traction: values.traction.trim(),
        risks: values.risks.trim(),
        exit_strategy: values.exitStrategy.trim(),
        approval_status: options?.resubmit ? "under_review" : projectApprovalStatus,
        submitted_at: options?.resubmit ? now : undefined,
        updated_at: now,
      };

      const { error: updateError } = await supabase
        .from("projects")
        .update(updatePayload)
        .eq("id", projectId)
        .eq("entrepreneur_id", appUser.id);

      if (updateError) {
        throw updateError;
      }

      const { error: deleteTechError } = await supabase
        .from("project_technologies")
        .delete()
        .eq("project_id", projectId);

      if (deleteTechError) {
        throw deleteTechError;
      }

      if (values.selectedTechnologyIds.length) {
        const { error: insertTechError } = await supabase.from("project_technologies").insert(
          values.selectedTechnologyIds.map((technologyId) => ({
            project_id: projectId,
            technology_id: technologyId,
          }))
        );

        if (insertTechError) {
          throw insertTechError;
        }
      }

      if (filesMarkedForDelete.length) {
        const filesToDelete = existingFiles.filter((file) => filesMarkedForDelete.includes(file.id));

        for (const file of filesToDelete) {
          if (file.bucketName && file.storagePath) {
            await supabase.storage.from(file.bucketName).remove([file.storagePath]);
          }
        }

        const { error: deleteFilesError } = await supabase
          .from("project_files")
          .delete()
          .in("id", filesMarkedForDelete);

        if (deleteFilesError) {
          throw deleteFilesError;
        }
      }

      for (const file of newFiles) {
        const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const storagePath = `${appUser.id}/${projectId}/${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(PROJECT_FILES_BUCKET)
          .upload(storagePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { error: insertFileError } = await supabase.from("project_files").insert({
          project_id: projectId,
          uploaded_by: appUser.id,
          file_type: inferFileType(file.name),
          bucket_name: PROJECT_FILES_BUCKET,
          storage_path: storagePath,
          file_name: file.name,
          mime_type: file.type || null,
          file_size: file.size,
          created_at: now,
        });

        if (insertFileError) {
          throw insertFileError;
        }
      }

      if (options?.rerunAI) {
        const categoryLabel = categoriesMap.get(values.categoryId) || "AI";
        const technologyLabels = values.selectedTechnologyIds
          .map((id) => technologiesMap.get(id))
          .filter((value): value is string => Boolean(value));

        const aiPayload = {
          Stage: mapStageToModel(values.startupStage),
          Category: mapCategoryToModel(categoryLabel),
          Technologies: mapTechnologiesToModel(technologyLabels),
          CustomerFocus: mapCustomerFocusToModel(values.customerFocus),
          TeamSize: Number(values.teamSize || 1),
          FounderMotivation: mapFounderMotivationToModel(values.founderMotivation),
          MarketSizeM: Number(values.marketSizeM || 0),
          CompetitorsCount: Number(values.competitorsCount || 0),
          MonthlyRevenue: Number(values.monthlyRevenueSar || 0),
          FundingStage: mapFundingStageToModel(values.fundingStage),
          CapitalSeeking: Number(values.capitalSeekingSar || 0),
          PostMoneyValuation: Number(values.postMoneyValuationSar || 0),
          ExitStrategy: values.exitStrategy.trim() || "Acquisition",
        };

        const response = await fetch(`${AI_BASE_URL}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(aiPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "تعذر تنفيذ التحليل الذكي.");
        }

        const result = (await response.json()) as PredictResponse;

        const { error: evaluationError } = await supabase.from("project_ai_evaluations").insert({
          project_id: projectId,
          model_name: "internal_predict_api",
          model_version: "vc-risk-xgb-v2.3",
          risk_level: mapRiskClassToDb(result.risk_class),
          risk_score: result.predicted_risk_score ?? 0,
          class_probabilities: result.probabilities ?? {},
          top_contributing_factors: result.top_3_reasons ?? [],
          ai_summary: result.advisory_summary ?? "",
          explanation_payload: result,
          created_at: now,
        });

        if (evaluationError) {
          throw evaluationError;
        }
      }

      const actionNotes: string[] = [];
      actionNotes.push("تم تحديث بيانات المشروع");

      if (options?.rerunAI) {
        actionNotes.push("تمت إعادة التحليل الذكي");
      }

      if (options?.resubmit) {
        actionNotes.push("تمت إعادة إرسال المشروع للمراجعة");
      }

      const { error: actionError } = await supabase.from("project_actions").insert({
        project_id: projectId,
        actor_id: appUser.id,
        action_type: options?.resubmit ? "submitted" : "saved",
        note: actionNotes.join(" - "),
        metadata: {
          rerun_ai: Boolean(options?.rerunAI),
          resubmit: Boolean(options?.resubmit),
        },
        created_at: now,
      });

      if (actionError) {
        throw actionError;
      }

      setSuccessMessage(
        options?.rerunAI
          ? "تم حفظ التعديلات وإعادة التحليل بنجاح."
          : options?.resubmit
            ? "تم حفظ التعديلات وإرسال المشروع للمراجعة."
            : "تم حفظ التعديلات بنجاح."
      );

      if (options?.rerunAI) {
        navigate(`/entrepreneur/projects/${projectId}/evaluation`, { replace: true });
        return;
      }

      navigate(`/entrepreneur/projects/${projectId}`, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تحديث المشروع حالياً.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل المشروع...</div>
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
          <h1 className="entrepreneur-page__title">تعديل المشروع</h1>
          <p className="entrepreneur-page__subtitle">
            عدّل بيانات المشروع، أضف أو احذف الملفات، وأعد التحليل عند الحاجة.
          </p>
        </div>
      </div>

      {successMessage ? <div className="entrepreneur-page__success">{successMessage}</div> : null}
      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <EditProjectForm
        values={values}
        categories={categories}
        technologies={technologies}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onToggleTechnology={handleToggleTechnology}
        onSave={async () => saveProject()}
        onSaveAndAnalyze={async () => saveProject({ rerunAI: true })}
        onSaveAndResubmit={async () => saveProject({ rerunAI: true, resubmit: true })}
      />

      <EditProjectFilesSection
        existingFiles={existingFiles}
        filesMarkedForDelete={filesMarkedForDelete}
        newFiles={newFiles}
        onToggleRemoveExisting={handleToggleRemoveExisting}
        onAddFiles={handleAddFiles}
        onRemoveNewFile={handleRemoveNewFile}
      />
    </section>
  );
}