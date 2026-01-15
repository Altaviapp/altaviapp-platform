/**
 * useActiveTripData Hook (Parent App)
 *
 * Adapter hook that transforms Parent app's student tracking data to the shared
 * ActiveTripData format for use with the @altaviapp/maps ActiveTripView component.
 *
 * Usage:
 * ```tsx
 * const { tripData, isLoading, ... } = useActiveTripData(studentId);
 *
 * <ActiveTripView
 *   data={tripData}
 *   highlightedStopIndex={studentStopIndex}
 *   renderSidePanel={() => <VehicleInfoCard ... />}
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
  DelayStatus,
} from '@altaviapp/maps';
import { useStudentTracking } from './useMyStudents';
import { Id } from '../../../../convex/_generated/dataModel';

export interface UseActiveTripDataResult {
  /** Transformed trip data for ActiveTripView */
  tripData: ActiveTripData | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether there is an active trip */
  hasActiveTrip: boolean;
  /** Index of the student's stop (for highlighting) */
  studentStopIndex: number | undefined;
  /** Vehicle info for VehicleInfoCard */
  vehicleInfo: {
    licensePlate: string;
    driverName: string | null;
    lastUpdate: number | null;
  } | null;
  /** Delay status for UI */
  delayStatus: DelayStatus | null;
  /** ETA data */
  etaMinutes: number | null;
  etaTime: string | null;
  distanceKm: number | null;
  /** Raw tracking data */
  rawTracking: ReturnType<typeof useStudentTracking>['tracking'];
}

/**
 * Transforms Parent app student tracking data to the shared ActiveTripData format
 */
export function useActiveTripData(
  studentId: Id<"students"> | string | null
): UseActiveTripDataResult {
  // Use the existing student tracking hook
  const {
    tracking,
    isLoading,
    hasActiveTrip,
    currentLocation,
    route,
    trip,
    stops,
    studentStop,
    vehicle,
    driver,
    school,
    completedStops,
    totalStops,
    currentStopIndex,
    etaMinutes,
    etaTime,
    distanceKm,
    delayStatus: rawDelayStatus,
    currentSpeed,
    lastGPSUpdate,
  } = useStudentTracking(studentId as Id<"students"> | null);

  // Transform stops to RouteStopMarker format
  const mapStops = useMemo((): RouteStopMarker[] => {
    if (!stops || stops.length === 0) return [];

    return stops.map((stop: any, index: number) => {
      let status: StopStatus = 'pending';
      if (stop.status === 'completed') status = 'completed';
      else if (stop.status === 'current' || index === currentStopIndex) status = 'current';

      return {
        id: String(stop.id || stop._id),
        name: stop.name || '',
        address: stop.address,
        position: { lat: stop.lat || stop.latitude, lng: stop.lng || stop.longitude },
        order: index + 1,
        status,
        scheduledTime: stop.scheduledTime || stop.estimatedArrivalTime,
        eta: stop.etaTime,
      };
    });
  }, [stops, currentStopIndex]);

  // Generate polyline from stops or use optimized route polyline
  const polyline = useMemo((): LatLng[] => {
    if (!stops || stops.length < 2) return [];
    return stops.map((stop: any) => ({
      lat: stop.lat || stop.latitude,
      lng: stop.lng || stop.longitude,
    }));
  }, [stops]);

  // Find student's stop index
  const studentStopIndex = useMemo(() => {
    if (!studentStop || !stops) return undefined;
    const stopId = studentStop.id;
    return stops.findIndex((s: any) =>
      s.id?.toString() === stopId?.toString()
    );
  }, [studentStop, stops]);

  // Transform vehicle position
  const vehiclePosition: VehiclePosition | null = useMemo(() => {
    if (!currentLocation) return null;
    return {
      position: {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      },
      heading: currentLocation.heading ?? 0,
      speed: currentSpeed ?? 0, // km/h
      accuracy: 10, // Default accuracy
      timestamp: lastGPSUpdate ?? Date.now(),
    };
  }, [currentLocation, currentSpeed, lastGPSUpdate]);

  // Transform delay status
  const delayStatus: DelayStatus | null = useMemo(() => {
    if (!rawDelayStatus) return null;
    return {
      isDelayed: rawDelayStatus.isDelayed ?? false,
      delayMinutes: rawDelayStatus.delayMinutes ?? 0,
      status: (rawDelayStatus.status as DelayStatus['status']) ?? 'on_time',
    };
  }, [rawDelayStatus]);

  // School position
  const schoolPosition: LatLng | undefined = useMemo(() => {
    if (!school) return undefined;
    return { lat: school.lat, lng: school.lng };
  }, [school]);

  // Build ActiveTripData
  const tripData = useMemo((): ActiveTripData | null => {
    if (!hasActiveTrip || !trip || isLoading) return null;

    return {
      tripId: String(trip.id),
      routeName: route?.name ?? 'Ruta',
      routeType: route?.type === 'pickup' ? 'pickup' : 'dropoff',
      vehiclePosition,
      currentSpeed: currentSpeed ?? 0,
      stops: mapStops,
      polyline,
      completedStops: completedStops ?? 0,
      totalStops: totalStops ?? 0,
      currentStopIndex: currentStopIndex ?? 0,
      schoolPosition,
      schoolName: school?.name,
      nextStop: studentStop
        ? {
            id: String(studentStop.id),
            name: studentStop.name || '',
            address: studentStop.address,
            etaMinutes: etaMinutes ?? undefined,
            etaTime: etaTime ?? undefined,
            distanceKm: distanceKm ?? undefined,
            latitude: studentStop.lat,
            longitude: studentStop.lng,
            delayStatus: delayStatus ?? undefined,
          }
        : undefined,
    };
  }, [
    hasActiveTrip,
    trip,
    isLoading,
    route,
    vehiclePosition,
    currentSpeed,
    mapStops,
    polyline,
    completedStops,
    totalStops,
    currentStopIndex,
    schoolPosition,
    school,
    studentStop,
    etaMinutes,
    etaTime,
    distanceKm,
    delayStatus,
  ]);

  // Vehicle info for display
  const vehicleInfo = useMemo(() => {
    if (!vehicle) return null;
    return {
      licensePlate: vehicle.licensePlate || '',
      driverName: driver?.name || null,
      lastUpdate: lastGPSUpdate,
    };
  }, [vehicle, driver, lastGPSUpdate]);

  return {
    tripData,
    isLoading,
    hasActiveTrip,
    studentStopIndex,
    vehicleInfo,
    delayStatus,
    etaMinutes,
    etaTime,
    distanceKm,
    rawTracking: tracking,
  };
}
