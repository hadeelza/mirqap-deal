import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import InvestorDealsList, { type InvestorDealListItem } from "../components/InvestorDealsList";

type DealRow = {
  id: string;
  project_id: string;
  offer_id: string;
  entrepreneur_id: string;
  status: string;
  contact_shared_at: string | null;
  closed_at: string | null;
  created_at: string;
};

type OfferRow = {
  id: string;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
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

export default function InvestorDealsPage() {
  const { appUser, isLoading: isAuthLoading } = useAuthUser();

  const [items, setItems] = useState<InvestorDealListItem[]>([]);
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

        const dealsResponse = await supabase
          .from("deals")
          .select(
            "id, project_id, offer_id, entrepreneur_id, status, contact_shared_at, closed_at, created_at"
          )
          .eq("investor_id", appUser.id)
          .order("created_at", { ascending: false });

        if (dealsResponse.error) {
          throw dealsResponse.error;
        }

        const deals = (dealsResponse.data ?? []) as DealRow[];

        if (!deals.length) {
          setItems([]);
          return;
        }

        const projectIds = Array.from(new Set(deals.map((item: DealRow) => item.project_id)));
        const offerIds = Array.from(new Set(deals.map((item: DealRow) => item.offer_id)));
        const entrepreneurIds = Array.from(
          new Set(deals.map((item: DealRow) => item.entrepreneur_id))
        );

        const [projectsResponse, offersResponse, usersResponse] = await Promise.all([
          supabase.from("projects").select("id, title, company_name").in("id", projectIds),
          supabase.from("investment_offers").select("id, offer_amount_sar, equity_percentage").in("id", offerIds),
          supabase.from("users").select("id, full_name").in("id", entrepreneurIds),
        ]);

        if (projectsResponse.error) {
          throw projectsResponse.error;
        }

        if (offersResponse.error) {
          throw offersResponse.error;
        }

        if (usersResponse.error) {
          throw usersResponse.error;
        }

        const projectMap = new Map<string, ProjectRow>();
        ((projectsResponse.data ?? []) as ProjectRow[]).forEach((item: ProjectRow) => {
          projectMap.set(item.id, item);
        });

        const offerMap = new Map<string, OfferRow>();
        ((offersResponse.data ?? []) as OfferRow[]).forEach((item: OfferRow) => {
          offerMap.set(item.id, item);
        });

        const userMap = new Map<string, UserRow>();
        ((usersResponse.data ?? []) as UserRow[]).forEach((item: UserRow) => {
          userMap.set(item.id, item);
        });

        const mappedItems: InvestorDealListItem[] = deals.map((deal: DealRow) => {
          const project = projectMap.get(deal.project_id);
          const offer = offerMap.get(deal.offer_id);
          const entrepreneur = userMap.get(deal.entrepreneur_id);

          return {
            id: deal.id,
            projectId: deal.project_id,
            offerId: deal.offer_id,
            projectTitle: project?.title ?? "مشروع غير متوفر",
            companyName: project?.company_name ?? "—",
            entrepreneurName: entrepreneur?.full_name ?? "—",
            status: deal.status,
            contactSharedAt: deal.contact_shared_at,
            closedAt: deal.closed_at,
            createdAt: deal.created_at,
            offerAmountSar: offer?.offer_amount_sar ?? null,
            equityPercentage: offer?.equity_percentage ?? null,
          };
        });

        setItems(mappedItems);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "تعذر تحميل الصفقات حالياً.");
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

    return items.filter((item: InvestorDealListItem) => item.status === statusFilter);
  }, [items, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      open: items.filter((item: InvestorDealListItem) => item.status === "open").length,
      inProgress: items.filter((item: InvestorDealListItem) => item.status === "in_progress").length,
      contactShared: items.filter((item: InvestorDealListItem) => item.status === "contact_shared").length,
      closed: items.filter((item: InvestorDealListItem) => item.status === "closed").length,
    };
  }, [items]);

  if (isAuthLoading || isLoading) {
    return <div className="page-loading">جارٍ تحميل الصفقات...</div>;
  }

  if (!appUser || appUser.role !== "investor") {
    return <div className="page-error">تعذر التحقق من حساب المستثمر الحالي.</div>;
  }

  return (
    <section className="investor-page deals-page">
      <div className="investor-page__header">
        <div>
          <h1 className="investor-page__title">الصفقات</h1>
          <p className="investor-page__subtitle">
            جميع الصفقات الحالية المرتبطة بعروضك الاستثمارية.
          </p>
        </div>

        <div className="investor-page__actions">
          <select
            className="page-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="open">مفتوحة</option>
            <option value="in_progress">قيد المتابعة</option>
            <option value="contact_shared">تم تبادل التواصل</option>
            <option value="closed">مغلقة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>
      </div>

      <div className="investor-summary-strip">
        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">إجمالي الصفقات</span>
          <strong className="investor-summary-strip__value">{stats.total}</strong>
        </div>

        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">مفتوحة</span>
          <strong className="investor-summary-strip__value">{stats.open}</strong>
        </div>

        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">قيد المتابعة</span>
          <strong className="investor-summary-strip__value">{stats.inProgress}</strong>
        </div>

        <div className="investor-summary-strip__card">
          <span className="investor-summary-strip__label">تم تبادل التواصل</span>
          <strong className="investor-summary-strip__value">{stats.contactShared}</strong>
        </div>
      </div>

      {pageError ? <div className="page-error">{pageError}</div> : null}

      {!filteredItems.length ? (
        <div className="page-empty">
          <h2>لا توجد صفقات حالياً</h2>
          <p>عند إنشاء صفقة جديدة عبر المنصة ستظهر هنا مباشرة.</p>
        </div>
      ) : (
        <InvestorDealsList items={filteredItems} />
      )}
    </section>
  );
}