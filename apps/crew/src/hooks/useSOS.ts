"use client";

/**
 * SOS Hook for Crew App
 *
 * Provides functionality for emergency SOS activation:
 * - Trigger SOS alert with GPS location
 * - Get emergency contacts for the institution
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";
import { useCurrentPosition } from "./useGPSTracking";

export function useSOS(tripId: Id<"trips"> | string | null) {
  const { userId } = useConvexAuth();
  const { getPosition } = useCurrentPosition();

  // Mutations
  const triggerSOSMutation = useMutation(api.trips.triggerSOS);

  // Get emergency contacts
  const emergencyContacts = useQuery(
    api.trips.getEmergencyContacts,
    userId && tripId ? { userId, tripId: tripId as Id<"trips"> } : "skip"
  );

  /**
   * Trigger SOS emergency alert
   * @param message Optional custom message
   * @returns Promise with incidentId and number of notified admins
   */
  const triggerSOS = async (message?: string) => {
    if (!userId || !tripId) throw new Error("No autenticado o viaje no especificado");

    const position = await getPosition();
    const latitude = position?.latitude ?? -0.1828;
    const longitude = position?.longitude ?? -78.4847;

    return triggerSOSMutation({
      userId,
      tripId: tripId as Id<"trips">,
      latitude,
      longitude,
      message,
    });
  };

  return {
    triggerSOS,
    emergencyContacts,
    isLoading: emergencyContacts === undefined,
    isReady: !!userId && !!tripId,
  };
}
