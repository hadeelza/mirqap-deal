import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";
import { getCurrentAppUser } from "../../lib/supabase/queries/users.queries";
import { signOutService } from "../../features/auth/services/auth.service";
import type { AppUser } from "../../core/types/auth.types";

type AuthContextValue = {
  session: Session | null;
  authUser: User | null;
  appUser: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAppUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppUser = useCallback(async (userId: string) => {
    const profile = await getCurrentAppUser(userId);
    setAppUser(profile);
  }, []);

  const refreshAppUser = useCallback(async () => {
    if (!authUser?.id) {
      setAppUser(null);
      return;
    }

    await loadAppUser(authUser.id);
  }, [authUser?.id, loadAppUser]);

  const signOut = useCallback(async () => {
    await signOutService();
    setSession(null);
    setAuthUser(null);
    setAppUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const currentSession = data.session ?? null;
        const currentUser = currentSession?.user ?? null;

        if (!mounted) {
          return;
        }

        setSession(currentSession);
        setAuthUser(currentUser);

        if (currentUser?.id) {
          const profile = await getCurrentAppUser(currentUser.id);
          if (mounted) {
            setAppUser(profile);
          }
        } else {
          setAppUser(null);
        }
      } catch {
        if (mounted) {
          setSession(null);
          setAuthUser(null);
          setAppUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setAuthUser(nextSession?.user ?? null);

      if (!nextSession?.user?.id) {
        setAppUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      void getCurrentAppUser(nextSession.user.id)
        .then((profile) => {
          if (mounted) {
            setAppUser(profile);
          }
        })
        .finally(() => {
          if (mounted) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      authUser,
      appUser,
      isLoading,
      isAuthenticated: !!authUser,
      refreshAppUser,
      signOut,
    }),
    [session, authUser, appUser, isLoading, refreshAppUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}

export default AuthProvider;