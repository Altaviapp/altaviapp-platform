/**
 * useActiveTrip Hook
 *
 * Complete state management for active trips including:
 * - GPS simulation and tracking
 * - Elapsed time tracking
 * - Stop progression
 * - Student boarding management
 * - localStorage persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TripWithDetails, Stop } from '@/types';
import type { GPSLocation } from '@/lib/mockData/gpsLocations';
import {
  startTrip as startTripState,
  getActiveTrip as getActiveTripState,
  simulateGPSUpdate,
  moveToNextStop as moveToNextStopState,
  finishTrip as finishTripState,
  addStudentOnBoard as addStudentState,
  removeStudentOnBoard as removeStudentState,
  saveActiveTripToStorage,
  loadActiveTripFromStorage,
  removeActiveTripFromStorage,
} from '@/lib/mockData/activeTrips';
import {
  getNextStop,
  getCurrentStop,
  calculateDistanceToStop,
  calculateETA,
  getTripProgress,
} from '@/lib/utils/tripCalculations';
import { useElapsedTime } from './useElapsedTime';

export interface UseActiveTripReturn {
  // Trip State
  trip: TripWithDetails | null;
  isActive: boolean;
  isLoading: boolean;

  // Current Position
  currentStop: Stop | null;
  nextStop: Stop | null;
  currentStopIndex: number;
  currentLocation: GPSLocation | null;

  // Students
  studentsOnBoard: string[];
  totalStudents: number;

  // Time
  elapsedSeconds: number;
  elapsedFormatted: string;

  // Computed Values
  progress: number;
  distanceToNextStop: number;
  etaToNextStop: string;
  currentSpeed: number;

  // Actions
  startTrip: (trip: TripWithDetails) => void;
  finishTrip: () => void;
  moveToNextStop: () => void;
  addStudent: (studentId: string) => void;
  removeStudent: (studentId: string) => void;
}

/**
 * Hook for managing active trip state
 *
 * @param tripId - Trip ID to manage (optional, for persistence)
 * @returns Active trip state and control functions
 */
export function useActiveTrip(tripId?: string): UseActiveTripReturn {
  const [trip, setTrip] = useState<TripWithDetails | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [studentsOnBoard, setStudentsOnBoard] = useState<string[]>([]);

  const gpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Elapsed time tracking
  const {
    elapsedSeconds,
    elapsedFormatted,
    start: startTimer,
    stop: stopTimer,
    setTime,
  } = useElapsedTime(0, false);

  /**
   * Load trip from storage on mount (if tripId provided)
   */
  useEffect(() => {
    if (!tripId) {
      setIsLoading(false);
      return;
    }

    const loadedTrip = loadActiveTripFromStorage(tripId);

    if (loadedTrip && loadedTrip.isActive) {
      setTrip(loadedTrip.trip);
      setIsActive(true);
      setCurrentLocation(loadedTrip.currentLocation);
      setCurrentStopIndex(loadedTrip.currentStopIndex);
      setStudentsOnBoard(loadedTrip.studentsOnBoard);

      // Restore elapsed time
      const elapsed = loadedTrip.elapsedSeconds || 0;
      setTime(elapsed);
      startTimer();

      // Resume GPS simulation
      startGPSSimulation(tripId);
    }

    setIsLoading(false);
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Save to storage whenever trip state changes
   */
  useEffect(() => {
    if (trip && isActive && tripId) {
      saveActiveTripToStorage(tripId);
    }
  }, [trip, isActive, tripId, currentLocation, currentStopIndex, studentsOnBoard]);

  /**
   * Start GPS simulation
   */
  const startGPSSimulation = useCallback((id: string) => {
    // Clear any existing interval
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
    }

    // Simulate GPS update every 15 seconds
    gpsIntervalRef.current = setInterval(() => {
      const updatedState = simulateGPSUpdate(id);

      if (updatedState) {
        setCurrentLocation(updatedState.currentLocation);

        // If simulation reached the end, stop
        if (!updatedState.isActive) {
          stopGPSSimulation();
        }
      }
    }, 15000); // 15 seconds
  }, []);

  /**
   * Stop GPS simulation
   */
  const stopGPSSimulation = useCallback(() => {
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
  }, []);

  /**
   * Start a trip
   */
  const startTrip = useCallback(
    (tripToStart: TripWithDetails) => {
      const activeState = startTripState(tripToStart);

      setTrip(activeState.trip);
      setIsActive(true);
      setCurrentLocation(activeState.currentLocation);
      setCurrentStopIndex(0);
      setStudentsOnBoard([]);

      startTimer();

      if (tripToStart._id) {
        startGPSSimulation(tripToStart._id);
        saveActiveTripToStorage(tripToStart._id);
      }
    },
    [startTimer, startGPSSimulation]
  );

  /**
   * Finish the trip
   */
  const finishTrip = useCallback(() => {
    if (!trip) return;

    const finishedTrip = finishTripState(trip._id);

    if (finishedTrip) {
      setTrip(finishedTrip);
      setIsActive(false);
      stopTimer();
      stopGPSSimulation();

      // Remove from storage
      if (trip._id) {
        removeActiveTripFromStorage(trip._id);
      }
    }
  }, [trip, stopTimer, stopGPSSimulation]);

  /**
   * Move to next stop (manual progression)
   */
  const moveToNextStop = useCallback(() => {
    if (!trip) return;

    const updatedState = moveToNextStopState(trip._id);

    if (updatedState) {
      setCurrentStopIndex(updatedState.currentStopIndex);
      setCurrentLocation(updatedState.currentLocation);
    }
  }, [trip]);

  /**
   * Add student to onboard list
   */
  const addStudent = useCallback(
    (studentId: string) => {
      if (!trip) return;

      addStudentState(trip._id, studentId);
      setStudentsOnBoard(prev => [...prev, studentId]);
    },
    [trip]
  );

  /**
   * Remove student from onboard list
   */
  const removeStudent = useCallback(
    (studentId: string) => {
      if (!trip) return;

      removeStudentState(trip._id, studentId);
      setStudentsOnBoard(prev => prev.filter(id => id !== studentId));
    },
    [trip]
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopGPSSimulation();
    };
  }, [stopGPSSimulation]);

  // Computed values
  const currentStop = trip ? getCurrentStop(trip, currentStopIndex) : null;
  const nextStop = trip ? getNextStop(trip, currentStopIndex) : null;

  const totalStops = trip?.stops?.length || 0;
  const progress = getTripProgress(totalStops, currentStopIndex);

  const distanceToNextStop =
    nextStop && currentLocation
      ? calculateDistanceToStop(
          currentLocation.latitude,
          currentLocation.longitude,
          nextStop
        )
      : 0;

  const etaToNextStop = calculateETA(distanceToNextStop);

  const currentSpeed = currentLocation?.speed || 0;

  const totalStudents = trip?.studentsAssigned?.length || 0;

  return {
    // Trip State
    trip,
    isActive,
    isLoading,

    // Current Position
    currentStop,
    nextStop,
    currentStopIndex,
    currentLocation,

    // Students
    studentsOnBoard,
    totalStudents,

    // Time
    elapsedSeconds,
    elapsedFormatted,

    // Computed Values
    progress,
    distanceToNextStop,
    etaToNextStop,
    currentSpeed,

    // Actions
    startTrip,
    finishTrip,
    moveToNextStop,
    addStudent,
    removeStudent,
  };
}
