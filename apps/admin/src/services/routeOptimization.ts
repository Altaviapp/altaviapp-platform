/**
 * Route Optimization Service
 *
 * Provides route optimization for the bulk route creation wizard.
 * Uses Google Maps Directions API with waypoint optimization to find
 * the most efficient stop order for school transport routes.
 */

import type { LatLng } from "@altaviapp/maps";

/**
 * Input stop for optimization
 */
export type OptimizationStop = {
  id: string;
  position: LatLng;
  studentIds: string[];
};

/**
 * Optimized stop with order information
 */
export type OptimizedStopResult = {
  id: string;
  position: LatLng;
  studentIds: string[];
  order: number;
};

/**
 * Result of route optimization
 */
export type RouteOptimizationResult = {
  /** Whether optimization was successful */
  success: boolean;
  /** Error message if optimization failed */
  error?: string;
  /** Optimized stops in order (same as input if optimization failed) */
  stops: OptimizedStopResult[];
  /** Encoded polyline for the optimized route */
  encodedPolyline: string;
  /** Total route duration in seconds */
  totalDuration: number;
  /** Total route distance in meters */
  totalDistance: number;
  /** Formatted duration string (e.g., "45 min") */
  formattedDuration: string;
  /** Formatted distance string (e.g., "12.5 km") */
  formattedDistance: string;
};

/**
 * Optimize the order of route stops using Google Maps Directions API
 *
 * For pickup routes: origin is the first stop, destination is the school
 * For dropoff routes: origin is the school, destination is the last stop
 *
 * Uses optimizeWaypoints: true to let Google determine the most efficient order.
 *
 * @param schoolLocation - The school's coordinates
 * @param stops - Array of stops to optimize (must have at least 1 stop)
 * @param routeType - "pickup" (stops -> school) or "dropoff" (school -> stops)
 * @returns Optimization result with ordered stops, polyline, duration, and distance
 */
export async function optimizeRouteOrder(
  schoolLocation: LatLng,
  stops: OptimizationStop[],
  routeType: "pickup" | "dropoff"
): Promise<RouteOptimizationResult> {
  // Return early if no stops
  if (stops.length === 0) {
    return {
      success: true,
      stops: [],
      encodedPolyline: "",
      totalDuration: 0,
      totalDistance: 0,
      formattedDuration: "0 min",
      formattedDistance: "0 km",
    };
  }

  // For single stop, no optimization needed
  if (stops.length === 1) {
    const singleStop = stops[0]!;
    try {
      const result = await calculateSingleStopRoute(
        schoolLocation,
        singleStop.position,
        routeType
      );
      return {
        success: true,
        stops: [{ ...singleStop, order: 1 }],
        encodedPolyline: result.encodedPolyline,
        totalDuration: result.totalDuration,
        totalDistance: result.totalDistance,
        formattedDuration: formatDuration(result.totalDuration),
        formattedDistance: formatDistance(result.totalDistance),
      };
    } catch (error) {
      return createFallbackResult(stops, error);
    }
  }

  try {
    const directionsService = new google.maps.DirectionsService();

    // Determine origin and destination based on route type
    // For pickup: first stop is origin, school is destination
    // For dropoff: school is origin, last stop is destination
    let origin: google.maps.LatLng;
    let destination: google.maps.LatLng;
    let waypointStops: OptimizationStop[];

    if (routeType === "pickup") {
      // Pickup: first stop -> waypoints -> school
      const firstStop = stops[0]!;
      origin = new google.maps.LatLng(firstStop.position.lat, firstStop.position.lng);
      destination = new google.maps.LatLng(schoolLocation.lat, schoolLocation.lng);
      waypointStops = stops.slice(1); // All stops except the first (origin)
    } else {
      // Dropoff: school -> waypoints -> last stop
      const lastStop = stops[stops.length - 1]!;
      origin = new google.maps.LatLng(schoolLocation.lat, schoolLocation.lng);
      destination = new google.maps.LatLng(lastStop.position.lat, lastStop.position.lng);
      waypointStops = stops.slice(0, -1); // All stops except the last (destination)
    }

    // Create waypoints for optimization
    const waypoints = waypointStops.map((stop) => ({
      location: new google.maps.LatLng(stop.position.lat, stop.position.lng),
      stopover: true,
    }));

    // Call Directions API with optimization enabled
    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true, // Key: Let Google optimize the order
          travelMode: google.maps.TravelMode.DRIVING,
          region: "EC", // Ecuador region for better local results
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions API error: ${status}`));
          }
        }
      );
    });

    const route = result.routes[0];
    if (!route) {
      return createFallbackResult(stops, new Error("No route found"));
    }

    // Get the optimized waypoint order from the API response
    const waypointOrder = route.waypoint_order ?? waypointStops.map((_, i) => i);

    // Build the optimized stop list
    let optimizedStops: OptimizedStopResult[];

    if (routeType === "pickup") {
      // For pickup: first stop (origin) + optimized waypoints
      const firstStop = stops[0]!;
      const optimizedWaypoints = waypointOrder.map((i) => waypointStops[i]!);
      optimizedStops = [
        { ...firstStop, order: 1 },
        ...optimizedWaypoints.map((stop, index) => ({
          ...stop,
          order: index + 2,
        })),
      ];
    } else {
      // For dropoff: optimized waypoints + last stop (destination)
      const lastStop = stops[stops.length - 1]!;
      const optimizedWaypoints = waypointOrder.map((i) => waypointStops[i]!);
      optimizedStops = [
        ...optimizedWaypoints.map((stop, index) => ({
          ...stop,
          order: index + 1,
        })),
        { ...lastStop, order: optimizedWaypoints.length + 1 },
      ];
    }

    // Calculate totals from all route legs
    let totalDuration = 0;
    let totalDistance = 0;
    for (const leg of route.legs) {
      totalDuration += leg.duration?.value ?? 0;
      totalDistance += leg.distance?.value ?? 0;
    }

    // Get encoded polyline
    const encodedPolyline = route.overview_polyline ?? "";

    return {
      success: true,
      stops: optimizedStops,
      encodedPolyline,
      totalDuration,
      totalDistance,
      formattedDuration: formatDuration(totalDuration),
      formattedDistance: formatDistance(totalDistance),
    };
  } catch (error) {
    // On error, return original order with error flag
    return createFallbackResult(stops, error);
  }
}

/**
 * Calculate route for a single stop (no optimization needed)
 */
async function calculateSingleStopRoute(
  schoolLocation: LatLng,
  stopPosition: LatLng,
  routeType: "pickup" | "dropoff"
): Promise<{
  encodedPolyline: string;
  totalDuration: number;
  totalDistance: number;
}> {
  const directionsService = new google.maps.DirectionsService();

  const origin = routeType === "pickup"
    ? new google.maps.LatLng(stopPosition.lat, stopPosition.lng)
    : new google.maps.LatLng(schoolLocation.lat, schoolLocation.lng);

  const destination = routeType === "pickup"
    ? new google.maps.LatLng(schoolLocation.lat, schoolLocation.lng)
    : new google.maps.LatLng(stopPosition.lat, stopPosition.lng);

  const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        region: "EC",
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions API error: ${status}`));
        }
      }
    );
  });

  const route = result.routes[0];
  if (!route) {
    throw new Error("No route found");
  }

  const leg = route.legs[0];
  return {
    encodedPolyline: route.overview_polyline ?? "",
    totalDuration: leg?.duration?.value ?? 0,
    totalDistance: leg?.distance?.value ?? 0,
  };
}

/**
 * Create a fallback result when optimization fails
 * Returns the original stop order with an error flag
 */
function createFallbackResult(
  stops: OptimizationStop[],
  error: unknown
): RouteOptimizationResult {
  const errorMessage = error instanceof Error ? error.message : "Unknown optimization error";
  console.error("Route optimization failed, using original order:", errorMessage);

  return {
    success: false,
    error: errorMessage,
    stops: stops.map((stop, index) => ({
      ...stop,
      order: index + 1,
    })),
    encodedPolyline: "",
    totalDuration: 0,
    totalDistance: 0,
    formattedDuration: "N/A",
    formattedDistance: "N/A",
  };
}

/**
 * Format duration in seconds to human readable string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}

/**
 * Format distance in meters to human readable string
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

/**
 * Route stop input for recalculation (with lat/lng directly)
 */
export type RecalculationStop = {
  id: string;
  latitude: number;
  longitude: number;
  studentIds: string[];
  order: number;
};

/**
 * Result of route recalculation
 */
export type RecalculationResult = {
  polyline: string;
  duration: number;
  distance: number;
};

/**
 * Recalculate route for a manually reordered list of stops
 *
 * Unlike optimizeRouteOrder, this function preserves the given stop order
 * and only calculates the polyline, duration, and distance.
 *
 * @param stops - Array of stops in the desired order
 * @param routeType - "pickup" (stops -> school) or "dropoff" (school -> stops)
 * @param schoolLocation - The school's coordinates
 * @returns Route calculation result with polyline, duration, and distance
 */
export async function recalculateRouteWithFixedOrder(
  stops: RecalculationStop[],
  routeType: "pickup" | "dropoff",
  schoolLocation: LatLng
): Promise<RecalculationResult | null> {
  // Return null if no stops
  if (stops.length === 0) {
    return {
      polyline: "",
      duration: 0,
      distance: 0,
    };
  }

  // Sort stops by order to ensure correct sequence
  const sortedStops = [...stops].sort((a, b) => a.order - b.order);

  // For single stop, calculate simple route
  if (sortedStops.length === 1) {
    const singleStop = sortedStops[0]!;
    const stopPosition: LatLng = {
      lat: singleStop.latitude,
      lng: singleStop.longitude,
    };
    try {
      const result = await calculateSingleStopRoute(
        schoolLocation,
        stopPosition,
        routeType
      );
      return {
        polyline: result.encodedPolyline,
        duration: result.totalDuration,
        distance: result.totalDistance,
      };
    } catch (error) {
      console.error("Failed to calculate single stop route:", error);
      return null;
    }
  }

  try {
    const directionsService = new google.maps.DirectionsService();

    // Determine origin and destination based on route type
    // For pickup: first stop is origin, school is destination
    // For dropoff: school is origin, last stop is destination
    let origin: google.maps.LatLng;
    let destination: google.maps.LatLng;
    let waypointStops: RecalculationStop[];

    if (routeType === "pickup") {
      // Pickup: first stop -> waypoints -> school
      const firstStop = sortedStops[0]!;
      origin = new google.maps.LatLng(firstStop.latitude, firstStop.longitude);
      destination = new google.maps.LatLng(schoolLocation.lat, schoolLocation.lng);
      waypointStops = sortedStops.slice(1); // All stops except the first (origin)
    } else {
      // Dropoff: school -> waypoints -> last stop
      const lastStop = sortedStops[sortedStops.length - 1]!;
      origin = new google.maps.LatLng(schoolLocation.lat, schoolLocation.lng);
      destination = new google.maps.LatLng(lastStop.latitude, lastStop.longitude);
      waypointStops = sortedStops.slice(0, -1); // All stops except the last (destination)
    }

    // Create waypoints in order (NO optimization - preserving manual order)
    const waypoints = waypointStops.map((stop) => ({
      location: new google.maps.LatLng(stop.latitude, stop.longitude),
      stopover: true,
    }));

    // Call Directions API WITHOUT optimization to preserve manual order
    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: false, // Key: DO NOT optimize - keep manual order
          travelMode: google.maps.TravelMode.DRIVING,
          region: "EC",
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions API error: ${status}`));
          }
        }
      );
    });

    const route = result.routes[0];
    if (!route) {
      return null;
    }

    // Calculate totals from all route legs
    let totalDuration = 0;
    let totalDistance = 0;
    for (const leg of route.legs) {
      totalDuration += leg.duration?.value ?? 0;
      totalDistance += leg.distance?.value ?? 0;
    }

    // Get encoded polyline
    const encodedPolyline = route.overview_polyline ?? "";

    return {
      polyline: encodedPolyline,
      duration: totalDuration,
      distance: totalDistance,
    };
  } catch (error) {
    console.error("Route recalculation failed:", error);
    return null;
  }
}

/**
 * Re-export useful types and functions from @altaviapp/maps
 * for convenience when working with route optimization
 */
export { decodePolyline, calculateHaversineDistance } from "@altaviapp/maps";
export type { LatLng } from "@altaviapp/maps";
