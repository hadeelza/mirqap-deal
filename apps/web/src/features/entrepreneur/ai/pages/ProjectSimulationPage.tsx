import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import SimulationInputForm, {
  type SimulationFormValues,
} from "../components/SimulationInputForm";
import SimulationCompareCard from "../components/SimulationCompareCard";
import SimulationReasonsDiffCard from "../components/SimulationReasonsDiffCard";

const AI_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || "http://127.0.0.1:8000";

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
  project_id: string;
  created_at: string;
};

type ReasonItem = {
  feature: string;
  explanation: string;
  contributionValue: number | null;
  effectDirection: string | null;
};

type SimulationViewModel = {
  summary: string;
  advisorySummary: string;
  deepExplanation: string;
  detailedExplanation: string;
  keyDecisionPoints: string[];
  clientActions: string[];
  disclaimer: string;
  warnings: string[];
  deltaScore: number;
  before: {
    riskClass: string;
    riskScorePercentage: number;
    topReasons: ReasonItem[];
  };
  after: {
    riskClass: string;
    riskScorePercentage: number;
    topReasons: ReasonItem[];
  };
};

type WhatIfResponse = {
  summary?: string;
  advisory_summary?: string;
  deep_explanation?: string;
  detailed_explanation?: string;
  key_decision_points?: string[];
  client_actions?: string[];
  disclaimer?: string;
  warnings?: string[];
  before?: {
    risk_class?: string;
    risk_score_percentage?: number;
    top_reasons?: unknown[];
  };
  after?: {
    risk_class?: string;
    risk_score_percentage?: number;
    top_reasons?: unknown[];
  };
  updated_input?: Record<string, unknown>;
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

const initialForm: SimulationFormValues = {
  teamSize: "",
  monthlyRevenue: "",
  fundingStage: "bootstrapped",
  capitalSeeking: "",
  postMoneyValuation: "",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item: unknown): item is string => typeof item === "string");
}

function parseReasons(value: unknown): ReasonItem[] {
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
    .filter((item): item is ReasonItem => Boolean(item));
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

function mapRiskClassToDb(value: string) {
  if (value.includes("منخفض")) {
    return "low";
  }

  if (value.includes("مرتفع")) {
    return "high";
  }

  return "medium";
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function ProjectSimulationPage() {
  const { appUser, isLoading } = useAuthUser();
  const { projectId } = useParams();

  const [projectTitle, setProjectTitle] = useState("");
  const [formValues, setFormValues] = useState<SimulationFormValues>(initialForm);
  const [baseInput, setBaseInput] = useState<AiRequestBody | null>(null);
  const [latestEvaluationId, setLatestEvaluationId] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationViewModel | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const initialComparableValues = useMemo(() => {
    if (!baseInput) {
      return null;
    }

    return {
      teamSize: String(baseInput.TeamSize),
      monthlyRevenue: String(baseInput.MonthlyRevenue),
      fundingStage:
        formValues.fundingStage || "bootstrapped",
      capitalSeeking: String(baseInput.CapitalSeeking),
      postMoneyValuation: String(baseInput.PostMoneyValuation),
    };
  }, [baseInput, formValues.fundingStage]);

  useEffect(() => {
    async function loadSimulationPage() {
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
          latestEvaluationResponse,
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
            .select("id,project_id,created_at")
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
        const latestEval = (latestEvaluationResponse.data ?? null) as EvaluationRow | null;
        setLatestEvaluationId(latestEval?.id ?? null);

        let categoryLabel = "AI";
        let technologyLabels: string[] = [];

        if (project.category_id) {
          const { data: categoryData } = await supabase
            .from("project_categories")
            .select("id,name_ar,name_en")
            .eq("id", project.category_id)
            .maybeSingle();

          const categoryRow = (categoryData ?? null) as CategoryRow | null;
          categoryLabel = categoryRow?.name_ar?.trim() || categoryRow?.name_en?.trim() || "AI";
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

        const builtBaseInput: AiRequestBody = {
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

        setBaseInput(builtBaseInput);

        setFormValues({
          teamSize: String(project.team_size ?? 1),
          monthlyRevenue: String(project.monthly_revenue_sar ?? 0),
          fundingStage: project.funding_stage ?? "bootstrapped",
          capitalSeeking: String(project.capital_seeking_sar ?? 0),
          postMoneyValuation: String(project.post_money_valuation_sar ?? 0),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل صفحة المحاكاة.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadSimulationPage();
  }, [appUser, projectId]);

  function handleChange<K extends keyof SimulationFormValues>(
    field: K,
    value: SimulationFormValues[K]
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleRunSimulation() {
    if (!appUser || !projectId || !baseInput) {
      return;
    }

    try {
      setErrorMessage("");
      setSaveMessage("");
      setIsSubmitting(true);

      const changedFields: Record<string, number | string> = {};

      if (Number(formValues.teamSize) !== baseInput.TeamSize) {
        changedFields.TeamSize = Number(formValues.teamSize);
      }

      if (Number(formValues.monthlyRevenue) !== baseInput.MonthlyRevenue) {
        changedFields.MonthlyRevenue = Number(formValues.monthlyRevenue);
      }

      const fundingStageMapped = mapFundingStageToModel(formValues.fundingStage);
      if (fundingStageMapped !== baseInput.FundingStage) {
        changedFields.FundingStage = fundingStageMapped;
      }

      if (Number(formValues.capitalSeeking) !== baseInput.CapitalSeeking) {
        changedFields.CapitalSeeking = Number(formValues.capitalSeeking);
      }

      if (Number(formValues.postMoneyValuation) !== baseInput.PostMoneyValuation) {
        changedFields.PostMoneyValuation = Number(formValues.postMoneyValuation);
      }

      if (!Object.keys(changedFields).length) {
        setErrorMessage("عدّل قيمة واحدة على الأقل لتشغيل المحاكاة.");
        return;
      }

      const response = await fetch(`${AI_BASE_URL}/what-if`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_startup: baseInput,
          changed_fields: changedFields,
          top_n: 3,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "تعذر تنفيذ المحاكاة.");
      }

      const raw = (await response.json()) as WhatIfResponse;

      const beforeRiskScore = raw.before?.risk_score_percentage ?? 0;
      const afterRiskScore = raw.after?.risk_score_percentage ?? 0;
      const deltaScore = (afterRiskScore - beforeRiskScore) / 100;

      const viewModel: SimulationViewModel = {
        summary: raw.summary || "لا يوجد ملخص.",
        advisorySummary: raw.advisory_summary || "لا يوجد ملخص استشاري.",
        deepExplanation: raw.deep_explanation || "",
        detailedExplanation: raw.detailed_explanation || "",
        keyDecisionPoints: raw.key_decision_points ?? [],
        clientActions: raw.client_actions ?? [],
        disclaimer: raw.disclaimer || "",
        warnings: raw.warnings ?? [],
        deltaScore,
        before: {
          riskClass: raw.before?.risk_class || "غير محددة",
          riskScorePercentage: beforeRiskScore,
          topReasons: parseReasons(raw.before?.top_reasons),
        },
        after: {
          riskClass: raw.after?.risk_class || "غير محددة",
          riskScorePercentage: afterRiskScore,
          topReasons: parseReasons(raw.after?.top_reasons),
        },
      };

      setResult(viewModel);

      const now = new Date().toISOString();

      try {
        const { error: simulationInsertError } = await supabase.from("ai_simulations").insert({
          project_id: projectId,
          evaluation_id: latestEvaluationId,
          initiated_by: appUser.id,
          original_input: baseInput,
          modified_input: raw.updated_input ?? changedFields,
          original_risk_level: mapRiskClassToDb(viewModel.before.riskClass),
          original_risk_score: viewModel.before.riskScorePercentage / 100,
          new_risk_level: mapRiskClassToDb(viewModel.after.riskClass),
          new_risk_score: viewModel.after.riskScorePercentage / 100,
          delta_score: viewModel.deltaScore,
          comparison_summary: viewModel.summary,
          created_at: now,
        });

        if (simulationInsertError) {
          throw simulationInsertError;
        }

        setSaveMessage("تم تنفيذ المحاكاة وحفظ نتيجتها بنجاح.");
      } catch (saveError) {
        const message =
          saveError instanceof Error
            ? saveError.message
            : "تم تنفيذ المحاكاة لكن تعذر حفظها في قاعدة البيانات.";
        setSaveMessage(message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تشغيل المحاكاة.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل صفحة المحاكاة...</div>
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
    <section className="entrepreneur-page entrepreneur-ai-page">
      <div className="entrepreneur-page__header">
        <div>
          <h1 className="entrepreneur-page__title">محاكاة المشروع</h1>
          <p className="entrepreneur-page__subtitle">
            جرّب سيناريوهات مختلفة وشاهد كيف تتغير نتيجة المخاطر قبل تعديل المشروع فعليًا.
          </p>
          <p className="entrepreneur-page__microtitle">{projectTitle}</p>
        </div>

        <div className="entrepreneur-page__header-actions">
          <Link to={`/entrepreneur/projects/${projectId}/evaluation`} className="btn btn--ghost">
            العودة للتقييم
          </Link>
          <Link to={`/entrepreneur/projects/${projectId}/edit`} className="btn btn--ghost">
            تعديل المشروع
          </Link>
        </div>
      </div>

      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}
      {saveMessage ? <div className="entrepreneur-page__success">{saveMessage}</div> : null}

      <SimulationInputForm
        values={formValues}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleRunSimulation}
      />

      {result ? (
        <>
          <SimulationCompareCard
            before={result.before}
            after={result.after}
            summary={result.summary}
            advisorySummary={result.advisorySummary}
            deltaScore={result.deltaScore}
          />

          <SimulationReasonsDiffCard
            beforeReasons={result.before.topReasons}
            afterReasons={result.after.topReasons}
          />

          {result.deepExplanation ? (
            <section className="entrepreneur-ai-card">
              <div className="entrepreneur-ai-card__header">
                <h2>الشرح العميق</h2>
              </div>
              <div className="entrepreneur-ai-text-card">
                <p>{result.deepExplanation}</p>
              </div>
            </section>
          ) : null}

          {result.detailedExplanation ? (
            <section className="entrepreneur-ai-card">
              <div className="entrepreneur-ai-card__header">
                <h2>الشرح التفصيلي</h2>
              </div>
              <div className="entrepreneur-ai-text-card">
                <p>{result.detailedExplanation}</p>
              </div>
            </section>
          ) : null}

          <div className="entrepreneur-ai-two-columns">
            <section className="entrepreneur-ai-card">
              <div className="entrepreneur-ai-card__header">
                <h2>نقاط القرار</h2>
              </div>

              {!result.keyDecisionPoints.length ? (
                <div className="entrepreneur-empty-mini">لا توجد نقاط قرار إضافية.</div>
              ) : (
                <ul className="entrepreneur-ai-bullets">
                  {result.keyDecisionPoints.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="entrepreneur-ai-card">
              <div className="entrepreneur-ai-card__header">
                <h2>الإجراءات المقترحة</h2>
              </div>

              {!result.clientActions.length ? (
                <div className="entrepreneur-empty-mini">لا توجد إجراءات مقترحة إضافية.</div>
              ) : (
                <ul className="entrepreneur-ai-bullets">
                  {result.clientActions.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="entrepreneur-ai-two-columns">
            <section className="entrepreneur-ai-card entrepreneur-ai-card--warning">
              <div className="entrepreneur-ai-card__header">
                <h2>التنبيهات</h2>
              </div>

              {!result.warnings.length ? (
                <div className="entrepreneur-empty-mini">لا توجد تنبيهات إضافية.</div>
              ) : (
                <ul className="entrepreneur-ai-bullets">
                  {result.warnings.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="entrepreneur-ai-card">
              <div className="entrepreneur-ai-card__header">
                <h2>إخلاء المسؤولية</h2>
              </div>

              <div className="entrepreneur-ai-text-card">
                <p>{result.disclaimer || "لا يوجد نص إضافي."}</p>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}