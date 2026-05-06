import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { ROUTES } from "../../core/constants/routes";
import { useAuthUser } from "../../core/hooks/useAuthUser";
import EntrepreneurSidebar from "../../features/entrepreneur/layout/components/EntrepreneurSidebar";
import EntrepreneurTopbar from "../../features/entrepreneur/layout/components/EntrepreneurTopbar";

type EntrepreneurProfileRow = {
  organization_name: string | null;
};

function resolveEntrepreneurPageTitle(pathname: string) {
  if (pathname === ROUTES.entrepreneur.dashboard) return "لوحة التحكم";
  if (pathname === ROUTES.entrepreneur.profile) return "الملف الشخصي";
  if (pathname === ROUTES.entrepreneur.profileEdit) return "تعديل الملف الشخصي";
  if (pathname === ROUTES.entrepreneur.projects) return "مشاريعي";
  if (pathname === ROUTES.entrepreneur.createProject) return "إضافة مشروع";
  if (pathname.startsWith(`${ROUTES.entrepreneur.projects}/`) && pathname.endsWith("/edit")) {
    return "تعديل المشروع";
  }
  if (pathname.startsWith(`${ROUTES.entrepreneur.projects}/`)) return "تفاصيل المشروع";
  if (pathname === ROUTES.entrepreneur.browseInvestors) return "استعراض المستثمرين";
  if (pathname === ROUTES.entrepreneur.offers) return "العروض المستلمة";
  if (pathname.startsWith(`${ROUTES.entrepreneur.offers}/`)) return "مراجعة العرض";
  if (pathname === ROUTES.entrepreneur.chats) return "المحادثات";
  if (pathname.startsWith(`${ROUTES.entrepreneur.chats}/`)) return "تفاصيل المحادثة";
  if (pathname === ROUTES.entrepreneur.notifications) return "الإشعارات";
  if (pathname.startsWith(`${ROUTES.entrepreneur.notifications}/`)) return "تفاصيل الإشعار";
  return "رائد الأعمال";
}

export default function EntrepreneurLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser, isLoading } = useAuthUser();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const pageTitle = useMemo(
    () => resolveEntrepreneurPageTitle(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    async function loadHeaderData() {
      if (!appUser) {
        setOrganizationName("");
        setUnreadNotificationsCount(0);
        return;
      }

      const [profileResponse, notificationsCountResponse] = await Promise.all([
        supabase
          .from("entrepreneur_profiles")
          .select("organization_name")
          .eq("user_id", appUser.id)
          .maybeSingle(),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", appUser.id)
          .eq("is_read", false),
      ]);

      if (!profileResponse.error) {
        const profile = profileResponse.data as EntrepreneurProfileRow | null;
        setOrganizationName(profile?.organization_name ?? "");
      }

      if (!notificationsCountResponse.error) {
        setUnreadNotificationsCount(notificationsCountResponse.count ?? 0);
      }
    }

    void loadHeaderData();
  }, [appUser, location.pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate(ROUTES.auth.signIn, { replace: true });
  }

  if (isLoading) {
    return <div className="panel-loading-screen">جاري تحميل واجهة رائد الأعمال...</div>;
  }

  if (!appUser) {
    return <div className="panel-loading-screen">تعذر تحميل بيانات المستخدم الحالي.</div>;
  }

  return (
    <div className="entrepreneur-shell">
      <EntrepreneurSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        fullName={appUser.full_name}
        email={appUser.email}
        organizationName={organizationName}
      />

      <div className="entrepreneur-shell__main">
        <EntrepreneurTopbar
          title={pageTitle}
          fullName={appUser.full_name}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="entrepreneur-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}