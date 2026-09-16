import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, apiFetch } from "../config/api";

type AuthState = "loading" | "authenticated" | "unauthenticated";

/**
 * Manages Gmail OAuth session state.
 *
 * The backend stores OAuth tokens in an HTTP-only cookie session.
 * This hook checks /auth/status on mount and exposes login/logout helpers.
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>("loading");

  const refreshAuth = useCallback(async () => {
    try {
      const response = await apiFetch("/auth/status");
      if (!response.ok) {
        setAuthState("unauthenticated");
        return;
      }

      const data = (await response.json()) as { authenticated: boolean };
      setAuthState(data.authenticated ? "authenticated" : "unauthenticated");
    } catch {
      setAuthState("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  // Full-page redirect — OAuth must happen on the backend domain.
  const login = () => {
    window.location.href = `${API_BASE_URL}/auth`;
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setAuthState("unauthenticated");
  };

  return {
    authState,
    isAuthenticated: authState === "authenticated",
    isLoading: authState === "loading",
    login,
    logout,
    refreshAuth,
  };
}
