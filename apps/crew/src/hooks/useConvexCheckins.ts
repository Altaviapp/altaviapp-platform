"use client";

/**
 * Convex Checkins hooks for Crew App
 *
 * Provides check-in/check-out functionality for drivers and monitors
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// TRIP CHECKINS
// ============================================

export function useTripCheckins(tripId: Id<"trips"> | null) {
  const { userId } = useConvexAuth();

  const checkins = useQuery(
    api.checkins.getTripCheckins,
    userId && tripId
      ? { userId, tripId }
      : "skip"
  );

  return {
    checkins: checkins ?? [],
    isLoading: checkins === undefined,
    isEmpty: checkins !== undefined && checkins.length === 0,
  };
}

// ============================================
// PENDING STUDENTS (Not yet checked in)
// ============================================

export function usePendingStudents(tripId: Id<"trips"> | null) {
  const { userId } = useConvexAuth();

  const pending = useQuery(
    api.checkins.getPendingStudents,
    userId && tripId
      ? { userId, tripId }
      : "skip"
  );

  return {
    pending: pending ?? [],
    isLoading: pending === undefined,
    isEmpty: pending !== undefined && pending.length === 0,
    count: pending?.length ?? 0,
  };
}

// ============================================
// CHECKIN MUTATIONS
// ============================================

export function useCheckinMutations() {
  const { userId } = useConvexAuth();

  const recordCheckin = useMutation(api.checkins.recordCheckin);
  const cancelCheckin = useMutation(api.checkins.cancelCheckin);

  return {
    recordCheckin: async (data: {
      tripId: Id<"trips">;
      studentId: Id<"students">;
      stopId: Id<"routeStops">;
      checkinType: "pickup" | "dropoff";
      qrScanned: boolean;
      latitude: number;
      longitude: number;
      manualReason?: string;
      notes?: string;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      return recordCheckin({ userId, ...data });
    },

    cancelCheckin: async (checkinId: Id<"studentCheckins">, reason: string) => {
      if (!userId) throw new Error("Not authenticated");
      return cancelCheckin({ userId, checkinId, reason });
    },
  };
}

// ============================================
// QR CODE VALIDATION
// ============================================

/**
 * Hook for QR code student lookup
 *
 * Pass the QR code string to look up the student.
 * Returns the student data if found, null otherwise.
 */
export function useStudentByQR(qrCode: string | null) {
  const { userId } = useConvexAuth();

  const student = useQuery(
    api.students.getStudentByQR,
    userId && qrCode
      ? { userId, qrCode }
      : "skip"
  );

  return {
    student: student ?? null,
    isLoading: qrCode !== null && student === undefined,
    isFound: student !== null && student !== undefined,
  };
}

