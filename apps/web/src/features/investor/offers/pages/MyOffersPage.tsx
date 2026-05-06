import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import MyOffersTable, { type MyOfferItem } from "../components/MyOffersTable";

type OfferRow = {
  id: string;
  project_id: string;
  entrepreneur_id: string;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
  status: string;
  created_at: string;
  responded_at: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  company_name: string;
};

type UserRow = {
  id: string;
  full_name: string;
};

export default function MyOffersPage() {
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [items, setItems] = useState<MyOfferItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadPage() {
      if (!appUser || appUser.role !== "investor") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setPageError("");

        const offersResponse = await supabase
          .from("investment_offers")
          .select(
            "id, project_id, entrepreneur_id, offer_amount_sar, equity_percentage, status, created_at, responded_at"
          )
          .eq("investor_id", appUser.id)
          .order("created_at", { ascending: false });

        if (offersResponse.error) {
          throw offersResponse.error;
        }

        const offers = (offersResponse.data ?? []) as OfferRow[];

        if (offers.length === 0) {
          setItems([]);
          setIsLoading(false);
          return;
        }

        const projectIds = Array.from(new Set(offers.map((item: OfferRow) => item.project_id)));
        const entrepreneurIds = Array.from(
          new Set(offers.map((item: OfferRow) => item.entrepreneur_id))
        );

        const [projectsResponse, usersResponse] = await Promise.all([
          supabase.from("projects").select("id, title, company_name").in("id", projectIds),
          supabase.from("users").select("id, full_name").in("id", entrepreneurIds),
        ]);

        if (projectsResponse.error) {
          throw projectsResponse.error;
        }

        if (usersResponse.error) {
          throw usersResponse.error;
        }

        const projects = (projectsResponse.data ?? []) as ProjectRow[];
        const users = (usersResponse.data ?? []) as UserRow[];

        const projectMap = new Map<string, ProjectRow>();
        projects.forEach((project: ProjectRow) => {
          projectMap.set(project.id, project);
        });

        const usersMap = new Map<string, UserRow>();
        users.forEach((user: UserRow) => {
          usersMap.set(user.id, user);
        });

        const mappedItems: MyOfferItem[] = offers.map((offer: OfferRow) => {
          const project = projectMap.get(offer.project_id);
          const entrepreneur = usersMap.get(offer.entrepreneur_id);

          return {
            id: offer.id,
            projectId: offer.project_id,
            projectTitle: project?.title ?? "مشروع غير متوفر",
            companyName: project?.company_name ?? "—",
            entrepreneurName: entrepreneur?.full_name ?? "—",
            offerAmountSar: offer.offer_amount_sar,
            equityPercentage: offer.equity_percentage,
            status: offer.status,
            createdAt: offer.created_at,
            respondedAt: offer.responded_at,
          };
        });

        setItems(mappedItems);
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل العروض حالياً.";
        setPageError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadPage();
  }, [appUser]);

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") {
      return items;
    }

    return items.filter((item: MyOfferItem) => item.status === statusFilter);
  }, [items, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item: MyOfferItem) => item.status === "pending").length,
      accepted: items.filter((item: MyOfferItem) => item.status === "accepted").length,
      negotiating: items.filter((item: MyOfferItem) => item.status === "negotiating").length,
    };
  }, [items]);

  if (isAuthLoading || isLoading) {
    return <div className="page-loading">جارٍ تحميل العروض...</div>;
  }

  if (!appUser || appUser.role !== "investor") {
    return <div className="page-error">تعذر التحقق من حساب المستثمر الحالي.</div>;
  }

  return (
    <section className="investor-page offers-page">
      <div className="investor-page__header">
        <div>
          <h1 className="investor-page__title">عروضي الاستثمارية</h1>
          <p className="investor-page__subtitle">
            متابعة جميع العروض المرسلة وحالة كل عرض على المشاريع المختلفة.
          </p>
        </div>

        <div className="investor-page__actions">
          <select
            className="page-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="accepted">مقبول</option>
            <option value="rejected">مرفوض</option>
            <option value="negotiating">تفاوض</option>
            <option value="withdrawn">مسحوب</option>
          </select>
        </div>
      </div>

      <div className="investor-summary-strip">
        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">إجمالي العروض</span>
          <strong className="investor-summary-strip__value">{stats.total}</strong>
        </div>

        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">قيد الانتظار</span>
          <strong className="investor-summary-strip__value">{stats.pending}</strong>
        </div>

        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">مقبولة</span>
          <strong className="investor-summary-strip__value">{stats.accepted}</strong>
        </div>

        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">قيد التفاوض</span>
          <strong className="investor-summary-strip__value">{stats.negotiating}</strong>
        </div>
      </div>

      {pageError ? <div className="page-error">{pageError}</div> : null}

      {!filteredItems.length ? (
        <div className="page-empty">
          <h2>لا توجد عروض مطابقة</h2>
          <p>لم يتم العثور على عروض ضمن الحالة المحددة حالياً.</p>
        </div>
      ) : (
        <MyOffersTable items={filteredItems} />
      )}
    </section>
  );
}