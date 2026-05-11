import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabase/client";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import ReceivedOffersTable, { type ReceivedOfferItem } from "../components/ReceivedOffersTable";

type OfferRow = {
  id: string;
  project_id: string;
  investor_id: string;
  amount?: never;
  offer_amount_sar: number | null;
  equity_percentage: number | null;
  status: string;
  created_at: string;
};

type ProjectRow = {
  id: string;
  title: string;
};

type UserRow = {
  id: string;
  full_name: string | null;
};

export default function ReceivedOffersPage() {
  const { appUser, isLoading } = useAuthUser();
  const [searchParams] = useSearchParams();

  const [offers, setOffers] = useState<ReceivedOfferItem[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadOffers() {
      if (!appUser || appUser.role !== "entrepreneur") {
        setIsPageLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        setIsPageLoading(true);

        let query = supabase
          .from("investment_offers")
          .select("id,project_id,investor_id,offer_amount_sar,equity_percentage,status,created_at")
          .eq("entrepreneur_id", appUser.id)
          .order("created_at", { ascending: false });

        const projectId = searchParams.get("projectId");
        if (projectId) {
          query = query.eq("project_id", projectId);
        }

        const { data: offerRows, error: offersError } = await query;

        if (offersError) {
          throw offersError;
        }

        const safeOffers = (offerRows ?? []) as OfferRow[];

        if (!safeOffers.length) {
          setOffers([]);
          return;
        }

        const projectIds = Array.from(new Set(safeOffers.map((item) => item.project_id)));
        const investorIds = Array.from(new Set(safeOffers.map((item) => item.investor_id)));

        const [{ data: projectRows }, { data: userRows }] = await Promise.all([
          supabase.from("projects").select("id,title").in("id", projectIds),
          supabase.from("users").select("id,full_name").in("id", investorIds),
        ]);

        const projectMap = new Map<string, ProjectRow>();
        ((projectRows ?? []) as ProjectRow[]).forEach((item: ProjectRow) => {
          projectMap.set(item.id, item);
        });

        const userMap = new Map<string, UserRow>();
        ((userRows ?? []) as UserRow[]).forEach((item: UserRow) => {
          userMap.set(item.id, item);
        });

        const mappedOffers: ReceivedOfferItem[] = safeOffers.map((offer: OfferRow) => ({
          id: offer.id,
          projectId: offer.project_id,
          projectTitle: projectMap.get(offer.project_id)?.title || "مشروع",
          investorName: userMap.get(offer.investor_id)?.full_name?.trim() || "مستثمر",
          amount: offer.offer_amount_sar,
          equity: offer.equity_percentage,
          status: offer.status,
          createdAt: offer.created_at,
        }));

        setOffers(mappedOffers);
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر تحميل العروض المستلمة.";
        setErrorMessage(message);
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadOffers();
  }, [appUser, searchParams]);

  const filteredOffers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return offers.filter((offer: ReceivedOfferItem) => {
      const matchesSearch =
        !normalizedSearch ||
        offer.projectTitle.toLowerCase().includes(normalizedSearch) ||
        offer.investorName.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || offer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [offers, search, statusFilter]);

  if (isLoading || isPageLoading) {
    return (
      <section className="entrepreneur-page">
        <div className="entrepreneur-page__loading">جاري تحميل العروض المستلمة...</div>
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
          <h1 className="entrepreneur-page__title">العروض المستلمة</h1>
          <p className="entrepreneur-page__subtitle">
            راجع جميع العروض الاستثمارية الواردة على مشاريعك واتخذ القرار المناسب.
          </p>
        </div>
      </div>

      <section className="entrepreneur-toolbar">
        <div className="entrepreneur-toolbar__search">
          <label htmlFor="received-offers-search">البحث</label>
          <input
            id="received-offers-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم المستثمر أو المشروع"
          />
        </div>

        <div className="entrepreneur-toolbar__filters">
          <div>
            <label htmlFor="received-offers-status">حالة العرض</label>
            <select
              id="received-offers-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">الكل</option>
              <option value="pending">بانتظار الرد</option>
              <option value="accepted">مقبول</option>
              <option value="rejected">مرفوض</option>
              <option value="negotiating">تفاوض</option>
              <option value="withdrawn">مسحوب</option>
            </select>
          </div>
        </div>
      </section>

      {errorMessage ? <div className="entrepreneur-page__error">{errorMessage}</div> : null}

      <ReceivedOffersTable offers={filteredOffers} />
    </section>
  );
}