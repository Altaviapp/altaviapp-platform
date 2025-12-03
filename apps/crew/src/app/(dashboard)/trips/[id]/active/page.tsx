'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft, X, QrCode, Users } from 'lucide-react';
import Link from 'next/link';

import { useActiveTrip } from '@/hooks/useActiveTrip';
import { useAuth } from '@/hooks/useAuth';
import { mockTodayTrips, mockStudents } from '@/lib/mockData';
import {
  TripHeader,
  TripProgress,
  GPSStatus,
  NextStopCard,
  QuickActions,
} from '@/components/trip';

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
  const {
    isDriver,
    isMonitor,
    canControlTrip,
    getCanPerformCheckin,
    canReportIncident,
    roleDisplayName
  } = useAuth();

  // Check if user can perform check-in for this trip (monitors always, drivers only if no monitor)
  // TODO: Get actual trip.monitorId from backend
  const tripMonitorId = null; // For now, assume no monitor assigned (driver can check-in)
  const canCheckin = getCanPerformCheckin(tripMonitorId);

  // Active trip state management
  const {
    trip,
    isActive,
    isLoading,
    currentStop,
    nextStop,
    currentStopIndex,
    currentLocation,
    studentsOnBoard,
    totalStudents,
    elapsedFormatted,
    progress,
    distanceToNextStop,
    etaToNextStop,
    currentSpeed,
    startTrip,
    finishTrip,
    moveToNextStop,
  } = useActiveTrip(tripId);

  // Initialize trip if not already active
  useEffect(() => {
    if (!isLoading && !isActive) {
      const tripData = mockTodayTrips.find(t => t._id === tripId);
      if (tripData) {
        startTrip(tripData);
      }
    }
  }, [isLoading, isActive, tripId, startTrip]);

  // Handle finish trip
  const handleFinishTrip = () => {
    if (confirm('¿Estás seguro de que deseas finalizar el viaje?')) {
      finishTrip();
      router.push('/dashboard');
    }
  };

  // Loading state
  if (isLoading || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Iniciando viaje...</p>
        </div>
      </div>
    );
  }

  // Get students for next stop
  const nextStopStudents = nextStop
    ? mockStudents.filter(s => nextStop.students?.includes(s._id))
    : [];

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
    if (canReportIncident) {
      router.push(`/trips/${tripId}/incident`);
    } else {
      alert('Solo los monitores pueden reportar incidentes');
    }
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

  const totalStops = trip.stops?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trip Header */}
      <TripHeader
        trip={trip}
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

      {/* GPS Status */}
      <GPSStatus
        speed={currentSpeed}
        accuracy={currentLocation?.accuracy}
        isActive={isActive}
        tripId={tripId}
      />

      {/* Main Content */}
      <div className="p-4 space-y-4 pb-32">
        {/* Next Stop Card */}
        {nextStop ? (
          <NextStopCard
            stop={nextStop}
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
              <p className="font-bold text-gray-900">{currentSpeed} km/h</p>
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
    </div>
  );
}
