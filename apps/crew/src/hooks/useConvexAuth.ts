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
  institutionId: Id<"institutions"> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDriver: boolean;
  isMonitor: boolean;
  user: ReturnType<typeof useAuth>["user"];
};

export function useConvexAuth(): ConvexAuthContext {
  const auth = useAuth();

  return {
    userId: auth.user?.id as Id<"users"> | null,
    institutionId: auth.user?.institutionId as Id<"institutions"> | null,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isDriver: auth.isDriver,
    isMonitor: auth.isMonitor,
    user: auth.user,
  };
}
