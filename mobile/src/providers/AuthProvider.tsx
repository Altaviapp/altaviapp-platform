"use client";

/**
 * Custom Authentication Provider
 *
 * Manages user authentication state using custom token-based auth
 * Replaces Clerk authentication
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "driver" | "parent";
  institutionId?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("altaviapp_token");
    if (savedToken) {
      // Verify token and load user
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CONVEX_URL}/auth/me?token=${authToken}`
      );

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(authToken);
        localStorage.setItem("altaviapp_token", authToken);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("altaviapp_token");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("altaviapp_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CONVEX_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("altaviapp_token", data.token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("altaviapp_token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
