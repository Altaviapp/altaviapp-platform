"use client";

/**
 * Real-time Monitoring hooks for Admin Dashboard
 *
 * Provides hooks for the monitoring page with live GPS updates,
 * trip details, timeline, and novedades.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// ACTIVE TRIPS WITH GPS POSITIONS
// ============================================

// Type for active trip with GPS position (matches Convex query return)
export interface ActiveTripWithGPS {
  tripId: string;
  routeId: string;
  routeName: string;
  routeType: "pickup" | "dropoff";
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  monitorId?: string;
  monitorName?: string;
  startTime?: number;
  scheduledTime: string;
  gps: {
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
    timestamp: number;
  } | null;
  novedadesCount: {
    total: number;
    pending: number;
  };
  studentsSummary: {
    checkedIn: number;
    expectedToBoard: number;
    total: number;
  };
  progress: {
    completedStops: number;
    totalStops: number;
  };
}

/**
 * Hook to get all active trips with their latest GPS positions
 * Used for the monitoring map to show all vehicles in real-time
 */
export function useActiveTripsWithGPS() {
  const { userId, institutionId } = useConvexAuth();

  const trips = useQuery(
    api.monitoring.getActiveTripsWithPositions,
    userId && institutionId ? { userId, institutionId } : "skip"
  );

  return {
    trips: (trips ?? []) as ActiveTripWithGPS[],
    isLoading: trips === undefined,
    activeCount: trips?.length ?? 0,
    hasActiveTrips: trips !== undefined && trips.length > 0,
  };
}

// ============================================
// TRIP MONITORING DETAILS
// ============================================

/**
 * Hook to get detailed monitoring info for a selected trip
 * Includes stops with ETAs, route polyline, and current position
 */
export function useTripMonitoringDetails(tripId: string | null) {
  const { userId } = useConvexAuth();

  const details = useQuery(
    api.monitoring.getTripMonitoringDetails,
    userId && tripId ? { userId, tripId: tripId as Id<"trips"> } : "skip"
  );

  return {
    trip: details?.trip ?? null,
    route: details?.route ?? null,
    vehicle: details?.vehicle ?? null,
    driver: details?.driver ?? null,
    monitor: details?.monitor ?? null,
    currentLocation: details?.currentLocation ?? null,
    stops: details?.stops ?? [],
    polyline: details?.polyline ?? null,
    encodedPolyline: details?.encodedPolyline ?? null,
    stats: details?.stats ?? null,
    isLoading: tripId !== null && details === undefined,
  };
}

// ============================================
// TRIP TIMELINE
// ============================================

/**
 * Hook to get combined timeline events for a trip
 * Includes check-ins, GPS events, and stop arrivals
 */
export function useTripTimeline(tripId: string | null, limit: number = 50) {
  const { userId } = useConvexAuth();

  const timeline = useQuery(
    api.monitoring.getTripTimeline,
    userId && tripId ? { userId, tripId: tripId as Id<"trips">, limit } : "skip"
  );

  return {
    events: timeline ?? [],
    isLoading: tripId !== null && timeline === undefined,
    isEmpty: timeline !== undefined && timeline.length === 0,
  };
}

// ============================================
// TRIP NOVEDADES
// ============================================

/**
 * Hook to get novedades affecting a trip
 * Used for the Novedades tab in monitoring sidebar
 */
export function useTripNovedades(tripId: string | null) {
  const { userId } = useConvexAuth();

  const novedades = useQuery(
    api.monitoring.getNovedadesForTrip,
    userId && tripId ? { userId, tripId: tripId as Id<"trips"> } : "skip"
  );

  const pendingCount = (novedades ?? []).filter((n) => n.status === "pending").length;

  return {
    novedades: novedades ?? [],
    isLoading: tripId !== null && novedades === undefined,
    isEmpty: novedades !== undefined && novedades.length === 0,
    pendingCount,
    hasPending: pendingCount > 0,
  };
}

// ============================================
// COMBINED MONITORING HOOK
// ============================================

/**
 * Combined hook for trip monitoring sidebar
 * Fetches details, timeline, and novedades for a selected trip
 */
export function useTripMonitoring(tripId: string | null) {
  const details = useTripMonitoringDetails(tripId);
  const timeline = useTripTimeline(tripId);
  const novedades = useTripNovedades(tripId);

  return {
    // Trip details
    trip: details.trip,
    route: details.route,
    vehicle: details.vehicle,
    driver: details.driver,
    monitor: details.monitor,
    currentLocation: details.currentLocation,
    stops: details.stops,
    polyline: details.polyline,
    encodedPolyline: details.encodedPolyline,
    stats: details.stats,

    // Timeline
    timeline: timeline.events,

    // Novedades
    novedades: novedades.novedades,
    pendingNovedadesCount: novedades.pendingCount,
    hasPendingNovedades: novedades.hasPending,

    // Loading states
    isLoading: details.isLoading || timeline.isLoading || novedades.isLoading,
    isDetailsLoading: details.isLoading,
    isTimelineLoading: timeline.isLoading,
    isNovedadesLoading: novedades.isLoading,
  };
}

// ============================================
// HELPER TYPES (exported for components)
// ============================================

// Re-export for backwards compatibility
export type ActiveTripWithPosition = ActiveTripWithGPS;

export type MonitoringStop = NonNullable<
  ReturnType<typeof useTripMonitoringDetails>["stops"]
>[number];

export type TimelineEvent = NonNullable<
  ReturnType<typeof useTripTimeline>["events"]
>[number];

export type TripNovedad = NonNullable<
  ReturnType<typeof useTripNovedades>["novedades"]
>[number];
