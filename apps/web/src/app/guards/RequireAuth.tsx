import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../core/constants/routes";
import { useAuthUser } from "../../core/hooks/useAuthUser";

export default function RequireAuth({ children }: PropsWithChildren) {
  const { session, appUser, isLoading } = useAuthUser();
  const location = useLocation();

  if (isLoading) {
    return <div className="auth-loader">جاري التحقق من الجلسة...</div>;
  }

  if (!session) {
    return <Navigate to={ROUTES.auth.signIn} replace state={{ from: location }} />;
  }

  if (!appUser) {
    return <div className="auth-loader">جاري تحميل بيانات المستخدم...</div>;
  }

  if (appUser.account_status === "suspended") {
    return <Navigate to={ROUTES.public.main} replace />;
  }

  if (
    appUser.account_status === "pending" &&
    location.pathname !== ROUTES.auth.completeProfile
  ) {
    return <Navigate to={ROUTES.auth.completeProfile} replace />;
  }

  if (
    appUser.account_status === "active" &&
    location.pathname === ROUTES.auth.completeProfile
  ) {
    if (appUser.role === "admin") {
      return <Navigate to={ROUTES.admin.dashboard} replace />;
    }

    if (appUser.role === "investor") {
      return <Navigate to={ROUTES.investor.dashboard} replace />;
    }

    return <Navigate to={ROUTES.entrepreneur.dashboard} replace />;
  }

  return <>{children}</>;
}