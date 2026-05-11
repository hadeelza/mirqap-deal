import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import InvestorCard, { type BrowseInvestorItem } from "../components/InvestorCard";
import InvestorFiltersPanel from "../components/InvestorFiltersPanel";

type MatchStatus = "match" | "neutral" | "no_match";

type UserRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  account_status: string;
};

type InvestorProfileRow = {
  user_id: string;
  investor_type: string | null;
  organization_name: string | null;
  bio: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  is_discoverable: boolean | null;
};

type InvestorPreferenceRow = {
  investor_id: string;
  min_ticket_sar: number | null;
  max_ticket_sar: number | null;
};

type InvestorPreferenceCategoryRow = {
  investor_id: string;
  category_id: string;
};

type InvestorPreferenceStageRow = {
  investor_id: string;
  startup_stage: string;
};

type InvestorPreferenceRiskRow = {
  investor_id: string;
  risk_level: string;
};

type InvestorPreferenceTechnologyRow = {
  investor_id: string;
  technology_id: string;
};

type ProjectRow = {
  id: string;
  title: string;
  category_id: string | null;
  startup_stage: string | null;
  capital_seeking_sar: number | null;
};

type ProjectTechnologyRow = {
  technology_id: string;
};

type ProjectEvaluationRow = {
  risk_level: string | null;
};

function normalizeText(value: unknown) {
  return String(value ?? "").toLowerCase();
}

function getSafeInvestorType(value: string | null | undefined) {
  if (!value || !value.trim()) {
    return "individual";
  }

  return value.trim();
}

function getStatus(specified: boolean, matches: boolean): MatchStatus {
  if (!specified) {
    return "neutral";
  }

  return matches ? "match" : "no_match";
}

function scoreFromStatuses(statuses: MatchStatus[]) {
  let points = 0;

  statuses.forEach((status) => {
    if (status === "match") {
      points += 1;
      return;
    }

    if (status === "neutral") {
      points += 0.5;
    }
  });

  return Math.round((points / statuses.length) * 100);
}

function matchLabel(score: number) {
  if (score >= 80) {
    return "ملاءمة ممتازة";
  }

  if (score >= 60) {
    return "ملاءمة جيدة";
  }

  if (score >= 40) {
    return "ملاءمة متوسطة";
  }

  return "ملاءمة محدودة";
}

function investorTypeLabel(value: string | null | undefined) {
  switch (value) {
    case "angel":
      return "مستثمر ملاك";
    case "individual":
      return "مستثمر فردي";
    case "institution":
      return "مؤسسة";
    case "incubator":
      return "حاضنة";
    case "accelerator":
      return "مسرعة";
    default:
      return "مستثمر";
  }
}

export default function BrowseInvestorsPage() {
  const { appUser, isLoading } = useAuthUser();
  const [searchParams] = useSearchParams();

  const [investors, setInvestors] = useState<BrowseInvestorItem[]>([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [investorType, setInvestorType] = useState("all");
  const [discoverability, setDiscoverability] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");

  useEffect(() => {
    async function loadPage() {
      if (!appUser || appUser.role !== "entrepreneur") {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        const selectedProjectId = searchParams.get("projectId");

        let currentProject: ProjectRow | null = null;
        let currentProjectTechnologyIds: string[] = [];
        let currentProjectRiskLevel: string | null = null;

        if (selectedProjectId) {
          const [
            projectResponse,
            projectTechnologiesResponse,
            evaluationResponse,
          ] = await Promise.all([
            supabase
              .from("projects")
              .select("id,title,category_id,startup_stage,capital_seeking_sar")
              .eq("id", selectedProjectId)
              .eq("entrepreneur_id", appUser.id)
              .maybeSingle(),
            supabase
              .from("project_technologies")
              .select("technology_id")
              .eq("project_id", selectedProjectId),
            supabase
              .from("project_ai_evaluations")
              .select("risk_level")
              .eq("project_id", selectedProjectId)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

          if (projectResponse.data) {
            currentProject = projectResponse.data as ProjectRow;
            setProjectTitle(currentProject.title);
          } else {
            setProjectTitle("");
          }

          currentProjectTechnologyIds = ((projectTechnologiesResponse.data ?? []) as ProjectTechnologyRow[]).map(
            (item: ProjectTechnologyRow) => item.technology_id
          );

          currentProjectRiskLevel = (evaluationResponse.data as ProjectEvaluationRow | null)?.risk_level ?? null;
        } else {
          setProjectTitle("");
        }

        const [
          usersResponse,
          profilesResponse,
          preferencesResponse,
          prefCategoriesResponse,
          prefStagesResponse,
          prefRisksResponse,
          prefTechnologiesResponse,
        ] = await Promise.all([
          supabase
            .from("users")
            .select("id,full_name,phone,avatar_url,role,account_status")
            .eq("role", "investor")
            .eq("account_status", "active")
            .order("created_at", { ascending: false }),
          supabase
            .from("investor_profiles")
            .select("user_id,investor_type,organization_name,bio,website_url,linkedin_url,is_discoverable"),
          supabase
            .from("investor_preferences")
            .select("investor_id,min_ticket_sar,max_ticket_sar"),
          supabase
            .from("investor_preference_categories")
            .select("investor_id,category_id"),
          supabase
            .from("investor_preference_stages")
            .select("investor_id,startup_stage"),
          supabase
            .from("investor_preference_risk_levels")
            .select("investor_id,risk_level"),
          supabase
            .from("investor_preference_technologies")
            .select("investor_id,technology_id"),
        ]);

        if (usersResponse.error) {
          throw usersResponse.error;
        }

        const userRows = (usersResponse.data ?? []) as UserRow[];
        const profileRows = (profilesResponse.data ?? []) as InvestorProfileRow[];
        const preferenceRows = (preferencesResponse.data ?? []) as InvestorPreferenceRow[];
        const prefCategoryRows = (prefCategoriesResponse.data ?? []) as InvestorPreferenceCategoryRow[];
        const prefStageRows = (prefStagesResponse.data ?? []) as InvestorPreferenceStageRow[];
        const prefRiskRows = (prefRisksResponse.data ?? []) as InvestorPreferenceRiskRow[];
        const prefTechnologyRows = (prefTechnologiesResponse.data ?? []) as InvestorPreferenceTechnologyRow[];

        const profileMap = new Map<string, InvestorProfileRow>();
        profileRows.forEach((item: InvestorProfileRow) => {
          profileMap.set(item.user_id, item);
        });

        const preferenceMap = new Map<string, InvestorPreferenceRow>();
        preferenceRows.forEach((item: InvestorPreferenceRow) => {
          preferenceMap.set(item.investor_id, item);
        });

        const prefCategoriesMap = new Map<string, string[]>();
        prefCategoryRows.forEach((item: InvestorPreferenceCategoryRow) => {
          const current = prefCategoriesMap.get(item.investor_id) ?? [];
          prefCategoriesMap.set(item.investor_id, [...current, item.category_id]);
        });

        const prefStagesMap = new Map<string, string[]>();
        prefStageRows.forEach((item: InvestorPreferenceStageRow) => {
          const current = prefStagesMap.get(item.investor_id) ?? [];
          prefStagesMap.set(item.investor_id, [...current, item.startup_stage]);
        });

        const prefRisksMap = new Map<string, string[]>();
        prefRiskRows.forEach((item: InvestorPreferenceRiskRow) => {
          const current = prefRisksMap.get(item.investor_id) ?? [];
          prefRisksMap.set(item.investor_id, [...current, item.risk_level]);
        });

        const prefTechnologiesMap = new Map<string, string[]>();
        prefTechnologyRows.forEach((item: InvestorPreferenceTechnologyRow) => {
          const current = prefTechnologiesMap.get(item.investor_id) ?? [];
          prefTechnologiesMap.set(item.investor_id, [...current, item.technology_id]);
        });

        const mappedInvestors: BrowseInvestorItem[] = userRows
          .map((user: UserRow) => {
            const profile = profileMap.get(user.id);

            if (!profile) {
              return null;
            }

            const preference = preferenceMap.get(user.id);
            const preferredCategoryIds = prefCategoriesMap.get(user.id) ?? [];
            const preferredStages = prefStagesMap.get(user.id) ?? [];
            const preferredRiskLevels = prefRisksMap.get(user.id) ?? [];
            const preferredTechnologyIds = prefTechnologiesMap.get(user.id) ?? [];

            const categoryFit = currentProject
              ? getStatus(
                  preferredCategoryIds.length > 0,
                  !!currentProject.category_id && preferredCategoryIds.includes(currentProject.category_id)
                )
              : "neutral";

            const stageFit = currentProject
              ? getStatus(
                  preferredStages.length > 0,
                  !!currentProject.startup_stage && preferredStages.includes(currentProject.startup_stage)
                )
              : "neutral";

            const riskFit = currentProject
              ? getStatus(
                  preferredRiskLevels.length > 0,
                  !!currentProjectRiskLevel && preferredRiskLevels.includes(currentProjectRiskLevel)
                )
              : "neutral";

            const overlapCount = currentProject
              ? currentProjectTechnologyIds.filter((technologyId: string) =>
                  preferredTechnologyIds.includes(technologyId)
                ).length
              : 0;

            const technologyFit = currentProject
              ? getStatus(preferredTechnologyIds.length > 0, overlapCount > 0)
              : "neutral";

            const hasTicketPreference =
              preference?.min_ticket_sar !== null ||
              preference?.max_ticket_sar !== null;

            const ticketFits = currentProject
              ? (() => {
                  if (currentProject.capital_seeking_sar === null || currentProject.capital_seeking_sar === undefined) {
                    return false;
                  }

                  const minTicket = preference?.min_ticket_sar;
                  const maxTicket = preference?.max_ticket_sar;
                  const capital = currentProject.capital_seeking_sar;

                  if (minTicket !== null && minTicket !== undefined && capital < minTicket) {
                    return false;
                  }

                  if (maxTicket !== null && maxTicket !== undefined && capital > maxTicket) {
                    return false;
                  }

                  return true;
                })()
              : false;

            const ticketFit = currentProject
              ? getStatus(Boolean(hasTicketPreference), ticketFits)
              : "neutral";

            const statuses: MatchStatus[] = [
              categoryFit,
              stageFit,
              riskFit,
              technologyFit,
              ticketFit,
            ];

            const matchScore = scoreFromStatuses(statuses);

            return {
              id: user.id,
              fullName: user.full_name?.trim() || "مستثمر",
              phone: user.phone,
              avatarUrl: user.avatar_url,
              organizationName: profile.organization_name?.trim() || "بدون جهة",
              investorType: getSafeInvestorType(profile.investor_type),
              bio: profile.bio?.trim() || "",
              websiteUrl: profile.website_url,
              linkedinUrl: profile.linkedin_url,
              isDiscoverable: profile.is_discoverable ?? false,
              minTicketSar: preference?.min_ticket_sar ?? null,
              maxTicketSar: preference?.max_ticket_sar ?? null,
              matchScore,
              matchLabel: matchLabel(matchScore),
              categoryFit,
              stageFit,
              riskFit,
              technologyFit,
              ticketFit,
              overlapCount,
            };
          })
          .filter((item): item is BrowseInvestorItem => Boolean(item));

        setInvestors(mappedInvestors);
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل المستثمرين حالياً.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadPage();
  }, [appUser, searchParams]);

  const filteredInvestors = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());

    const filtered = investors.filter((investor: BrowseInvestorItem) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeText(investor.fullName).includes(normalizedSearch) ||
        normalizeText(investor.organizationName).includes(normalizedSearch) ||
        normalizeText(investor.bio).includes(normalizedSearch) ||
        normalizeText(investorTypeLabel(investor.investorType)).includes(normalizedSearch);

      const matchesType = investorType === "all" || investor.investorType === investorType;

      const matchesDiscoverability =
        discoverability === "all" ||
        (discoverability === "discoverable" && investor.isDiscoverable) ||
        (discoverability === "hidden" && !investor.isDiscoverable);

      return matchesSearch && matchesType && matchesDiscoverability;
    });

    return filtered.sort((a: BrowseInvestorItem, b: BrowseInvestorItem) => {
      if (sortBy === "name") {
        return a.fullName.localeCompare(b.fullName, "ar");
      }

      if (sortBy === "discoverable_first") {
        if (a.isDiscoverable === b.isDiscoverable) {
          return b.matchScore - a.matchScore;
        }

        return a.isDiscoverable ? -1 : 1;
      }

      return b.matchScore - a.matchScore;
    });
  }, [investors, search, investorType, discoverability, sortBy]);

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل المستثمرين...</div>
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
          <h1 className="entrepreneur-page__title">تصفح المستثمرين</h1>
          <p className="entrepreneur-page__subtitle">
            استعرض المستثمرين المتاحين داخل المنصة وشاهد ملاءمتهم مع مشروعك الحالي.
          </p>
          {projectTitle ? (
            <p className="entrepreneur-page__microtitle">المشروع الحالي للمطابقة: {projectTitle}</p>
          ) : (
            <p className="entrepreneur-page__microtitle">
              لعرض مطابقة دقيقة، افتح الصفحة من داخل تفاصيل مشروع محدد.
            </p>
          )}
        </div>

        {searchParams.get("projectId") ? (
          <Link
            to={`/entrepreneur/projects/${searchParams.get("projectId")}`}
            className="btn btn--ghost"
          >
            العودة إلى المشروع
          </Link>
        ) : null}
      </div>

      <InvestorFiltersPanel
        search={search}
        investorType={investorType}
        discoverability={discoverability}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onInvestorTypeChange={setInvestorType}
        onDiscoverabilityChange={setDiscoverability}
        onSortChange={setSortBy}
      />

      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      {!filteredInvestors.length ? (
        <div className="entrepreneur-empty-state">
          <h3>لا يوجد مستثمرون مطابقون</h3>
          <p>جرّب تغيير الفلاتر أو افتح الصفحة من مشروع آخر.</p>
        </div>
      ) : (
        <div className="entrepreneur-investors-grid">
          {filteredInvestors.map((investor: BrowseInvestorItem) => (
            <InvestorCard key={investor.id} investor={investor} />
          ))}
        </div>
      )}
    </section>
  );
}