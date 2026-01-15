'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useCallback, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Sunrise,
  Sunset,
  FileText,
  UserMinus,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ActiveTripView, GoogleMapsProvider, MapFooter } from '@altaviapp/maps';

import { useTripOperations, useCurrentPosition, useStopActions, useActiveTripData } from '@/hooks';
import type { GPSSourceType, GeofenceAlert } from '@/hooks';
import { RelayModeModal } from '@/components/trip/RelayModeModal';
import { IncidentReportModal } from '@/components/trip/IncidentReportModal';
import { TripCompletionModal } from '@/components/trip/TripCompletionModal';
import { CrewActionsPanel } from '@/components/trip/CrewActionsPanel';
import { CheckinSheet } from '@/components/checkin';
import { Id } from '../../../../../../../../convex/_generated/dataModel';
import type { StudentWithStatus } from '@/components/trip/NextStopCard';

/**
 * Active Trip Page
 *
 * Redesigned layout with:
 * - Container 1: Header + Map + Footer (next stop info)
 * - Container 2: Crew actions panel
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

  // Trip completion modal state
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionStats, setCompletionStats] = useState<any>(null);

  // Handle geofence alerts
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

  // Use the unified hook for trip data and GPS tracking
  const {
    tripData,
    isLoading,
    isTracking: gpsIsTracking,
    gpsPosition,
    gpsError,
    startTracking: startGPSTracking,
    stopTracking: stopGPSTracking,
    requestPermission: requestGPSPermission,
    permissionStatus: gpsPermission,
    geofenceAlerts,
    novedades,
    hasNovedades,
    absentCount,
    rawTrip: convexTrip,
    tripStudents,
  } = useActiveTripData(tripId, { onGeofenceAlert: handleGeofenceAlert });

  // Additional hooks for actions
  const { completeTrip } = useTripOperations();
  const { getPosition } = useCurrentPosition();
  const {
    arriveAtStop,
    skipStop,
    isStopArrived,
    isStopSkipped,
  } = useStopActions(tripId || null);

  // Trip data from hook
  const isActive = convexTrip?.status === 'in_progress';
  const tripStartTime = convexTrip?.startTime;
  const routeName = tripData?.routeName ?? 'Ruta';
  const routeType = tripData?.routeType;
  const vehiclePlate = convexTrip?.vehicle?.licensePlate ?? 'N/A';
  const isPickup = routeType === 'pickup';
  const tripStops = (convexTrip as any)?.stops ?? [];
  const currentStopIndex = tripData?.currentStopIndex ?? 0;
  const totalStops = tripData?.totalStops ?? 0;

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

  // Get next stop with ETA
  const stopsWithETA = tripStops as Array<typeof tripStops[0] & {
    etaMinutes?: number | null;
    etaTime?: string | null;
    isCompleted?: boolean;
    isNext?: boolean;
  }>;

  const backendNextStop = convexTrip?.nextStop ?? null;
  const nextStopRaw = backendNextStop
    ? {
        ...tripStops.find((s: any) => s._id.toString() === backendNextStop.id?.toString()) ?? tripStops[0],
        etaMinutes: backendNextStop.etaMinutes,
        etaTime: backendNextStop.etaTime,
        distanceKm: backendNextStop.distanceKm,
      }
    : stopsWithETA.find((s: any) => s.isNext) ?? tripStops[0] ?? null;

  // Get students for the next stop (for pending count)
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

  // Count pending students at next stop
  const pendingStudentsCount = useMemo(() => {
    return nextStopStudents.filter(
      (s) => s.status === 'pending'
    ).length;
  }, [nextStopStudents]);

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

        const result = await completeTrip(tripId as Id<"trips">, latitude, longitude);

        if (result.stats) {
          setCompletionStats(result.stats);
        } else {
          const startTime = convexTrip?.startTime ?? Date.now();
          const endTime = Date.now();
          setCompletionStats({
            duration: endTime - startTime,
            plannedDuration: 40 * 60000,
            studentsPickedUp: tripStudents?.filter((s: any) => s.checkedIn).length ?? 0,
            studentsAbsent: tripStudents?.filter((s: any) => s.novedad?.typeCategory === 'absence').length ?? 0,
            studentsNoShow: tripStudents?.filter((s: any) => !s.checkedIn && !s.novedad).length ?? 0,
            incidentsCount: 0,
            stopsCompleted: tripStops.filter((s: any) => isStopArrived(s._id as string)).length,
            stopsSkipped: tripStops.filter((s: any) => isStopSkipped(s._id as string)).length,
            totalStops: tripStops.length,
          });
        }
        setIsCompletionModalOpen(true);
      } catch (error) {
        console.error('Error completing trip:', error);
        alert(`Error al finalizar viaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  // Loading state
  if (isLoading || !tripData) {
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

  // Open check-in sheet
  const handleOpenCheckin = () => {
    setSelectedStudentId(null);
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

  // Handle arrival at stop
  const handleArrived = async () => {
    if (nextStopRaw) {
      await arriveAtStop(nextStopRaw._id as string);
    }
  };

  // Handle skip stop
  const handleSkip = async (reason?: string) => {
    if (nextStopRaw) {
      await skipStop(nextStopRaw._id as string, reason);
    }
  };

  // Get current stop arrival status
  const isCurrentStopArrived = nextStopRaw ? isStopArrived(nextStopRaw._id as string) : false;

  const TypeIcon = isPickup ? Sunrise : Sunset;

  // Get delay status for footer
  const delayStatus = tripData.nextStop?.delayStatus;

  return (
    <GoogleMapsProvider>
      <ActiveTripView
        data={tripData}
        showDifferentiatedPolyline={(tripData.completedStops ?? 0) > 0}
        autoFitBounds={false}
        hideMapCenterButton={true}
        renderHeader={() => (
          <div className={cn(
            'px-4 py-3 flex items-center justify-between flex-shrink-0 z-30',
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
        )}
        renderFloatingButtons={() => (
          <>
            {/* GPS Error Alert */}
            {gpsError && (
              <div className="absolute top-14 left-2 right-2 z-20 p-2 bg-error/90 backdrop-blur-sm rounded-lg text-sm text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {gpsError.message}
              </div>
            )}

            {/* Novedades Indicator */}
            {hasNovedades && (
              <Link
                href={`/trips/${tripId}/students`}
                className="absolute top-14 left-2 right-2 z-20 p-2 bg-amber-500/90 backdrop-blur-sm rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-sm text-white">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">
                    {novedades.length} {novedades.length === 1 ? 'novedad' : 'novedades'}
                  </span>
                  {absentCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      <UserMinus className="w-3 h-3" />
                      {absentCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-white/80">Ver</span>
              </Link>
            )}

            {/* Geofence Alerts */}
            {geofenceAlerts.length > 0 && (
              <div className="absolute bottom-20 left-2 right-2 z-20 p-2 bg-info/90 backdrop-blur-sm rounded-lg">
                {geofenceAlerts.map((alert, index) => (
                  <div key={`${alert.stopId}-${index}`} className="flex items-center gap-2 text-sm text-white">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{alert.stopName}:</span>
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        renderMapFooter={({ centerOnVehicle }) => (
          nextStopRaw ? (
            <MapFooter
              stopName={nextStopRaw.name ?? 'Parada'}
              stopAddress={nextStopRaw.address}
              stopNumber={currentStopIndex + 1}
              totalStops={totalStops}
              etaMinutes={'etaMinutes' in nextStopRaw ? nextStopRaw.etaMinutes ?? undefined : undefined}
              etaTime={'etaTime' in nextStopRaw ? nextStopRaw.etaTime ?? undefined : undefined}
              distanceKm={'distanceKm' in nextStopRaw ? nextStopRaw.distanceKm ?? undefined : undefined}
              delayStatus={delayStatus}
              onCenterClick={centerOnVehicle}
              centerDisabled={!tripData.vehiclePosition}
            />
          ) : null
        )}
        renderSidePanel={() => (
          <CrewActionsPanel
            stopId={nextStopRaw?._id as string ?? ''}
            isArrived={isCurrentStopArrived}
            onArrived={handleArrived}
            onSkip={handleSkip}
            onNavigate={handleNavigate}
            onCheckin={handleOpenCheckin}
            pendingStudentsCount={pendingStudentsCount}
            onIncident={handleIncident}
            onRelay={handleRelay}
            onDetails={handleDetails}
            onFinish={handleFinishTrip}
            canFinish={true}
          />
        )}
      />

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
        selectedStudentId={selectedStudentId}
      />

      {/* Trip Completion Modal */}
      <TripCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        stats={completionStats}
        routeName={routeName}
        routeType={routeType === 'pickup' ? 'pickup' : 'dropoff'}
        onViewSummary={() => {
          setIsCompletionModalOpen(false);
          router.push(`/trips/${tripId}/summary`);
        }}
        onGoToDashboard={() => {
          setIsCompletionModalOpen(false);
          router.push('/dashboard');
        }}
      />
    </GoogleMapsProvider>
  );
}
