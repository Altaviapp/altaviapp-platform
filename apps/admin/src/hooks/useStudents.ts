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
  const createStudentWithInvitation = useMutation(api.students.createStudentWithInvitation);
  const updateStudent = useMutation(api.students.updateStudent);
  const deactivateStudent = useMutation(api.students.deactivateStudent);
  const regenerateQRCode = useMutation(api.students.regenerateQRCode);
  const inviteSecondaryGuardianMutation = useMutation(api.students.inviteSecondaryGuardian);

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

    createStudentWithInvitation: async (data: {
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
      sendInvitation: boolean;
    }) => {
      if (!userId || !institutionId) throw new Error("Not authenticated");
      return createStudentWithInvitation({ userId, institutionId, ...data });
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
        emergencyContactSecondary: string;
        isActive: boolean;
      }>
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateStudent({ userId, studentId, ...data });
    },

    inviteSecondaryGuardian: async (
      studentId: Id<"students">,
      email: string,
      name: string
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return inviteSecondaryGuardianMutation({ userId, studentId, email, name });
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

// Hook for students with their route assignments (for route wizard)
export function useStudentsWithRoutes() {
  const { userId, institutionId } = useConvexAuth();

  const students = useQuery(
    api.students.listStudentsWithRoutes,
    userId && institutionId
      ? { userId, institutionId }
      : "skip"
  );

  return {
    students: students ?? [],
    isLoading: students === undefined,
  };
}

// ============================================
// BULK IMPORT HOOKS
// ============================================

export type StudentImportData = {
  firstName: string;
  lastName: string;
  grade: string;
  dateOfBirth?: number;
  address?: string;
  parentEmail: string;
  parentName?: string;
  parentPhone?: string;
  emergencyContact?: string;
};

/**
 * Hook for validating student import (preview mode)
 */
export function useValidateStudentImport(students: StudentImportData[]) {
  const { userId, institutionId } = useConvexAuth();

  const validation = useQuery(
    api.students.validateStudentImport,
    userId && institutionId && students.length > 0
      ? { userId, institutionId, students }
      : "skip"
  );

  return {
    validation,
    isLoading: validation === undefined && students.length > 0,
    isReady: validation !== undefined,
  };
}

/**
 * Hook for bulk import mutations
 */
export function useStudentImportMutations() {
  const { userId, institutionId } = useConvexAuth();

  const importStudentsBulk = useMutation(api.students.importStudentsBulk);
  const inviteSecondaryGuardian = useMutation(api.students.inviteSecondaryGuardian);

  return {
    /**
     * Import students in bulk with optional parent invitations
     */
    importStudents: async (
      students: StudentImportData[],
      sendInvitations: boolean
    ) => {
      if (!userId || !institutionId) throw new Error("Not authenticated");
      return importStudentsBulk({ userId, institutionId, students, sendInvitations });
    },

    /**
     * Invite a secondary guardian for a student
     */
    inviteSecondaryGuardian: async (
      studentId: Id<"students">,
      email: string,
      name: string
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return inviteSecondaryGuardian({ userId, studentId, email, name });
    },
  };
}

// ============================================
// PARENT EMAIL CHECK HOOK
// ============================================

export type ParentEmailStatus = {
  valid: boolean;
  error?: string;
  email?: string;
  userExists?: boolean;
  invitationPending?: boolean;
  needsInvitation?: boolean;
  hasExistingHousehold?: boolean;
  householdStudents?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
  }>;
  existingParentName?: string;
  existingParentPhone?: string;
  householdSize?: number;
};

/**
 * Hook to check parent email status for manual student creation
 * Returns information about existing households, users, and pending invitations
 */
export function useParentEmailCheck(email: string) {
  const { userId, institutionId } = useConvexAuth();

  // Only query if email is valid format
  const isValidEmailFormat = email && email.includes("@") && email.includes(".");

  const status = useQuery(
    api.students.checkParentEmailStatus,
    userId && institutionId && isValidEmailFormat
      ? { userId, institutionId, email }
      : "skip"
  );

  return {
    status: status as ParentEmailStatus | undefined,
    isLoading: status === undefined && isValidEmailFormat,
    isChecking: status === undefined && isValidEmailFormat && !!email,
  };
}
