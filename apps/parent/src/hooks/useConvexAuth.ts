"use client";

/**
 * Hook to get auth context with Convex-compatible IDs
 *
 * Provides userId as typed ID for Convex queries
 */

import { useAuth } from "@altaviapp/auth";
import { Id } from "../../../../convex/_generated/dataModel";

export type ConvexAuthContext = {
  userId: Id<"users"> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuth>["user"];
  logout: () => Promise<void>;
};

export function useConvexAuth(): ConvexAuthContext {
  const auth = useAuth();

  return {
    userId: auth.user?.id as Id<"users"> | null,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    logout: auth.logout,
  };
}
