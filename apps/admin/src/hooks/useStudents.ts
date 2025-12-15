"use client";

/**
 * Hook for student management
 *
 * Provides CRUD operations for students with loading/error states
 */

import { useQuery, useMutation } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

export function useStudents(filters?: { grade?: string; isActive?: boolean }) {
  const { userId, institutionId } = useConvexAuth();

  const students = useQuery(
    api.students.listStudents,
    userId && institutionId
      ? { userId, institutionId, ...filters }
      : "skip"
  );

  return {
    students: students ?? [],
    isLoading: students === undefined,
    isEmpty: students !== undefined && students.length === 0,
  };
}

export function useStudent(studentId: Id<"students"> | null) {
  const { userId } = useConvexAuth();

  const student = useQuery(
    api.students.getStudent,
    userId && studentId
      ? { userId, studentId }
      : "skip"
  );

  return {
    student,
    isLoading: student === undefined,
    notFound: student === null,
  };
}

export function useStudentMutations() {
  const { userId, institutionId } = useConvexAuth();

  const createStudent = useMutation(api.students.createStudent);
  const updateStudent = useMutation(api.students.updateStudent);
  const deactivateStudent = useMutation(api.students.deactivateStudent);
  const regenerateQRCode = useMutation(api.students.regenerateQRCode);

  return {
    createStudent: async (data: {
      firstName: string;
      lastName: string;
      grade: string;
      dateOfBirth: number;
      address: string;
      homeLatitude?: number;
      homeLongitude?: number;
      parentPhone: string;
      parentEmail: string;
      parentName: string;
      emergencyContact: string;
    }) => {
      if (!userId || !institutionId) throw new Error("Not authenticated");
      return createStudent({ userId, institutionId, ...data });
    },

    updateStudent: async (
      studentId: Id<"students">,
      data: Partial<{
        firstName: string;
        lastName: string;
        grade: string;
        dateOfBirth: number;
        address: string;
        homeLatitude: number;
        homeLongitude: number;
        parentPhone: string;
        parentEmail: string;
        parentName: string;
        emergencyContact: string;
        isActive: boolean;
      }>
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateStudent({ userId, studentId, ...data });
    },

    deactivateStudent: async (studentId: Id<"students">) => {
      if (!userId) throw new Error("Not authenticated");
      return deactivateStudent({ userId, studentId });
    },

    regenerateQRCode: async (studentId: Id<"students">) => {
      if (!userId) throw new Error("Not authenticated");
      return regenerateQRCode({ userId, studentId });
    },
  };
}

// Hook for student route assignments
export function useStudentRouteAssignments(studentId: Id<"students"> | null) {
  const { userId } = useConvexAuth();

  const assignments = useQuery(
    api.studentRoutes.getStudentAssignments,
    userId && studentId
      ? { userId, studentId }
      : "skip"
  );

  return {
    assignments: assignments ?? [],
    isLoading: assignments === undefined,
  };
}
