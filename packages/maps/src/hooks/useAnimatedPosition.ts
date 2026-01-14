"use client";

import { useState, useEffect, useRef } from "react";
import type { LatLng } from "../config";

/**
 * Calculate the distance between two points in meters using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Linear interpolation between two values
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Ease-out cubic function for smoother deceleration
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export interface UseAnimatedPositionOptions {
  /** Animation duration in milliseconds (default: 1000ms) */
  duration?: number;
  /** Maximum distance in meters to animate (beyond this, snap to position) */
  maxAnimateDistance?: number;
  /** Whether animation is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook to smoothly animate between GPS positions
 *
 * Interpolates the marker position between updates for a fluid movement
 * instead of abrupt jumps every GPS update interval.
 *
 * @param targetPosition - The target GPS position to animate to
 * @param options - Animation configuration options
 * @returns The current interpolated position
 *
 * @example
 * ```tsx
 * const animatedPosition = useAnimatedPosition(vehiclePosition?.position ?? null, {
 *   duration: 1000,
 *   maxAnimateDistance: 500,
 * });
 *
 * <Marker position={animatedPosition ?? defaultPosition} />
 * ```
 */
export function useAnimatedPosition(
  targetPosition: LatLng | null,
  options: UseAnimatedPositionOptions = {}
): LatLng | null {
  const { duration = 1000, maxAnimateDistance = 500, enabled = true } = options;

  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(targetPosition);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const startPositionRef = useRef<LatLng | null>(null);

  useEffect(() => {
    // If animation is disabled or no target, just set directly
    if (!enabled || !targetPosition) {
      setCurrentPosition(targetPosition);
      return;
    }

    // If no current position, snap to target immediately
    if (!currentPosition) {
      setCurrentPosition(targetPosition);
      return;
    }

    // Calculate distance to determine if we should animate
    const distance = calculateDistance(
      currentPosition.lat,
      currentPosition.lng,
      targetPosition.lat,
      targetPosition.lng
    );

    // If distance is too large (GPS jump), snap immediately
    if (distance > maxAnimateDistance) {
      setCurrentPosition(targetPosition);
      return;
    }

    // If positions are essentially the same, don't animate
    if (distance < 0.5) {
      return;
    }

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Store animation start state
    startPositionRef.current = currentPosition;
    startTimeRef.current = performance.now();

    // Animation loop
    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      if (startPositionRef.current) {
        const lat = lerp(startPositionRef.current.lat, targetPosition.lat, easedProgress);
        const lng = lerp(startPositionRef.current.lng, targetPosition.lng, easedProgress);

        setCurrentPosition({ lat, lng });
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition?.lat, targetPosition?.lng, duration, maxAnimateDistance, enabled]);

  return currentPosition;
}

export default useAnimatedPosition;
