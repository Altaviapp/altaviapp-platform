'use client';

import { useState, useMemo } from 'react';
import { MapPin, Clock, Phone, MessageCircle, ChevronDown, Bus, User, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyStudents, useStudentTracking, useConvexAuth } from '@/hooks';
import { LiveTrackingMap } from '@/components/tracking/LiveTrackingMap';
import type { Id } from '../../../../../../convex/_generated/dataModel';

// Helper to get full name from student
function getStudentName(student: { firstName: string; lastName: string } | null | undefined): string {
  if (!student) return 'Seleccionar estudiante';
  return `${student.firstName} ${student.lastName}`;
}

// Status configuration
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  in_transit: { label: 'EN RUTA', color: 'text-white', bg: 'bg-success' },
  in_progress: { label: 'EN RUTA', color: 'text-white', bg: 'bg-success' },
  not_started: { label: 'NO INICIADO', color: 'text-gray-600', bg: 'bg-gray-200' },
  scheduled: { label: 'PROGRAMADO', color: 'text-gray-600', bg: 'bg-gray-200' },
  completed: { label: 'COMPLETADO', color: 'text-white', bg: 'bg-info' },
  delayed: { label: 'RETRASADO', color: 'text-white', bg: 'bg-warning' },
};

// Mock driver data (will come from backend in production)
const mockDriver = {
  name: 'Juan Pérez',
  phone: '+593 99 123 4567',
};

export default function TrackingPage() {
  const { isLoading: authLoading } = useConvexAuth();
  const { students, isLoading: studentsLoading } = useMyStudents();

  // Selected student state
  const [selectedStudentId, setSelectedStudentId] = useState<Id<'students'> | null>(null);
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  // Set first student as default when loaded
  const selectedStudent = useMemo(() => {
    if (selectedStudentId) {
      return students.find(s => s._id === selectedStudentId) ?? students[0] ?? null;
    }
    return students[0] ?? null;
  }, [students, selectedStudentId]);

  // Get tracking data for selected student
  const { tracking, isLoading: trackingLoading, hasActiveTrip, currentLocation } = useStudentTracking(
    selectedStudent?._id as Id<'students'> | null
  );

  // Loading state
  if (authLoading || studentsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-gray-100 rounded-xl h-16" />
        <div className="bg-gray-100 rounded-xl h-64" />
        <div className="bg-gray-100 rounded-xl h-48" />
      </div>
    );
  }

  // No students state
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay estudiantes registrados</h3>
        <p className="text-sm text-gray-500 text-center">
          Aún no tienes estudiantes asociados a tu cuenta.
        </p>
      </div>
    );
  }

  const tripStatus = tracking?.trip?.status ?? 'not_started';
  const status = statusConfig[tripStatus] ?? statusConfig.not_started!;

  // Calculate progress
  const progress = hasActiveTrip ? 50 : 0; // TODO: Calculate real progress from stops

  // Calculate time since last update
  const lastUpdate = (() => {
    if (!currentLocation?.timestamp) return null;
    const seconds = Math.floor((Date.now() - currentLocation.timestamp) / 1000);
    if (seconds < 60) return `${seconds} seg`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  })();

  // Vehicle location for map
  const vehicleLocation = currentLocation ? {
    lat: currentLocation.latitude,
    lng: currentLocation.longitude,
    speed: currentLocation.speed,
    heading: currentLocation.heading,
    timestamp: currentLocation.timestamp,
  } : null;

  return (
    <div className="space-y-4">
      {/* Student Selector */}
      {students.length > 1 && (
        <div className="relative">
          <button
            onClick={() => setShowStudentSelector(!showStudentSelector)}
            className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{getStudentName(selectedStudent)}</p>
                <p className="text-sm text-gray-500">
                  Viaje de {tracking?.route?.type === 'pickup' ? 'Ida' : tracking?.route?.type === 'dropoff' ? 'Vuelta' : '--'}
                </p>
              </div>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', showStudentSelector && 'rotate-180')} />
          </button>

          {showStudentSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
              {students.map((student) => (
                <button
                  key={student._id}
                  onClick={() => {
                    setSelectedStudentId(student._id as Id<'students'>);
                    setShowStudentSelector(false);
                  }}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors',
                    selectedStudent?._id === student._id && 'bg-primary/5'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{getStudentName(student)}</p>
                    <p className="text-sm text-gray-500">{student.grade}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Single Student Header (if only one student) */}
      {students.length === 1 && selectedStudent && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{getStudentName(selectedStudent)}</p>
            <p className="text-sm text-gray-500">
              {tracking?.route?.type === 'pickup' ? 'Viaje de Ida' : tracking?.route?.type === 'dropoff' ? 'Viaje de Vuelta' : 'Sin viaje activo'}
            </p>
          </div>
        </div>
      )}

      {/* Real-time Map */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <LiveTrackingMap
          vehicleLocation={vehicleLocation}
          height="280px"
          autoCenter={true}
          lastUpdate={lastUpdate ?? undefined}
          vehicleInfo={{
            plate: 'ABC-1234', // TODO: Get from trip data
            driverName: mockDriver.name,
          }}
        />

        {/* Map Controls */}
        {hasActiveTrip && (
          <div className="flex items-center justify-center gap-2 p-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Actualiza automáticamente
            </span>
          </div>
        )}
      </div>

      {/* Trip Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">Información del Viaje</span>
          </div>
          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', status.bg, status.color)}>
            {status.label}
          </span>
        </div>

        {hasActiveTrip && currentLocation ? (
          <>
            <p className="text-sm text-gray-500 mb-3">Actualizado: Hace {lastUpdate ?? '--'}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progreso de la ruta</span>
                <span className="text-gray-900 font-medium">{tracking?.route?.name ?? 'Ruta'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Trip Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                <p className="font-semibold text-gray-900">En ruta</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Velocidad</p>
                <p className="font-semibold text-gray-900">
                  {currentLocation.speed !== null && currentLocation.speed !== undefined
                    ? `${Math.round(currentLocation.speed * 3.6)} km/h`
                    : '-- km/h'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">El viaje aún no ha iniciado</p>
            <p className="text-sm text-gray-500 mt-1">El mapa se actualizará cuando el conductor inicie el recorrido</p>
          </div>
        )}
      </div>

      {/* Driver Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <span className="font-semibold text-gray-900">Conductor</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{mockDriver.name}</p>
            <p className="text-sm text-gray-500">{mockDriver.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${mockDriver.phone.replace(/\s/g, '')}`}
              className="p-3 rounded-full bg-success text-white hover:bg-success/90 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </a>
            <a
              href={`https://wa.me/${mockDriver.phone.replace(/\s/g, '').replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      {hasActiveTrip && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-75" />
            <div className="relative w-2 h-2 bg-success rounded-full" />
          </div>
          <span>Seguimiento en tiempo real activo</span>
        </div>
      )}
    </div>
  );
}
