"use client";

/**
 * GPS Tracking Hook for Crew App
 *
 * Provides continuous GPS tracking with battery-efficient updates.
 * Sends location to Convex every 15 seconds when trip is active.
 *
 * Supports multiple GPS sources:
 * - mobile: GPS from driver/monitor's mobile device (default)
 * - device: GPS from installed hardware in vehicle
 * - api: GPS from external API integration
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// TYPES
// ============================================

export type GPSSourceType = "mobile" | "device" | "api";

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface GPSError {
  code: number;
  message: string;
}

export interface GPSTrackingState {
  position: GPSPosition | null;
  error: GPSError | null;
  isTracking: boolean;
  isSupported: boolean;
  permissionStatus: "prompt" | "granted" | "denied" | "unknown";
  lastUpdateTime: number | null;
  updateCount: number;
  // Multi-source GPS support
  gpsSource: GPSSourceType;
  isExternalGpsActive: boolean;
  fallbackActive: boolean;
}

export interface GeofenceAlert {
  stopId: string;
  stopName: string;
  message: string;
}

export interface UseGPSTrackingReturn extends GPSTrackingState {
  startTracking: (tripId: Id<"trips">, options?: { gpsSource?: GPSSourceType; fallbackToMobile?: boolean }) => void;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
  getCurrentPosition: () => Promise<GPSPosition | null>;
  geofenceAlerts: GeofenceAlert[];
  activateFallback: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const UPDATE_INTERVAL = 15000; // 15 seconds
const EXTERNAL_GPS_TIMEOUT = 120000; // 2 minutes - consider external GPS offline if no update
const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000,
};

const BATTERY_SAVER_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 10000,
};

// ============================================
// HOOK
// ============================================

export function useGPSTracking(
  options: {
    highAccuracy?: boolean;
    onPositionUpdate?: (position: GPSPosition) => void;
    onError?: (error: GPSError) => void;
    onGeofenceAlert?: (alerts: GeofenceAlert[]) => void;
    onExternalGpsTimeout?: () => void;
  } = {}
): UseGPSTrackingReturn {
  const { userId } = useConvexAuth();
  const updateLocationMutation = useMutation(api.gpsTracking.updateLocation);

  // State
  const [state, setState] = useState<GPSTrackingState>({
    position: null,
    error: null,
    isTracking: false,
    isSupported: typeof navigator !== "undefined" && "geolocation" in navigator,
    permissionStatus: "unknown",
    lastUpdateTime: null,
    updateCount: 0,
    // Multi-source GPS
    gpsSource: "mobile",
    isExternalGpsActive: false,
    fallbackActive: false,
  });

  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([]);

  // Refs for tracking
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const externalGpsCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tripIdRef = useRef<Id<"trips"> | null>(null);
  const lastPositionRef = useRef<GPSPosition | null>(null);
  const gpsSourceRef = useRef<GPSSourceType>("mobile");
  const fallbackEnabledRef = useRef<boolean>(true);

  // Position options based on accuracy preference
  const positionOptions = options.highAccuracy !== false
    ? HIGH_ACCURACY_OPTIONS
    : BATTERY_SAVER_OPTIONS;

  /**
   * Check and update permission status
   */
  const checkPermission = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      setState((prev) => ({
        ...prev,
        permissionStatus: result.state as "prompt" | "granted" | "denied",
      }));

      result.addEventListener("change", () => {
        setState((prev) => ({
          ...prev,
          permissionStatus: result.state as "prompt" | "granted" | "denied",
        }));
      });
    } catch {
      // Permissions API not supported
    }
  }, []);

  /**
   * Request geolocation permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setState((prev) => ({ ...prev, permissionStatus: "granted" }));
          resolve(true);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setState((prev) => ({ ...prev, permissionStatus: "denied" }));
          }
          resolve(false);
        },
        positionOptions
      );
    });
  }, [state.isSupported, positionOptions]);

  /**
   * Get current position once
   */
  const getCurrentPosition = useCallback(async (): Promise<GPSPosition | null> => {
    if (!state.isSupported) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position: GPSPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          };
          resolve(position);
        },
        () => {
          resolve(null);
        },
        positionOptions
      );
    });
  }, [state.isSupported, positionOptions]);

  /**
   * Send position to Convex
   */
  const sendPositionToServer = useCallback(
    async (position: GPSPosition, tripId: Id<"trips">) => {
      if (!userId) {
        return;
      }

      try {
        const result = await updateLocationMutation({
          userId,
          tripId,
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed ?? undefined,
          heading: position.heading ?? undefined,
        });

        // Handle geofence alerts
        if (result?.geofenceAlerts && result.geofenceAlerts.length > 0) {
          setGeofenceAlerts(result.geofenceAlerts);
          options.onGeofenceAlert?.(result.geofenceAlerts);
        }

        setState((prev) => ({
          ...prev,
          lastUpdateTime: Date.now(),
          updateCount: prev.updateCount + 1,
          error: null,
        }));
      } catch (error) {
        console.error("Error sending GPS location:", error);
        setState((prev) => ({
          ...prev,
          error: {
            code: -1,
            message: error instanceof Error ? error.message : "Error al enviar ubicación",
          },
        }));
      }
    },
    [userId, updateLocationMutation, options]
  );

  /**
   * Handle position update from watchPosition
   */
  const handlePositionUpdate = useCallback(
    (pos: GeolocationPosition) => {
      const position: GPSPosition = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        timestamp: pos.timestamp,
      };

      lastPositionRef.current = position;

      setState((prev) => ({
        ...prev,
        position,
        error: null,
      }));

      options.onPositionUpdate?.(position);
    },
    [options]
  );

  /**
   * Handle position error
   */
  const handlePositionError = useCallback(
    (error: GeolocationPositionError) => {
      const gpsError: GPSError = {
        code: error.code,
        message: getErrorMessage(error.code),
      };

      setState((prev) => ({
        ...prev,
        error: gpsError,
      }));

      options.onError?.(gpsError);
    },
    [options]
  );

  /**
   * Start mobile GPS tracking (internal helper)
   */
  const startMobileTracking = useCallback(
    (tripId: Id<"trips">) => {
      if (!state.isSupported) {
        return;
      }

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handlePositionError,
        positionOptions
      );

      // Set up interval to send updates every 15 seconds
      intervalIdRef.current = setInterval(() => {
        if (lastPositionRef.current && tripIdRef.current) {
          sendPositionToServer(lastPositionRef.current, tripIdRef.current);
        }
      }, UPDATE_INTERVAL);

      // Send initial position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position: GPSPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          };
          lastPositionRef.current = position;
          sendPositionToServer(position, tripId);
        },
        handlePositionError,
        positionOptions
      );
    },
    [
      state.isSupported,
      handlePositionUpdate,
      handlePositionError,
      positionOptions,
      sendPositionToServer,
    ]
  );

  /**
   * Start GPS tracking for a trip
   * Supports multiple GPS sources: mobile, device, or api
   */
  const startTracking = useCallback(
    (tripId: Id<"trips">, trackingOptions?: { gpsSource?: GPSSourceType; fallbackToMobile?: boolean }) => {
      if (state.isTracking) {
        return;
      }

      const source = trackingOptions?.gpsSource || "mobile";
      const fallbackEnabled = trackingOptions?.fallbackToMobile ?? true;

      tripIdRef.current = tripId;
      gpsSourceRef.current = source;
      fallbackEnabledRef.current = fallbackEnabled;

      setState((prev) => ({
        ...prev,
        isTracking: true,
        gpsSource: source,
        error: null,
        fallbackActive: false,
        isExternalGpsActive: source !== "mobile",
      }));

      if (source === "mobile") {
        // Use device's GPS directly
        startMobileTracking(tripId);
      } else {
        // External GPS (device or api) - don't use local GPS
        // Set up interval to check if external GPS is sending updates
        externalGpsCheckIntervalRef.current = setInterval(async () => {
          // Query the backend for last GPS update
          // If no update in EXTERNAL_GPS_TIMEOUT, trigger fallback or error
          const lastUpdate = state.lastUpdateTime;
          const now = Date.now();

          if (lastUpdate && (now - lastUpdate) > EXTERNAL_GPS_TIMEOUT) {
            // External GPS timeout
            if (fallbackEnabled && state.isSupported) {
              // Activate fallback to mobile GPS
              console.log("External GPS timeout - activating mobile fallback");
              setState((prev) => ({
                ...prev,
                fallbackActive: true,
                isExternalGpsActive: false,
              }));
              startMobileTracking(tripId);
              options.onExternalGpsTimeout?.();
            } else {
              // No fallback - set error
              setState((prev) => ({
                ...prev,
                error: {
                  code: -2,
                  message: "GPS externo no responde. Verifique la conexión del dispositivo.",
                },
                isExternalGpsActive: false,
              }));
              options.onExternalGpsTimeout?.();
            }
            // Clear the check interval
            if (externalGpsCheckIntervalRef.current) {
              clearInterval(externalGpsCheckIntervalRef.current);
              externalGpsCheckIntervalRef.current = null;
            }
          }
        }, 30000); // Check every 30 seconds
      }
    },
    [
      state.isTracking,
      state.isSupported,
      state.lastUpdateTime,
      startMobileTracking,
      options,
    ]
  );

  /**
   * Activate fallback to mobile GPS manually
   */
  const activateFallback = useCallback(() => {
    if (!tripIdRef.current || !state.isSupported) {
      return;
    }

    // Stop external GPS check interval
    if (externalGpsCheckIntervalRef.current) {
      clearInterval(externalGpsCheckIntervalRef.current);
      externalGpsCheckIntervalRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      fallbackActive: true,
      isExternalGpsActive: false,
    }));

    startMobileTracking(tripIdRef.current);
  }, [state.isSupported, startMobileTracking]);

  /**
   * Stop GPS tracking
   */
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (externalGpsCheckIntervalRef.current !== null) {
      clearInterval(externalGpsCheckIntervalRef.current);
      externalGpsCheckIntervalRef.current = null;
    }

    tripIdRef.current = null;
    gpsSourceRef.current = "mobile";
    fallbackEnabledRef.current = true;

    setState((prev) => ({
      ...prev,
      isTracking: false,
      gpsSource: "mobile",
      isExternalGpsActive: false,
      fallbackActive: false,
    }));
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
      if (externalGpsCheckIntervalRef.current !== null) {
        clearInterval(externalGpsCheckIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    geofenceAlerts,
    startTracking,
    stopTracking,
    requestPermission,
    getCurrentPosition,
    activateFallback,
  };
}

// ============================================
// HELPERS
// ============================================

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación.";
    case 2:
      return "No se pudo obtener la ubicación. Verifica que el GPS esté habilitado.";
    case 3:
      return "Tiempo de espera agotado. Intentando de nuevo...";
    default:
      return "Error desconocido al obtener la ubicación.";
  }
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Simple hook to just get current position once
 */
export function useCurrentPosition() {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosition = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocalización no soportada");
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise<GPSPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsPosition: GPSPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          };
          setPosition(gpsPosition);
          setLoading(false);
          resolve(gpsPosition);
        },
        (err) => {
          setError(getErrorMessage(err.code));
          setLoading(false);
          resolve(null);
        },
        HIGH_ACCURACY_OPTIONS
      );
    });
  }, []);

  return {
    position,
    loading,
    error,
    getPosition,
  };
}
