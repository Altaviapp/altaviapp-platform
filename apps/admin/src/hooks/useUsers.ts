"use client";

/**
 * Hook for user management
 *
 * Provides user queries with loading/error states
 * All queries filter by institutionId for multi-tenancy
 */

import { useQuery, useMutation } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

export type UserRole = "super_admin" | "admin" | "monitor" | "driver" | "parent";

export function useUsers(filters?: { role?: UserRole }) {
  const { userId, institutionId } = useConvexAuth();

  const users = useQuery(
    api.users.listUsers,
    userId
      ? { userId, institutionId: institutionId ?? undefined, role: filters?.role }
      : "skip"
  );

  return {
    users: users ?? [],
    isLoading: users === undefined,
    isEmpty: users !== undefined && users.length === 0,
  };
}

export function useUser(targetUserId: Id<"users"> | null) {
  const { userId } = useConvexAuth();

  const user = useQuery(
    api.users.getUserById,
    userId && targetUserId
      ? { userId, targetUserId }
      : "skip"
  );

  return {
    user,
    isLoading: user === undefined,
    notFound: user === null,
  };
}

export function useUserMutations() {
  const { userId } = useConvexAuth();

  const updateUser = useMutation(api.users.updateUser);
  const deactivateUser = useMutation(api.users.deactivateUser);
  const reactivateUser = useMutation(api.users.reactivateUser);

  return {
    updateUser: async (
      targetUserId: Id<"users">,
      data: Partial<{
        name: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: UserRole;
        institutionId: Id<"institutions">;
        isActive: boolean;
      }>
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateUser({ userId, targetUserId, ...data });
    },

    deactivateUser: async (targetUserId: Id<"users">) => {
      if (!userId) throw new Error("Not authenticated");
      return deactivateUser({ userId, targetUserId });
    },

    reactivateUser: async (targetUserId: Id<"users">) => {
      if (!userId) throw new Error("Not authenticated");
      return reactivateUser({ userId, targetUserId });
    },
  };
}

/**
 * Get user stats for dashboard
 */
export function useUserStats() {
  const { users, isLoading } = useUsers();

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    drivers: users.filter((u) => u.role === "driver").length,
    monitors: users.filter((u) => u.role === "monitor").length,
    parents: users.filter((u) => u.role === "parent").length,
    active: users.filter((u) => u.isActive !== false).length,
  };

  return {
    stats,
    isLoading,
  };
}
