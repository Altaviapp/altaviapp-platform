/**
 * useActiveTripData Hook
 *
 * Adapter hook that transforms Crew app's trip data to the shared ActiveTripData format
 * for use with the @altaviapp/maps ActiveTripView component.
 *
 * Usage:
 * ```tsx
 * const { tripData, isLoading } = useActiveTripData(tripId);
 *
 * <ActiveTripView
 *   data={tripData}
 *   renderSidePanel={() => <NextStopCard ... />}
 * />
 * ```
 */

import { useMemo } from 'react';
import type {
  ActiveTripData,
  RouteStopMarker,
  StopStatus,
  LatLng,
  VehiclePosition,
} from '@altaviapp/maps';
import { useDirectionsPolyline } from '@altaviapp/maps';
import { useTrip, useTripStudents, useGPSTracking, useNovedadesForTrip, useConvexAuth } from '@/hooks';
import type { GeofenceAlert, GPSSourceType } from '@/hooks';
import { Id } from '../../../../convex/_generated/dataModel';

export interface UseActiveTripDataOptions {
  /** Callback for geofence alerts */
  onGeofenceAlert?: (alerts: GeofenceAlert[]) => void;
}

export interface UseActiveTripDataResult {
  /** Transformed trip data for ActiveTripView */
  tripData: ActiveTripData | null;
  /** Whether trip data is loading */
  isLoading: boolean;
  /** Whether GPS tracking is active */
  isTracking: boolean;
  /** Raw GPS position from tracking */
  gpsPosition: ReturnType<typeof useGPSTracking>['position'];
  /** GPS tracking error if any */
  gpsError: ReturnType<typeof useGPSTracking>['error'];
  /** Start GPS tracking */
  startTracking: (tripId: Id<"trips">, options?: { gpsSource?: GPSSourceType; fallbackToMobile?: boolean }) => void;
  /** Stop GPS tracking */
  stopTracking: () => void;
  /** Request GPS permission */
  requestPermission: () => Promise<boolean>;
  /** GPS permission status */
  permissionStatus: ReturnType<typeof useGPSTracking>['permissionStatus'];
  /** Geofence alerts */
  geofenceAlerts: GeofenceAlert[];
  /** Novedades for the trip */
  novedades: ReturnType<typeof useNovedadesForTrip>['novedades'];
  /** Whether trip has novedades */
  hasNovedades: boolean;
  /** Number of absent students */
  absentCount: number;
  /** Raw trip data from Convex */
  rawTrip: ReturnType<typeof useTrip>['trip'];
  /** Students for the trip */
  tripStudents: ReturnType<typeof useTripStudents>['students'];
  /** Polyline for the route */
  polyline: LatLng[];
  /** Whether using real Google Directions route */
  isRealRoute: boolean;
  /** Whether polyline is loading */
  isLoadingRoute: boolean;
}

/**
 * Transforms Crew app hooks data to the shared ActiveTripData format
 */
export function useActiveTripData(
  tripId: string | null,
  options: UseActiveTripDataOptions = {}
): UseActiveTripDataResult {
  const { onGeofenceAlert } = options;

  // Auth check
  const { isAuthenticated } = useConvexAuth();

  // Core trip data
  const { trip: convexTrip, isLoading: tripLoading } = useTrip(
    tripId as Id<"trips"> | null
  );

  // GPS tracking
  const {
    position: gpsPosition,
    isTracking,
    error: gpsError,
    permissionStatus,
    startTracking,
    stopTracking,
    requestPermission,
    geofenceAlerts,
  } = useGPSTracking({
    highAccuracy: true,
    onGeofenceAlert,
  });

  // Students for this trip
  const { students: tripStudents } = useTripStudents(tripId || null);

  // Novedades
  const { novedades, hasNovedades } = useNovedadesForTrip(
    isAuthenticated ? tripId : null
  );

  const absentCount = novedades.filter(
    (n: any) => n.type === 'absence' || n.typeCategorySnapshot === 'absence'
  ).length;

  // Get stops from trip (using any type to handle Convex inference)
  const tripStops = (convexTrip as any)?.stops ?? [];

  // Transform stops to RouteStopMarker format
  const mapStops = useMemo((): RouteStopMarker[] => {
    return tripStops.map((stop: any, index: number) => {
      let status: StopStatus = 'pending';
      if (stop.isCompleted) status = 'completed';
      else if (stop.isNext) status = 'current';

      return {
        id: String(stop._id),
        name: stop.name,
        address: stop.address,
        position: { lat: stop.latitude, lng: stop.longitude },
        order: index + 1,
        status,
        scheduledTime: stop.estimatedArrivalTime ?? undefined,
      };
    });
  }, [tripStops]);

  // Get stops as LatLng array for directions
  const stopsForDirections = useMemo(() => {
    return tripStops.map((stop: any) => ({
      lat: stop.latitude,
      lng: stop.longitude,
    }));
  }, [tripStops]);

  // Use real Google Directions polyline
  const {
    polyline,
    isLoading: isLoadingRoute,
    isRealRoute,
  } = useDirectionsPolyline({
    stops: stopsForDirections,
    vehiclePosition: gpsPosition
      ? { lat: gpsPosition.latitude, lng: gpsPosition.longitude }
      : null,
    enabled: tripStops.length >= 2,
  });

  // Calculate progress
  const stopsWithMeta = tripStops as Array<{
    _id: any;
    name?: string;
    address?: string;
    latitude: number;
    longitude: number;
    estimatedArrivalTime?: string;
    isCompleted?: boolean;
    isNext?: boolean;
  }>;
  const completedStops = stopsWithMeta.filter((s) => s?.isCompleted).length;
  const currentStopIndex = completedStops;
  const totalStops = stopsWithMeta.length;

  // Get current speed
  const tripStats = convexTrip?.stats as
    | { currentSpeed?: number | null; avgSpeed?: number }
    | undefined;
  const currentSpeed = gpsPosition?.speed
    ? Math.round(gpsPosition.speed * 3.6) // Convert m/s to km/h
    : Math.round(tripStats?.currentSpeed ?? tripStats?.avgSpeed ?? 0);

  // Vehicle position for map
  const vehiclePosition: VehiclePosition | null = gpsPosition
    ? {
        position: { lat: gpsPosition.latitude, lng: gpsPosition.longitude },
        heading: gpsPosition.heading ?? 0,
        speed: gpsPosition.speed ? gpsPosition.speed * 3.6 : 0,
        accuracy: gpsPosition.accuracy ?? 10,
        timestamp: gpsPosition.timestamp,
      }
    : null;

  // School position
  const schoolPosition = convexTrip?.school
    ? { lat: convexTrip.school.lat, lng: convexTrip.school.lng }
    : undefined;

  // Next stop data
  const backendNextStop = convexTrip?.nextStop ?? null;
  const nextStopRaw = backendNextStop
    ? stopsWithMeta.find((s) => s._id.toString() === backendNextStop.id?.toString())
    : stopsWithMeta.find((s) => s.isNext);

  // Build ActiveTripData
  const tripData = useMemo((): ActiveTripData | null => {
    if (!convexTrip || tripLoading) return null;

    return {
      tripId: tripId || '',
      routeName: convexTrip.route?.name ?? 'Ruta',
      routeType: convexTrip.route?.type === 'pickup' ? 'pickup' : 'dropoff',
      vehiclePosition,
      currentSpeed,
      stops: mapStops,
      polyline,
      completedStops,
      totalStops,
      currentStopIndex,
      schoolPosition,
      schoolName: convexTrip.school?.name,
      nextStop: nextStopRaw
        ? {
            id: String(nextStopRaw._id),
            name: nextStopRaw.name ?? '',
            address: nextStopRaw.address,
            etaMinutes: backendNextStop?.etaMinutes ?? undefined,
            etaTime: backendNextStop?.etaTime ?? undefined,
            distanceKm: backendNextStop?.distanceKm ?? undefined,
            latitude: nextStopRaw.latitude,
            longitude: nextStopRaw.longitude,
          }
        : undefined,
    };
  }, [
    convexTrip,
    tripLoading,
    tripId,
    vehiclePosition,
    currentSpeed,
    mapStops,
    polyline,
    completedStops,
    totalStops,
    currentStopIndex,
    schoolPosition,
    nextStopRaw,
    backendNextStop,
  ]);

  return {
    tripData,
    isLoading: tripLoading,
    isTracking,
    gpsPosition,
    gpsError,
    startTracking,
    stopTracking,
    requestPermission,
    permissionStatus,
    geofenceAlerts,
    novedades,
    hasNovedades,
    absentCount,
    rawTrip: convexTrip,
    tripStudents,
    polyline,
    isRealRoute,
    isLoadingRoute,
  };
}
