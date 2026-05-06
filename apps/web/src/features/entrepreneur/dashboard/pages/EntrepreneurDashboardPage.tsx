import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import EntrepreneurStatsCards from "../components/EntrepreneurStatsCards";
import MyRecentProjectsSection from "../components/MyRecentProjectsSection";
import LatestOffersSection from "../components/LatestOffersSection";
import RecentNotificationsSection from "../components/RecentNotificationsSection";

type ProjectRow = {
  id: string;
  title: string | null;
  company_name: string | null;
  approval_status: string | null;
  publication_status: string | null;
  investment_status: string | null;
  created_at: string | null;
  confidence_level: string | null;
};

type EvaluationRow = {
  project_id: string;
  risk_level: string | null;
  risk_score: number | null;
  explanation_payload: unknown;
};

type ProjectRelation = {
  id: string;
  title: string | null;
} | null;

type InvestorRelation = {
  id: string;
  full_name: string | null;
} | null;

type OfferRow = {
  id: string;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
  status: string | null;
  created_at: string | null;
  project: ProjectRelation | ProjectRelation[];
  investor: InvestorRelation | InvestorRelation[];
};

type NotificationRow = {
  id: string;
  title: string | null;
  body: string | null;
  is_read: boolean | null;
  created_at: string | null;
  ref_type: string | null;
  ref_id: string | null;
};

type DashboardStats = {
  totalProjects: number;
  publishedProjects: number;
  receivedOffers: number;
  openDeals: number;
};

export type DashboardProjectCard = {
  id: string;
  title: string;
  companyName: string;
  approvalStatus: string;
  publicationStatus: string;
  investmentStatus: string;
  createdAt: string;
  riskLevel: string | null;
  riskScore: number | null;
  confidenceLevel: string | null;
};

export type DashboardOfferCard = {
  id: string;
  amount: number | null;
  equity: number | null;
  status: string;
  createdAt: string;
  projectTitle: string;
  investorName: string;
};

export type DashboardNotificationCard = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  refType: string | null;
  refId: string | null;
};

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function extractConfidenceLevel(payload: unknown, fallback: string | null) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    const value = record.confidence_level;

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

export default function EntrepreneurDashboardPage() {
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    publishedProjects: 0,
    receivedOffers: 0,
    openDeals: 0,
  });
  const [projects, setProjects] = useState<DashboardProjectCard[]>([]);
  const [offers, setOffers] = useState<DashboardOfferCard[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotificationCard[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      if (!appUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const [
          projectsResponse,
          offersCountResponse,
          latestOffersResponse,
          openDealsCountResponse,
          notificationsResponse,
        ] = await Promise.all([
          supabase
            .from("projects")
            .select(
              "id, title, company_name, approval_status, publication_status, investment_status, created_at, confidence_level"
            )
            .eq("entrepreneur_id", appUser.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("investment_offers")
            .select("id", { count: "exact", head: true })
            .eq("entrepreneur_id", appUser.id),
          supabase
            .from("investment_offers")
            .select(
              `
                id,
                offer_amount_sar,
                equity_percentage,
                status,
                created_at,
                project:projects!investment_offers_project_id_fkey (
                  id,
                  title
                ),
                investor:users!investment_offers_investor_id_fkey (
                  id,
                  full_name
                )
              `
            )
            .eq("entrepreneur_id", appUser.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("deals")
            .select("id", { count: "exact", head: true })
            .eq("entrepreneur_id", appUser.id)
            .in("status", ["open", "in_progress", "contact_shared"]),
          supabase
            .from("notifications")
            .select("id, title, body, is_read, created_at, ref_type, ref_id")
            .eq("recipient_id", appUser.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (projectsResponse.error) {
          throw new Error(projectsResponse.error.message);
        }

        if (offersCountResponse.error) {
          throw new Error(offersCountResponse.error.message);
        }

        if (latestOffersResponse.error) {
          throw new Error(latestOffersResponse.error.message);
        }

        if (openDealsCountResponse.error) {
          throw new Error(openDealsCountResponse.error.message);
        }

        if (notificationsResponse.error) {
          throw new Error(notificationsResponse.error.message);
        }

        const projectRows = (projectsResponse.data ?? []) as ProjectRow[];
        const projectIds = projectRows.map((item: ProjectRow) => item.id);

        let evaluationsRows: EvaluationRow[] = [];

        if (projectIds.length > 0) {
          const evaluationsResponse = await supabase
            .from("project_ai_evaluations")
            .select("project_id, risk_level, risk_score, explanation_payload, created_at")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false });

          if (evaluationsResponse.error) {
            throw new Error(evaluationsResponse.error.message);
          }

          evaluationsRows = (evaluationsResponse.data ?? []) as EvaluationRow[];
        }

        const latestEvaluationMap = new Map<string, EvaluationRow>();

        evaluationsRows.forEach((item: EvaluationRow) => {
          if (!latestEvaluationMap.has(item.project_id)) {
            latestEvaluationMap.set(item.project_id, item);
          }
        });

        const mappedProjects: DashboardProjectCard[] = projectRows.slice(0, 4).map((project: ProjectRow) => {
          const evaluation = latestEvaluationMap.get(project.id);

          return {
            id: project.id,
            title: project.title ?? "بدون عنوان",
            companyName: project.company_name ?? "غير محدد",
            approvalStatus: project.approval_status ?? "draft",
            publicationStatus: project.publication_status ?? "private",
            investmentStatus: project.investment_status ?? "open",
            createdAt: project.created_at ?? "",
            riskLevel: evaluation?.risk_level ?? null,
            riskScore: evaluation?.risk_score ?? null,
            confidenceLevel: extractConfidenceLevel(
              evaluation?.explanation_payload ?? null,
              project.confidence_level ?? null
            ),
          };
        });

        const latestOfferRows = (latestOffersResponse.data ?? []) as OfferRow[];

        const mappedOffers: DashboardOfferCard[] = latestOfferRows.map((item: OfferRow) => {
          const project = normalizeRelation<ProjectRelation>(item.project);
          const investor = normalizeRelation<InvestorRelation>(item.investor);

          return {
            id: item.id,
            amount: item.offer_amount_sar,
            equity: item.equity_percentage,
            status: item.status ?? "pending",
            createdAt: item.created_at ?? "",
            projectTitle: project?.title ?? "مشروع غير معروف",
            investorName: investor?.full_name ?? "مستثمر غير معروف",
          };
        });

        const notificationRows = (notificationsResponse.data ?? []) as NotificationRow[];

        const mappedNotifications: DashboardNotificationCard[] = notificationRows.map(
          (item: NotificationRow) => ({
            id: item.id,
            title: item.title ?? "إشعار",
            body: item.body ?? "",
            isRead: Boolean(item.is_read),
            createdAt: item.created_at ?? "",
            refType: item.ref_type ?? null,
            refId: item.ref_id ?? null,
          })
        );

        setStats({
          totalProjects: projectRows.length,
          publishedProjects: projectRows.filter(
            (item: ProjectRow) => item.publication_status === "published"
          ).length,
          receivedOffers: offersCountResponse.count ?? 0,
          openDeals: openDealsCountResponse.count ?? 0,
        });

        setProjects(mappedProjects);
        setOffers(mappedOffers);
        setNotifications(mappedNotifications);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "تعذر تحميل بيانات لوحة التحكم."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [appUser]);

  const quickLinks = useMemo(
    () => [
      { label: "إضافة مشروع", to: ROUTES.entrepreneur.createProject },
      { label: "مشاريعي", to: ROUTES.entrepreneur.projects },
      { label: "استعراض المستثمرين", to: ROUTES.entrepreneur.browseInvestors },
      { label: "العروض المستلمة", to: ROUTES.entrepreneur.offers },
      { label: "الملف الشخصي", to: ROUTES.entrepreneur.profile },
    ],
    []
  );

  if (isAuthLoading || isLoading) {
    return <div className="panel-loading-screen">جاري تحميل لوحة التحكم...</div>;
  }

  if (!appUser) {
    return <div className="panel-loading-screen">تعذر العثور على المستخدم الحالي.</div>;
  }

  return (
    <section className="entrepreneur-dashboard">
      <div className="panel-page-heading">
        <div>
          <h2 className="panel-page-heading__title">لوحة تحكم رائد الأعمال</h2>
          <p className="panel-page-heading__subtitle">
            متابعة سريعة لمشاريعك، عروضك، وإشعاراتك في مكان واحد.
          </p>
        </div>
      </div>

      {errorMessage ? <div className="panel-error-box">{errorMessage}</div> : null}

      <EntrepreneurStatsCards stats={stats} />

      <div className="entrepreneur-dashboard__quick-actions">
        {quickLinks.map((item) => (
          <Link key={item.to} to={item.to} className="entrepreneur-dashboard__quick-link">
            {item.label}
          </Link>
        ))}
      </div>

      <div className="entrepreneur-dashboard__grid">
        <div className="entrepreneur-dashboard__col entrepreneur-dashboard__col--wide">
          <MyRecentProjectsSection projects={projects} />
        </div>

        <div className="entrepreneur-dashboard__col">
          <LatestOffersSection offers={offers} />
        </div>

        <div className="entrepreneur-dashboard__col entrepreneur-dashboard__col--full">
          <RecentNotificationsSection notifications={notifications} />
        </div>
      </div>
    </section>
  );
}