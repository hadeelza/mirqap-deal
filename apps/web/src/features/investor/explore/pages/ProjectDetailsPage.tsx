import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import { supabase } from "../../../../lib/supabase/client";
import {
  explainProjectAI,
  type AIBaseStartupPayload,
  type AIExplainResponse,
  type AITopReason,
} from "../../../../lib/api/ai-api/explain.api";
import {
  simulateProjectWhatIf,
  type AISimulationResponse,
} from "../../../../lib/api/ai-api/simulate.api";
import ProjectHeroCard from "../components/ProjectHeroCard";
import ProjectBusinessInfoSection from "../components/ProjectBusinessInfoSection";
import ProjectFilesSection from "../components/ProjectFilesSection";
import ProjectAISummaryCard from "../components/ProjectAISummaryCard";
import ProjectRiskCard from "../components/ProjectRiskCard";
import TopReasonsCard from "../components/TopReasonsCard";
import ProjectWarningsCard from "../components/ProjectWarningsCard";
import AIExplanationPanel from "../components/AIExplanationPanel";
import WhatIfSimulationDrawer from "../components/WhatIfSimulationDrawer";
import InterestedButton from "../components/InterestedButton";
import SubmitOfferButton from "../components/SubmitOfferButton";

type ExplanationIntent =
  | "summary"
  | "why_risk"
  | "score_meaning"
  | "top_reasons"
  | "compare_simulation";

interface ProjectRow {
  id: string;
  entrepreneur_id: string | null;
  title: string;
  company_name: string | null;
  short_pitch: string | null;
  category_id: string | null;
  startup_stage: string | null;
  confidence_level: string | null;
  customer_focus: string | null;
  team_size: number | null;
  founder_motivation: string | null;
  market_size_m: number | string | null;
  competitors_count: number | null;
  monthly_revenue_sar: number | string | null;
  capital_seeking_sar: number | string | null;
  post_money_valuation_sar: number | string | null;
  funding_stage: string | null;
  problem_description: string | null;
  solution_description: string | null;
  differentiation: string | null;
  traction: string | null;
  risks: string | null;
  exit_strategy: string | null;
  approval_status: string | null;
  investment_status:string | null;
  publication_status: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CategoryRow {
  id: string;
  name_ar: string | null;
  name_en: string | null;
}

interface ProjectTechnologyRow {
  technology_id: string | null;
}

interface TechnologyRow {
  id: string;
  name_ar: string | null;
  name_en: string | null;
}

interface ProjectFileRow {
  id: string;
  file_type: string | null;
  bucket_name: string | null;
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
}

interface EvaluationRow {
  id: string;
  project_id: string | null;
  risk_level: string | null;
  risk_score: number | string | null;
  class_probabilities: unknown;
  top_contributing_factors: unknown;
  ai_summary: string | null;
  explanation_payload: unknown;
  model_name: string | null;
  model_version: string | null;
  created_at: string | null;
}

interface FileViewItem {
  id: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number | null;
  url: string;
}

interface TopReasonViewItem {
  feature: string;
  featureValue: string;
  contributionValue: string;
  effectDirection: string;
  explanation: string;
}

interface AIInsightView {
  riskClass: string;
  riskScorePercentage: number | null;
  predictedRiskScore: number | null;
  confidenceLevel: string;
  probabilities: Array<{ label: string; value: number }>;
  aiSummary: string;
  advisorySummary: string;
  recommendations: string[];
  warnings: string[];
  topReasons: TopReasonViewItem[];
  modelVersion: string;
  generatedAt: string;
  riskScoreNote: string;
  disclaimer: string;
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { appUser, isLoading } = useAuthUser();

  const [project, setProject] = useState<ProjectRow | null>(null);
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [technologyNamesAr, setTechnologyNamesAr] = useState<string[]>([]);
  const [technologyNamesEn, setTechnologyNamesEn] = useState<string[]>([]);
  const [files, setFiles] = useState<FileViewItem[]>([]);
  const [storedEvaluation, setStoredEvaluation] = useState<EvaluationRow | null>(null);
  const [isInterested, setIsInterested] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [liveExplainResponse, setLiveExplainResponse] = useState<AIExplainResponse | null>(null);
  const [isExplainLoading, setIsExplainLoading] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<ExplanationIntent>("summary");
  const [explanationContent, setExplanationContent] = useState("");

  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResponse, setSimulationResponse] = useState<AISimulationResponse | null>(null);
  const [simulationError, setSimulationError] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!projectId) {
        setPageError("معرف المشروع غير موجود.");
        setPageLoading(false);
        return;
      }

      try {
        setPageError("");
        setPageLoading(true);

        const projectResponse = await supabase
          .from("projects")
          .select(
            "id, entrepreneur_id, title, company_name, short_pitch, category_id, startup_stage, confidence_level, customer_focus, team_size, founder_motivation, market_size_m, competitors_count, monthly_revenue_sar, capital_seeking_sar, post_money_valuation_sar, funding_stage, problem_description, solution_description, differentiation, traction, risks, exit_strategy, approval_status, publication_status, published_at, created_at, updated_at"
          )
          .eq("id", projectId)
          .maybeSingle();

        if (projectResponse.error) {
          throw projectResponse.error;
        }

        const fetchedProject = (projectResponse.data ?? null) as ProjectRow | null;

        if (!fetchedProject) {
          throw new Error("المشروع غير موجود.");
        }

        const [
          categoryResponse,
          projectTechnologiesResponse,
          projectFilesResponse,
          evaluationResponse,
          interestResponse,
        ] = await Promise.all([
          fetchedProject.category_id
            ? supabase
                .from("project_categories")
                .select("id, name_ar, name_en")
                .eq("id", fetchedProject.category_id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          supabase
            .from("project_technologies")
            .select("technology_id")
            .eq("project_id", projectId),
          supabase
            .from("project_files")
            .select("id, file_type, bucket_name, storage_path, file_name, mime_type, file_size")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false }),
          supabase
            .from("project_ai_evaluations")
            .select(
              "id, project_id, risk_level, risk_score, class_probabilities, top_contributing_factors, ai_summary, explanation_payload, model_name, model_version, created_at"
            )
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          appUser?.id
            ? supabase
                .from("investor_project_interests")
                .select("id")
                .eq("investor_id", appUser.id)
                .eq("project_id", projectId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        if (categoryResponse.error) {
          throw categoryResponse.error;
        }

        if (projectTechnologiesResponse.error) {
          throw projectTechnologiesResponse.error;
        }

        if (projectFilesResponse.error) {
          throw projectFilesResponse.error;
        }

        if (evaluationResponse.error) {
          throw evaluationResponse.error;
        }

        if (interestResponse.error) {
          throw interestResponse.error;
        }

        const projectTechnologyRows = (projectTechnologiesResponse.data ??
          []) as ProjectTechnologyRow[];

        const technologyIds = projectTechnologyRows
          .map((item: ProjectTechnologyRow) => item.technology_id)
          .filter((value): value is string => Boolean(value));

        let technologyRows: TechnologyRow[] = [];

        if (technologyIds.length > 0) {
          const technologiesResponse = await supabase
            .from("technologies")
            .select("id, name_ar, name_en")
            .in("id", technologyIds);

          if (technologiesResponse.error) {
            throw technologiesResponse.error;
          }

          technologyRows = (technologiesResponse.data ?? []) as TechnologyRow[];
        }

        const fileRows = (projectFilesResponse.data ?? []) as ProjectFileRow[];
        const preparedFiles = await Promise.all(
          fileRows.map(async (file: ProjectFileRow): Promise<FileViewItem> => {
            const url = await resolveStorageFileUrl(
              file.bucket_name ?? "",
              file.storage_path ?? ""
            );

            return {
              id: file.id,
              fileName: file.file_name ?? "ملف",
              fileType: mapFileTypeLabel(file.file_type ?? ""),
              mimeType: file.mime_type ?? "",
              fileSize: file.file_size ?? null,
              url,
            };
          })
        );

        setProject(fetchedProject);
        setCategory((categoryResponse.data ?? null) as CategoryRow | null);
        setTechnologyNamesAr(
          technologyRows
            .map((item: TechnologyRow) => item.name_ar ?? "")
            .filter((value: string) => Boolean(value))
        );
        setTechnologyNamesEn(
          technologyRows
            .map((item: TechnologyRow) => item.name_en ?? item.name_ar ?? "")
            .filter((value: string) => Boolean(value))
        );
        setFiles(preparedFiles);
        setStoredEvaluation((evaluationResponse.data ?? null) as EvaluationRow | null);
        setIsInterested(Boolean(interestResponse.data));

        const evaluationData = (evaluationResponse.data ?? null) as EvaluationRow | null;

        if (!evaluationData) {
          const explainPayload = buildAIBaseStartupPayload(
            fetchedProject,
            (categoryResponse.data ?? null) as CategoryRow | null,
            technologyRows
          );

          if (explainPayload) {
            setIsExplainLoading(true);
            const explainResponse = await explainProjectAI(explainPayload);
            setLiveExplainResponse(explainResponse);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "تعذر تحميل تفاصيل المشروع.";
        setPageError(errorMessage);
      } finally {
        setPageLoading(false);
        setIsExplainLoading(false);
      }
    }

    void loadPage();
  }, [projectId, appUser?.id]);

  const aiInsight = useMemo<AIInsightView | null>(() => {
    if (storedEvaluation) {
      return buildAIInsightFromStoredEvaluation(storedEvaluation);
    }

    if (liveExplainResponse) {
      return buildAIInsightFromExplainResponse(liveExplainResponse);
    }

    return null;
  }, [storedEvaluation, liveExplainResponse]);

  useEffect(() => {
    if (!aiInsight) {
      setExplanationContent("لا توجد بيانات AI متاحة حالياً.");
      return;
    }

    setExplanationContent(aiInsight.advisorySummary || aiInsight.aiSummary);
  }, [aiInsight]);

  async function handleExplanationIntent(intent: ExplanationIntent) {
    setSelectedIntent(intent);

    if (!project) {
      return;
    }

    if (intent === "compare_simulation") {
      if (!simulationResponse) {
        setExplanationContent("شغّل المحاكاة أولاً حتى تتم المقارنة بين قبل وبعد.");
        return;
      }

      setExplanationContent(buildCompareExplanation(simulationResponse));
      return;
    }

    try {
      setIsExplainLoading(true);

      let explainData = liveExplainResponse;

      if (!explainData) {
        const payload = buildAIBaseStartupPayload(
          project,
          category,
          technologyNamesEn.map((item: string) => ({ id: "", name_en: item, name_ar: item }))
        );

        if (!payload) {
          throw new Error("تعذر تجهيز مدخلات الشرح الذكي.");
        }

        explainData = await explainProjectAI(payload);
        setLiveExplainResponse(explainData);
      }

      setExplanationContent(buildControlledExplanation(intent, explainData));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "تعذر توليد الشرح حالياً.";
      setExplanationContent(errorMessage);
    } finally {
      setIsExplainLoading(false);
    }
  }

  async function handleSimulationSubmit(payload: {
    TeamSize?: number;
    MonthlyRevenue?: number;
    FundingStage?: string;
  }) {
    if (!project) {
      return;
    }

    try {
      setSimulationError("");
      setIsSimulating(true);

      const basePayload = buildAIBaseStartupPayload(
        project,
        category,
        technologyNamesEn.map((item: string) => ({ id: "", name_en: item, name_ar: item }))
      );

      if (!basePayload) {
        throw new Error("تعذر تجهيز بيانات المحاكاة.");
      }

      const response = await simulateProjectWhatIf({
        base_startup: basePayload,
        changed_fields: payload,
        top_n: 3,
      });

      setSimulationResponse(response);
      setSelectedIntent("compare_simulation");
      setExplanationContent(buildCompareExplanation(response));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "تعذر تنفيذ المحاكاة.";
      setSimulationError(errorMessage);
    } finally {
      setIsSimulating(false);
    }
  }

  if (isLoading || pageLoading) {
    return (
      <section className="project-details-page">
        <div className="project-empty-box">جاري تحميل تفاصيل المشروع...</div>
      </section>
    );
  }

  if (pageError) {
    return (
      <section className="project-details-page">
        <div className="project-empty-box project-empty-box--error">{pageError}</div>
      </section>
    );
  }

  if (!project || !appUser) {
    return (
      <section className="project-details-page">
        <div className="project-empty-box project-empty-box--error">
          تعذر الوصول إلى بيانات المشروع.
        </div>
      </section>
    );
  }

  return (
    <section className="project-details-page">
      <div className="project-details-back-link">
        <Link to="/investor/explore">العودة إلى المشاريع</Link>
      </div>

      <ProjectHeroCard
        title={project.title}
        companyName={project.company_name ?? ""}
        shortPitch={project.short_pitch ?? ""}
        categoryName={category?.name_ar ?? "غير مصنف"}
        startupStage={mapStartupStageLabel(project.startup_stage)}
        confidenceLevel={mapProjectConfidenceLabel(project.confidence_level)}
        investmentStatus={mapInvestmentStatusLabel(project.investment_status)}
        capitalSeekingSar={toNumberOrNull(project.capital_seeking_sar)}
        actions={
          <>
            <InterestedButton
              investorId={appUser.id}
              projectId={project.id}
              initialInterested={isInterested}
              onChanged={setIsInterested}
            />
            <SubmitOfferButton projectId={project.id} />
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setIsSimulationOpen(true)}
            >
              تشغيل محاكاة What-If
            </button>
          </>
        }
      />

      <div className="project-details-main-grid">
        <div className="project-details-main-grid__primary">
          <ProjectBusinessInfoSection
            problemDescription={project.problem_description ?? ""}
            solutionDescription={project.solution_description ?? ""}
            differentiation={project.differentiation ?? ""}
            traction={project.traction ?? ""}
            risks={project.risks ?? ""}
            exitStrategy={project.exit_strategy ?? ""}
            customerFocus={mapCustomerFocusLabel(project.customer_focus)}
            founderMotivation={mapFounderMotivationLabel(project.founder_motivation)}
            fundingStage={mapFundingStageLabel(project.funding_stage)}
            teamSize={project.team_size ?? null}
            marketSizeM={toNumberOrNull(project.market_size_m)}
            competitorsCount={project.competitors_count ?? null}
            monthlyRevenueSar={toNumberOrNull(project.monthly_revenue_sar)}
            postMoneyValuationSar={toNumberOrNull(project.post_money_valuation_sar)}
            technologies={technologyNamesAr}
          />

          <ProjectFilesSection files={files} />

          <AIExplanationPanel
            selectedIntent={selectedIntent}
            onSelect={handleExplanationIntent}
            content={explanationContent}
            isLoading={isExplainLoading}
            hasSimulation={Boolean(simulationResponse)}
          />
        </div>

        <div className="project-details-main-grid__secondary">
          <ProjectAISummaryCard
            aiSummary={aiInsight?.aiSummary ?? "لا توجد بيانات AI محفوظة حالياً."}
            advisorySummary={aiInsight?.advisorySummary ?? ""}
            modelVersion={aiInsight?.modelVersion ?? ""}
            generatedAt={aiInsight?.generatedAt ?? ""}
          />

          <ProjectRiskCard
            riskClass={aiInsight?.riskClass ?? "غير متوفر"}
            riskScorePercentage={aiInsight?.riskScorePercentage ?? null}
            predictedRiskScore={aiInsight?.predictedRiskScore ?? null}
            confidenceLevel={aiInsight?.confidenceLevel ?? "غير متوفر"}
            riskScoreNote={aiInsight?.riskScoreNote ?? ""}
            probabilities={aiInsight?.probabilities ?? []}
          />

          <TopReasonsCard reasons={aiInsight?.topReasons ?? []} />

          <ProjectWarningsCard
            warnings={simulationResponse?.warnings ?? aiInsight?.warnings ?? []}
            recommendations={
              simulationResponse?.recommendations ?? aiInsight?.recommendations ?? []
            }
            disclaimer={simulationResponse?.disclaimer ?? aiInsight?.disclaimer ?? ""}
          />
        </div>
      </div>

      <WhatIfSimulationDrawer
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        initialTeamSize={project.team_size ?? 1}
        initialMonthlyRevenue={toNumberOrNull(project.monthly_revenue_sar) ?? 0}
        initialFundingStage={mapFundingStageApiValue(project.funding_stage)}
        onSubmit={handleSimulationSubmit}
        isSubmitting={isSimulating}
        result={simulationResponse}
        errorMessage={simulationError}
      />
    </section>
  );
}

function buildAIInsightFromStoredEvaluation(evaluation: EvaluationRow): AIInsightView {
  const payload = isRecord(evaluation.explanation_payload) ? evaluation.explanation_payload : {};
  const riskClass =
    getString(payload.risk_class) || mapRiskLevelArabic(evaluation.risk_level);
  const predictedRiskScore = toNumberOrNull(
    payload.predicted_risk_score ?? evaluation.risk_score
  );
  const riskScorePercentage =
    toNumberOrNull(payload.risk_score_percentage) ??
    (predictedRiskScore !== null ? predictedRiskScore * 100 : null);

  const probabilities = normalizeProbabilities(
    payload.probabilities ?? evaluation.class_probabilities
  );

  const confidenceLevel =
    getString(payload.confidence_level) || deriveConfidenceLevel(probabilities);

  const topReasonsSource =
    getArray(payload.top_3_reasons) ||
    getArray(payload.top_features_affecting_prediction) ||
    getArray(evaluation.top_contributing_factors) ||
    [];

  return {
    riskClass,
    riskScorePercentage,
    predictedRiskScore,
    confidenceLevel,
    probabilities,
    aiSummary: evaluation.ai_summary ?? "",
    advisorySummary: getString(payload.advisory_summary),
    recommendations: getStringArray(payload.recommendations),
    warnings: getStringArray(payload.warnings),
    topReasons: topReasonsSource.map(mapTopReasonToView),
    modelVersion: getString(payload.model_version) || evaluation.model_version || "",
    generatedAt: formatDateTime(getString(payload.generated_at) || evaluation.created_at || ""),
    riskScoreNote: getString(payload.risk_score_note),
    disclaimer: getString(payload.disclaimer),
  };
}

function buildAIInsightFromExplainResponse(response: AIExplainResponse): AIInsightView {
  const reasons = response.top_features_affecting_prediction ?? response.top_3_reasons ?? [];

  return {
    riskClass: response.risk_class,
    riskScorePercentage: toNumberOrNull(response.risk_score_percentage),
    predictedRiskScore: toNumberOrNull(response.predicted_risk_score),
    confidenceLevel: response.confidence_level,
    probabilities: normalizeProbabilities(response.probabilities),
    aiSummary: response.advisory_summary,
    advisorySummary: response.advisory_summary,
    recommendations: response.recommendations ?? [],
    warnings: response.warnings ?? [],
    topReasons: reasons.map(mapTopReasonToView),
    modelVersion: response.model_version ?? "",
    generatedAt: formatDateTime(response.generated_at ?? ""),
    riskScoreNote: response.risk_score_note ?? "",
    disclaimer: "",
  };
}

function buildControlledExplanation(
  intent: ExplanationIntent,
  response: AIExplainResponse
): string {
  const reasons = response.top_features_affecting_prediction ?? response.top_3_reasons ?? [];

  if (intent === "summary") {
    return response.advisory_summary || "لا يوجد شرح مختصر متاح.";
  }

  if (intent === "why_risk") {
    const topReason = reasons[0];
    const reasonText = topReason
      ? `أبرز عامل ظاهر في النتيجة هو "${topReason.feature}"، وشرحه: ${topReason.explanation}`
      : "لا توجد أسباب تفسيرية كافية.";
    return `تصنيف المخاطر الحالي هو ${response.risk_class} بدرجة ${response.risk_score_percentage.toFixed(
      2
    )}% وبثقة ${response.confidence_level}. ${reasonText}`;
  }

  if (intent === "score_meaning") {
    return response.risk_score_note || "السكور يمثل قراءة معيارية من النموذج للمقارنة بين الحالات المختلفة.";
  }

  if (intent === "top_reasons") {
    if (!reasons.length) {
      return "لا توجد أسباب رئيسية متاحة حالياً.";
    }

    return reasons
      .slice(0, 3)
      .map(
        (item, index) =>
          `${index + 1}) ${item.feature}: ${item.explanation || "لا يوجد شرح إضافي."}`
      )
      .join(" ");
  }

  return response.advisory_summary || "";
}

function buildCompareExplanation(response: AISimulationResponse): string {
  const beforeScore = response.before.risk_score_percentage.toFixed(2);
  const afterScore = response.after.risk_score_percentage.toFixed(2);

  return `${response.summary} قبل التعديل كان التصنيف ${response.before.risk_class} بدرجة ${beforeScore}%، وبعد التعديل أصبح ${response.after.risk_class} بدرجة ${afterScore}%. ${response.deep_explanation ?? response.detailed_explanation ?? response.advisory_summary ?? ""}`;
}

function buildAIBaseStartupPayload(
    project: ProjectRow,
    category: CategoryRow | null,
    technologies: Array<{ name_en?: string | null; name_ar?: string | null }>
  ): AIBaseStartupPayload | null {
    const categoryName = mapCategoryApiValue(category?.name_en ?? category?.name_ar ?? "");
    const technologyName = mapTechnologyApiValue(technologies);
    const exitStrategy = mapExitStrategyApiValue(project.exit_strategy);
  
    return {
      Stage: mapStartupStageApiValue(project.startup_stage),
      Category: categoryName,
      Technologies: technologyName,
      CustomerFocus: mapCustomerFocusApiValue(project.customer_focus),
      TeamSize: project.team_size ?? 1,
      FounderMotivation: mapFounderMotivationApiValue(project.founder_motivation),
      MarketSizeM: toNumberOrNull(project.market_size_m) ?? 0,
      CompetitorsCount: project.competitors_count ?? 0,
      MonthlyRevenue: toNumberOrNull(project.monthly_revenue_sar) ?? 0,
      FundingStage: mapFundingStageApiValue(project.funding_stage),
      CapitalSeeking: toNumberOrNull(project.capital_seeking_sar) ?? 0,
      PostMoneyValuation: toNumberOrNull(project.post_money_valuation_sar) ?? 0,
      ExitStrategy: exitStrategy,
    };
  }
  
function mapTopReasonToView(item: unknown): TopReasonViewItem {
  if (!isRecord(item)) {
    return {
      feature: "غير متوفر",
      featureValue: "—",
      contributionValue: "—",
      effectDirection: "—",
      explanation: "",
    };
  }

  return {
    feature: getString(item.feature) || "غير متوفر",
    featureValue: String(item.feature_value ?? "—"),
    contributionValue: String(item.contribution_value ?? "—"),
    effectDirection: mapEffectDirection(getString(item.effect_direction)),
    explanation: getString(item.explanation),
  };
}

function normalizeProbabilities(
  value: unknown
): Array<{ label: string; value: number }> {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .map(([key, rawValue]): { label: string; value: number } | null => {
      const numericValue = toNumberOrNull(rawValue);

      if (numericValue === null) {
        return null;
      }

      return {
        label: key,
        value: numericValue,
      };
    })
    .filter((item): item is { label: string; value: number } => Boolean(item));
}

function deriveConfidenceLevel(
  probabilities: Array<{ label: string; value: number }>
): string {
  if (!probabilities.length) {
    return "غير متوفر";
  }

  const maxValue = Math.max(...probabilities.map((item) => item.value));

  if (maxValue >= 0.7) {
    return "عالية";
  }

  if (maxValue >= 0.45) {
    return "متوسطة";
  }

  return "منخفضة";
}

function mapFileTypeLabel(value: string): string {
  if (value === "pitch_deck") return "Pitch Deck";
  if (value === "business_plan") return "Business Plan";
  if (value === "financials") return "Financials";
  if (value === "prototype") return "Prototype";
  if (value === "legal") return "Legal";
  return "Other";
}

function mapRiskLevelArabic(value: string | null): string {
  if (value === "low") return "منخفضة";
  if (value === "medium") return "متوسطة";
  if (value === "high") return "مرتفعة";
  return "غير متوفر";
}

function mapStartupStageLabel(value: string | null): string {
  if (value === "idea") return "Idea";
  if (value === "mvp_seed") return "MVP / Seed";
  return "مرحلة غير محددة";
}

function mapProjectConfidenceLabel(value: string | null): string {
  if (value === "concept") return "Concept";
  if (value === "prototype") return "Prototype";
  if (value === "mvp") return "MVP";
  if (value === "early_market") return "Early Market";
  return "Confidence غير محدد";
}

function mapInvestmentStatusLabel(value: string | null): string {
  if (value === "open") return "Open";
  if (value === "in_negotiation") return "In Negotiation";
  if (value === "funded") return "Funded";
  if (value === "closed") return "Closed";
  return "حالة غير محددة";
}

function mapCustomerFocusLabel(value: string | null): string {
  if (value === "b2b") return "B2B";
  if (value === "b2c") return "B2C";
  if (value === "b2g") return "B2G";
  if (value === "marketplace") return "Marketplace";
  if (value === "other") return "Other";
  return "غير محدد";
}

function mapFounderMotivationLabel(value: string | null): string {
  if (value === "low") return "Low";
  if (value === "medium") return "Medium";
  if (value === "high") return "High";
  return "غير محدد";
}

function mapFundingStageLabel(value: string | null): string {
  if (value === "bootstrapped") return "Bootstrapped";
  if (value === "friends_family") return "Friends & Family";
  if (value === "pre_seed") return "Pre-Seed";
  if (value === "seed") return "Seed";
  return "غير محدد";
}


  function mapCategoryApiValue(value: string): string {
    const normalized = value.trim().toLowerCase();
  
    if (normalized.includes("fintech") || normalized.includes("تقنية مالية")) return "Fintech";
    if (normalized.includes("health") || normalized.includes("صحي")) return "Healthtech";
    if (normalized.includes("education") || normalized.includes("تعليم")) return "Edtech";
    if (normalized.includes("ecommerce") || normalized.includes("commerce") || normalized.includes("تجارة")) return "E-commerce";
    if (normalized.includes("logistics") || normalized.includes("لوجست")) return "Logistics";
    if (normalized.includes("software") || normalized.includes("saas")) return "SaaS";
  
    return "Fintech";
  }
  
  function mapTechnologyApiValue(
    technologies: Array<{ name_en?: string | null; name_ar?: string | null }>
  ): string {
    const names = technologies
      .map((item) => (item.name_en ?? item.name_ar ?? "").trim().toLowerCase())
      .filter(Boolean);
  
    if (names.some((item) => item.includes("api"))) return "API";
    if (names.some((item) => item.includes("ai") || item.includes("ml") || item.includes("ذكاء"))) return "AI";
    if (names.some((item) => item.includes("blockchain"))) return "Blockchain";
    if (names.some((item) => item.includes("iot"))) return "IoT";
    if (names.some((item) => item.includes("cloud"))) return "Cloud";
    if (names.some((item) => item.includes("mobile"))) return "Mobile App";
  
    return "API";
  }
  
  function mapStartupStageApiValue(value: string | null): string {
    if (value === "idea") return "Idea";
    if (value === "mvp_seed") return "MVP/Seed";
    return "Idea";
  }
  
  function mapCustomerFocusApiValue(value: string | null): "B2B" | "B2C" {
    const normalized = (value ?? "").trim().toLowerCase();
  
    if (normalized === "b2b") {
      return "B2B";
    }
  
    if (normalized === "b2c") {
      return "B2C";
    }
  
    if (normalized === "b2g") {
      return "B2B";
    }
  
    if (normalized === "marketplace") {
      return "B2C";
    }
  
    if (normalized === "other") {
      return "B2B";
    }
  
    return "B2B";
  }
  
  function mapFounderMotivationApiValue(value: string | null): string {
    if (value === "low") return "Low";
    if (value === "medium") return "Medium";
    if (value === "high") return "High";
    return "Medium";
  }
  
  function mapFundingStageApiValue(value: string | null): string {
    if (value === "bootstrapped") return "Bootstrapped";
    if (value === "friends_family") return "Friends & Family";
    if (value === "pre_seed") return "Pre-Seed";
    if (value === "seed") return "Seed";
    return "Bootstrapped";
  }
  
  function mapExitStrategyApiValue(value: string | null): string {
    const normalized = (value ?? "").trim().toLowerCase();
  
    if (
      normalized.includes("acquisition") ||
      normalized.includes("استحواذ")
    ) {
      return "Acquisition";
    }
  
    if (
      normalized.includes("ipo") ||
      normalized.includes("طرح")
    ) {
      return "IPO";
    }
  
    if (
      normalized.includes("merger") ||
      normalized.includes("اندماج")
    ) {
      return "Merger";
    }
  
    return "Acquisition";
  }

function mapEffectDirection(value: string): string {
  if (value === "increases_prediction") return "يرفع المخاطر";
  if (value === "decreases_prediction") return "يخفض المخاطر";
  return value || "—";
}

function formatDateTime(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ar-SA");
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function getArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function resolveStorageFileUrl(
  bucketName: string,
  storagePath: string
): Promise<string> {
  if (!bucketName || !storagePath) {
    return "#";
  }

  const signedUrlResponse = await supabase.storage
    .from(bucketName)
    .createSignedUrl(storagePath, 60 * 60);

  if (!signedUrlResponse.error && signedUrlResponse.data?.signedUrl) {
    return signedUrlResponse.data.signedUrl;
  }

  const publicUrlResponse = supabase.storage.from(bucketName).getPublicUrl(storagePath);

  return publicUrlResponse.data.publicUrl || "#";
}