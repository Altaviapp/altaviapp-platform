"use client";

/**
 * Hook for Institution data and mutations
 *
 * Provides access to the current institution's data and
 * mutation methods for updating institution settings.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";

/**
 * Fetch the current user's institution
 */
export function useInstitution() {
  const { userId, institutionId } = useConvexAuth();

  const institution = useQuery(
    api.institutions.getInstitution,
    userId && institutionId ? { userId, institutionId } : "skip"
  );

  return {
    institution,
    isLoading: institution === undefined,
  };
}

/**
 * Mutation hook for updating school location
 */
export function useSchoolLocationMutation() {
  const { userId, institutionId } = useConvexAuth();
  const updateLocationMutation = useMutation(api.institutions.updateSchoolLocation);

  const updateSchoolLocation = async (location: {
    schoolLatitude: number;
    schoolLongitude: number;
    schoolAddress?: string;
  }) => {
    if (!userId || !institutionId) {
      throw new Error("No autenticado");
    }

    return updateLocationMutation({
      userId,
      institutionId,
      ...location,
    });
  };

  return { updateSchoolLocation };
}
