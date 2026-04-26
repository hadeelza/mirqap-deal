import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../core/constants/routes";
import { useAuthUser } from "../../core/hooks/useAuthUser";
import RequireAuth from "./RequireAuth";

export default function RequireEntrepreneur({ children }: PropsWithChildren) {
  const { appUser } = useAuthUser();

  return (
    <RequireAuth>
      {appUser?.role === "entrepreneur" ? children : <Navigate to={ROUTES.public.main} replace />}
    </RequireAuth>
  );
}