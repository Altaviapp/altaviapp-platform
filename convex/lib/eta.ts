/**
 * ETA Calculation Utilities
 *
 * Distance-based ETA calculation for real-time trip tracking.
 * Uses Haversine formula for distance and GPS speed for estimation.
 */

// ============================================
// TYPES
// ============================================

export interface LatLng {
  lat: number;
  lng: number;
}

export interface StopForETA {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  order: number;
  scheduledTime?: string;
  estimatedArrivalTime?: string;
}

export interface StopWithETA extends StopForETA {
  etaMinutes: number | null;
  etaTime: string | null;
  distanceKm: number | null;
  isCompleted: boolean;
  isNext: boolean;
}

export interface GPSData {
  latitude: number;
  longitude: number;
  speed?: number; // km/h
  heading?: number;
  timestamp: number;
}

// ============================================
// CONSTANTS
// ============================================

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

// Default urban speed when no GPS speed available (km/h)
// Conservative estimate for school bus in urban areas with stops
const DEFAULT_URBAN_SPEED_KMH = 25;

// Minimum speed to consider (km/h) - below this we use default
const MIN_VALID_SPEED_KMH = 5;

// Maximum speed to consider valid (km/h) - above this likely GPS error
const MAX_VALID_SPEED_KMH = 80;

// Average time at each stop (minutes) - for student pickup/dropoff
const AVG_STOP_TIME_MINUTES = 2;

// ============================================
// DISTANCE CALCULATIONS
// ============================================

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate total distance along a path of points
 * @returns Total distance in kilometers
 */
export function calculatePathDistance(points: LatLng[]): number {
  if (points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    totalDistance += haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }
  return totalDistance;
}

// ============================================
// SPEED CALCULATIONS
// ============================================

/**
 * Get effective speed for ETA calculation
 * Uses GPS speed if valid, otherwise falls back to calculated average
 */
export function getEffectiveSpeed(
  gpsSpeed: number | undefined,
  calculatedAvgSpeed: number | undefined
): number {
  // Check if GPS speed is valid
  if (
    gpsSpeed !== undefined &&
    gpsSpeed >= MIN_VALID_SPEED_KMH &&
    gpsSpeed <= MAX_VALID_SPEED_KMH
  ) {
    // Weight GPS speed more heavily, blend with calculated
    if (calculatedAvgSpeed !== undefined && calculatedAvgSpeed > MIN_VALID_SPEED_KMH) {
      return gpsSpeed * 0.7 + calculatedAvgSpeed * 0.3;
    }
    return gpsSpeed;
  }

  // Use calculated average if valid
  if (calculatedAvgSpeed !== undefined && calculatedAvgSpeed >= MIN_VALID_SPEED_KMH) {
    return Math.min(calculatedAvgSpeed, MAX_VALID_SPEED_KMH);
  }

  // Fall back to default urban speed
  return DEFAULT_URBAN_SPEED_KMH;
}

/**
 * Calculate average speed from trip progress
 */
export function calculateTripAverageSpeed(
  startTime: number,
  startPosition: LatLng,
  currentPosition: LatLng,
  stopsCompleted: number
): number {
  const elapsedHours = (Date.now() - startTime) / (1000 * 60 * 60);

  // Must have some elapsed time
  if (elapsedHours < 0.01) {
    // Less than ~36 seconds
    return DEFAULT_URBAN_SPEED_KMH;
  }

  // Calculate direct distance traveled
  const distanceTraveled = haversineDistance(
    startPosition.lat,
    startPosition.lng,
    currentPosition.lat,
    currentPosition.lng
  );

  // Account for stop time in speed calculation
  const stopTimeHours = (stopsCompleted * AVG_STOP_TIME_MINUTES) / 60;
  const drivingTimeHours = Math.max(0.01, elapsedHours - stopTimeHours);

  const avgSpeed = distanceTraveled / drivingTimeHours;

  // Sanity check
  if (avgSpeed < MIN_VALID_SPEED_KMH || avgSpeed > MAX_VALID_SPEED_KMH) {
    return DEFAULT_URBAN_SPEED_KMH;
  }

  return avgSpeed;
}

// ============================================
// ETA CALCULATIONS
// ============================================

/**
 * Calculate ETA in minutes from distance and speed
 */
export function calculateETAMinutes(
  distanceKm: number,
  speedKmh: number,
  includeStopTime: boolean = false
): number {
  if (distanceKm <= 0) return 0;
  if (speedKmh <= 0) speedKmh = DEFAULT_URBAN_SPEED_KMH;

  const travelMinutes = (distanceKm / speedKmh) * 60;
  const stopMinutes = includeStopTime ? AVG_STOP_TIME_MINUTES : 0;

  return Math.ceil(travelMinutes + stopMinutes);
}

/**
 * Format ETA as time string (HH:mm) from minutes
 */
export function formatETATime(etaMinutes: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + etaMinutes);

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

/**
 * Calculate ETAs for all remaining stops
 * Returns stops enriched with ETA information
 */
export function calculateStopETAs(
  currentPosition: LatLng,
  stops: StopForETA[],
  completedStopIds: Set<string>,
  speedKmh: number
): StopWithETA[] {
  // Sort stops by order
  const sortedStops = [...stops].sort((a, b) => a.order - b.order);

  let cumulativeMinutes = 0;
  let previousPosition = currentPosition;
  let foundNextStop = false;

  return sortedStops.map((stop) => {
    const isCompleted = completedStopIds.has(stop.id);

    // If completed, no ETA needed
    if (isCompleted) {
      return {
        ...stop,
        etaMinutes: null,
        etaTime: null,
        distanceKm: null,
        isCompleted: true,
        isNext: false,
      };
    }

    // Calculate distance from previous position to this stop
    const distanceKm = haversineDistance(
      previousPosition.lat,
      previousPosition.lng,
      stop.latitude,
      stop.longitude
    );

    // Calculate time to this stop
    const travelMinutes = calculateETAMinutes(distanceKm, speedKmh, true);
    cumulativeMinutes += travelMinutes;

    // Determine if this is the next stop
    const isNext = !foundNextStop;
    if (isNext) {
      foundNextStop = true;
    }

    // Update previous position for next iteration
    previousPosition = { lat: stop.latitude, lng: stop.longitude };

    return {
      ...stop,
      etaMinutes: cumulativeMinutes,
      etaTime: formatETATime(cumulativeMinutes),
      distanceKm: Math.round(distanceKm * 100) / 100, // Round to 2 decimals
      isCompleted: false,
      isNext,
    };
  });
}

/**
 * Calculate ETA to a specific stop
 * Used for parent app to show ETA to child's stop
 */
export function calculateETAToStop(
  currentPosition: LatLng,
  targetStop: StopForETA,
  intermediateStops: StopForETA[],
  speedKmh: number
): { etaMinutes: number; etaTime: string; distanceKm: number } {
  // Sort intermediate stops by order
  const sortedStops = intermediateStops
    .filter((s) => s.order < targetStop.order)
    .sort((a, b) => a.order - b.order);

  let totalDistanceKm = 0;
  let previousPosition = currentPosition;

  // Calculate distance through intermediate stops
  for (const stop of sortedStops) {
    totalDistanceKm += haversineDistance(
      previousPosition.lat,
      previousPosition.lng,
      stop.latitude,
      stop.longitude
    );
    previousPosition = { lat: stop.latitude, lng: stop.longitude };
  }

  // Add distance to target stop
  totalDistanceKm += haversineDistance(
    previousPosition.lat,
    previousPosition.lng,
    targetStop.latitude,
    targetStop.longitude
  );

  // Calculate ETA including stop times at intermediate stops
  const travelMinutes = (totalDistanceKm / speedKmh) * 60;
  const stopMinutes = sortedStops.length * AVG_STOP_TIME_MINUTES;
  const etaMinutes = Math.ceil(travelMinutes + stopMinutes);

  return {
    etaMinutes,
    etaTime: formatETATime(etaMinutes),
    distanceKm: Math.round(totalDistanceKm * 100) / 100,
  };
}

/**
 * Get delay status compared to scheduled time
 */
export function getDelayStatus(
  etaMinutes: number,
  scheduledTime: string | undefined
): { isDelayed: boolean; delayMinutes: number; status: "on_time" | "slight_delay" | "delayed" | "very_delayed" } {
  if (!scheduledTime) {
    return { isDelayed: false, delayMinutes: 0, status: "on_time" };
  }

  // Parse scheduled time (HH:mm format)
  const [hours, minutes] = scheduledTime.split(":").map(Number);
  if (hours === undefined || minutes === undefined) {
    return { isDelayed: false, delayMinutes: 0, status: "on_time" };
  }

  const now = new Date();
  const scheduledDate = new Date();
  scheduledDate.setHours(hours, minutes, 0, 0);

  // Calculate when we'll arrive based on ETA
  const arrivalTime = new Date(now.getTime() + etaMinutes * 60 * 1000);

  // Calculate delay in minutes
  const delayMinutes = Math.round(
    (arrivalTime.getTime() - scheduledDate.getTime()) / 60000
  );

  if (delayMinutes <= 2) {
    return { isDelayed: false, delayMinutes: 0, status: "on_time" };
  } else if (delayMinutes <= 5) {
    return { isDelayed: true, delayMinutes, status: "slight_delay" };
  } else if (delayMinutes <= 15) {
    return { isDelayed: true, delayMinutes, status: "delayed" };
  } else {
    return { isDelayed: true, delayMinutes, status: "very_delayed" };
  }
}
