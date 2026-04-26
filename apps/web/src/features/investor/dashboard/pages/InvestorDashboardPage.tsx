import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import {  supabase } from "../../../../lib/supabase/client";
import InvestorStatsCards from "../components/InvestorStatsCards";
import RecommendedProjectsSection from "../components/RecommendedProjectsSection";
import RecentNotificationsSection from "../components/RecentNotificationsSection";
import RecentInterestsSection from "../components/RecentInterestsSection";

type PreferenceRow = {
  min_ticket_sar: number | null;
  max_ticket_sar: number | null;
};

type PreferenceCategoryRow = {
  category_id: string | null;
};

type PreferenceStageRow = {
  startup_stage: string | null;
};

type PreferenceRiskRow = {
  risk_level: string | null;
};

type PreferenceTechnologyRow = {
  technology_id: string | null;
};

type ProjectTechnologyRow = {
  technology_id: string | null;
};

type ProjectEvaluationRow = {
  risk_level: string | null;
  risk_score: number | null;
  ai_summary: string | null;
  created_at: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  company_name: string | null;
  short_pitch: string | null;
  category_id: string | null;
  startup_stage: string | null;
  capital_seeking_sar: number | null;
  investment_status: string | null;
  created_at: string | null;
  project_technologies: ProjectTechnologyRow[] | null;
  project_ai_evaluations: ProjectEvaluationRow[] | null;
};

type InterestProjectRow = {
  id: string;
  title: string;
  company_name: string | null;
  short_pitch: string | null;
  investment_status: string | null;
  category_id: string | null;
  startup_stage: string | null;
  capital_seeking_sar: number | null;
  project_technologies: ProjectTechnologyRow[] | null;
};

type RecentInterestRow = {
  id: string;
  created_at: string | null;
  project: InterestProjectRow | null;
};

type NotificationRow = {
  id: string;
  type: string | null;
  title: string;
  body: string | null;
  ref_type: string | null;
  ref_id: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

type DashboardStats = {
  suitableProjects: number;
  interestedProjects: number;
  offersCount: number;
  openDeals: number;
};

type RecommendedProject = {
  id: string;
  title: string;
  companyName: string;
  shortPitch: string;
  aiSummary: string;
  riskLevel: string;
  riskScore: number | null;
  capitalSeekingSar: number | null;
  investmentStatus: string;
  matchScore: number;
  matchReasons: string[];
  createdAt: string | null;
};

type RecentNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string | null;
  linkTo: string;
};

type RecentInterest = {
  id: string;
  createdAt: string | null;
  projectId: string;
  title: string;
  companyName: string;
  shortPitch: string;
  investmentStatus: string;
  capitalSeekingSar: number | null;
};

type DashboardState = {
  stats: DashboardStats;
  recommendedProjects: RecommendedProject[];
  recentNotifications: RecentNotification[];
  recentInterests: RecentInterest[];
  hasPreferences: boolean;
};

const initialState: DashboardState = {
  stats: {
    suitableProjects: 0,
    interestedProjects: 0,
    offersCount: 0,
    openDeals: 0,
  },
  recommendedProjects: [],
  recentNotifications: [],
  recentInterests: [],
  hasPreferences: false,
};

function getLatestEvaluation(evaluations: ProjectEvaluationRow[] | null | undefined) {
  if (!evaluations || evaluations.length === 0) {
    return null;
  }

  return [...evaluations].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  })[0];
}

function getProjectTechnologyIds(project: {
  project_technologies?: ProjectTechnologyRow[] | null;
}) {
  return (project.project_technologies ?? [])
    .map((item) => item.technology_id)
    .filter((value): value is string => Boolean(value));
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("ar-SA").format(value);
}

function buildNotificationLink(refType: string | null, refId: string | null) {
  if ((refType === "project" || refType === "projects") && refId) {
    return `${ROUTES.investor.explore}/${refId}`;
  }

  if ((refType === "offer" || refType === "offers") && refId) {
    return `${ROUTES.investor.offers}/${refId}`;
  }

  if ((refType === "deal" || refType === "deals") && refId) {
    return `${ROUTES.investor.deals}/${refId}`;
  }

  return ROUTES.investor.notifications;
}

export default function InvestorDashboardPage() {
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [dashboard, setDashboard] = useState<DashboardState>(initialState);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboardData(showRefreshState = false) {
    if (!appUser?.id) {
      setIsPageLoading(false);
      return;
    }

    try {
      setErrorMessage("");

      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsPageLoading(true);
      }

      const [
        preferenceResponse,
        preferenceCategoriesResponse,
        preferenceStagesResponse,
        preferenceRiskLevelsResponse,
        preferenceTechnologiesResponse,
        projectsResponse,
        recentInterestsResponse,
        interestCountResponse,
        offersCountResponse,
        dealsCountResponse,
        notificationsResponse,
      ] = await Promise.all([
        supabase
          .from("investor_preferences")
          .select("min_ticket_sar, max_ticket_sar")
          .eq("investor_id", appUser.id)
          .maybeSingle<PreferenceRow>(),

        supabase
          .from("investor_preference_categories")
          .select("category_id")
          .eq("investor_id", appUser.id)
          .returns<PreferenceCategoryRow[]>(),

        supabase
          .from("investor_preference_stages")
          .select("startup_stage")
          .eq("investor_id", appUser.id)
          .returns<PreferenceStageRow[]>(),

        supabase
          .from("investor_preference_risk_levels")
          .select("risk_level")
          .eq("investor_id", appUser.id)
          .returns<PreferenceRiskRow[]>(),

        supabase
          .from("investor_preference_technologies")
          .select("technology_id")
          .eq("investor_id", appUser.id)
          .returns<PreferenceTechnologyRow[]>(),

        supabase
          .from("projects")
          .select(
            `
            id,
            title,
            company_name,
            short_pitch,
            category_id,
            startup_stage,
            capital_seeking_sar,
            investment_status,
            created_at,
            project_technologies (
              technology_id
            ),
            project_ai_evaluations (
              risk_level,
              risk_score,
              ai_summary,
              created_at
            )
          `
          )
          .eq("approval_status", "approved")
          .eq("publication_status", "published")
          .neq("investment_status", "closed")
          .order("created_at", { ascending: false })
          .limit(60)
          .returns<ProjectRow[]>(),

        supabase
          .from("investor_project_interests")
          .select(
            `
            id,
            created_at,
            project:projects (
              id,
              title,
              company_name,
              short_pitch,
              investment_status,
              category_id,
              startup_stage,
              capital_seeking_sar,
              project_technologies (
                technology_id
              )
            )
          `
          )
          .eq("investor_id", appUser.id)
          .order("created_at", { ascending: false })
          .limit(5)
          .returns<RecentInterestRow[]>(),

        supabase
          .from("investor_project_interests")
          .select("id", { count: "exact", head: true })
          .eq("investor_id", appUser.id),

        supabase
          .from("investment_offers")
          .select("id", { count: "exact", head: true })
          .eq("investor_id", appUser.id),

        supabase
          .from("deals")
          .select("id", { count: "exact", head: true })
          .eq("investor_id", appUser.id)
          .in("status", ["open", "in_progress", "contact_shared"]),

        supabase
          .from("notifications")
          .select("id, type, title, body, ref_type, ref_id, is_read, created_at")
          .eq("recipient_id", appUser.id)
          .order("created_at", { ascending: false })
          .limit(6)
          .returns<NotificationRow[]>(),
      ]);

      const possibleErrors = [
        preferenceResponse.error,
        preferenceCategoriesResponse.error,
        preferenceStagesResponse.error,
        preferenceRiskLevelsResponse.error,
        preferenceTechnologiesResponse.error,
        projectsResponse.error,
        recentInterestsResponse.error,
        interestCountResponse.error,
        offersCountResponse.error,
        dealsCountResponse.error,
        notificationsResponse.error,
      ].filter(Boolean);

      if (possibleErrors.length > 0) {
        throw new Error(possibleErrors[0]?.message || "تعذر تحميل بيانات لوحة المستثمر.");
      }

      const preference = preferenceResponse.data ?? null;

      const preferenceCategoryIds = (preferenceCategoriesResponse.data ?? [])
        .map((item: PreferenceCategoryRow) => item.category_id)
        .filter((value: string | null): value is string => Boolean(value));
      
      const preferenceStages = (preferenceStagesResponse.data ?? [])
        .map((item: PreferenceStageRow) => item.startup_stage)
        .filter((value: string | null): value is string => Boolean(value));
      
      const preferenceRiskLevels = (preferenceRiskLevelsResponse.data ?? [])
        .map((item: PreferenceRiskRow) => item.risk_level)
        .filter((value: string | null): value is string => Boolean(value));
      
      const preferenceTechnologyIds = (preferenceTechnologiesResponse.data ?? [])
        .map((item: PreferenceTechnologyRow) => item.technology_id)
        .filter((value: string | null): value is string => Boolean(value));
      
      const recentInterestRows = (recentInterestsResponse.data ?? []).filter(
        (item: RecentInterestRow): item is RecentInterestRow & { project: InterestProjectRow } =>
          Boolean(item.project)
      );
      
      const historicalCategoryIds = recentInterestRows
        .map((item: RecentInterestRow & { project: InterestProjectRow }) => item.project.category_id)
        .filter((value: string | null): value is string => Boolean(value));
      
      const historicalTechnologyIds = recentInterestRows.flatMap(
        (item: RecentInterestRow & { project: InterestProjectRow }) =>
          getProjectTechnologyIds(item.project)
      );

      const hasPreferences =
        Boolean(preference?.min_ticket_sar || preference?.max_ticket_sar) ||
        preferenceCategoryIds.length > 0 ||
        preferenceStages.length > 0 ||
        preferenceRiskLevels.length > 0 ||
        preferenceTechnologyIds.length > 0;

        const recommendedProjects = (projectsResponse.data ?? [])
        .map((project: ProjectRow): RecommendedProject => {
          const latestEvaluation = getLatestEvaluation(project.project_ai_evaluations);
          const projectTechnologyIds = getProjectTechnologyIds(project);

          const reasons: string[] = [];
          let score = 0;

          if (project.category_id && preferenceCategoryIds.includes(project.category_id)) {
            score += 30;
            reasons.push("مطابقة للفئة");
          }

          if (project.startup_stage && preferenceStages.includes(project.startup_stage)) {
            score += 20;
            reasons.push("مطابقة للمرحلة");
          }

          if (latestEvaluation?.risk_level && preferenceRiskLevels.includes(latestEvaluation.risk_level)) {
            score += 22;
            reasons.push("مطابقة للمخاطرة");
          }

          const technologyOverlap = projectTechnologyIds.filter((item) =>
            preferenceTechnologyIds.includes(item)
          ).length;

          if (technologyOverlap > 0) {
            score += Math.min(technologyOverlap * 8, 20);
            reasons.push(`تقاطع تقني (${technologyOverlap})`);
          }

          if (preference?.min_ticket_sar !== null && preference?.max_ticket_sar !== null && project.capital_seeking_sar !== null) {
            if (
              project.capital_seeking_sar >= preference!.min_ticket_sar &&
              project.capital_seeking_sar <= preference!.max_ticket_sar
            ) {
              score += 14;
              reasons.push("ضمن نطاق التذكرة");
            }
          } else if (preference?.max_ticket_sar !== null && project.capital_seeking_sar !== null) {
            if (project.capital_seeking_sar <= preference!.max_ticket_sar) {
              score += 10;
              reasons.push("مناسب لحجم الاستثمار");
            }
          }

          if (project.category_id && historicalCategoryIds.includes(project.category_id)) {
            score += 8;
            reasons.push("مشابه لاهتماماتك السابقة");
          }

          const historicalTechOverlap = projectTechnologyIds.filter((item) =>
            historicalTechnologyIds.includes(item)
          ).length;

          if (historicalTechOverlap > 0) {
            score += Math.min(historicalTechOverlap * 3, 9);
            reasons.push("متقاطع مع سجل الاهتمامات");
          }

          const createdAtTime = project.created_at ? new Date(project.created_at).getTime() : 0;
          const now = Date.now();
          const daysDiff = createdAtTime ? Math.floor((now - createdAtTime) / (1000 * 60 * 60 * 24)) : 999;

          if (daysDiff <= 7) {
            score += 6;
          } else if (daysDiff <= 30) {
            score += 3;
          }

          if (!hasPreferences && latestEvaluation?.risk_score !== null && latestEvaluation?.risk_score !== undefined) {
            const normalizedRiskBonus =
              latestEvaluation.risk_score <= 1
                ? Math.max(0, Math.round((1 - latestEvaluation.risk_score) * 15))
                : 0;

            score += normalizedRiskBonus;
          }

          if (!hasPreferences && reasons.length === 0) {
            reasons.push("مرشح عام مناسب للبداية");
          }

          return {
            id: project.id,
            title: project.title,
            companyName: project.company_name ?? "بدون اسم شركة",
            shortPitch: project.short_pitch ?? "لا يوجد وصف مختصر متاح حالياً.",
            aiSummary: latestEvaluation?.ai_summary ?? "لا يوجد ملخص ذكي متاح حالياً لهذا المشروع.",
            riskLevel: latestEvaluation?.risk_level ?? "غير محدد",
            riskScore: latestEvaluation?.risk_score ?? null,
            capitalSeekingSar: project.capital_seeking_sar ?? null,
            investmentStatus: project.investment_status ?? "open",
            matchScore: score,
            matchReasons: reasons,
            createdAt: project.created_at ?? null,
          };
        })
        .filter((project: RecommendedProject) => (hasPreferences ? project.matchScore > 0 : true))
        .sort((a: RecommendedProject, b: RecommendedProject) => {
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }

          const aRisk = a.riskScore ?? 999;
          const bRisk = b.riskScore ?? 999;

          if (aRisk !== bRisk) {
            return aRisk - bRisk;
          }

          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

      const recentNotifications: RecentNotification[] = (notificationsResponse.data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body ?? "",
        type: item.type ?? "system",
        isRead: Boolean(item.is_read),
        createdAt: item.created_at ?? null,
        linkTo: buildNotificationLink(item.ref_type, item.ref_id),
      }));

      const recentInterests: RecentInterest[] = recentInterestRows.map((item) => ({
        id: item.id,
        createdAt: item.created_at ?? null,
        projectId: item.project.id,
        title: item.project.title,
        companyName: item.project.company_name ?? "بدون اسم شركة",
        shortPitch: item.project.short_pitch ?? "لا يوجد وصف مختصر متاح.",
        investmentStatus: item.project.investment_status ?? "open",
        capitalSeekingSar: item.project.capital_seeking_sar ?? null,
      }));

      setDashboard({
        hasPreferences,
        stats: {
          suitableProjects: recommendedProjects.length,
          interestedProjects: interestCountResponse.count ?? 0,
          offersCount: offersCountResponse.count ?? 0,
          openDeals: dealsCountResponse.count ?? 0,
        },
        recommendedProjects: recommendedProjects.slice(0, 6),
        recentNotifications,
        recentInterests,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء تحميل لوحة المستثمر."
      );
    } finally {
      setIsPageLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (!appUser?.id || appUser.role !== "investor") {
      setIsPageLoading(false);
      return;
    }

    void loadDashboardData();
  }, [appUser?.id, appUser?.role]);

  const welcomeName = useMemo(() => {
    if (!appUser?.full_name) {
      return "المستثمر";
    }

    const parts = appUser.full_name.trim().split(" ");
    return parts[0] || appUser.full_name;
  }, [appUser?.full_name]);

  if (isAuthLoading || isPageLoading) {
    return (
      <section className="investor-dashboard">
        <div className="investor-dashboard__hero investor-dashboard__hero--loading" />
        <InvestorStatsCards
          isLoading
          stats={{
            suitableProjects: 0,
            interestedProjects: 0,
            offersCount: 0,
            openDeals: 0,
          }}
        />
        <div className="investor-dashboard__grid">
          <div className="investor-dashboard__skeleton-card" />
          <div className="investor-dashboard__skeleton-card" />
          <div className="investor-dashboard__skeleton-card investor-dashboard__skeleton-card--wide" />
        </div>
      </section>
    );
  }

  if (!appUser || appUser.role !== "investor") {
    return (
      <section className="investor-dashboard investor-dashboard__center">
        <div className="investor-dashboard__empty-card">
          <h2>لا يمكن عرض لوحة المستثمر حالياً</h2>
          <p>لم يتم العثور على حساب مستثمر صالح لعرض هذه الصفحة.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="investor-dashboard">
      <div className="investor-dashboard__hero">
        <div className="investor-dashboard__hero-content">
          <span className="investor-dashboard__eyebrow">لوحة المستثمر</span>
          <h1 className="investor-dashboard__title">مرحباً {welcomeName}</h1>
          <p className="investor-dashboard__subtitle">
            هنا تظهر لك المشاريع الأقرب لتفضيلاتك واهتماماتك السابقة، مع إشعاراتك الأخيرة
            وحالة نشاطك داخل المنصة.
          </p>

          <div className="investor-dashboard__hero-actions">
            <Link to={ROUTES.investor.explore} className="btn btn--primary">
              استكشاف المشاريع
            </Link>
            <Link to={ROUTES.investor.preferences} className="btn btn--ghost">
              تعديل التفضيلات
            </Link>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void loadDashboardData(true)}
              disabled={isRefreshing}
            >
              {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
            </button>
          </div>
        </div>

        <div className="investor-dashboard__hero-side">
          <div className="investor-dashboard__summary-box">
            <h3>ملخص سريع</h3>
            <ul>
              <li>المشاريع المناسبة: {formatNumber(dashboard.stats.suitableProjects)}</li>
              <li>المشاريع المهتم بها: {formatNumber(dashboard.stats.interestedProjects)}</li>
              <li>العروض المقدمة: {formatNumber(dashboard.stats.offersCount)}</li>
              <li>الصفقات المفتوحة: {formatNumber(dashboard.stats.openDeals)}</li>
            </ul>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="investor-dashboard__error">
          <div>
            <strong>تعذر تحميل بعض البيانات</strong>
            <p>{errorMessage}</p>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void loadDashboardData(true)}
            disabled={isRefreshing}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      <InvestorStatsCards isLoading={false} stats={dashboard.stats} />

      <div className="investor-dashboard__quick-actions">
        <Link to={ROUTES.investor.explore} className="investor-dashboard__quick-action">
          <span>استكشاف المشاريع</span>
          <small>تصفح المشاريع المنشورة والمعتمدة</small>
        </Link>

        <Link to={ROUTES.investor.interests} className="investor-dashboard__quick-action">
          <span>المشاريع المهتم بها</span>
          <small>راجع المشاريع التي وضعت عليها اهتماماً</small>
        </Link>

        <Link to={ROUTES.investor.offers} className="investor-dashboard__quick-action">
          <span>عروضي</span>
          <small>تابع العروض الاستثمارية التي قدمتها</small>
        </Link>

        <Link to={ROUTES.investor.preferences} className="investor-dashboard__quick-action">
          <span>تفضيلاتي</span>
          <small>حدّث الفئات والمراحل والمخاطر المناسبة لك</small>
        </Link>
      </div>

      <div className="investor-dashboard__grid">
        <div className="investor-dashboard__main">
          <RecommendedProjectsSection
            isLoading={false}
            hasPreferences={dashboard.hasPreferences}
            projects={dashboard.recommendedProjects}
          />
        </div>

        <div className="investor-dashboard__side">
          <RecentNotificationsSection
            isLoading={false}
            notifications={dashboard.recentNotifications}
          />

          <RecentInterestsSection
            isLoading={false}
            interests={dashboard.recentInterests}
          />
        </div>
      </div>
    </section>
  );
}