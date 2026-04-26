import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../core/hooks/useAuth";
import { ROUTES } from "../../core/constants/routes";

export function ProtectedRoute() {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader label="جارٍ التحقق من الجلسة..." fullScreen />;
  }

  if (!session) {
    return <Navigate to={ROUTES.auth.signIn} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;