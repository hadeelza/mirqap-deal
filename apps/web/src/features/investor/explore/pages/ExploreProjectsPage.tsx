import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import {  supabase } from "../../../../lib/supabase/client";
import ProjectsSearchBar from "../components/ProjectsSearchBar";
import ProjectsFiltersPanel from "../components/ProjectsFiltersPanel";
import ProjectsSortBar from "../components/ProjectsSortBar";
import ProjectsResultsGrid from "../components/ProjectsResultsGrid";
import type { ExploreProjectCardData } from "../components/InvestorProjectCard";

type StartupStage = "idea" | "mvp_seed";
type ConfidenceLevel = "concept" | "prototype" | "mvp" | "early_market";
type RiskLevel = "low" | "medium" | "high";
type CustomerFocus = "b2b" | "b2c" | "b2g" | "marketplace" | "other";
type InvestmentStatus = "open" | "in_negotiation" | "funded" | "closed";
type FundingStage = "bootstrapped" | "friends_family" | "pre_seed" | "seed";
type SortOption = "newest" | "lowest_risk" | "best_match";

interface ProjectCategoryRow {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

interface TechnologyRow {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

interface ProjectRow {
  id: string;
  title: string;
  company_name: string | null;
  short_pitch: string | null;
  category_id: string | null;
  startup_stage: StartupStage | null;
  confidence_level: ConfidenceLevel | null;
  customer_focus: CustomerFocus | null;
  capital_seeking_sar: number | string | null;
  funding_stage: FundingStage | null;
  investment_status: InvestmentStatus | null;
  approval_status: string | null;
  publication_status: string | null;
  published_at: string | null;
  created_at: string | null;
}

interface ProjectTechnologyRow {
  project_id: string | null;
  technology_id: string | null;
}

interface ProjectEvaluationRow {
  project_id: string | null;
  risk_level: RiskLevel | null;
  risk_score: number | string | null;
  ai_summary: string | null;
  created_at: string | null;
}

interface InvestorPreferenceRow {
  investor_id: string;
  min_ticket_sar: number | string | null;
  max_ticket_sar: number | string | null;
}

interface PreferenceCategoryRow {
  category_id: string | null;
}

interface PreferenceStageRow {
  startup_stage: StartupStage | null;
}

interface PreferenceRiskRow {
  risk_level: RiskLevel | null;
}

interface PreferenceTechnologyRow {
  technology_id: string | null;
}

interface InterestRow {
  project_id: string | null;
  created_at: string | null;
}

interface ExploreFiltersState {
  search: string;
  categoryId: string;
  startupStage: string;
  confidenceLevel: string;
  riskLevel: string;
  customerFocus: string;
  technologyId: string;
  investmentStatus: string;
  fundingStage: string;
}

const INITIAL_FILTERS: ExploreFiltersState = {
  search: "",
  categoryId: "",
  startupStage: "",
  confidenceLevel: "",
  riskLevel: "",
  customerFocus: "",
  technologyId: "",
  investmentStatus: "",
  fundingStage: "",
};

export default function ExploreProjectsPage() {
  const { appUser, isLoading } = useAuthUser();

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState<ExploreFiltersState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>("best_match");
  const [visibleCount, setVisibleCount] = useState(9);

  const [categoryOptions, setCategoryOptions] = useState<ProjectCategoryRow[]>([]);
  const [technologyOptions, setTechnologyOptions] = useState<TechnologyRow[]>([]);
  const [allProjects, setAllProjects] = useState<ExploreProjectCardData[]>([]);

  useEffect(() => {
    async function loadExploreData() {
      if (!appUser?.id) {
        setIsBootstrapping(false);
        return;
      }

      try {
        setErrorMessage("");

        const [
          categoriesResponse,
          technologiesResponse,
          projectsResponse,
          projectTechnologiesResponse,
          evaluationsResponse,
          preferencesResponse,
          preferenceCategoriesResponse,
          preferenceStagesResponse,
          preferenceRiskResponse,
          preferenceTechnologiesResponse,
          interestsResponse,
        ] = await Promise.all([
          supabase
            .from("project_categories")
            .select("id, name_ar, name_en, is_active")
            .eq("is_active", true)
            .order("name_ar", { ascending: true }),
          supabase
            .from("technologies")
            .select("id, name_ar, name_en, is_active")
            .eq("is_active", true)
            .order("name_ar", { ascending: true }),
          supabase
            .from("projects")
            .select(
              "id, title, company_name, short_pitch, category_id, startup_stage, confidence_level, customer_focus, capital_seeking_sar, funding_stage, investment_status, approval_status, publication_status, published_at, created_at"
            )
            .eq("approval_status", "approved")
            .eq("publication_status", "published")
            .order("published_at", { ascending: false }),
          supabase
            .from("project_technologies")
            .select("project_id, technology_id"),
          supabase
            .from("project_ai_evaluations")
            .select("project_id, risk_level, risk_score, ai_summary, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("investor_preferences")
            .select("investor_id, min_ticket_sar, max_ticket_sar")
            .eq("investor_id", appUser.id)
            .maybeSingle(),
          supabase
            .from("investor_preference_categories")
            .select("category_id")
            .eq("investor_id", appUser.id),
          supabase
            .from("investor_preference_stages")
            .select("startup_stage")
            .eq("investor_id", appUser.id),
          supabase
            .from("investor_preference_risk_levels")
            .select("risk_level")
            .eq("investor_id", appUser.id),
          supabase
            .from("investor_preference_technologies")
            .select("technology_id")
            .eq("investor_id", appUser.id),
          supabase
            .from("investor_project_interests")
            .select("project_id, created_at")
            .eq("investor_id", appUser.id)
            .order("created_at", { ascending: false }),
        ]);

        if (categoriesResponse.error) throw categoriesResponse.error;
        if (technologiesResponse.error) throw technologiesResponse.error;
        if (projectsResponse.error) throw projectsResponse.error;
        if (projectTechnologiesResponse.error) throw projectTechnologiesResponse.error;
        if (evaluationsResponse.error) throw evaluationsResponse.error;
        if (preferencesResponse.error) throw preferencesResponse.error;
        if (preferenceCategoriesResponse.error) throw preferenceCategoriesResponse.error;
        if (preferenceStagesResponse.error) throw preferenceStagesResponse.error;
        if (preferenceRiskResponse.error) throw preferenceRiskResponse.error;
        if (preferenceTechnologiesResponse.error) throw preferenceTechnologiesResponse.error;
        if (interestsResponse.error) throw interestsResponse.error;

        const categories = (categoriesResponse.data ?? []) as ProjectCategoryRow[];
        const technologies = (technologiesResponse.data ?? []) as TechnologyRow[];
        const projects = (projectsResponse.data ?? []) as ProjectRow[];
        const projectTechnologies = (projectTechnologiesResponse.data ?? []) as ProjectTechnologyRow[];
        const evaluations = (evaluationsResponse.data ?? []) as ProjectEvaluationRow[];
        const investorPreference = (preferencesResponse.data ?? null) as InvestorPreferenceRow | null;
        const preferenceCategories = (preferenceCategoriesResponse.data ?? []) as PreferenceCategoryRow[];
        const preferenceStages = (preferenceStagesResponse.data ?? []) as PreferenceStageRow[];
        const preferenceRiskLevels = (preferenceRiskResponse.data ?? []) as PreferenceRiskRow[];
        const preferenceTechnologies = (preferenceTechnologiesResponse.data ?? []) as PreferenceTechnologyRow[];
        const interestRows = (interestsResponse.data ?? []) as InterestRow[];

        const categoryMap = new Map<string, ProjectCategoryRow>();
        categories.forEach((item: ProjectCategoryRow) => {
          categoryMap.set(item.id, item);
        });

        const technologyMap = new Map<string, TechnologyRow>();
        technologies.forEach((item: TechnologyRow) => {
          technologyMap.set(item.id, item);
        });

        const projectTechnologyMap = new Map<string, string[]>();
        projectTechnologies.forEach((item: ProjectTechnologyRow) => {
          if (!item.project_id || !item.technology_id) {
            return;
          }

          const current = projectTechnologyMap.get(item.project_id) ?? [];
          current.push(item.technology_id);
          projectTechnologyMap.set(item.project_id, current);
        });

        const evaluationMap = new Map<string, ProjectEvaluationRow>();
        evaluations.forEach((item: ProjectEvaluationRow) => {
          if (!item.project_id) {
            return;
          }

          if (!evaluationMap.has(item.project_id)) {
            evaluationMap.set(item.project_id, item);
          }
        });

        const interestedProjectIds = new Set(
          interestRows
            .map((item: InterestRow) => item.project_id)
            .filter((value): value is string => Boolean(value))
        );

        const preferredCategoryIds = new Set(
          preferenceCategories
            .map((item: PreferenceCategoryRow) => item.category_id)
            .filter((value): value is string => Boolean(value))
        );

        const preferredStages = new Set(
          preferenceStages
            .map((item: PreferenceStageRow) => item.startup_stage)
            .filter((value): value is StartupStage => Boolean(value))
        );

        const preferredRiskLevels = new Set(
          preferenceRiskLevels
            .map((item: PreferenceRiskRow) => item.risk_level)
            .filter((value): value is RiskLevel => Boolean(value))
        );

        const preferredTechnologyIds = new Set(
          preferenceTechnologies
            .map((item: PreferenceTechnologyRow) => item.technology_id)
            .filter((value): value is string => Boolean(value))
        );

        const historicalCategoryIds = new Set<string>();
        const historicalTechnologyIds = new Set<string>();

        interestRows.forEach((interest: InterestRow) => {
          if (!interest.project_id) {
            return;
          }

          const matchedProject = projects.find((project: ProjectRow) => project.id === interest.project_id);

          if (matchedProject?.category_id) {
            historicalCategoryIds.add(matchedProject.category_id);
          }

          const techIds = projectTechnologyMap.get(interest.project_id) ?? [];
          techIds.forEach((techId: string) => historicalTechnologyIds.add(techId));
        });

        const minTicket = toNumberOrNull(investorPreference?.min_ticket_sar ?? null);
        const maxTicket = toNumberOrNull(investorPreference?.max_ticket_sar ?? null);

        const preparedProjects: ExploreProjectCardData[] = projects.map(
          (project: ProjectRow): ExploreProjectCardData => {
            const projectCategory = project.category_id ? categoryMap.get(project.category_id) : null;
            const projectTechnologyIds = projectTechnologyMap.get(project.id) ?? [];
            const projectTechnologyNames = projectTechnologyIds
              .map((technologyId: string) => technologyMap.get(technologyId)?.name_ar ?? "")
              .filter((name: string) => Boolean(name));

            const evaluation = evaluationMap.get(project.id);
            const riskScore = toNumberOrNull(evaluation?.risk_score ?? null);
            const capitalSeekingSar = toNumberOrNull(project.capital_seeking_sar);
            const categoryMatch = Boolean(project.category_id && preferredCategoryIds.has(project.category_id));
            const stageMatch = Boolean(project.startup_stage && preferredStages.has(project.startup_stage));
            const riskMatch = Boolean(evaluation?.risk_level && preferredRiskLevels.has(evaluation.risk_level));
            const technologyMatchCount = projectTechnologyIds.filter((technologyId: string) =>
              preferredTechnologyIds.has(technologyId)
            ).length;
            const historicalCategoryMatch = Boolean(
              project.category_id && historicalCategoryIds.has(project.category_id)
            );
            const historicalTechnologyMatchCount = projectTechnologyIds.filter((technologyId: string) =>
              historicalTechnologyIds.has(technologyId)
            ).length;

            let matchScore = 0;

            if (categoryMatch) {
              matchScore += 24;
            }

            if (stageMatch) {
              matchScore += 18;
            }

            if (riskMatch) {
              matchScore += 18;
            }

            if (technologyMatchCount > 0) {
              matchScore += Math.min(technologyMatchCount * 10, 24);
            }

            if (historicalCategoryMatch) {
              matchScore += 10;
            }

            if (historicalTechnologyMatchCount > 0) {
              matchScore += Math.min(historicalTechnologyMatchCount * 4, 10);
            }

            if (
              capitalSeekingSar !== null &&
              minTicket !== null &&
              maxTicket !== null &&
              capitalSeekingSar >= minTicket &&
              capitalSeekingSar <= maxTicket
            ) {
              matchScore += 12;
            } else if (
              capitalSeekingSar !== null &&
              minTicket !== null &&
              maxTicket === null &&
              capitalSeekingSar >= minTicket
            ) {
              matchScore += 8;
            } else if (
              capitalSeekingSar !== null &&
              maxTicket !== null &&
              minTicket === null &&
              capitalSeekingSar <= maxTicket
            ) {
              matchScore += 8;
            }

            return {
              projectId: project.id,
              title: project.title,
              companyName: project.company_name ?? "",
              shortPitch: project.short_pitch ?? "",
              categoryName: projectCategory?.name_ar ?? "غير مصنف",
              categoryId: project.category_id ?? "",
              startupStage: project.startup_stage ?? null,
              confidenceLevel: project.confidence_level ?? null,
              customerFocus: project.customer_focus ?? null,
              fundingStage: project.funding_stage ?? null,
              investmentStatus: project.investment_status ?? null,
              capitalSeekingSar,
              publishedAt: project.published_at,
              createdAt: project.created_at,
              technologyIds: projectTechnologyIds,
              technologyNames: projectTechnologyNames,
              riskLevel: evaluation?.risk_level ?? null,
              riskScore,
              aiSummary: (evaluation?.ai_summary ?? "").trim(),
              isInterested: interestedProjectIds.has(project.id),
              matchScore,
            };
          }
        );

        setCategoryOptions(categories);
        setTechnologyOptions(technologies);
        setAllProjects(preparedProjects);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذر تحميل المشاريع حالياً.";
        setErrorMessage(message);
      } finally {
        setIsBootstrapping(false);
      }
    }

    void loadExploreData();
  }, [appUser]);

  useEffect(() => {
    setVisibleCount(9);
  }, [filters, sortBy]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    const result = allProjects.filter((project: ExploreProjectCardData) => {
      const searchTarget = [
        project.title,
        project.companyName,
        project.shortPitch,
        project.categoryName,
        ...project.technologyNames,
      ]
        .join(" ")
        .toLowerCase();

      if (normalizedSearch && !searchTarget.includes(normalizedSearch)) {
        return false;
      }

      if (filters.categoryId && project.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.startupStage && project.startupStage !== filters.startupStage) {
        return false;
      }

      if (filters.confidenceLevel && project.confidenceLevel !== filters.confidenceLevel) {
        return false;
      }

      if (filters.riskLevel && project.riskLevel !== filters.riskLevel) {
        return false;
      }

      if (filters.customerFocus && project.customerFocus !== filters.customerFocus) {
        return false;
      }

      if (filters.technologyId && !project.technologyIds.includes(filters.technologyId)) {
        return false;
      }

      if (filters.investmentStatus && project.investmentStatus !== filters.investmentStatus) {
        return false;
      }

      if (filters.fundingStage && project.fundingStage !== filters.fundingStage) {
        return false;
      }

      return true;
    });

    const sorted = [...result].sort((first: ExploreProjectCardData, second: ExploreProjectCardData) => {
      if (sortBy === "newest") {
        return getTimestamp(second.publishedAt ?? second.createdAt) - getTimestamp(first.publishedAt ?? first.createdAt);
      }

      if (sortBy === "lowest_risk") {
        const firstRisk = first.riskScore ?? Number.POSITIVE_INFINITY;
        const secondRisk = second.riskScore ?? Number.POSITIVE_INFINITY;

        if (firstRisk !== secondRisk) {
          return firstRisk - secondRisk;
        }

        if (first.matchScore !== second.matchScore) {
          return second.matchScore - first.matchScore;
        }

        return getTimestamp(second.publishedAt ?? second.createdAt) - getTimestamp(first.publishedAt ?? first.createdAt);
      }

      if (second.matchScore !== first.matchScore) {
        return second.matchScore - first.matchScore;
      }

      const firstRisk = first.riskScore ?? Number.POSITIVE_INFINITY;
      const secondRisk = second.riskScore ?? Number.POSITIVE_INFINITY;

      if (firstRisk !== secondRisk) {
        return firstRisk - secondRisk;
      }

      return getTimestamp(second.publishedAt ?? second.createdAt) - getTimestamp(first.publishedAt ?? first.createdAt);
    });

    return sorted;
  }, [allProjects, filters, sortBy]);

  const visibleProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

  const hasMore = visibleCount < filteredProjects.length;

  function updateFilter(key: keyof ExploreFiltersState, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS);
    setSortBy("best_match");
  }

  function loadMore() {
    setVisibleCount((current) => current + 9);
  }

  if (isLoading || isBootstrapping) {
    return (
      <section className="investor-explore-page">
        <div className="investor-explore-state">جاري تحميل المشاريع...</div>
      </section>
    );
  }

  if (!appUser) {
    return (
      <section className="investor-explore-page">
        <div className="investor-explore-state investor-explore-state--error">
          تعذر تحميل بيانات المستثمر الحالية.
        </div>
      </section>
    );
  }

  return (
    <section className="investor-explore-page">
      <div className="investor-explore-hero">
        <div>
          <span className="investor-explore-hero__eyebrow">Explore Projects</span>
          <h1 className="investor-explore-hero__title">استكشاف المشاريع</h1>
          <p className="investor-explore-hero__subtitle">
            استعرض المشاريع المعتمدة والمنشورة، واستخدم الفلاتر والترتيب الذكي للوصول إلى الفرص الأقرب
            لتفضيلاتك الاستثمارية.
          </p>
        </div>

        <div className="investor-explore-hero__actions">
          <Link to={ROUTES.investor.preferences} className="btn btn--ghost">
            تعديل التفضيلات
          </Link>
          <Link to={ROUTES.investor.interests} className="btn btn--secondary">
            المشاريع المهتم بها
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="investor-profile-alert investor-profile-alert--error">{errorMessage}</div>
      ) : null}

      <ProjectsSearchBar
        value={filters.search}
        onChange={(value: string) => updateFilter("search", value)}
        onClear={() => updateFilter("search", "")}
      />

      <ProjectsFiltersPanel
        categories={categoryOptions}
        technologies={technologyOptions}
        filters={filters}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      <ProjectsSortBar
        sortBy={sortBy}
        onChange={setSortBy}
        totalCount={filteredProjects.length}
        visibleCount={visibleProjects.length}
      />

      <ProjectsResultsGrid
        projects={visibleProjects}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </section>
  );
}

function toNumberOrNull(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

function getTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}