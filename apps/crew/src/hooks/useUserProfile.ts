"use client";

/**
 * Hook for fetching and updating basic user profile data
 *
 * Used in the settings page to allow crew members to update
 * their name and phone number.
 */

import { useQuery, useMutation } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";

export function useUserProfile() {
  const { userId } = useConvexAuth();

  // Fetch full user data
  const userData = useQuery(
    api.users.getUserById,
    userId ? { userId, targetUserId: userId } : "skip"
  );

  // Update mutation
  const updateMutation = useMutation(api.users.updateUser);

  const updateProfile = async (data: {
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    if (!userId) throw new Error("No autenticado");

    return updateMutation({
      userId,
      targetUserId: userId,
      ...data,
    });
  };

  return {
    profile: userData ?? null,
    isLoading: userData === undefined,
    updateProfile,
  };
}
