import { useAuthContext } from "../../app/providers/AuthProvider";

export function useAuthUser() {
  return useAuthContext();
}