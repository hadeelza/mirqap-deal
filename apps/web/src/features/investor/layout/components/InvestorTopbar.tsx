import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import { supabase } from "../../../../lib/supabase/client";

type InvestorTopbarProps = {
  pageTitle: string;
  onOpenSidebar: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export default function InvestorTopbar({
  pageTitle,
  onOpenSidebar,
  onLogout,
  isLoggingOut,
}: InvestorTopbarProps) {
  const { appUser } = useAuthUser();
  const [organizationName, setOrganizationName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadHeaderData() {
      if (!appUser?.id) return;

      const [{ data: profileData }, { count }] = await Promise.all([
        supabase
          .from("investor_profiles")
          .select("organization_name")
          .eq("user_id", appUser.id)
          .maybeSingle(),
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", appUser.id)
          .eq("is_read", false),
      ]);

      setOrganizationName(profileData?.organization_name ?? "");
      setUnreadCount(count ?? 0);
    }

    void loadHeaderData();
  }, [appUser?.id]);

  const initials = useMemo(() => {
    const name = appUser?.full_name?.trim() ?? "";
    if (!name) return "م";
    return name.split(" ").slice(0, 2).map((part) => part[0]).join("");
  }, [appUser?.full_name]);

  return (
    <header className="investor-topbar">
      <div className="investor-topbar__start">
        <button type="button" className="investor-topbar__menu" onClick={onOpenSidebar}>
          ☰
        </button>

        <div className="investor-topbar__title-wrap">
          <h1 className="investor-topbar__title">{pageTitle}</h1>
          <p className="investor-topbar__subtitle">
            {organizationName || "تابع مشاريعك واهتماماتك وعروضك الاستثمارية"}
          </p>
        </div>
      </div>

      <div className="investor-topbar__actions">
        <Link to={ROUTES.investor.notifications} className="investor-topbar__action">
          <span>الإشعارات</span>
          {unreadCount > 0 ? (
            <span className="investor-topbar__badge">{unreadCount}</span>
          ) : null}
        </Link>

        <Link to={ROUTES.investor.profile} className="investor-topbar__profile">
          <span className="investor-topbar__profile-avatar">{initials}</span>
          <div className="investor-topbar__profile-text">
            <strong>{appUser?.full_name || "مستثمر"}</strong>
            <span>{appUser?.email || "—"}</span>
          </div>
        </Link>

        <button
          type="button"
          className="investor-topbar__logout"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "جارٍ الخروج..." : "خروج"}
        </button>
      </div>
    </header>
  );
}