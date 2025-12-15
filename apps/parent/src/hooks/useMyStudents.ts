"use client";

/**
 * Parent's students hooks for Convex
 *
 * Provides functionality for parents to view their children
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// MY STUDENTS (Parent's children)
// ============================================

export function useMyStudents() {
  const { userId } = useConvexAuth();

  const students = useQuery(
    api.students.listStudentsForParent,
    userId ? { userId } : "skip"
  );

  return {
    students: students ?? [],
    isLoading: students === undefined,
    isEmpty: students !== undefined && students.length === 0,
  };
}

// ============================================
// SINGLE STUDENT
// ============================================

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
  };
}

// ============================================
// STUDENT TRACKING (Real-time location)
// ============================================

export function useStudentTracking(studentId: Id<"students"> | null) {
  const { userId } = useConvexAuth();

  const tracking = useQuery(
    api.trips.getActiveTripForStudent,
    userId && studentId
      ? { userId, studentId }
      : "skip"
  );

  const hasActiveTrip = tracking !== null && tracking !== undefined;

  return {
    tracking,
    isLoading: tracking === undefined,
    hasActiveTrip,
    currentLocation: tracking?.currentLocation ?? null,
    route: tracking?.route ?? null,
    trip: tracking?.trip ?? null,
  };
}

// ============================================
// ALL STUDENTS WITH TRACKING
// ============================================

export function useMyStudentsWithTracking() {
  const { students, isLoading: studentsLoading } = useMyStudents();

  // Get the first student's tracking (typically parents have 1-3 children)
  // For multi-student tracking, use individual useStudentTracking hooks
  const firstStudentId = students.length > 0 ? students[0]?._id ?? null : null;
  const { tracking, isLoading: trackingLoading } = useStudentTracking(firstStudentId);

  return {
    students,
    tracking,
    isLoading: studentsLoading || trackingLoading,
    hasStudents: students.length > 0,
  };
}
