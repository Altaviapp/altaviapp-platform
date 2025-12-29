'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface NavigationStep {
  instruction: string;
  maneuver: string;
  distance: number; // meters
  duration: number; // seconds
  streetName?: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  stopIndex?: number;
}

export interface Position {
  latitude: number;
  longitude: number;
}

interface UseNavigationOptions {
  steps: NavigationStep[];
  currentPosition: Position | null;
  isTracking: boolean;
  advanceThreshold?: number; // meters to advance to next step (default 30)
}

interface UseNavigationReturn {
  currentStep: NavigationStep | null;
  nextStep: NavigationStep | null;
  currentStepIndex: number;
  distanceToManeuver: number | null;
  allSteps: NavigationStep[];
  isNavigating: boolean;
  progress: number; // 0-100
}

/**
 * Hook to manage turn-by-turn navigation state
 *
 * Tracks the current navigation step based on GPS position
 * and automatically advances when the user approaches the next maneuver point.
 */
export function useNavigation({
  steps,
  currentPosition,
  isTracking,
  advanceThreshold = 30,
}: UseNavigationOptions): UseNavigationReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((pos1: Position, pos2: Position): number => {
    const R = 6371000; // Earth's radius in meters
    const lat1 = (pos1.latitude * Math.PI) / 180;
    const lat2 = (pos2.latitude * Math.PI) / 180;
    const deltaLat = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const deltaLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // Calculate distance to current step's end point
  const distanceToManeuver = useMemo(() => {
    if (!currentPosition || !steps[currentStepIndex]) {
      return null;
    }

    const step = steps[currentStepIndex];
    return calculateDistance(currentPosition, {
      latitude: step.endLatitude,
      longitude: step.endLongitude,
    });
  }, [currentPosition, steps, currentStepIndex, calculateDistance]);

  // Update current step based on position
  useEffect(() => {
    if (!currentPosition || !isTracking || steps.length === 0) {
      return;
    }

    // Check if we should advance to the next step
    if (distanceToManeuver !== null && distanceToManeuver < advanceThreshold) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      }
    }
  }, [currentPosition, isTracking, steps, distanceToManeuver, advanceThreshold, currentStepIndex]);

  // Reset step index when steps change
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [steps]);

  // Current and next steps
  const currentStep = steps[currentStepIndex] || null;
  const nextStep = steps[currentStepIndex + 1] || null;

  // Calculate progress
  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.round((currentStepIndex / steps.length) * 100);
  }, [currentStepIndex, steps.length]);

  return {
    currentStep,
    nextStep,
    currentStepIndex,
    distanceToManeuver,
    allSteps: steps,
    isNavigating: isTracking && steps.length > 0,
    progress,
  };
}

/**
 * Generate mock navigation steps from route stops
 *
 * This is a fallback when actual navigation steps are not available.
 * It creates simple "head to stop" instructions between stops.
 */
export function generateNavigationStepsFromStops(
  stops: Array<{
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }>
): NavigationStep[] {
  const steps: NavigationStep[] = [];

  for (let i = 0; i < stops.length; i++) {
    const currentStop = stops[i];
    const nextStop = stops[i + 1];

    // Skip if currentStop is somehow undefined
    if (!currentStop) continue;

    if (nextStop) {
      // Calculate rough distance
      const R = 6371000;
      const lat1 = (currentStop.latitude * Math.PI) / 180;
      const lat2 = (nextStop.latitude * Math.PI) / 180;
      const deltaLat = ((nextStop.latitude - currentStop.latitude) * Math.PI) / 180;
      const deltaLon = ((nextStop.longitude - currentStop.longitude) * Math.PI) / 180;
      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      steps.push({
        instruction: `Dirígete a ${nextStop.name}`,
        maneuver: 'straight',
        distance: Math.round(distance),
        duration: Math.round(distance / 8.33), // Assume ~30 km/h average
        streetName: nextStop.address,
        startLatitude: currentStop.latitude,
        startLongitude: currentStop.longitude,
        endLatitude: nextStop.latitude,
        endLongitude: nextStop.longitude,
        stopIndex: i + 1,
      });
    } else {
      // Last stop - arrival
      steps.push({
        instruction: `Llegada a ${currentStop.name}`,
        maneuver: 'arrive',
        distance: 0,
        duration: 0,
        streetName: currentStop.address,
        startLatitude: currentStop.latitude,
        startLongitude: currentStop.longitude,
        endLatitude: currentStop.latitude,
        endLongitude: currentStop.longitude,
        stopIndex: i,
      });
    }
  }

  return steps;
}
