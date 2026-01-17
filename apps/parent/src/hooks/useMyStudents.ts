"use client";

/**
 * Parent's students hooks for Convex
 *
 * Provides functionality for parents to view their children
 */

import { useQuery, useMutation } from "convex/react";
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

  // Extract progress data (new structure with object)
  const progressData = tracking?.progress;
  const progressPercentage = typeof progressData === "object"
    ? progressData?.percentage ?? 0
    : (progressData ?? 0);
  const completedStops = typeof progressData === "object"
    ? progressData?.completedStops ?? 0
    : 0;
  const totalStops = typeof progressData === "object"
    ? progressData?.totalStops ?? 0
    : 0;
  const currentStopIndex = typeof progressData === "object"
    ? progressData?.currentStopIndex ?? 0
    : 0;

  return {
    tracking,
    isLoading: tracking === undefined,
    hasActiveTrip,
    // Core trip data
    currentLocation: tracking?.currentLocation ?? null,
    route: tracking?.route ?? null,
    trip: tracking?.trip ?? null,
    // Enhanced tracking data
    stops: tracking?.stops ?? [],
    studentStop: tracking?.studentStop ?? null,
    vehicle: tracking?.vehicle ?? null,
    driver: tracking?.driver ?? null,
    school: tracking?.school ?? null,
    // Progress data (enhanced structure)
    progress: progressPercentage,
    completedStops,
    totalStops,
    currentStopIndex,
    // ETA data (distance-based real-time)
    etaMinutes: tracking?.etaMinutes ?? null,
    etaTime: tracking?.etaTime ?? null,
    distanceKm: tracking?.distanceKm ?? null,
    delayStatus: tracking?.delayStatus ?? null,
    currentSpeed: tracking?.currentSpeed ?? null,
    // Last GPS update timestamp
    lastGPSUpdate: tracking?.lastGPSUpdate ?? null,
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

// ============================================
// STUDENT LOCATION MUTATION
// ============================================

export function useStudentLocationMutation() {
  const { userId } = useConvexAuth();
  const updateLocationMutation = useMutation(api.students.updateStudentLocation);

  const updateLocation = async (
    studentId: Id<"students">,
    location: {
      homeLatitude: number;
      homeLongitude: number;
      homeAddress?: string;
    }
  ) => {
    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    return await updateLocationMutation({
      userId,
      studentId,
      homeLatitude: location.homeLatitude,
      homeLongitude: location.homeLongitude,
      homeAddress: location.homeAddress,
    });
  };

  return {
    updateLocation,
  };
}

// ============================================
// MY STUDENTS WITH PHOTOS
// ============================================

export function useMyStudentsWithPhotos() {
  const { userId } = useConvexAuth();

  const students = useQuery(
    api.students.listStudentsForParentWithPhotos,
    userId ? { userId } : "skip"
  );

  return {
    students: students ?? [],
    isLoading: students === undefined,
    isEmpty: students !== undefined && students.length === 0,
  };
}

// ============================================
// SINGLE STUDENT WITH PHOTO
// ============================================

export function useStudentWithPhoto(studentId: Id<"students"> | null) {
  const { userId } = useConvexAuth();

  const student = useQuery(
    api.students.getStudentWithPhoto,
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
// TRIP HISTORY
// ============================================

export function useTripHistory(studentId: Id<"students"> | null, daysLimit?: number) {
  const { userId } = useConvexAuth();

  const history = useQuery(
    api.trips.getTripHistoryForStudent,
    userId && studentId
      ? { userId, studentId, limit: daysLimit }
      : "skip"
  );

  return {
    trips: history ?? [],
    isLoading: history === undefined,
    isEmpty: history !== undefined && history.length === 0,
  };
}

// ============================================
// INSTITUTION GRADES
// ============================================

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

// ============================================
// STUDENT MUTATIONS (Edit & Photo)
// ============================================

export function useStudentMutations() {
  const { userId } = useConvexAuth();
  const updateStudentMutation = useMutation(api.students.updateStudent);
  const generateUploadUrlMutation = useMutation(api.students.generatePhotoUploadUrl);
  const savePhotoMutation = useMutation(api.students.saveStudentPhoto);
  const deletePhotoMutation = useMutation(api.students.deleteStudentPhoto);
  const inviteSecondaryGuardianMutation = useMutation(api.students.inviteSecondaryGuardian);

  const updateStudent = async (
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
    }>
  ) => {
    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    return await updateStudentMutation({
      userId,
      studentId,
      ...data,
    });
  };

  const uploadPhoto = async (studentId: Id<"students">, file: File) => {
    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    // 1. Get upload URL
    const { uploadUrl } = await generateUploadUrlMutation({
      userId,
      studentId,
    });

    // 2. Upload file to Convex storage
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Error al subir la foto");
    }

    const { storageId } = await response.json();

    // 3. Save reference in student record
    await savePhotoMutation({
      userId,
      studentId,
      storageId,
    });

    return { success: true };
  };

  const deletePhoto = async (studentId: Id<"students">) => {
    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    return await deletePhotoMutation({
      userId,
      studentId,
    });
  };

  const inviteSecondaryGuardian = async (
    studentId: Id<"students">,
    email: string,
    name: string
  ) => {
    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    return await inviteSecondaryGuardianMutation({
      userId,
      studentId,
      email,
      name,
    });
  };

  return {
    updateStudent,
    uploadPhoto,
    deletePhoto,
    inviteSecondaryGuardian,
  };
}
