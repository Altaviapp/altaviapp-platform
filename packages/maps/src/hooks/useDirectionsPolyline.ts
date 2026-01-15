"use client";

/**
 * useDirectionsPolyline Hook
 *
 * Fetches the real route polyline from Google Directions API.
 * Falls back to simple stop-to-stop lines if directions fail.
 *
 * Usage:
 * ```tsx
 * const { polyline, isLoading } = useDirectionsPolyline({
 *   stops,
 *   vehiclePosition,
 *   enabled: true,
 * });
 * ```
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { LatLng } from "../types/maps";
import { getRoutePolyline } from "../services/directions";

export interface UseDirectionsPolylineOptions {
  /** Array of stops with lat/lng */
  stops: Array<{ lat: number; lng: number }>;
  /** Current vehicle position (used as origin if available) */
  vehiclePosition?: { lat: number; lng: number } | null;
  /** Whether to fetch directions (set false to disable) */
  enabled?: boolean;
  /** Minimum distance (meters) vehicle must move before refetching */
  refetchDistanceThreshold?: number;
}

export interface UseDirectionsPolylineResult {
  /** The polyline path (real directions or fallback) */
  polyline: LatLng[];
  /** Whether currently fetching directions */
  isLoading: boolean;
  /** Whether using real directions (vs fallback) */
  isRealRoute: boolean;
  /** Error message if directions failed */
  error: string | null;
  /** Manually refetch directions */
  refetch: () => void;
}

/**
 * Calculate distance between two points in meters (Haversine formula)
 */
function calculateDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate fallback polyline from stops (simple straight lines)
 */
function generateFallbackPolyline(
  stops: Array<{ lat: number; lng: number }>,
  vehiclePosition?: { lat: number; lng: number } | null
): LatLng[] {
  const points: LatLng[] = [];

  // Add vehicle position as first point if available
  if (vehiclePosition) {
    points.push({ lat: vehiclePosition.lat, lng: vehiclePosition.lng });
  }

  // Add all stops
  stops.forEach((stop) => {
    points.push({ lat: stop.lat, lng: stop.lng });
  });

  return points;
}

export function useDirectionsPolyline({
  stops,
  vehiclePosition,
  enabled = true,
  refetchDistanceThreshold = 500, // 500 meters default
}: UseDirectionsPolylineOptions): UseDirectionsPolylineResult {
  const [polyline, setPolyline] = useState<LatLng[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealRoute, setIsRealRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track last fetch position to avoid unnecessary refetches
  const lastFetchPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastStopsHashRef = useRef<string>("");
  const hasFetchedRef = useRef(false);

  // Generate a hash of stops to detect changes
  const stopsHash = stops.map((s) => `${s.lat.toFixed(5)},${s.lng.toFixed(5)}`).join("|");

  // Fetch directions
  const fetchDirections = useCallback(async () => {
    if (!enabled || stops.length < 2) {
      // Use fallback
      setPolyline(generateFallbackPolyline(stops, vehiclePosition));
      setIsRealRoute(false);
      return;
    }

    // Get first and last stops (we know they exist because length >= 2)
    const firstStop = stops[0]!;
    const lastStop = stops[stops.length - 1]!;

    // Determine origin (vehicle position or first stop)
    const origin = vehiclePosition
      ? { lat: vehiclePosition.lat, lng: vehiclePosition.lng }
      : { lat: firstStop.lat, lng: firstStop.lng };

    // Destination is the last stop
    const destination = { lat: lastStop.lat, lng: lastStop.lng };

    // Waypoints are all stops except the last (if more than 2 stops)
    const waypoints =
      stops.length > 2
        ? stops.slice(0, -1).map((s) => ({ lat: s.lat, lng: s.lng }))
        : undefined;

    setIsLoading(true);
    setError(null);

    try {
      const route = await getRoutePolyline(
        origin,
        destination,
        waypoints
      );

      if (route && route.length > 0) {
        setPolyline(route);
        setIsRealRoute(true);
        lastFetchPositionRef.current = origin;
      } else {
        // Fallback to simple polyline
        setPolyline(generateFallbackPolyline(stops, vehiclePosition));
        setIsRealRoute(false);
      }
    } catch (err) {
      console.error("Error fetching directions:", err);
      setError(err instanceof Error ? err.message : "Error fetching directions");
      // Use fallback on error
      setPolyline(generateFallbackPolyline(stops, vehiclePosition));
      setIsRealRoute(false);
    } finally {
      setIsLoading(false);
      hasFetchedRef.current = true;
    }
  }, [enabled, stops, vehiclePosition]);

  // Initial fetch and refetch on stops change
  useEffect(() => {
    // Check if stops changed
    if (stopsHash !== lastStopsHashRef.current) {
      lastStopsHashRef.current = stopsHash;
      hasFetchedRef.current = false;
      fetchDirections();
      return;
    }

    // Check if we haven't fetched yet
    if (!hasFetchedRef.current) {
      fetchDirections();
      return;
    }

    // Check if vehicle moved enough to warrant refetch
    if (vehiclePosition && lastFetchPositionRef.current) {
      const distance = calculateDistance(vehiclePosition, lastFetchPositionRef.current);
      if (distance > refetchDistanceThreshold) {
        fetchDirections();
      }
    }
  }, [stopsHash, vehiclePosition, refetchDistanceThreshold, fetchDirections]);

  // Generate fallback if no polyline yet
  useEffect(() => {
    if (polyline.length === 0 && stops.length > 0) {
      setPolyline(generateFallbackPolyline(stops, vehiclePosition));
    }
  }, [polyline.length, stops, vehiclePosition]);

  return {
    polyline,
    isLoading,
    isRealRoute,
    error,
    refetch: fetchDirections,
  };
}
