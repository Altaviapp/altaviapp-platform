/**
 * Route Optimization Service
 *
 * Optimizes the order of stops using Google Maps Directions API
 * with optimizeWaypoints: true (similar to how Uber calculates routes)
 */

import type { LatLng, OptimizationResult, RouteStop } from "../types/maps";

/**
 * Optimize the order of stops for the most efficient route
 *
 * This uses Google Maps Directions API with optimizeWaypoints: true
 * which reorders waypoints to minimize total travel time.
 *
 * @param origin - Starting point (e.g., first pickup or school)
 * @param destination - End point (e.g., school or last dropoff)
 * @param stops - Array of stops to optimize
 * @returns Optimized order and route information
 */
export async function optimizeStopOrder(
  origin: LatLng,
  destination: LatLng,
  stops: RouteStop[]
): Promise<OptimizationResult | null> {
  if (stops.length === 0) {
    return {
      optimizedOrder: [],
      totalDistance: "0 km",
      totalDuration: "0 min",
      legs: [],
    };
  }

  if (stops.length === 1) {
    return {
      optimizedOrder: [0],
      totalDistance: "Calculando...",
      totalDuration: "Calculando...",
      legs: [],
    };
  }

  try {
    const directionsService = new google.maps.DirectionsService();

    // Create waypoints from stops
    const waypoints = stops.map((stop) => ({
      location: new google.maps.LatLng(stop.position.lat, stop.position.lng),
      stopover: true,
    }));

    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          waypoints,
          optimizeWaypoints: true, // KEY: This tells Google to optimize the order!
          travelMode: google.maps.TravelMode.DRIVING,
          region: "EC",
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Optimization request failed: ${status}`));
          }
        }
      );
    });

    const route = result.routes[0];
    if (!route) {
      return null;
    }

    // Get the optimized order from waypoint_order
    // waypoint_order contains the new indices of the waypoints in optimized order
    const optimizedOrder = route.waypoint_order || stops.map((_, i) => i);

    // Calculate totals
    let totalDistance = 0;
    let totalDuration = 0;
    const legs = route.legs.map((leg) => {
      totalDistance += leg.distance?.value || 0;
      totalDuration += leg.duration?.value || 0;
      return {
        distance: leg.distance?.text || "",
        duration: leg.duration?.text || "",
        startAddress: leg.start_address,
        endAddress: leg.end_address,
      };
    });

    return {
      optimizedOrder,
      totalDistance: formatDistance(totalDistance),
      totalDuration: formatDuration(totalDuration),
      legs,
    };
  } catch (error) {
    console.error("Route optimization error:", error);
    return null;
  }
}

/**
 * Reorder stops array based on optimization result
 */
export function reorderStops<T extends { id: string }>(
  stops: T[],
  optimizedOrder: number[]
): T[] {
  return optimizedOrder.map((index) => stops[index]).filter((stop): stop is T => stop !== undefined);
}

/**
 * Calculate the nearest stop for a student
 * Uses Haversine formula for distance calculation
 */
export function findNearestStop(
  studentPosition: LatLng,
  stops: RouteStop[]
): RouteStop | null {
  if (stops.length === 0) return null;

  const firstStop = stops[0];
  if (!firstStop) return null;

  let nearestStop: RouteStop = firstStop;
  let minDistance = calculateHaversineDistance(studentPosition, firstStop.position);

  for (let i = 1; i < stops.length; i++) {
    const currentStop = stops[i];
    if (!currentStop) continue;
    const distance = calculateHaversineDistance(studentPosition, currentStop.position);
    if (distance < minDistance) {
      minDistance = distance;
      nearestStop = currentStop;
    }
  }

  return nearestStop;
}

/**
 * Auto-assign students to their nearest stops
 */
export function autoAssignStudentsToStops(
  students: { id: string; position: LatLng }[],
  stops: RouteStop[]
): Map<string, string> {
  const assignments = new Map<string, string>();

  for (const student of students) {
    const nearestStop = findNearestStop(student.position, stops);
    if (nearestStop) {
      assignments.set(student.id, nearestStop.id);
    }
  }

  return assignments;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateHaversineDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}
