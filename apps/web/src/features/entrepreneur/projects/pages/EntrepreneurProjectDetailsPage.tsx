import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import ProjectHeaderCard from "../components/ProjectHeaderCard";
import ProjectBusinessInfoSection from "../components/ProjectBusinessInfoSection";
import ProjectFilesSection from "../components/ProjectFilesSection";
import ProjectInsightsCard from "../components/ProjectInsightsCard";
import ProjectOffersPreviewSection from "../components/ProjectOffersPreviewSection";
import type {
  EntrepreneurProjectDetailsData,
  ProjectEvaluationView,
  ProjectFileItem,
  ProjectOfferPreview,
  ProjectProbabilityItem,
  ProjectReasonItem,
  ProjectTechnologyItem,
} from "../components/project-details.types";

type ProjectRow = {
  id: string;
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
  publication_status: string;
  investment_status: string;
  submitted_at: string | null;
  published_at: string | null;
  created_at: string;
};

type CategoryRow = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
};

type ProjectTechnologyLinkRow = {
  technology_id: string;
};

type TechnologyRow = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
};

type ProjectFileRow = {
  id: string;
  file_type: string;
  bucket_name: string | null;
  storage_path: string | null;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
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

type OfferRow = {
  id: string;
  investor_id: string;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
  status: string;
  created_at: string;
};

type UserRow = {
  id: string;
  full_name: string | null;
};

function extractArrayStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item: unknown): item is string => typeof item === "string");
}

function extractConfidenceLevel(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  return typeof record.confidence_level === "string" ? record.confidence_level : null;
}

function extractWarnings(payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }

  const record = payload as Record<string, unknown>;
  return extractArrayStrings(record.warnings);
}

function extractRecommendations(payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }

  const record = payload as Record<string, unknown>;
  return extractArrayStrings(record.recommendations);
}

function extractProbabilities(value: unknown): ProjectProbabilityItem[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const record = value as Record<string, unknown>;

  return Object.entries(record)
    .map(([label, rawValue]: [string, unknown]) => ({
      label,
      value: typeof rawValue === "number" ? rawValue : Number(rawValue),
    }))
    .filter((item: ProjectProbabilityItem) => !Number.isNaN(item.value));
}

function extractReasons(topFactors: unknown, payload: unknown): ProjectReasonItem[] {
  const source =
    Array.isArray(topFactors)
      ? topFactors
      : payload && typeof payload === "object" && !Array.isArray(payload)
        ? (() => {
            const record = payload as Record<string, unknown>;
            if (Array.isArray(record.top_3_reasons)) {
              return record.top_3_reasons;
            }
            if (Array.isArray(record.top_features_affecting_prediction)) {
              return record.top_features_affecting_prediction;
            }
            return [];
          })()
        : [];

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item: unknown) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;

      return {
        feature: typeof record.feature === "string" ? record.feature : "عامل غير محدد",
        explanation: typeof record.explanation === "string" ? record.explanation : "لا يوجد شرح إضافي.",
        effectDirection:
          typeof record.effect_direction === "string" ? record.effect_direction : null,
        contributionValue:
          typeof record.contribution_value === "number"
            ? record.contribution_value
            : record.contribution_value !== undefined
              ? Number(record.contribution_value)
              : null,
      };
    })
    .filter((item: ProjectReasonItem | null): item is ProjectReasonItem => Boolean(item));
}

export default function EntrepreneurProjectDetailsPage() {
  const { projectId } = useParams();
  const { appUser, isLoading } = useAuthUser();

  const [project, setProject] = useState<EntrepreneurProjectDetailsData | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProjectDetails() {
      if (!appUser || appUser.role !== "entrepreneur" || !projectId) {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const { data: projectRow, error: projectError } = await supabase
          .from("projects")
          .select(
            "id,title,company_name,short_pitch,category_id,startup_stage,confidence_level,customer_focus,team_size,founder_motivation,market_size_m,competitors_count,monthly_revenue_sar,capital_seeking_sar,post_money_valuation_sar,funding_stage,problem_description,solution_description,differentiation,traction,risks,exit_strategy,approval_status,publication_status,investment_status,submitted_at,published_at,created_at"
          )
          .eq("id", projectId)
          .eq("entrepreneur_id", appUser.id)
          .single();

        if (projectError) {
          throw projectError;
        }

        const safeProject = projectRow as ProjectRow;

        const [
          categoryResponse,
          technologyLinksResponse,
          filesResponse,
          evaluationResponse,
          offersResponse,
        ] = await Promise.all([
          safeProject.category_id
            ? supabase
                .from("project_categories")
                .select("id,name_ar,name_en")
                .eq("id", safeProject.category_id)
                .single()
            : Promise.resolve({ data: null }),
          supabase
            .from("project_technologies")
            .select("technology_id")
            .eq("project_id", safeProject.id),
          supabase
            .from("project_files")
            .select("id,file_type,bucket_name,storage_path,file_name,mime_type,file_size,created_at")
            .eq("project_id", safeProject.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("project_ai_evaluations")
            .select("id,risk_level,risk_score,class_probabilities,top_contributing_factors,ai_summary,explanation_payload,created_at")
            .eq("project_id", safeProject.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("investment_offers")
            .select("id,investor_id,offer_amount_sar,equity_percentage,status,created_at")
            .eq("project_id", safeProject.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const category = (categoryResponse.data ?? null) as CategoryRow | null;
        const technologyLinks = (technologyLinksResponse.data ?? []) as ProjectTechnologyLinkRow[];
        const technologyIds = technologyLinks.map((item: ProjectTechnologyLinkRow) => item.technology_id);

        const technologiesResponse = technologyIds.length
          ? await supabase
              .from("technologies")
              .select("id,name_ar,name_en")
              .in("id", technologyIds)
          : { data: [] as TechnologyRow[] };

        const technologyMap = new Map<string, TechnologyRow>();
        ((technologiesResponse.data ?? []) as TechnologyRow[]).forEach((item: TechnologyRow) => {
          technologyMap.set(item.id, item);
        });

        const technologies: ProjectTechnologyItem[] = technologyLinks.map(
          (link: ProjectTechnologyLinkRow) => {
            const technology = technologyMap.get(link.technology_id);
            return {
              id: link.technology_id,
              label:
                technology?.name_ar?.trim() ||
                technology?.name_en?.trim() ||
                "تقنية غير معروفة",
            };
          }
        );

        const files: ProjectFileItem[] = ((filesResponse.data ?? []) as ProjectFileRow[]).map(
          (file: ProjectFileRow) => {
            const publicUrl =
              file.bucket_name && file.storage_path
                ? supabase.storage.from(file.bucket_name).getPublicUrl(file.storage_path).data.publicUrl
                : null;

            return {
              id: file.id,
              fileName: file.file_name,
              fileType: file.file_type,
              mimeType: file.mime_type,
              fileSize: file.file_size,
              publicUrl,
              storagePath: file.storage_path,
              bucketName: file.bucket_name,
              createdAt: file.created_at,
            };
          }
        );

        const evaluationRow = (evaluationResponse.data ?? null) as EvaluationRow | null;

        const evaluation: ProjectEvaluationView | null = evaluationRow
          ? {
              riskLevel: evaluationRow.risk_level,
              riskScore: evaluationRow.risk_score,
              confidenceLevel: extractConfidenceLevel(evaluationRow.explanation_payload),
              aiSummary: evaluationRow.ai_summary,
              recommendations: extractRecommendations(evaluationRow.explanation_payload),
              warnings: extractWarnings(evaluationRow.explanation_payload),
              probabilities: extractProbabilities(evaluationRow.class_probabilities),
              topReasons: extractReasons(
                evaluationRow.top_contributing_factors,
                evaluationRow.explanation_payload
              ),
            }
          : null;

        const rawOffers = (offersResponse.data ?? []) as OfferRow[];
        const investorIds = rawOffers.map((item: OfferRow) => item.investor_id);

        const investorsResponse = investorIds.length
          ? await supabase.from("users").select("id,full_name").in("id", investorIds)
          : { data: [] as UserRow[] };

        const investorsMap = new Map<string, UserRow>();
        ((investorsResponse.data ?? []) as UserRow[]).forEach((item: UserRow) => {
          investorsMap.set(item.id, item);
        });

        const offers: ProjectOfferPreview[] = rawOffers.map((offer: OfferRow) => ({
          id: offer.id,
          investorName: investorsMap.get(offer.investor_id)?.full_name?.trim() || "مستثمر",
          offerAmountSar: offer.offer_amount_sar,
          equityPercentage: offer.equity_percentage,
          status: offer.status,
          createdAt: offer.created_at,
        }));

        const details: EntrepreneurProjectDetailsData = {
          id: safeProject.id,
          title: safeProject.title,
          companyName: safeProject.company_name,
          shortPitch: safeProject.short_pitch,
          categoryName: category?.name_ar?.trim() || category?.name_en?.trim() || "غير مصنف",
          startupStage: safeProject.startup_stage,
          confidenceLevel: safeProject.confidence_level,
          customerFocus: safeProject.customer_focus,
          teamSize: safeProject.team_size,
          founderMotivation: safeProject.founder_motivation,
          marketSizeM: safeProject.market_size_m,
          competitorsCount: safeProject.competitors_count,
          monthlyRevenueSar: safeProject.monthly_revenue_sar,
          capitalSeekingSar: safeProject.capital_seeking_sar,
          postMoneyValuationSar: safeProject.post_money_valuation_sar,
          fundingStage: safeProject.funding_stage,
          problemDescription: safeProject.problem_description,
          solutionDescription: safeProject.solution_description,
          differentiation: safeProject.differentiation,
          traction: safeProject.traction,
          risks: safeProject.risks,
          exitStrategy: safeProject.exit_strategy,
          approvalStatus: safeProject.approval_status,
          publicationStatus: safeProject.publication_status,
          investmentStatus: safeProject.investment_status,
          submittedAt: safeProject.submitted_at,
          publishedAt: safeProject.published_at,
          createdAt: safeProject.created_at,
          technologies,
          files,
          evaluation,
          offers,
        };

        setProject(details);
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل تفاصيل المشروع.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadProjectDetails();
  }, [appUser, projectId]);

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل تفاصيل المشروع...</div>
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

  if (!project) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__error">المشروع غير موجود.</div>
      </section>
    );
  }

  return (
    <section className="entrepreneur-page entrepreneur-project-details-page">
      <ProjectHeaderCard project={project} />
      <ProjectBusinessInfoSection project={project} />
      <ProjectInsightsCard evaluation={project.evaluation} />
      <ProjectFilesSection files={project.files} />
      <ProjectOffersPreviewSection offers={project.offers} />
    </section>
  );
}