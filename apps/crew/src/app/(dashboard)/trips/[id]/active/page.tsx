'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useCallback, useState } from 'react';
import { ArrowLeft, X, QrCode, Users, Bus } from 'lucide-react';
import Link from 'next/link';

import { useTrip, useTripOperations, useConvexAuth, useGPSTracking, useCurrentPosition } from '@/hooks';
import type { GeofenceAlert, GPSSourceType } from '@/hooks';
// Import components directly to avoid loading RouteMap (Leaflet) during SSR
import { TripHeader } from '@/components/trip/TripHeader';
import { TripProgress } from '@/components/trip/TripProgress';
import { GPSStatus } from '@/components/trip/GPSStatus';
import { NextStopCard } from '@/components/trip/NextStopCard';
import { QuickActions } from '@/components/trip/QuickActions';
import { RelayModeModal } from '@/components/trip/RelayModeModal';
import { Id } from '../../../../../../../../convex/_generated/dataModel';

/**
 * Active Trip Page
 *
 * Main control panel for trip in progress with real-time updates.
 * UI adapts based on user role:
 * - Driver: Can finish trip, see GPS/navigation
 * - Monitor: Can do check-ins, see students, report incidents
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

  // Get real trip data from Convex
  const { trip: convexTrip, isLoading: tripLoading } = useTrip(tripId as Id<"trips"> | null);
  const { completeTrip } = useTripOperations();
  const { getPosition } = useCurrentPosition();

  // Use real auth with fallback for UI testing
  const { isAuthenticated, isDriver: authIsDriver, isMonitor: authIsMonitor } = useConvexAuth();
  const isDriver = isAuthenticated ? authIsDriver : true; // Default to driver for UI testing
  const isMonitor = isAuthenticated ? authIsMonitor : false;
  const canControlTrip = isDriver; // Drivers can control trips
  const canReportIncident = true; // Both drivers and monitors can report incidents
  const getCanPerformCheckin = (tripMonitorId: string | null) => {
    if (isMonitor) return true; // Monitors can always check-in
    if (isDriver && !tripMonitorId) return true; // Drivers only if no monitor
    return false;
  };

  // Check if user can perform check-in for this trip (monitors always, drivers only if no monitor)
  const tripMonitorId = null; // For now, assume no monitor assigned (driver can check-in)
  const canCheckin = getCanPerformCheckin(tripMonitorId);

  // Trip is active if status is in_progress
  const isActive = convexTrip?.status === 'in_progress';

  // Handle geofence alerts from GPS tracking
  const handleGeofenceAlert = useCallback((alerts: GeofenceAlert[]) => {
    // Show notification for each geofence alert
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
  const currentStopIndex = 0; // TODO: Track from backend
  const studentsOnBoard: string[] = []; // TODO: Get from checkins
  const totalStudents = 3; // TODO: Get from trip students
  const progress = 0;
  const distanceToNextStop = 0;
  const etaToNextStop = '';
  const currentSpeed = gpsPosition?.speed ? Math.round(gpsPosition.speed * 3.6) : 0;

  // Trip data for UI
  const tripStartTime = convexTrip?.startTime;
  const routeName = convexTrip?.route?.name ?? 'Ruta';
  const routeType = convexTrip?.route?.type;
  const vehiclePlate = convexTrip?.vehicle?.licensePlate ?? 'N/A';
  const tripStops = convexTrip?.stops ?? [];

  // Format elapsed time
  const elapsedFormatted = (() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const secs = elapsedSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  // Start GPS tracking when trip is active (for drivers only)
  useEffect(() => {
    if (isActive && isDriver && tripId && !gpsIsTracking) {
      // Request permission first if needed
      if (gpsPermission === 'prompt' || gpsPermission === 'unknown') {
        requestGPSPermission().then((granted) => {
          if (granted) {
            startGPSTracking(tripId as any); // Cast needed for Convex Id type
          }
        });
      } else if (gpsPermission === 'granted') {
        startGPSTracking(tripId as any);
      }
    }
  }, [isActive, isDriver, tripId, gpsIsTracking, gpsPermission, requestGPSPermission, startGPSTracking]);

  // Cleanup GPS tracking on unmount
  useEffect(() => {
    return () => {
      if (gpsIsTracking) {
        stopGPSTracking();
      }
    };
  }, [gpsIsTracking, stopGPSTracking]);

  // Stop GPS tracking when trip is no longer active (completed/cancelled externally)
  useEffect(() => {
    if (!isActive && gpsIsTracking) {
      console.log('[GPS] Trip no longer active, stopping GPS tracking');
      stopGPSTracking();
    }
  }, [isActive, gpsIsTracking, stopGPSTracking]);

  // Handle finish trip
  const handleFinishTrip = async () => {
    if (confirm('¿Estás seguro de que deseas finalizar el viaje?')) {
      // Stop GPS tracking before finishing
      if (gpsIsTracking) {
        stopGPSTracking();
      }

      try {
        // Get current position for trip completion
        const position = await getPosition();
        const latitude = position?.latitude ?? gpsPosition?.latitude ?? -0.1828;
        const longitude = position?.longitude ?? gpsPosition?.longitude ?? -78.4847;

        // Complete trip in Convex
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  // Get next stop from trip data
  const nextStop = tripStops[currentStopIndex + 1] ?? null;
  const currentStop = tripStops[currentStopIndex] ?? null;

  // Students for next stop (will come from backend later)
  const nextStopStudents: { _id: string; firstName: string; lastName: string }[] = [];

  // Handle quick actions
  const handleCheckIn = () => {
    if (canCheckin) {
      router.push(`/trips/${tripId}/checkin`);
    } else {
      alert('No tienes permiso para realizar check-in en este viaje');
    }
  };

  const handleAttendance = () => {
    router.push(`/trips/${tripId}/students`);
  };

  const handleIncident = () => {
    router.push(`/trips/${tripId}/incidents`);
  };

  const handleMessage = () => {
    alert('Mensajería próximamente');
  };

  const handleNavigate = () => {
    if (nextStop) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${nextStop.latitude},${nextStop.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Handle relay mode
  const handleOpenRelay = () => {
    // Set current vehicle plate from trip data
    setCurrentVehiclePlate(vehiclePlate);
    setIsRelayModalOpen(true);
  };

  const handleRelayComplete = (newVehicle: { gpsSourceType: GPSSourceType }) => {
    // Update GPS source based on new vehicle configuration
    setGpsSourceType(newVehicle.gpsSourceType);

    // If new vehicle uses mobile GPS, restart tracking
    if (newVehicle.gpsSourceType === 'mobile') {
      stopGPSTracking();
      if (gpsPermission === 'granted') {
        startGPSTracking(tripId as unknown as Id<"trips">, {
          gpsSource: 'mobile',
        });
      }
    } else {
      // External GPS - stop mobile tracking
      stopGPSTracking();
    }

    // Show success message
    alert(`Vehículo cambiado exitosamente. ${newVehicle.gpsSourceType === 'mobile' ? 'Usando GPS del celular.' : 'Usando GPS externo del vehículo.'}`);
  };

  // Move to next stop (local state only for now)
  const moveToNextStop = () => {
    // TODO: Update backend with stop progress
    alert('Avanzando a siguiente parada');
  };

  const totalStops = tripStops.length;

  // Create trip object for TripHeader (minimal mock structure)
  const tripForHeader = {
    _id: tripId,
    route: { name: routeName, type: routeType || 'dropoff' as const },
    type: routeType === 'pickup' ? 'inbound' : 'outbound',
    vehicle: { plate: vehiclePlate },
    stops: tripStops,
  } as any; // Type cast for now

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trip Header */}
      <TripHeader
        trip={tripForHeader}
        elapsedFormatted={elapsedFormatted}
      />

      {/* Trip Progress */}
      <TripProgress
        currentStopIndex={currentStopIndex}
        totalStops={totalStops}
        studentsOnBoard={studentsOnBoard.length}
        totalStudents={totalStudents}
        progress={progress}
      />

      {/* GPS Status - use real GPS data when available */}
      <GPSStatus
        speed={gpsPosition?.speed !== null ? Math.round((gpsPosition?.speed ?? 0) * 3.6) : currentSpeed}
        accuracy={gpsPosition?.accuracy}
        isActive={gpsIsTracking || isActive}
        tripId={tripId}
      />

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="mx-4 mt-2 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
          {gpsError.message}
        </div>
      )}

      {/* Geofence Alerts */}
      {geofenceAlerts.length > 0 && (
        <div className="mx-4 mt-2 space-y-2">
          {geofenceAlerts.map((alert, index) => (
            <div
              key={`${alert.stopId}-${index}`}
              className="p-3 bg-info/10 border border-info/20 rounded-lg text-sm"
            >
              <p className="font-semibold text-info">{alert.stopName}</p>
              <p className="text-gray-700">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4 pb-32">
        {/* Next Stop Card */}
        {nextStop ? (
          <NextStopCard
            stop={{
              _id: nextStop._id,
              routeId: String(nextStop.routeId),
              order: nextStop.order,
              name: nextStop.name,
              address: nextStop.address,
              latitude: nextStop.latitude,
              longitude: nextStop.longitude,
              estimatedArrivalTime: nextStop.scheduledTime,
              students: [],
            }}
            stopNumber={currentStopIndex + 2}
            distanceKm={distanceToNextStop}
            eta={etaToNextStop}
            students={nextStopStudents}
            onNavigate={handleNavigate}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Última parada alcanzada
            </p>
            <p className="text-sm text-gray-600">
              Has completado todas las paradas de la ruta
            </p>
          </div>
        )}

        {/* Current Stop Info (if at a stop) */}
        {currentStop && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-600">Parada Actual</p>
                <p className="text-lg font-bold text-gray-900">{currentStop.name}</p>
              </div>
              <button
                onClick={moveToNextStop}
                disabled={!nextStop}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  nextStop
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Siguiente Parada
              </button>
            </div>
            <p className="text-sm text-gray-600">{currentStop.address}</p>
          </div>
        )}

        {/* Quick Actions */}
        <QuickActions
          onCheckIn={handleCheckIn}
          onAttendance={handleAttendance}
          onIncident={handleIncident}
          onMessage={handleMessage}
        />

        {/* Relay Mode Button */}
        <button
          onClick={handleOpenRelay}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-warning/10 border border-warning/30 rounded-lg text-warning-dark hover:bg-warning/20 transition-colors"
        >
          <Bus className="w-5 h-5" />
          <span className="font-medium">Modo Relevo - Cambiar Vehículo</span>
        </button>

        {/* Trip Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Resumen del Viaje
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Paradas completadas</p>
              <p className="font-bold text-gray-900">{currentStopIndex} / {totalStops}</p>
            </div>
            <div>
              <p className="text-gray-600">Estudiantes a bordo</p>
              <p className="font-bold text-gray-900">{studentsOnBoard.length} / {totalStudents}</p>
            </div>
            <div>
              <p className="text-gray-600">Tiempo transcurrido</p>
              <p className="font-bold text-gray-900 font-mono">{elapsedFormatted}</p>
            </div>
            <div>
              <p className="text-gray-600">Velocidad actual</p>
              <p className="font-bold text-gray-900">
                {gpsPosition?.speed !== null
                  ? Math.round((gpsPosition?.speed ?? 0) * 3.6)
                  : currentSpeed} km/h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Role-based */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Driver: Finish Trip button */}
          {canControlTrip && (
            <button
              onClick={handleFinishTrip}
              className="w-full py-4 bg-success hover:bg-success/90 text-white rounded-lg text-base font-bold transition-colors shadow-lg"
            >
              FINALIZAR VIAJE
            </button>
          )}

          {/* Monitor: Check-in button (primary action) */}
          {isMonitor && (
            <button
              onClick={handleCheckIn}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-base font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              REGISTRAR ESTUDIANTE
            </button>
          )}

          {/* Both roles: secondary actions */}
          <div className="grid grid-cols-2 gap-3">
            {canCheckin && !isMonitor && (
              <button
                onClick={handleCheckIn}
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Check-in
              </button>
            )}

            <button
              onClick={handleAttendance}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Estudiantes
            </button>

            <Link
              href="/dashboard"
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Salir
            </Link>
          </div>
        </div>
      </div>

      {/* Relay Mode Modal */}
      <RelayModeModal
        tripId={tripId as unknown as Id<"trips">}
        currentVehiclePlate={currentVehiclePlate}
        isOpen={isRelayModalOpen}
        onClose={() => setIsRelayModalOpen(false)}
        onRelayComplete={handleRelayComplete}
      />
    </div>
  );
}
