'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useCallback, useState, lazy, Suspense } from 'react';
import {
  ArrowLeft,
  QrCode,
  Users,
  Bus,
  MapPin,
  Clock,
  Navigation,
  AlertTriangle,
  Loader2,
  Sunrise,
  Sunset,
  FileText,
  UserMinus,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { useTrip, useTripOperations, useConvexAuth, useGPSTracking, useCurrentPosition, useNovedadesForTrip } from '@/hooks';
import type { GeofenceAlert, GPSSourceType } from '@/hooks';
import { RelayModeModal } from '@/components/trip/RelayModeModal';
import { CheckinSheet } from '@/components/checkin';
import { Id } from '../../../../../../../../convex/_generated/dataModel';

// Dynamic import for RouteMap to avoid SSR issues with Leaflet
const RouteMap = lazy(() =>
  import('@/components/trip/RouteMap').then((mod) => ({ default: mod.RouteMap }))
);

/**
 * Active Trip Page
 *
 * Redesigned with prominent map view for better navigation experience.
 * Shows real-time bus location, route, and next stop information.
 */
export default function ActiveTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = (params?.id as string) || '';

  // Relay Mode state
  const [isRelayModalOpen, setIsRelayModalOpen] = useState(false);
  const [currentVehiclePlate, setCurrentVehiclePlate] = useState('');
  const [gpsSourceType, setGpsSourceType] = useState<GPSSourceType>('mobile');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Check-in sheet state
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);

  // Get real trip data from Convex
  const { trip: convexTrip, isLoading: tripLoading } = useTrip(tripId as Id<"trips"> | null);
  const { completeTrip } = useTripOperations();
  const { getPosition } = useCurrentPosition();

  // Use real auth with fallback for UI testing
  const { isAuthenticated } = useConvexAuth();

  // Get novedades for this trip
  const { novedades, hasNovedades } = useNovedadesForTrip(isAuthenticated ? tripId : null);
  const absentCount = novedades.filter((n: any) =>
    n.type === 'absence' || n.typeCategorySnapshot === 'absence'
  ).length;

  // Both roles (driver and monitor) have full access to trip controls
  const canControlTrip = true;
  const canCheckin = true;

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

  // GPS Tracking - only for drivers
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

  // Derived state
  const isLoading = tripLoading;
  const studentsOnBoard: string[] = [];
  const totalStudents = 3;

  // Trip data for UI
  const tripStartTime = convexTrip?.startTime;
  const routeName = convexTrip?.route?.name ?? 'Ruta';
  const routeType = convexTrip?.route?.type;
  const vehiclePlate = convexTrip?.vehicle?.licensePlate ?? 'N/A';
  const tripStops = convexTrip?.stops ?? [];
  const isPickup = routeType === 'pickup';

  // Format elapsed time (compact)
  const elapsedFormatted = (() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const secs = elapsedSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  })();

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
      console.log('[GPS] Trip no longer active, stopping GPS tracking');
      stopGPSTracking();
    }
  }, [isActive, gpsIsTracking, stopGPSTracking]);

  // Handle finish trip
  const handleFinishTrip = async () => {
    if (confirm('¿Estás seguro de que deseas finalizar el viaje?')) {
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
  if (isLoading || !convexTrip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  // Get next stop from trip data - use the one from backend with ETA
  const backendNextStop = convexTrip?.nextStop ?? null;

  // Get stops with ETA data
  const stopsWithETA = tripStops as Array<typeof tripStops[0] & {
    etaMinutes?: number | null;
    etaTime?: string | null;
    isCompleted?: boolean;
    isNext?: boolean;
  }>;

  // Find next stop (prefer backend nextStop, fallback to first non-completed)
  const nextStop = backendNextStop
    ? {
        ...tripStops.find((s) => s._id.toString() === backendNextStop.id?.toString()) ?? tripStops[0],
        etaMinutes: backendNextStop.etaMinutes,
        etaTime: backendNextStop.etaTime,
        distanceKm: backendNextStop.distanceKm,
      }
    : stopsWithETA.find((s) => s.isNext) ?? tripStops[0] ?? null;

  // Calculate current stop index
  const completedStops = stopsWithETA.filter((s) => s.isCompleted).length;
  const currentStopIndex = completedStops;
  const totalStops = tripStops.length;

  // Get speed from GPS or trip stats
  const tripStats = convexTrip?.stats as { currentSpeed?: number | null; avgSpeed?: number } | undefined;
  const currentSpeed = gpsPosition?.speed
    ? Math.round(gpsPosition.speed * 3.6)
    : Math.round(tripStats?.currentSpeed ?? tripStats?.avgSpeed ?? 0);

  // Navigate to next stop in Google Maps
  const handleNavigate = () => {
    if (nextStop) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${nextStop.latitude},${nextStop.longitude}&travelmode=driving`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Quick action handlers
  const handleCheckIn = () => {
    if (canCheckin) {
      setIsCheckinOpen(true);
    } else {
      alert('No tienes permiso para realizar check-in en este viaje');
    }
  };

  const handleStudentList = () => {
    router.push(`/trips/${tripId}/students`);
  };

  const handleIncident = () => {
    router.push(`/trips/${tripId}/incidents`);
  };

  // Handle relay mode
  const handleOpenRelay = () => {
    setCurrentVehiclePlate(vehiclePlate);
    setIsRelayModalOpen(true);
  };

  const handleRelayComplete = (newVehicle: { gpsSourceType: GPSSourceType }) => {
    setGpsSourceType(newVehicle.gpsSourceType);

    if (newVehicle.gpsSourceType === 'mobile') {
      stopGPSTracking();
      if (gpsPermission === 'granted') {
        startGPSTracking(tripId as unknown as Id<"trips">, {
          gpsSource: 'mobile',
        });
      }
    } else {
      stopGPSTracking();
    }

    alert(`Vehículo cambiado exitosamente. ${newVehicle.gpsSourceType === 'mobile' ? 'Usando GPS del celular.' : 'Usando GPS externo del vehículo.'}`);
  };

  // Prepare stops for map (matching Stop type)
  const mapStops = tripStops.map((stop, index) => ({
    _id: stop._id,
    routeId: String(stop.routeId),
    name: stop.name,
    address: stop.address,
    latitude: stop.latitude,
    longitude: stop.longitude,
    order: index,
    estimatedArrivalTime: stop.estimatedArrivalTime ?? '',
    students: [] as string[],
  }));

  // Current location for map (matching GPSLocation type)
  const currentLocation = gpsPosition ? {
    latitude: gpsPosition.latitude,
    longitude: gpsPosition.longitude,
    heading: gpsPosition.heading ?? 0,
    speed: gpsPosition.speed ?? 0,
    timestamp: new Date().toISOString(),
    accuracy: gpsPosition.accuracy ?? 10,
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
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-lg hover:bg-white/20"
          >
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
                {absentCount} {absentCount === 1 ? 'ausente' : 'ausentes'}
              </span>
            )}
          </div>
          <span className="text-xs text-amber-600">Ver lista →</span>
        </Link>
      )}

      {/* Prominent Map Section */}
      <div className="flex-1 relative" style={{ minHeight: '50vh' }}>
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Cargando mapa...</p>
              </div>
            </div>
          }
        >
          <RouteMap
            stops={mapStops}
            currentStopIndex={currentStopIndex}
            currentLocation={currentLocation}
            height="100%"
            showControls={true}
            tripId={tripId}
          />
        </Suspense>

        {/* Speed indicator overlay */}
        {gpsIsTracking && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                gpsIsTracking ? 'bg-success animate-pulse' : 'bg-gray-400'
              )} />
              <span className="font-bold text-lg">{currentSpeed}</span>
              <span className="text-gray-600 text-sm">km/h</span>
            </div>
          </div>
        )}

        {/* Progress overlay */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">{currentStopIndex}/{totalStops}</span>
            <span className="text-gray-500">paradas</span>
          </div>
        </div>
      </div>

      {/* Next Stop Card - Compact with ETA */}
      {nextStop && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{currentStopIndex + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Siguiente Parada</p>
                <p className="font-semibold text-gray-900 truncate">{nextStop.name}</p>
                <div className="flex items-center gap-2 text-xs">
                  {/* Dynamic ETA */}
                  {'etaMinutes' in nextStop && nextStop.etaMinutes !== null && nextStop.etaMinutes !== undefined ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                      ~{nextStop.etaMinutes} min
                      {'etaTime' in nextStop && nextStop.etaTime && (
                        <span className="opacity-75 ml-1">({nextStop.etaTime})</span>
                      )}
                    </span>
                  ) : nextStop.estimatedArrivalTime ? (
                    <span className="text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {nextStop.estimatedArrivalTime}
                    </span>
                  ) : null}
                  {'distanceKm' in nextStop && nextStop.distanceKm && (
                    <span className="text-gray-500">
                      <MapPin className="w-3 h-3 inline mr-0.5" />
                      {nextStop.distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              IR
            </button>
          </div>
        </div>
      )}

      {/* Geofence Alerts */}
      {geofenceAlerts.length > 0 && (
        <div className="px-4 py-2 bg-info/10 border-y border-info/20">
          {geofenceAlerts.map((alert, index) => (
            <div key={`${alert.stopId}-${index}`} className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-info" />
              <span className="font-medium text-info">{alert.stopName}:</span>
              <span className="text-gray-700">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-around">
          <button
            onClick={handleCheckIn}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary/10 transition-colors">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Check-in</span>
          </button>

          <button
            onClick={handleStudentList}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary/10 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Lista</span>
          </button>

          <button
            onClick={handleIncident}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-error transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-error/10 transition-colors">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Incidente</span>
          </button>

          <button
            onClick={handleOpenRelay}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-warning transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-warning/10 transition-colors">
              <Bus className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Relevo</span>
          </button>
        </div>
      </div>

      {/* Finish Trip Button - Both driver and monitor can finish */}
      <div className="px-4 py-4 bg-white border-t border-gray-200 safe-area-pb">
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

      {/* Check-in Sheet */}
      <CheckinSheet
        tripId={tripId as Id<"trips">}
        currentStop={nextStop ? {
          id: nextStop._id as Id<"routeStops">,
          name: nextStop.name ?? 'Parada',
          order: currentStopIndex,
        } : null}
        routeType={routeType === 'pickup' ? 'pickup' : 'dropoff'}
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
      />
    </div>
  );
}
