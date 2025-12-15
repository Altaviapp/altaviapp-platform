/**
 * Active Trip State Management
 *
 * Manages the state of active trips with GPS simulation
 */

import type { TripWithDetails } from '@/types';
import type { GPSLocation } from './gpsLocations';
import { generateRouteGPSPath, updateGPSTimestamp } from './gpsLocations';

export interface ActiveTripState {
  trip: TripWithDetails;
  gpsPath: GPSLocation[];
  currentGPSIndex: number;
  currentLocation: GPSLocation | null;
  startTime: string;
  elapsedSeconds: number;
  currentStopIndex: number;
  studentsOnBoard: string[];
  isActive: boolean;
}

/**
 * In-memory storage for active trips
 * In production, this would be in localStorage or a state management library
 */
const activeTripStore: Map<string, ActiveTripState> = new Map();

/**
 * Start a trip and initialize GPS simulation
 *
 * @param trip - Trip to start
 * @returns Initialized active trip state
 */
export function startTrip(trip: TripWithDetails): ActiveTripState {
  // Generate complete GPS path for the route
  const gpsPath = trip.stops
    ? generateRouteGPSPath(trip.stops)
    : [];

  const activeState: ActiveTripState = {
    trip: {
      ...trip,
      status: 'in_progress',
      actualStartTime: new Date().toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    gpsPath,
    currentGPSIndex: 0,
    currentLocation: gpsPath[0] || null,
    startTime: new Date().toISOString(),
    elapsedSeconds: 0,
    currentStopIndex: 0,
    studentsOnBoard: [],
    isActive: true,
  };

  activeTripStore.set(trip._id, activeState);

  return activeState;
}

/**
 * Get active trip state
 *
 * @param tripId - Trip ID
 * @returns Active trip state or null if not active
 */
export function getActiveTrip(tripId: string): ActiveTripState | null {
  return activeTripStore.get(tripId) || null;
}

/**
 * Update elapsed time for active trip
 *
 * @param tripId - Trip ID
 * @param elapsedSeconds - Total elapsed seconds
 */
export function updateElapsedTime(tripId: string, elapsedSeconds: number): void {
  const activeTrip = activeTripStore.get(tripId);
  if (!activeTrip) return;

  activeTrip.elapsedSeconds = elapsedSeconds;
  activeTripStore.set(tripId, activeTrip);
}

/**
 * Simulate GPS movement (called every 15 seconds)
 *
 * @param tripId - Trip ID
 * @returns Updated active trip state or null
 */
export function simulateGPSUpdate(tripId: string): ActiveTripState | null {
  const activeTrip = activeTripStore.get(tripId);
  if (!activeTrip || !activeTrip.isActive) return null;

  const { gpsPath, currentGPSIndex } = activeTrip;

  // Move to next GPS point
  const nextIndex = Math.min(currentGPSIndex + 1, gpsPath.length - 1);

  // Update location with current timestamp
  const newLocation = gpsPath[nextIndex]
    ? updateGPSTimestamp(gpsPath[nextIndex])
    : activeTrip.currentLocation;

  // Check if we've reached the end of the route
  if (nextIndex >= gpsPath.length - 1) {
    activeTrip.isActive = false;
  }

  activeTrip.currentGPSIndex = nextIndex;
  activeTrip.currentLocation = newLocation;

  activeTripStore.set(tripId, activeTrip);

  return activeTrip;
}

/**
 * Move to next stop (manual progression for testing)
 *
 * @param tripId - Trip ID
 * @returns Updated active trip state or null
 */
export function moveToNextStop(tripId: string): ActiveTripState | null {
  const activeTrip = activeTripStore.get(tripId);
  if (!activeTrip) return null;

  const totalStops = activeTrip.trip.stops?.length || 0;

  if (activeTrip.currentStopIndex < totalStops - 1) {
    activeTrip.currentStopIndex += 1;

    // Calculate approximate GPS index for this stop
    const stopsPerGPSPoint = activeTrip.gpsPath.length / totalStops;
    const newGPSIndex = Math.floor(activeTrip.currentStopIndex * stopsPerGPSPoint);

    activeTrip.currentGPSIndex = newGPSIndex;
    activeTrip.currentLocation = activeTrip.gpsPath[newGPSIndex] || activeTrip.currentLocation;

    activeTripStore.set(tripId, activeTrip);
  }

  return activeTrip;
}

/**
 * Add student to onboard list
 *
 * @param tripId - Trip ID
 * @param studentId - Student ID to add
 */
export function addStudentOnBoard(tripId: string, studentId: string): void {
  const activeTrip = activeTripStore.get(tripId);
  if (!activeTrip) return;

  if (!activeTrip.studentsOnBoard.includes(studentId)) {
    activeTrip.studentsOnBoard.push(studentId);
    activeTrip.trip.studentsOnBoard = activeTrip.studentsOnBoard;
    activeTripStore.set(tripId, activeTrip);
  }
}

/**
 * Remove student from onboard list
 *
 * @param tripId - Trip ID
 * @param studentId - Student ID to remove
 */
export function removeStudentOnBoard(tripId: string, studentId: string): void {
  const activeTrip = activeTripStore.get(tripId);
  if (!activeTrip) return;

  activeTrip.studentsOnBoard = activeTrip.studentsOnBoard.filter(
    id => id !== studentId
  );
  activeTrip.trip.studentsOnBoard = activeTrip.studentsOnBoard;
  activeTripStore.set(tripId, activeTrip);
}

/**
 * Finish a trip
 *
 * @param tripId - Trip ID
 * @returns Final trip state
 */
export function finishTrip(tripId: string): TripWithDetails | null {
  const activeTrip = activeTripStore.get(tripId);
  if (!activeTrip) return null;

  const finishedTrip: TripWithDetails = {
    ...activeTrip.trip,
    status: 'completed',
    actualEndTime: new Date().toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  activeTrip.isActive = false;
  activeTripStore.set(tripId, activeTrip);

  return finishedTrip;
}

/**
 * Cancel an active trip
 *
 * @param tripId - Trip ID
 * @returns Cancelled trip state
 */
export function cancelTrip(tripId: string): TripWithDetails | null {
  const activeTrip = activeTripStore.get(tripId);
  if (!activeTrip) return null;

  const cancelledTrip: TripWithDetails = {
    ...activeTrip.trip,
    status: 'cancelled',
  };

  activeTrip.isActive = false;

  // Remove from active store
  activeTripStore.delete(tripId);

  return cancelledTrip;
}

/**
 * Check if a trip is currently active
 *
 * @param tripId - Trip ID
 * @returns True if trip is active
 */
export function isTripActive(tripId: string): boolean {
  const activeTrip = activeTripStore.get(tripId);
  return activeTrip?.isActive || false;
}

/**
 * Get all active trips
 *
 * @returns Array of all active trip states
 */
export function getAllActiveTrips(): ActiveTripState[] {
  return Array.from(activeTripStore.values()).filter(trip => trip.isActive);
}

/**
 * Clear all active trips (for testing/reset)
 */
export function clearAllActiveTrips(): void {
  activeTripStore.clear();
}

/**
 * Save active trip state to localStorage
 *
 * @param tripId - Trip ID
 */
export function saveActiveTripToStorage(tripId: string): void {
  if (typeof window === 'undefined') return;

  const activeTrip = activeTripStore.get(tripId);
  if (!activeTrip) return;

  try {
    localStorage.setItem(
      `activeTrip_${tripId}`,
      JSON.stringify(activeTrip)
    );
  } catch (error) {
    console.error('Failed to save active trip to storage:', error);
  }
}

/**
 * Load active trip state from localStorage
 *
 * @param tripId - Trip ID
 * @returns Loaded active trip state or null
 */
export function loadActiveTripFromStorage(tripId: string): ActiveTripState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(`activeTrip_${tripId}`);
    if (!stored) return null;

    const activeTrip = JSON.parse(stored) as ActiveTripState;
    activeTripStore.set(tripId, activeTrip);

    return activeTrip;
  } catch (error) {
    console.error('Failed to load active trip from storage:', error);
    return null;
  }
}

/**
 * Remove active trip from localStorage
 *
 * @param tripId - Trip ID
 */
export function removeActiveTripFromStorage(tripId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(`activeTrip_${tripId}`);
  } catch (error) {
    console.error('Failed to remove active trip from storage:', error);
  }
}
