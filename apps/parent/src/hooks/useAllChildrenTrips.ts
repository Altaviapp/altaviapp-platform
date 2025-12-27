"use client";

/**
 * Hook to get all children with their trip tracking status
 *
 * This hook provides the parent's children data.
 * Each child component (ChildTripCard) will query its own tracking
 * to keep the hook rules simple and Convex-compatible.
 */

import { useMyStudentsWithPhotos } from "./useMyStudents";

export function useAllChildrenTrips() {
  const { students, isLoading, isEmpty } = useMyStudentsWithPhotos();

  return {
    children: students,
    isLoading,
    isEmpty,
    hasChildren: students.length > 0,
  };
}

// Re-export useStudentTracking for individual child tracking
export { useStudentTracking } from "./useMyStudents";
