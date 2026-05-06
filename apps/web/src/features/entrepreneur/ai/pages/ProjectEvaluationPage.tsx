import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import EvaluationSummaryCard from "../components/EvaluationSummaryCard";
import TopFactorsCard from "../components/TopFactorsCard";
import WarningsCard from "../components/WarningsCard";
import RecommendationsCard from "../components/RecommendationsCard";
import AIExplanationPanel from "../components/AIExplanationPanel";

const AI_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || "http://127.0.0.1:8000";

type QuestionKey =
  | "explain_result"
  | "why_risk"
  | "score_meaning"
  | "top_reasons"
  | "improve_profile";

type ProjectRow = {
  id: string;
  title: string;
  category_id: string | null;
  startup_stage: string | null;
  customer_focus: string | null;
  team_size: number | null;
  founder_motivation: string | null;
  market_size_m: number | null;
  competitors_count: number | null;
  monthly_revenue_sar: number | null;
  funding_stage: string | null;
  capital_seeking_sar: number | null;
  post_money_valuation_sar: number | null;
  exit_strategy: string | null;
};

type CategoryRow = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
};

type ProjectTechnologyRow = {
  technology_id: string;
};

type TechnologyRow = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
};

type EvaluationRow = {
  id: string;
  risk_level: string | null;
  risk_score: number | null;
  class_probabilities: unknown;
  top_contributing_factors: unknown;
  ai_summary: string | null;
  explanation_payload: unknown;
  created_at: string;
};

type ProbabilityItem = {
  label: string;
  value: number;
};

type FactorItem = {
  feature: string;
  explanation: string;
  contributionValue: number | null;
  effectDirection: string | null;
};

type EvaluationViewModel = {
  riskClass: string;
  riskScorePercentage: number;
  predictedRiskScore: number;
  riskScoreNote: string;
  confidenceLevel: string;
  probabilities: ProbabilityItem[];
  advisorySummary: string;
  recommendations: string[];
  warnings: string[];
  topFactors: FactorItem[];
};

type ExplainResponse = {
  risk_class?: string;
  risk_score_percentage?: number;
  predicted_risk_score?: number;
  risk_score_note?: string;
  confidence_level?: string;
  probabilities?: Record<string, number>;
  recommendations?: string[];
  advisory_summary?: string;
  warnings?: string[];
  top_3_reasons?: unknown[];
  top_features_affecting_prediction?: unknown[];
};

type AiRequestBody = {
  Stage: string;
  Category: string;
  Technologies: string;
  CustomerFocus: string;
  TeamSize: number;
  FounderMotivation: string;
  MarketSizeM: number;
  CompetitorsCount: number;
  MonthlyRevenue: number;
  FundingStage: string;
  CapitalSeeking: number;
  PostMoneyValuation: number;
  ExitStrategy: string;
};

function mapRiskLevelToArabic(value: string | null) {
  switch (value) {
    case "low":
      return "منخفضة";
    case "medium":
      return "متوسطة";
    case "high":
      return "مرتفعة";
    default:
      return "غير محددة";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getStringValue(record: Record<string, unknown> | null, key: string) {
  if (!record) {
    return null;
  }

  const value = record[key];
  return typeof value === "string" ? value : null;
}

function getNumberValue(record: Record<string, unknown> | null, key: string) {
  if (!record) {
    return null;
  }

  const value = record[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item: unknown): item is string => typeof item === "string");
}

function parseProbabilities(value: unknown): ProbabilityItem[] {
  const record = asRecord(value);

  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([label, raw]) => {
      const valueNumber = typeof raw === "number" ? raw : Number(raw);
      return {
        label,
        value: Number.isNaN(valueNumber) ? 0 : valueNumber,
      };
    })
    .filter((item) => item.value >= 0);
}

function parseFactors(value: unknown): FactorItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item: unknown) => {
      const record = asRecord(item);

      if (!record) {
        return null;
      }

      const contribution =
        typeof record.contribution_value === "number"
          ? record.contribution_value
          : typeof record.contribution_value === "string"
            ? Number(record.contribution_value)
            : null;

      return {
        feature: typeof record.feature === "string" ? record.feature : "عامل غير محدد",
        explanation:
          typeof record.explanation === "string" ? record.explanation : "لا يوجد شرح إضافي.",
        contributionValue: contribution !== null && !Number.isNaN(contribution) ? contribution : null,
        effectDirection:
          typeof record.effect_direction === "string" ? record.effect_direction : null,
      };
    })
    .filter((item): item is FactorItem => Boolean(item));
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

function mapCustomerFocusToModel(value: string | null) {
  if (value === "b2b") {
    return "B2B";
  }

  return "B2C";
}

function mapStageToModel(value: string | null) {
  if (value === "idea") {
    return "Idea";
  }

  return "MVP/Seed";
}

function mapFounderMotivationToModel(value: string | null) {
  switch (value) {
    case "low":
      return "Low";
    case "high":
      return "High";
    default:
      return "Medium";
  }
}

function mapFundingStageToModel(value: string | null) {
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

function buildEvaluationFromSaved(row: EvaluationRow): EvaluationViewModel {
  const payload = asRecord(row.explanation_payload);

  const riskClass =
    getStringValue(payload, "risk_class") || mapRiskLevelToArabic(row.risk_level);

  const riskScorePercentage =
    getNumberValue(payload, "risk_score_percentage") ??
    (typeof row.risk_score === "number" ? row.risk_score * 100 : 0);

  const predictedRiskScore =
    getNumberValue(payload, "predicted_risk_score") ??
    (typeof row.risk_score === "number" ? row.risk_score : 0);

  const riskScoreNote =
    getStringValue(payload, "risk_score_note") ||
    "درجة المخاطر هي درجة معيارية للمقارنة بين الحالات، وليست حكمًا نهائيًا.";

  const confidenceLevel =
    getStringValue(payload, "confidence_level") || "غير متوفرة";

  const advisorySummary =
    getStringValue(payload, "advisory_summary") ||
    row.ai_summary ||
    "لا يوجد ملخص محفوظ.";

  const recommendations = getStringArray(payload?.recommendations);
  const warnings = getStringArray(payload?.warnings);

  const factors =
    parseFactors(payload?.top_3_reasons) ||
    parseFactors(payload?.top_features_affecting_prediction);

  const parsedFactors = factors.length
    ? factors
    : parseFactors(row.top_contributing_factors);

  const probabilities = parseProbabilities(payload?.probabilities ?? row.class_probabilities);

  return {
    riskClass,
    riskScorePercentage,
    predictedRiskScore,
    riskScoreNote,
    confidenceLevel,
    probabilities,
    advisorySummary,
    recommendations,
    warnings,
    topFactors: parsedFactors,
  };
}

function buildEvaluationFromExplain(response: ExplainResponse): EvaluationViewModel {
  const topFactors = response.top_features_affecting_prediction?.length
    ? parseFactors(response.top_features_affecting_prediction)
    : parseFactors(response.top_3_reasons);

  return {
    riskClass: response.risk_class || "غير محددة",
    riskScorePercentage: typeof response.risk_score_percentage === "number" ? response.risk_score_percentage : 0,
    predictedRiskScore: typeof response.predicted_risk_score === "number" ? response.predicted_risk_score : 0,
    riskScoreNote:
      response.risk_score_note ||
      "درجة المخاطر هي درجة معيارية للمقارنة بين الحالات، وليست حكمًا نهائيًا.",
    confidenceLevel: response.confidence_level || "غير متوفرة",
    probabilities: parseProbabilities(response.probabilities),
    advisorySummary: response.advisory_summary || "لا يوجد ملخص.",
    recommendations: response.recommendations ?? [],
    warnings: response.warnings ?? [],
    topFactors,
  };
}

function buildAnswer(model: EvaluationViewModel, question: QuestionKey) {
  switch (question) {
    case "explain_result":
      return model.advisorySummary;

    case "why_risk":
      return `التصنيف الحالي هو ${model.riskClass}، والسبب الأوضح يظهر في العوامل الأعلى تأثيرًا مثل:\n• ${model.topFactors
        .slice(0, 3)
        .map((item) => `${item.feature}: ${item.explanation}`)
        .join("\n• ")}`;

    case "score_meaning":
      return `السكور الحالي هو ${model.riskScorePercentage.toFixed(
        2
      )}%، بينما الدرجة الخام هي ${model.predictedRiskScore.toFixed(4)}.\n${model.riskScoreNote}`;

    case "top_reasons":
      return model.topFactors.length
        ? `أكثر الأسباب تأثيرًا على النتيجة هي:\n• ${model.topFactors
            .slice(0, 5)
            .map((item) => `${item.feature}: ${item.explanation}`)
            .join("\n• ")}`
        : "لا توجد أسباب تفصيلية محفوظة حالياً.";

    case "improve_profile":
      return model.recommendations.length
        ? `لتحسين الملف قبل عرضه:\n• ${model.recommendations.join("\n• ")}`
        : "لا توجد توصيات محفوظة حالياً.";

    default:
      return "";
  }
}

export default function ProjectEvaluationPage() {
  const { appUser, isLoading } = useAuthUser();
  const { projectId } = useParams();

  const [projectTitle, setProjectTitle] = useState("");
  const [savedEvaluation, setSavedEvaluation] = useState<EvaluationViewModel | null>(null);
  const [aiInput, setAiInput] = useState<AiRequestBody | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<QuestionKey | null>(null);
  const [explanationAnswer, setExplanationAnswer] = useState("");
  const [explanationError, setExplanationError] = useState("");
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [fetchedExplainModel, setFetchedExplainModel] = useState<EvaluationViewModel | null>(null);

  const effectiveModel = useMemo(() => {
    return savedEvaluation;
  }, [savedEvaluation]);

  useEffect(() => {
    async function loadEvaluationPage() {
      if (!appUser || appUser.role !== "entrepreneur" || !projectId) {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const [
          projectResponse,
          projectTechnologiesResponse,
          evaluationResponse,
        ] = await Promise.all([
          supabase
            .from("projects")
            .select(
              "id,title,category_id,startup_stage,customer_focus,team_size,founder_motivation,market_size_m,competitors_count,monthly_revenue_sar,funding_stage,capital_seeking_sar,post_money_valuation_sar,exit_strategy"
            )
            .eq("id", projectId)
            .eq("entrepreneur_id", appUser.id)
            .single(),
          supabase.from("project_technologies").select("technology_id").eq("project_id", projectId),
          supabase
            .from("project_ai_evaluations")
            .select(
              "id,risk_level,risk_score,class_probabilities,top_contributing_factors,ai_summary,explanation_payload,created_at"
            )
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (projectResponse.error) {
          throw projectResponse.error;
        }

        const project = projectResponse.data as ProjectRow;
        setProjectTitle(project.title);

        const projectTechnologies = (projectTechnologiesResponse.data ?? []) as ProjectTechnologyRow[];

        let categoryLabel = "AI";
        let technologyLabels: string[] = [];

        if (project.category_id) {
          const { data: categoryData } = await supabase
            .from("project_categories")
            .select("id,name_ar,name_en")
            .eq("id", project.category_id)
            .maybeSingle();

          const categoryRow = (categoryData ?? null) as CategoryRow | null;
          categoryLabel =
            categoryRow?.name_ar?.trim() || categoryRow?.name_en?.trim() || "AI";
        }

        const technologyIds = projectTechnologies.map((item) => item.technology_id);

        if (technologyIds.length) {
          const { data: technologyData } = await supabase
            .from("technologies")
            .select("id,name_ar,name_en")
            .in("id", technologyIds);

          technologyLabels = ((technologyData ?? []) as TechnologyRow[]).map(
            (item) => item.name_ar?.trim() || item.name_en?.trim() || "AI"
          );
        }

        const inputBody: AiRequestBody = {
          Stage: mapStageToModel(project.startup_stage),
          Category: mapCategoryToModel(categoryLabel),
          Technologies: mapTechnologiesToModel(technologyLabels),
          CustomerFocus: mapCustomerFocusToModel(project.customer_focus),
          TeamSize: project.team_size ?? 1,
          FounderMotivation: mapFounderMotivationToModel(project.founder_motivation),
          MarketSizeM: project.market_size_m ?? 0,
          CompetitorsCount: project.competitors_count ?? 0,
          MonthlyRevenue: project.monthly_revenue_sar ?? 0,
          FundingStage: mapFundingStageToModel(project.funding_stage),
          CapitalSeeking: project.capital_seeking_sar ?? 0,
          PostMoneyValuation: project.post_money_valuation_sar ?? 0,
          ExitStrategy: project.exit_strategy?.trim() || "Acquisition",
        };

        setAiInput(inputBody);

        const evaluationRow = (evaluationResponse.data ?? null) as EvaluationRow | null;
        setSavedEvaluation(evaluationRow ? buildEvaluationFromSaved(evaluationRow) : null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل صفحة التقييم.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadEvaluationPage();
  }, [appUser, projectId]);

  async function handleAsk(question: QuestionKey) {
    if (!aiInput) {
      return;
    }

    try {
      setActiveQuestion(question);
      setExplanationError("");
      setIsExplanationLoading(true);

      let model = fetchedExplainModel;

      if (!model) {
        const response = await fetch(`${AI_BASE_URL}/explain`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(aiInput),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "تعذر تنفيذ الشرح الذكي.");
        }

        const raw = (await response.json()) as ExplainResponse;
        model = buildEvaluationFromExplain(raw);
        setFetchedExplainModel(model);
      }

      setExplanationAnswer(buildAnswer(model, question));
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر توليد الشرح الذكي.";
      setExplanationError(message);
    } finally {
      setIsExplanationLoading(false);
    }
  }

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل التقييم الذكي...</div>
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

  if (errorMessage) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">{errorMessage}</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-page entrepreneur-ai-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">تقييم المشروع الذكي</h1>
          <p className="entrepreneur-page__subtitle">
            قراءة تفصيلية تساعدك على فهم وضع المشروع قبل عرضه على المستثمرين.
          </p>
          <p className="entrepreneur-page__microtitle">{projectTitle}</p>
        </div>

        <div className="entrepreneur-page__header-actions">
          <Link to={`/entrepreneur/projects/${projectId}`} className="btn btn--ghost">
            تفاصيل المشروع
          </Link>
          <Link to={`/entrepreneur/projects/${projectId}/edit`} className="btn btn--ghost">
            تعديل المشروع
          </Link>
          <Link to={`/entrepreneur/projects/${projectId}/simulation`} className="btn btn--primary">
            صفحة المحاكاة
          </Link>
        </div>
      </div>

      {!effectiveModel ? (
        <section className="entrepreneur-ai-card">
          <div className="entrepreneur-empty-mini">
            لا يوجد تقييم محفوظ لهذا المشروع حتى الآن. افتح صفحة التعديل ثم استخدم خيار إعادة التحليل.
          </div>
        </section>
      ) : (
        <>
          <EvaluationSummaryCard
            riskClass={effectiveModel.riskClass}
            riskScorePercentage={effectiveModel.riskScorePercentage}
            predictedRiskScore={effectiveModel.predictedRiskScore}
            confidenceLevel={effectiveModel.confidenceLevel}
            advisorySummary={effectiveModel.advisorySummary}
            probabilities={effectiveModel.probabilities}
          />

          <div className="entrepreneur-ai-two-columns">
            <TopFactorsCard factors={effectiveModel.topFactors} />
            <AIExplanationPanel
              activeQuestion={activeQuestion}
              answer={explanationAnswer}
              isLoading={isExplanationLoading}
              errorMessage={explanationError}
              onAsk={handleAsk}
            />
          </div>

          <div className="entrepreneur-ai-two-columns">
            <RecommendationsCard recommendations={effectiveModel.recommendations} />
            <WarningsCard warnings={effectiveModel.warnings} />
          </div>
        </>
      )}
    </section>
  );
}