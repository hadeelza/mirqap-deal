import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import InvestorSidebar from "../../features/investor/layout/components/InvestorSidebar";
import InvestorTopbar from "../../features/investor/layout/components/InvestorTopbar";
import { ROUTES } from "../../core/constants/routes";
import { supabase } from "../../lib/supabase/client";

function getInvestorPageTitle(pathname: string) {
  if (pathname.includes("/investor/profile")) return "الملف الشخصي";
  if (pathname.includes("/investor/preferences")) return "التفضيلات الاستثمارية";
  if (pathname.includes("/investor/explore")) return "استكشاف المشاريع";
  if (pathname.includes("/investor/interests")) return "المشاريع المهتم بها";
  if (pathname.includes("/investor/offers")) return "عروضي الاستثمارية";
  if (pathname.includes("/investor/deals")) return "الصفقات";
  if (pathname.includes("/investor/chats")) return "المحادثات";
  if (pathname.includes("/investor/notifications")) return "الإشعارات";
  return "لوحة المستثمر";
}

export default function InvestorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pageTitle = useMemo(() => getInvestorPageTitle(location.pathname), [location.pathname]);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      navigate(ROUTES.auth.signIn, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="investor-shell" dir="rtl">
      <InvestorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => void handleLogout()}
        isLoggingOut={isLoggingOut}
      />

      {sidebarOpen ? (
        <button
          type="button"
          className="investor-shell__backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="إغلاق القائمة"
        />
      ) : null}

      <div className="investor-shell__body">
        <InvestorTopbar
          pageTitle={pageTitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={() => void handleLogout()}
          isLoggingOut={isLoggingOut}
        />

        <main className="investor-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}