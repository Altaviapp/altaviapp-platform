/**
 * GPS Location Simulation
 *
 * Generates realistic GPS paths between route stops for trip simulation
 */

import type { Stop } from '@/types';
import { calculateBearing } from '@/lib/utils/tripCalculations';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // degrees (0-360)
  timestamp: string;
  accuracy: number; // meters
}

/**
 * Generate GPS points between two stops
 *
 * @param start - Starting stop
 * @param end - Ending stop
 * @param numPoints - Number of intermediate points to generate (default: 12)
 * @returns Array of GPS locations along the path
 */
export function generateGPSPath(
  start: Stop,
  end: Stop,
  numPoints: number = 12
): GPSLocation[] {
  const points: GPSLocation[] = [];

  // Calculate bearing for consistent heading
  const heading = calculateBearing(
    start.latitude,
    start.longitude,
    end.latitude,
    end.longitude
  );

  // Generate intermediate points using linear interpolation
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;

    // Linear interpolation of coordinates
    const lat = start.latitude + (end.latitude - start.latitude) * ratio;
    const lng = start.longitude + (end.longitude - start.longitude) * ratio;

    // Simulate realistic speed variation (25-45 km/h for school bus in city)
    // Slower at start/end (near stops), faster in middle
    const speedFactor = Math.sin(ratio * Math.PI); // 0 -> 1 -> 0
    const baseSpeed = 25;
    const maxSpeed = 45;
    const speed = Math.round(baseSpeed + (maxSpeed - baseSpeed) * speedFactor);

    // Add small random variation to heading for realism
    const headingVariation = (Math.random() - 0.5) * 10; // ±5 degrees
    const adjustedHeading = (heading + headingVariation + 360) % 360;

    // GPS accuracy varies slightly
    const accuracy = 5 + Math.random() * 15; // 5-20 meters

    points.push({
      latitude: lat,
      longitude: lng,
      speed,
      heading: Math.round(adjustedHeading),
      timestamp: new Date().toISOString(),
      accuracy: Math.round(accuracy),
    });
  }

  return points;
}

/**
 * Generate complete GPS path for an entire route
 *
 * @param stops - Array of stops in route
 * @returns Array of GPS locations covering the entire route
 */
export function generateRouteGPSPath(stops: Stop[]): GPSLocation[] {
  if (stops.length < 2) return [];

  const allPoints: GPSLocation[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const segment = generateGPSPath(stops[i], stops[i + 1]);

    // Add all points except the last (to avoid duplicates at stop boundaries)
    if (i < stops.length - 2) {
      allPoints.push(...segment.slice(0, -1));
    } else {
      // Include last point for the final segment
      allPoints.push(...segment);
    }
  }

  return allPoints;
}

/**
 * Get GPS location at a specific progress point in the route
 *
 * @param gpsPath - Complete GPS path for route
 * @param progressRatio - Progress ratio (0.0 to 1.0)
 * @returns GPS location at that progress point
 */
export function getGPSLocationAtProgress(
  gpsPath: GPSLocation[],
  progressRatio: number
): GPSLocation | null {
  if (gpsPath.length === 0) return null;

  const index = Math.floor(progressRatio * (gpsPath.length - 1));
  const clampedIndex = Math.max(0, Math.min(index, gpsPath.length - 1));

  return gpsPath[clampedIndex];
}

/**
 * Simulate GPS location at a specific stop
 *
 * @param stop - The stop to get location for
 * @returns GPS location at the stop (stationary)
 */
export function getGPSLocationAtStop(stop: Stop): GPSLocation {
  return {
    latitude: stop.latitude,
    longitude: stop.longitude,
    speed: 0, // Stationary at stop
    heading: 0,
    timestamp: new Date().toISOString(),
    accuracy: 10,
  };
}

/**
 * Update GPS location timestamp
 *
 * @param location - GPS location to update
 * @returns Updated GPS location with current timestamp
 */
export function updateGPSTimestamp(location: GPSLocation): GPSLocation {
  return {
    ...location,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Simulate GPS drift (small random movement for realism)
 *
 * @param location - Base GPS location
 * @param driftMeters - Maximum drift in meters (default: 10m)
 * @returns GPS location with drift applied
 */
export function applyGPSDrift(
  location: GPSLocation,
  driftMeters: number = 10
): GPSLocation {
  // Convert meters to approximate degrees (rough approximation at equator)
  const metersPerDegree = 111320;
  const driftDegrees = driftMeters / metersPerDegree;

  const latDrift = (Math.random() - 0.5) * 2 * driftDegrees;
  const lngDrift = (Math.random() - 0.5) * 2 * driftDegrees;

  return {
    ...location,
    latitude: location.latitude + latDrift,
    longitude: location.longitude + lngDrift,
    timestamp: new Date().toISOString(),
  };
}
