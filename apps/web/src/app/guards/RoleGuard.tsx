import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../core/hooks/useAuth";
import { ROUTES } from "../../core/constants/routes";

type AllowedRole = "admin" | "investor" | "entrepreneur";

type RoleGuardProps = PropsWithChildren<{
  allowedRoles: AllowedRole[];
}>;

function getDefaultRoute(role: AllowedRole) {
  if (role === "admin") return ROUTES.admin.dashboard;
  if (role === "investor") return ROUTES.investor.dashboard;
  return ROUTES.entrepreneur.dashboard;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { appUser, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!appUser) {
    return <Navigate to={ROUTES.auth.signIn} replace />;
  }

  if (!allowedRoles.includes(appUser.role as AllowedRole)) {
    return <Navigate to={getDefaultRoute(appUser.role as AllowedRole)} replace />;
  }

  return <>{children}</>;
}

export default RoleGuard;