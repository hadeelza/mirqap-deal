import { useAuthContext } from "../../app/providers/AuthProvider";

export function useAuth() {
  const context = useAuthContext();

  return {
    session: context.session,
    user: context.authUser,
    authUser: context.authUser,
    appUser: context.appUser,
    role: context.appUser?.role ?? null,
    isLoading: context.isLoading,
    isAuthenticated: context.isAuthenticated,
    refreshAppUser: context.refreshAppUser,
    signOut: context.signOut,
  };
}

export default useAuth;