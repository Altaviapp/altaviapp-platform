"use client";

/**
 * Stop Actions Hook for Crew App
 *
 * Provides functionality for drivers/monitors to:
 * - Confirm arrival at a stop
 * - Skip a stop (no students)
 * - Add private notes to a stop
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";
import { useCurrentPosition } from "./useGPSTracking";

export function useStopActions(tripId: Id<"trips"> | string | null) {
  const { userId } = useConvexAuth();
  const { getPosition } = useCurrentPosition();

  // Mutations
  const arriveAtStopMutation = useMutation(api.trips.arriveAtStop);
  const skipStopMutation = useMutation(api.trips.skipStop);
  const addStopNoteMutation = useMutation(api.trips.addStopNote);

  // Get stop events for this trip
  const stopEvents = useQuery(
    api.trips.getStopEvents,
    userId && tripId ? { userId, tripId: tripId as Id<"trips"> } : "skip"
  );

  /**
   * Confirm arrival at a stop
   */
  const arriveAtStop = async (stopId: Id<"routeStops"> | string) => {
    if (!userId || !tripId) throw new Error("No autenticado o viaje no especificado");

    const position = await getPosition();
    const latitude = position?.latitude ?? -0.1828;
    const longitude = position?.longitude ?? -78.4847;

    return arriveAtStopMutation({
      userId,
      tripId: tripId as Id<"trips">,
      stopId: stopId as Id<"routeStops">,
      latitude,
      longitude,
    });
  };

  /**
   * Skip a stop (no students to pick up/drop off)
   */
  const skipStop = async (stopId: Id<"routeStops"> | string, reason?: string) => {
    if (!userId || !tripId) throw new Error("No autenticado o viaje no especificado");

    const position = await getPosition();
    const latitude = position?.latitude ?? -0.1828;
    const longitude = position?.longitude ?? -78.4847;

    return skipStopMutation({
      userId,
      tripId: tripId as Id<"trips">,
      stopId: stopId as Id<"routeStops">,
      reason,
      latitude,
      longitude,
    });
  };

  /**
   * Add a private note to a stop
   */
  const addStopNote = async (stopId: Id<"routeStops"> | string, note: string) => {
    if (!userId || !tripId) throw new Error("No autenticado o viaje no especificado");

    const position = await getPosition();

    return addStopNoteMutation({
      userId,
      tripId: tripId as Id<"trips">,
      stopId: stopId as Id<"routeStops">,
      note,
      latitude: position?.latitude,
      longitude: position?.longitude,
    });
  };

  /**
   * Check if a stop has been arrived at
   */
  const isStopArrived = (stopId: string): boolean => {
    if (!stopEvents) return false;
    return !!stopEvents[stopId]?.arrivedAt;
  };

  /**
   * Check if a stop has been skipped
   */
  const isStopSkipped = (stopId: string): boolean => {
    if (!stopEvents) return false;
    return !!stopEvents[stopId]?.skippedAt;
  };

  /**
   * Get notes for a stop
   */
  const getStopNotes = (stopId: string) => {
    if (!stopEvents) return [];
    return stopEvents[stopId]?.notes ?? [];
  };

  return {
    arriveAtStop,
    skipStop,
    addStopNote,
    isStopArrived,
    isStopSkipped,
    getStopNotes,
    stopEvents: stopEvents ?? {},
    isLoading: stopEvents === undefined,
    isReady: !!userId && !!tripId,
  };
}
