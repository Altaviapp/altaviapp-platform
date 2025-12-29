"use client";

/**
 * Custom Authentication Provider
 *
 * Manages user authentication state using custom token-based auth.
 * Provides complete auth functionality:
 * - Login/Logout
 * - Token validation and refresh
 * - Password reset
 * - Email verification
 * - Role-based access helpers
 *
 * @package @altaviapp/auth
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { AuthUser, AuthContextType, LoginResult, UserRole, RegisterInstitutionData, RegisterResult } from "./types";
import { hasMinimumRole } from "./types";

// ============================================
// API HELPER
// ============================================

/**
 * Get the HTTP API base URL from Convex URL
 * Converts .convex.cloud to .convex.site for HTTP endpoints
 */
function getApiBaseUrl(): string {
  // Try NEXT_PUBLIC_CONVEX_URL first (Next.js apps)
  const convexUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL || "")
    : (process.env.NEXT_PUBLIC_CONVEX_URL || "");

  // If it's already a .convex.site URL, use it directly
  if (convexUrl.includes(".convex.site")) {
    return convexUrl;
  }

  // Convert .convex.cloud to .convex.site
  return convexUrl.replace(".convex.cloud", ".convex.site");
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER PROPS
// ============================================

interface AuthProviderProps {
  children: ReactNode;
  /** Override the API base URL (optional, auto-detected from env) */
  apiBaseUrl?: string;
  /** Storage key for the auth token (default: "altaviapp_token") */
  storageKey?: string;
}

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({
  children,
  apiBaseUrl,
  storageKey = "altaviapp_token"
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve API base URL
  const API_BASE_URL = apiBaseUrl || getApiBaseUrl();

  // Key for tracking if rememberMe was used
  const rememberMeKey = `${storageKey}_remember`;

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  const saveToken = useCallback((newToken: string, rememberMe: boolean = true) => {
    setToken(newToken);
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        // Persist across browser sessions
        localStorage.setItem(storageKey, newToken);
        localStorage.setItem(rememberMeKey, 'true');
      } else {
        // Session only - expires when browser closes
        sessionStorage.setItem(storageKey, newToken);
        localStorage.removeItem(rememberMeKey);
      }
    }
  }, [storageKey, rememberMeKey]);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(rememberMeKey);
      sessionStorage.removeItem(storageKey);
    }
  }, [storageKey, rememberMeKey]);

  const verifyToken = useCallback(async (authToken: string): Promise<boolean> => {
    try {
      const data = await apiRequest<{
        success: boolean;
        user?: AuthUser;
        error?: string;
      }>(API_BASE_URL, `/auth/me?token=${encodeURIComponent(authToken)}`);

      if (data.success && data.user) {
        setUser(data.user);
        setToken(authToken);
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      clearAuth();
      return false;
    }
  }, [API_BASE_URL, clearAuth]);

  // Load token from storage on mount (check both localStorage and sessionStorage)
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // First check localStorage (rememberMe=true), then sessionStorage (rememberMe=false)
    const savedToken = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    if (savedToken) {
      verifyToken(savedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [storageKey, verifyToken]);

  // ============================================
  // AUTH ACTIONS
  // ============================================

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false): Promise<LoginResult> => {
    try {
      const data = await apiRequest<{
        success: boolean;
        token?: string;
        user?: AuthUser;
        error?: string;
      }>(API_BASE_URL, "/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.success && data.token && data.user) {
        setUser(data.user);
        saveToken(data.token, rememberMe);

        // Check if email verification is needed
        if (!data.user.emailVerified) {
          return {
            success: true,
            requiresEmailVerification: true
          };
        }

        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Error al iniciar sesión"
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL, saveToken]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await apiRequest(API_BASE_URL, "/auth/logout", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  }, [API_BASE_URL, token, clearAuth]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const savedToken = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    if (!savedToken) return false;
    return verifyToken(savedToken);
  }, [storageKey, verifyToken]);

  // ============================================
  // PASSWORD MANAGEMENT
  // ============================================

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const data = await apiRequest<{
        success: boolean;
        message?: string;
        error?: string;
      }>(API_BASE_URL, "/auth/request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      return {
        success: data.success,
        error: data.error
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL]);

  const resetPassword = useCallback(async (
    email: string,
    resetCode: string,
    newPassword: string
  ) => {
    try {
      const data = await apiRequest<{
        success: boolean;
        message?: string;
        error?: string;
      }>(API_BASE_URL, "/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      return {
        success: data.success,
        error: data.error
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL]);

  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!token) {
      return { success: false, error: "No autenticado" };
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        message?: string;
        error?: string;
      }>(API_BASE_URL, "/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ token, currentPassword, newPassword }),
      });

      return {
        success: data.success,
        error: data.error
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL, token]);

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  const verifyEmail = useCallback(async (verificationCode: string) => {
    if (!token) {
      return { success: false, error: "No autenticado" };
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        message?: string;
        error?: string;
      }>(API_BASE_URL, "/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token, verificationCode }),
      });

      if (data.success) {
        // Refresh user to get updated emailVerified status
        await refreshSession();
      }

      return {
        success: data.success,
        error: data.error
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL, token, refreshSession]);

  const resendVerificationEmail = useCallback(async () => {
    if (!token) {
      return { success: false, error: "No autenticado" };
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        message?: string;
        error?: string;
      }>(API_BASE_URL, "/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      return {
        success: data.success,
        error: data.error
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL, token]);

  // ============================================
  // INVITATION FLOW
  // ============================================

  const verifyInvitationCode = useCallback(async (code: string) => {
    try {
      const data = await apiRequest<{
        success: boolean;
        valid?: boolean;
        invitation?: {
          email: string;
          firstName?: string;
          lastName?: string;
          role: string;
          institutionName: string;
        };
        message?: string;
        error?: string;
      }>(API_BASE_URL, `/invitations/verify?code=${encodeURIComponent(code)}`);

      return {
        success: data.success,
        valid: data.valid,
        invitation: data.invitation,
        error: data.success ? undefined : (data.message || data.error),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL]);

  const acceptInvitation = useCallback(async (
    invitationCode: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const data = await apiRequest<{
        success: boolean;
        token?: string;
        user?: {
          email: string;
          name: string;
          role: string;
          institutionId: string;
        };
        userId?: string;
        error?: string;
      }>(API_BASE_URL, "/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ invitationCode, password }),
      });

      if (data.success && data.token) {
        // Auto-login after accepting invitation
        saveToken(data.token);
        await refreshSession();
        return { success: true, requiresEmailVerification: true };
      } else {
        return {
          success: false,
          error: data.error || "Error al aceptar invitación"
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL, saveToken, refreshSession]);

  // ============================================
  // INSTITUTION REGISTRATION (Signup Flow)
  // ============================================

  const registerInstitution = useCallback(async (
    data: RegisterInstitutionData
  ): Promise<RegisterResult> => {
    try {
      const response = await apiRequest<{
        success: boolean;
        token?: string;
        userId?: string;
        institutionId?: string;
        clientId?: string;
        user?: AuthUser;
        error?: string;
      }>(API_BASE_URL, "/auth/register-institution", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.success && response.token) {
        // Auto-login after registration
        saveToken(response.token);
        await refreshSession();
        return {
          success: true,
          userId: response.userId,
          institutionId: response.institutionId,
          clientId: response.clientId,
          requiresEmailVerification: true,
        };
      } else {
        return {
          success: false,
          error: response.error || "Error al registrar institución"
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de conexión";
      return { success: false, error: message };
    }
  }, [API_BASE_URL, saveToken, refreshSession]);

  // ============================================
  // ROLE HELPERS
  // ============================================

  const role = user?.role;
  const isDriver = role === "driver";
  const isMonitor = role === "monitor";
  const isCrewMemberFlag = role === "driver" || role === "monitor";
  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";

  const hasRoleCheck = useCallback((requiredRole: UserRole): boolean => {
    if (!role) return false;
    return hasMinimumRole(role, requiredRole);
  }, [role]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AuthContext.Provider
      value={{
        // State
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,

        // Auth actions
        login,
        logout,
        refreshSession,

        // Password management
        requestPasswordReset,
        resetPassword,
        changePassword,

        // Email verification
        verifyEmail,
        resendVerificationEmail,

        // Invitation flow
        verifyInvitationCode,
        acceptInvitation,

        // Institution registration (signup flow)
        registerInstitution,

        // Role helpers
        isDriver,
        isMonitor,
        isCrewMember: isCrewMemberFlag,
        isAdmin,
        isSuperAdmin,
        hasRole: hasRoleCheck,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
