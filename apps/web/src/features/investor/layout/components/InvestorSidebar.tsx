import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, type NavLinkRenderProps } from "react-router-dom";
// import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "../../../../core/constants/routes";
import { APP_CONFIG } from "../../../../core/config/app-config";
import { useAuthUser } from "../../../../core/hooks/useAuthUser";
import { supabase } from "../../../../lib/supabase/client";

type InvestorSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

const navItems = [
  { label: "لوحة المستثمر", to: ROUTES.investor.dashboard },
  { label: "الملف الشخصي", to: ROUTES.investor.profile },
  { label: "التفضيلات", to: ROUTES.investor.preferences },
  { label: "استكشاف المشاريع", to: ROUTES.investor.explore },
  { label: "المشاريع المهتم بها", to: ROUTES.investor.interests },
  { label: "عروضي الاستثمارية", to: ROUTES.investor.offers },
  { label: "الصفقات", to: ROUTES.investor.deals },
  { label: "المحادثات", to: ROUTES.investor.chats },
  { label: "الإشعارات", to: ROUTES.investor.notifications },
];

export default function InvestorSidebar({
  isOpen,
  onClose,
  onLogout,
  isLoggingOut,
}: InvestorSidebarProps) {
  const { appUser } = useAuthUser();
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    async function loadInvestorProfile() {
      if (!appUser?.id) return;

      const { data } = await supabase
        .from("investor_profiles")
        .select("organization_name")
        .eq("user_id", appUser.id)
        .maybeSingle();

      setOrganizationName(data?.organization_name ?? "");
    }

    void loadInvestorProfile();
  }, [appUser?.id]);

  const initials = useMemo(() => {
    const name = appUser?.full_name?.trim() ?? "";
    if (!name) return "م";
    return name.split(" ").slice(0, 2).map((part) => part[0]).join("");
  }, [appUser?.full_name]);

  return (
    <aside className={`investor-sidebar ${isOpen ? "investor-sidebar--open" : ""}`}>
      <div className="investor-sidebar__head">
        <Link to={ROUTES.investor.dashboard} className="investor-brand" onClick={onClose}>
          <span className="investor-brand__logo">ج</span>
          <div className="investor-brand__content">
            <strong>{APP_CONFIG.appNameAr || "جسر الملاك"}</strong>
            <span>{APP_CONFIG.appTaglineAr || "منصة ذكية لربط المستثمرين برواد الأعمال"}</span>
          </div>
        </Link>

        <button type="button" className="investor-sidebar__close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="investor-sidebar__profile">
        <div className="investor-sidebar__avatar">{initials}</div>

        <div className="investor-sidebar__profile-text">
          <strong>{appUser?.full_name || "مستثمر"}</strong>
          <span>{organizationName || "ملف مستثمر"}</span>
        </div>
      </div>

      <nav className="investor-sidebar__nav">
  {navItems.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === ROUTES.investor.dashboard}
      onClick={onClose}
      className={({ isActive }: NavLinkRenderProps) =>
        isActive
          ? "investor-sidebar__link investor-sidebar__link--active"
          : "investor-sidebar__link"
      }
    >
      {item.label}
    </NavLink>
  ))}
</nav>

      <div className="investor-sidebar__footer">
        <button
          type="button"
          className="investor-sidebar__logout"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </aside>
  );
}