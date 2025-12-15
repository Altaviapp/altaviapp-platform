/**
 * Directions Service
 *
 * Calculates routes between points using Google Maps Directions API
 */

import type { LatLng, DirectionsResult } from "../types/maps";

/**
 * Calculate route between origin and destination with optional waypoints
 */
export async function calculateRoute(
  origin: LatLng,
  destination: LatLng,
  waypoints?: LatLng[]
): Promise<DirectionsResult | null> {
  try {
    const directionsService = new google.maps.DirectionsService();

    const waypointsRequest = waypoints?.map((wp) => ({
      location: wp,
      stopover: true,
    }));

    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          waypoints: waypointsRequest,
          travelMode: google.maps.TravelMode.DRIVING,
          region: "EC",
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });

    // Extract route information
    const route = result.routes[0];
    if (!route) {
      return null;
    }

    // Decode polyline
    const polyline = decodePolyline(route.overview_polyline);

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    route.legs.forEach((leg) => {
      totalDistance += leg.distance?.value || 0;
      totalDuration += leg.duration?.value || 0;
    });

    return {
      polyline,
      distance: formatDistance(totalDistance),
      duration: formatDuration(totalDuration),
      bounds: {
        north: route.bounds.getNorthEast().lat(),
        south: route.bounds.getSouthWest().lat(),
        east: route.bounds.getNorthEast().lng(),
        west: route.bounds.getSouthWest().lng(),
      },
    };
  } catch (error) {
    console.error("Directions error:", error);
    return null;
  }
}

/**
 * Get just the polyline path between points
 */
export async function getRoutePolyline(
  origin: LatLng,
  destination: LatLng,
  waypoints?: LatLng[]
): Promise<LatLng[]> {
  const result = await calculateRoute(origin, destination, waypoints);
  return result?.polyline || [];
}

/**
 * Decode Google Maps polyline encoding
 */
function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;

    // Decode latitude
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}

/**
 * Format distance in meters to human readable
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

/**
 * Format duration in seconds to human readable
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}
