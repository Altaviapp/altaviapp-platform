'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Bus,
  MapPin,
  Clock,
  AlertTriangle,
  Sunrise,
  Sunset,
  FileText,
  UserMinus,
  Crosshair,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GoogleMapsProvider, GoogleRouteMap, getRoutePolyline, type RouteStopMarker, type StopStatus, type LatLng } from '@altaviapp/maps';

import { useTrip, useTripOperations, useConvexAuth, useGPSTracking, useCurrentPosition, useNovedadesForTrip, useTripStudents } from '@/hooks';
import type { GeofenceAlert, GPSSourceType } from '@/hooks';
import { RelayModeModal } from '@/components/trip/RelayModeModal';
import { IncidentReportModal } from '@/components/trip/IncidentReportModal';
import { NextStopCard, type StudentWithStatus } from '@/components/trip/NextStopCard';
import { QuickActions } from '@/components/trip/QuickActions';
import { CheckinSheet } from '@/components/checkin';
import { Id } from '../../../../../../../../convex/_generated/dataModel';

/**
 * Active Trip Page
 *
 * Redesigned with visual map, next stop card with integrated check-in,
 * and 3 action buttons (incident, relay, details)
 */
export default function ActiveTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = (params?.id as string) || '';

  // Modal states
  const [isRelayModalOpen, setIsRelayModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [currentVehiclePlate, setCurrentVehiclePlate] = useState('');
  const [gpsSourceType, setGpsSourceType] = useState<GPSSourceType>('mobile');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Check-in sheet state
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Map reference for centering
  const mapRef = useRef<google.maps.Map | null>(null);

  // Directions polyline state
  const [directionsPolyline, setDirectionsPolyline] = useState<LatLng[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [initialBoundsFit, setInitialBoundsFit] = useState(false);

  // Get real trip data from Convex
  const { trip: convexTrip, isLoading: tripLoading } = useTrip(tripId as Id<"trips"> | null);
  const { completeTrip } = useTripOperations();
  const { getPosition } = useCurrentPosition();
  const { students: tripStudents } = useTripStudents(tripId || null);

  // Use real auth
  const { isAuthenticated } = useConvexAuth();

  // Get novedades for this trip
  const { novedades, hasNovedades } = useNovedadesForTrip(isAuthenticated ? tripId : null);
  const absentCount = novedades.filter((n: any) =>
    n.type === 'absence' || n.typeCategorySnapshot === 'absence'
  ).length;

  // Trip is active if status is in_progress
  const isActive = convexTrip?.status === 'in_progress';

  // Handle geofence alerts from GPS tracking
  const handleGeofenceAlert = useCallback((alerts: GeofenceAlert[]) => {
    alerts.forEach((alert) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Alerta de Parada', {
          body: alert.message,
          icon: '/icons/icon-192x192.png',
        });
      }
    });
  }, []);

  // GPS Tracking
  const {
    position: gpsPosition,
    isTracking: gpsIsTracking,
    error: gpsError,
    permissionStatus: gpsPermission,
    startTracking: startGPSTracking,
    stopTracking: stopGPSTracking,
    requestPermission: requestGPSPermission,
    geofenceAlerts,
  } = useGPSTracking({
    highAccuracy: true,
    onGeofenceAlert: handleGeofenceAlert,
  });

  // Trip data for UI
  const tripStartTime = convexTrip?.startTime;
  const routeName = convexTrip?.route?.name ?? 'Ruta';
  const routeType = convexTrip?.route?.type;
  const vehiclePlate = convexTrip?.vehicle?.licensePlate ?? 'N/A';
  const tripStops = convexTrip?.stops ?? [];
  const isPickup = routeType === 'pickup';

  // Prepare stops for map
  const mapStops = useMemo((): RouteStopMarker[] => tripStops.map((stop, index) => {
    const stopWithMeta = stop as typeof stop & { isCompleted?: boolean; isNext?: boolean };
    let status: StopStatus = 'pending';
    if (stopWithMeta.isCompleted) status = 'completed';
    else if (stopWithMeta.isNext) status = 'current';

    return {
      id: String(stop._id),
      name: stop.name,
      address: stop.address,
      position: { lat: stop.latitude, lng: stop.longitude },
      order: index + 1,
      status,
      scheduledTime: stop.estimatedArrivalTime ?? undefined,
    };
  }), [tripStops]);

  // Generate polyline from stops (simple straight-line route)
  const routePolyline = useMemo(() => {
    if (tripStops.length < 2) return [];
    return tripStops.map(stop => ({
      lat: stop.latitude,
      lng: stop.longitude,
    }));
  }, [tripStops]);

  // Handle map load to store reference
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Center map on current position
  const handleCenterOnMe = useCallback(() => {
    if (mapRef.current && gpsPosition) {
      mapRef.current.panTo({
        lat: gpsPosition.latitude,
        lng: gpsPosition.longitude,
      });
      mapRef.current.setZoom(16);
    }
  }, [gpsPosition]);

  // Fetch directions route when stops are available or GPS position changes significantly
  useEffect(() => {
    const fetchRoute = async () => {
      if (tripStops.length < 1 || isLoadingRoute) return;

      const lastStop = tripStops[tripStops.length - 1];
      if (!lastStop) return;

      // Use current GPS position as origin if available, otherwise use first stop
      const currentPos = gpsPosition
        ? { lat: gpsPosition.latitude, lng: gpsPosition.longitude }
        : tripStops[0] ? { lat: tripStops[0].latitude, lng: tripStops[0].longitude } : null;

      if (!currentPos) return;

      setIsLoadingRoute(true);
      try {
        const origin = currentPos;
        const destination = { lat: lastStop.latitude, lng: lastStop.longitude };

        // All stops except the last one are waypoints
        const waypoints = tripStops.slice(0, -1).map(stop => ({
          lat: stop.latitude,
          lng: stop.longitude,
        }));

        const polyline = await getRoutePolyline(origin, destination, waypoints.length > 0 ? waypoints : undefined);
        if (polyline && polyline.length > 0) {
          setDirectionsPolyline(polyline);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fall back to simple polyline if directions fail
        const fallback = gpsPosition
          ? [{ lat: gpsPosition.latitude, lng: gpsPosition.longitude }, ...routePolyline]
          : routePolyline;
        setDirectionsPolyline(fallback);
      } finally {
        setIsLoadingRoute(false);
        // Mark initial bounds as fit after first route fetch
        if (!initialBoundsFit) {
          setInitialBoundsFit(true);
        }
      }
    };

    // Only fetch if Google Maps is loaded (mapRef is set)
    // Refetch when GPS position changes significantly (but not too often)
    if (mapRef.current && tripStops.length >= 1 && !directionsPolyline.length) {
      fetchRoute();
    }
  }, [tripStops, isLoadingRoute, directionsPolyline.length, routePolyline, gpsPosition, initialBoundsFit]);

  // Format elapsed time
  const elapsedFormatted = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const secs = elapsedSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Elapsed time counter
  useEffect(() => {
    if (!isActive || !tripStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - tripStartTime) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, tripStartTime]);

  // Start GPS tracking when trip is active
  useEffect(() => {
    if (isActive && tripId && !gpsIsTracking) {
      if (gpsPermission === 'prompt' || gpsPermission === 'unknown') {
        requestGPSPermission().then((granted) => {
          if (granted) {
            startGPSTracking(tripId as any);
          }
        });
      } else if (gpsPermission === 'granted') {
        startGPSTracking(tripId as any);
      }
    }
  }, [isActive, tripId, gpsIsTracking, gpsPermission, requestGPSPermission, startGPSTracking]);

  // Cleanup GPS tracking on unmount
  useEffect(() => {
    return () => {
      if (gpsIsTracking) {
        stopGPSTracking();
      }
    };
  }, [gpsIsTracking, stopGPSTracking]);

  // Stop GPS tracking when trip is no longer active
  useEffect(() => {
    if (!isActive && gpsIsTracking) {
      stopGPSTracking();
    }
  }, [isActive, gpsIsTracking, stopGPSTracking]);

  // Get next stop with ETA - calculate BEFORE early return to maintain hooks order
  const stopsWithETA = tripStops as Array<typeof tripStops[0] & {
    etaMinutes?: number | null;
    etaTime?: string | null;
    isCompleted?: boolean;
    isNext?: boolean;
  }>;

  const backendNextStop = convexTrip?.nextStop ?? null;
  const nextStopRaw = backendNextStop
    ? {
        ...tripStops.find((s) => s._id.toString() === backendNextStop.id?.toString()) ?? tripStops[0],
        etaMinutes: backendNextStop.etaMinutes,
        etaTime: backendNextStop.etaTime,
        distanceKm: backendNextStop.distanceKm,
      }
    : stopsWithETA.find((s) => s.isNext) ?? tripStops[0] ?? null;

  // Calculate progress - BEFORE early return
  const completedStops = stopsWithETA.filter((s) => s.isCompleted).length;
  const currentStopIndex = completedStops;
  const totalStops = tripStops.length;

  // Get speed - BEFORE early return
  const tripStats = convexTrip?.stats as { currentSpeed?: number | null; avgSpeed?: number } | undefined;
  const currentSpeed = gpsPosition?.speed
    ? Math.round(gpsPosition.speed * 3.6)
    : Math.round(tripStats?.currentSpeed ?? tripStats?.avgSpeed ?? 0);

  // Get students for the next stop - MUST be called before early return
  const nextStopStudents = useMemo((): StudentWithStatus[] => {
    if (!nextStopRaw) return [];

    return tripStudents
      .filter((ts: any) => ts.stop?.id === nextStopRaw._id)
      .map((ts: any) => {
        let status: StudentWithStatus['status'] = 'pending';
        if (ts.status === 'absent') status = 'absent';
        else if (ts.status === 'parent_pickup') status = 'parent_pickup';
        else if (ts.checkinStatus === 'pickup' || ts.checkinStatus === 'checked_in') status = 'checked_in';
        else if (ts.checkinStatus === 'dropoff' || ts.checkinStatus === 'checked_out') status = 'checked_out';

        return {
          _id: ts.student?.id || '',
          firstName: ts.student?.firstName || '',
          lastName: ts.student?.lastName || '',
          status,
          novedad: ts.novedad,
        };
      })
      .filter((s: StudentWithStatus) => s._id);
  }, [tripStudents, nextStopRaw]);

  // Handle finish trip
  const handleFinishTrip = async () => {
    if (confirm('Estas seguro de que deseas finalizar el viaje?')) {
      if (gpsIsTracking) {
        stopGPSTracking();
      }

      try {
        const position = await getPosition();
        const latitude = position?.latitude ?? gpsPosition?.latitude ?? -0.1828;
        const longitude = position?.longitude ?? gpsPosition?.longitude ?? -78.4847;

        await completeTrip(tripId as Id<"trips">, latitude, longitude);
        router.push('/dashboard');
      } catch (error) {
        console.error('Error completing trip:', error);
        alert(`Error al finalizar viaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  // Loading state
  if (tripLoading || !convexTrip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  // Navigate to Google Maps
  const handleNavigate = () => {
    if (nextStopRaw) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${nextStopRaw.latitude},${nextStopRaw.longitude}&travelmode=driving`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Handle student check-in from NextStopCard
  const handleStudentCheckin = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsCheckinOpen(true);
  };

  // Action handlers
  const handleIncident = () => setIsIncidentModalOpen(true);
  const handleRelay = () => {
    setCurrentVehiclePlate(vehiclePlate);
    setIsRelayModalOpen(true);
  };
  const handleDetails = () => router.push(`/trips/${tripId}/details`);

  const handleRelayComplete = (newVehicle: { gpsSourceType: GPSSourceType }) => {
    setGpsSourceType(newVehicle.gpsSourceType);
    if (newVehicle.gpsSourceType === 'mobile') {
      stopGPSTracking();
      if (gpsPermission === 'granted') {
        startGPSTracking(tripId as unknown as Id<"trips">, { gpsSource: 'mobile' });
      }
    } else {
      stopGPSTracking();
    }
  };

  // Vehicle position for map
  const vehiclePosition = gpsPosition ? {
    position: { lat: gpsPosition.latitude, lng: gpsPosition.longitude },
    heading: gpsPosition.heading ?? 0,
    speed: gpsPosition.speed ? gpsPosition.speed * 3.6 : 0,
    accuracy: gpsPosition.accuracy ?? 10,
    timestamp: gpsPosition.timestamp,
  } : null;

  const TypeIcon = isPickup ? Sunrise : Sunset;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Compact Header */}
      <div className={cn(
        'px-4 py-3 flex items-center justify-between',
        isPickup ? 'bg-warning' : 'bg-info'
      )}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/20">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5 text-white" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm uppercase tracking-wide">
                  En Ruta
                </span>
                <span className="px-2 py-0.5 bg-white/20 rounded text-white text-xs font-medium">
                  {isPickup ? 'Recogida' : 'Entrega'}
                </span>
              </div>
              <p className="text-white/80 text-xs">{routeName}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-white">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{elapsedFormatted}</span>
          </div>
          <p className="text-white/70 text-xs">{vehiclePlate}</p>
        </div>
      </div>

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="mx-4 mt-2 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {gpsError.message}
        </div>
      )}

      {/* Novedades Indicator */}
      {hasNovedades && (
        <Link
          href={`/trips/${tripId}/students`}
          className="mx-4 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-amber-800">
              {novedades.length} {novedades.length === 1 ? 'novedad' : 'novedades'}
            </span>
            {absentCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                <UserMinus className="w-3 h-3" />
                {absentCount} ausente{absentCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="text-xs text-amber-600">Ver lista</span>
        </Link>
      )}

      {/* Map Section - Visual only, no turn-by-turn */}
      <GoogleMapsProvider>
        <div className="flex-1 relative" style={{ minHeight: '45vh' }}>
          <GoogleRouteMap
            stops={mapStops}
            currentStopIndex={currentStopIndex}
            polyline={directionsPolyline.length > 0 ? directionsPolyline : routePolyline}
            vehiclePosition={vehiclePosition}
            showVehicle={!!vehiclePosition}
            autoFitBounds={!initialBoundsFit}
            showGeofences={false}
            onMapLoad={handleMapLoad}
            style={{ height: '45vh', width: '100%' }}
            overlays={{
              topLeft: gpsIsTracking ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      gpsIsTracking ? 'bg-success animate-pulse' : 'bg-gray-400'
                    )} />
                    <span className="font-bold text-lg">{currentSpeed}</span>
                    <span className="text-gray-600 text-sm">km/h</span>
                  </div>
                </div>
              ) : undefined,
              topRight: (
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{currentStopIndex}/{totalStops}</span>
                    <span className="text-gray-500">paradas</span>
                  </div>
                </div>
              ),
              bottomRight: (
                <button
                  onClick={handleCenterOnMe}
                  className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  aria-label="Centrar en mi ubicación"
                >
                  <Crosshair className="w-5 h-5 text-primary" />
                </button>
              ),
            }}
          />
        </div>
      </GoogleMapsProvider>

      {/* Next Stop Card with Students and Check-in */}
      {nextStopRaw && (
        <div className="px-4 -mt-4 relative z-10">
          <NextStopCard
            stop={{
              _id: nextStopRaw._id as string,
              name: nextStopRaw.name ?? '',
              address: nextStopRaw.address ?? '',
              latitude: nextStopRaw.latitude ?? 0,
              longitude: nextStopRaw.longitude ?? 0,
            }}
            stopNumber={currentStopIndex + 1}
            distanceKm={'distanceKm' in nextStopRaw ? (nextStopRaw.distanceKm ?? 0) : 0}
            eta={
              'etaMinutes' in nextStopRaw && nextStopRaw.etaMinutes
                ? `~${nextStopRaw.etaMinutes} min`
                : nextStopRaw.estimatedArrivalTime ?? '-'
            }
            students={nextStopStudents}
            routeType={routeType === 'pickup' ? 'pickup' : 'dropoff'}
            onNavigate={handleNavigate}
            onCheckin={handleStudentCheckin}
          />
        </div>
      )}

      {/* Geofence Alerts */}
      {geofenceAlerts.length > 0 && (
        <div className="px-4 py-2 bg-info/10 border-y border-info/20 mt-3">
          {geofenceAlerts.map((alert, index) => (
            <div key={`${alert.stopId}-${index}`} className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-info" />
              <span className="font-medium text-info">{alert.stopName}:</span>
              <span className="text-gray-700">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions - 3 buttons */}
      <div className="py-3 mt-3">
        <QuickActions
          onIncident={handleIncident}
          onRelay={handleRelay}
          onDetails={handleDetails}
        />
      </div>

      {/* Finish Trip Button */}
      <div className="px-4 py-4 bg-white border-t border-gray-200 safe-area-pb mt-auto">
        <button
          onClick={handleFinishTrip}
          className="w-full py-4 bg-success hover:bg-success/90 text-white rounded-xl text-lg font-bold transition-colors shadow-lg"
        >
          FINALIZAR VIAJE
        </button>
      </div>

      {/* Relay Mode Modal */}
      <RelayModeModal
        tripId={tripId as unknown as Id<"trips">}
        currentVehiclePlate={currentVehiclePlate}
        isOpen={isRelayModalOpen}
        onClose={() => setIsRelayModalOpen(false)}
        onRelayComplete={handleRelayComplete}
      />

      {/* Incident Report Modal */}
      <IncidentReportModal
        tripId={tripId}
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
      />

      {/* Check-in Sheet */}
      <CheckinSheet
        tripId={tripId as Id<"trips">}
        currentStop={nextStopRaw ? {
          id: nextStopRaw._id as Id<"routeStops">,
          name: nextStopRaw.name ?? 'Parada',
          order: currentStopIndex,
        } : null}
        routeType={routeType === 'pickup' ? 'pickup' : 'dropoff'}
        isOpen={isCheckinOpen}
        onClose={() => {
          setIsCheckinOpen(false);
          setSelectedStudentId(null);
        }}
      />
    </div>
  );
}
