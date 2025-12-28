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

/**
 * Hook to get institution grades
 *
 * Returns configured grades for the institution (or defaults if not configured)
 */
export function useInstitutionGrades() {
  const { userId, institutionId } = useConvexAuth();

  const result = useQuery(
    api.institutions.getInstitutionGrades,
    userId && institutionId ? { userId, institutionId } : "skip"
  );

  return {
    grades: result?.grades ?? [],
    isCustom: result?.isCustom ?? false,
    isLoading: result === undefined,
  };
}

/**
 * Mutation hook for updating institution grades
 */
export function useInstitutionGradesMutation() {
  const { userId, institutionId } = useConvexAuth();
  const updateGradesMutation = useMutation(api.institutions.updateInstitutionGrades);

  const updateGrades = async (grades: string[]) => {
    if (!userId || !institutionId) {
      throw new Error("No autenticado");
    }

    return updateGradesMutation({
      userId,
      institutionId,
      grades,
    });
  };

  return { updateGrades };
}
