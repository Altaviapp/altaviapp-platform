/**
 * Trip Calculations Utilities
 *
 * Provides mathematical functions for GPS tracking, distance calculation,
 * ETA estimation, and trip progress tracking.
 */

import type { TripWithDetails, Stop } from '@/types';

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 *
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = R * c;

  return Math.round(distanceKm * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate estimated time of arrival
 *
 * @param distanceKm - Distance to destination in kilometers
 * @param avgSpeedKmh - Average speed in km/h (default: 35 km/h for school bus)
 * @returns ETA string formatted as "X min" or "X h Y min"
 */
export function calculateETA(distanceKm: number, avgSpeedKmh: number = 35): string {
  const hours = distanceKm / avgSpeedKmh;
  const totalMinutes = Math.round(hours * 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (m === 0) {
    return `${h} h`;
  }

  return `${h} h ${m} min`;
}

/**
 * Format elapsed time in seconds to HH:mm:ss
 *
 * @param seconds - Total elapsed seconds
 * @returns Formatted time string "HH:mm:ss"
 */
export function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [h, m, s]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Get the next stop in the trip route
 *
 * @param trip - Trip with details including stops
 * @param currentStopIndex - Index of current stop (0-based)
 * @returns Next stop or null if at end
 */
export function getNextStop(
  trip: TripWithDetails,
  currentStopIndex: number
): Stop | null {
  if (!trip.stops || currentStopIndex >= trip.stops.length - 1) {
    return null;
  }

  return trip.stops[currentStopIndex + 1];
}

/**
 * Get current stop in the trip route
 *
 * @param trip - Trip with details including stops
 * @param currentStopIndex - Index of current stop (0-based)
 * @returns Current stop or null if invalid index
 */
export function getCurrentStop(
  trip: TripWithDetails,
  currentStopIndex: number
): Stop | null {
  if (!trip.stops || currentStopIndex < 0 || currentStopIndex >= trip.stops.length) {
    return null;
  }

  return trip.stops[currentStopIndex];
}

/**
 * Calculate trip progress as percentage
 *
 * @param totalStops - Total number of stops in route
 * @param completedStops - Number of completed stops
 * @returns Progress percentage (0-100)
 */
export function getTripProgress(totalStops: number, completedStops: number): number {
  if (totalStops === 0) return 0;

  const progress = (completedStops / totalStops) * 100;

  return Math.round(progress);
}

/**
 * Calculate bearing (angle) between two GPS coordinates
 * Used for rotating the bus icon on the map
 *
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearingRad = Math.atan2(y, x);
  const bearingDeg = toDegrees(bearingRad);

  return (bearingDeg + 360) % 360; // Normalize to 0-360
}

/**
 * Calculate total route distance
 *
 * @param stops - Array of stops with GPS coordinates
 * @returns Total distance in kilometers
 */
export function calculateTotalRouteDistance(stops: Stop[]): number {
  if (stops.length < 2) return 0;

  let totalDistance = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const stop1 = stops[i];
    const stop2 = stops[i + 1];

    totalDistance += calculateDistance(
      stop1.latitude,
      stop1.longitude,
      stop2.latitude,
      stop2.longitude
    );
  }

  return Math.round(totalDistance * 100) / 100;
}

/**
 * Calculate distance from current location to a specific stop
 *
 * @param currentLat - Current latitude
 * @param currentLng - Current longitude
 * @param stop - Destination stop
 * @returns Distance in kilometers
 */
export function calculateDistanceToStop(
  currentLat: number,
  currentLng: number,
  stop: Stop
): number {
  return calculateDistance(
    currentLat,
    currentLng,
    stop.latitude,
    stop.longitude
  );
}

/**
 * Check if current location is within geofence of a stop
 *
 * @param currentLat - Current latitude
 * @param currentLng - Current longitude
 * @param stop - Stop to check
 * @param radiusKm - Geofence radius in kilometers (default: 0.1 km = 100m)
 * @returns True if within geofence
 */
export function isWithinGeofence(
  currentLat: number,
  currentLng: number,
  stop: Stop,
  radiusKm: number = 0.1
): boolean {
  const distance = calculateDistanceToStop(currentLat, currentLng, stop);
  return distance <= radiusKm;
}

/**
 * Format distance for display
 *
 * @param distanceKm - Distance in kilometers
 * @returns Formatted string "X.XX km" or "XXX m" for short distances
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }

  return `${distanceKm.toFixed(2)} km`;
}

/**
 * Calculate average speed based on distance and time
 *
 * @param distanceKm - Distance traveled in kilometers
 * @param timeSeconds - Time elapsed in seconds
 * @returns Speed in km/h
 */
export function calculateSpeed(distanceKm: number, timeSeconds: number): number {
  if (timeSeconds === 0) return 0;

  const hours = timeSeconds / 3600;
  const speedKmh = distanceKm / hours;

  return Math.round(speedKmh);
}

// Helper functions

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}
