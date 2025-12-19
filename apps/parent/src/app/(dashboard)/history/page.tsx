'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Bus, MapPin, Clock, Calendar, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useMyStudents, useTripHistory } from '@/hooks';
import type { Id } from '../../../../../../convex/_generated/dataModel';

const periods = [
  { value: 7, label: 'Última semana' },
  { value: 30, label: 'Último mes' },
  { value: 90, label: 'Últimos 3 meses' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'COMPLETADO', color: 'text-white', bg: 'bg-success' },
  in_progress: { label: 'EN CURSO', color: 'text-white', bg: 'bg-info' },
  scheduled: { label: 'PROGRAMADO', color: 'text-white', bg: 'bg-gray-400' },
  cancelled: { label: 'CANCELADO', color: 'text-white', bg: 'bg-error' },
};

const studentStatusConfig: Record<string, { label: string; color: string }> = {
  boarded: { label: 'Abordó', color: 'text-success' },
  dropped_off: { label: 'Llegó', color: 'text-success' },
  absent: { label: 'Ausente', color: 'text-warning' },
  parent_pickup: { label: 'Recoge padre', color: 'text-info' },
  scheduled: { label: 'Esperando', color: 'text-gray-500' },
};

// Group trips by date
interface TripData {
  tripId: Id<"trips">;
  date: string;
  type: string;
  routeName: string;
  status: string;
  driverName: string;
  studentStatus: string;
  startedAt?: number;
  completedAt?: number;
}

function groupTripsByDate(trips: TripData[]) {
  const groups: { [key: string]: TripData[] } = {};

  for (const trip of trips) {
    const dateKey = trip.date;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(trip);
  }

  // Convert to array and sort by date (newest first)
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dateTrips]) => ({
      date,
      formattedDate: formatDateLabel(date),
      trips: dateTrips,
    }));
}

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === today) {
    return 'Hoy';
  }
  if (dateStr === yesterdayStr) {
    return 'Ayer';
  }

  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '--:--';
  return new Date(timestamp).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const { students, isLoading: studentsLoading, isEmpty: noStudents } = useMyStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<Id<"students"> | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]!);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

  // Set first student as default when students load
  useMemo(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0]!._id);
    }
  }, [students, selectedStudentId]);

  const { trips, isLoading: historyLoading, isEmpty: noTrips } = useTripHistory(
    selectedStudentId,
    selectedPeriod.value
  );

  const selectedStudent = students.find((s) => s._id === selectedStudentId);
  const groupedTrips = useMemo(() => groupTripsByDate(trips), [trips]);
  const isLoading = studentsLoading || historyLoading;

  if (isLoading && !students.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (noStudents) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sin estudiantes</h2>
        <p className="text-gray-500 text-center">
          No tienes estudiantes registrados para ver el historial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-3">
        {/* Student Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStudentSelector(!showStudentSelector);
              setShowPeriodSelector(false);
            }}
            className="w-full bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
          >
            <span className="text-sm text-gray-900 truncate">
              {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Seleccionar'}
            </span>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform flex-shrink-0', showStudentSelector && 'rotate-180')} />
          </button>

          {showStudentSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
              {students.map((student) => (
                <button
                  key={student._id}
                  onClick={() => {
                    setSelectedStudentId(student._id);
                    setShowStudentSelector(false);
                  }}
                  className={cn(
                    'w-full p-3 text-left text-sm hover:bg-gray-50 transition-colors',
                    selectedStudentId === student._id && 'bg-primary-50 text-primary'
                  )}
                >
                  {student.firstName} {student.lastName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPeriodSelector(!showPeriodSelector);
              setShowStudentSelector(false);
            }}
            className="w-full bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
          >
            <span className="text-sm text-gray-900 truncate">{selectedPeriod.label}</span>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform flex-shrink-0', showPeriodSelector && 'rotate-180')} />
          </button>

          {showPeriodSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setShowPeriodSelector(false);
                  }}
                  className={cn(
                    'w-full p-3 text-left text-sm hover:bg-gray-50 transition-colors',
                    selectedPeriod.value === period.value && 'bg-primary-50 text-primary'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {historyLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!historyLoading && noTrips && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin viajes registrados</h3>
          <p className="text-gray-500">
            No hay viajes en el período seleccionado para este estudiante.
          </p>
        </div>
      )}

      {/* Trip History */}
      {!historyLoading && groupedTrips.map((group) => (
        <div key={group.date}>
          {/* Date Header */}
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {group.formattedDate} - {group.date}
            </span>
          </div>

          {/* Trips */}
          <div className="space-y-3">
            {group.trips.map((trip) => {
              const status = statusConfig[trip.status] ?? statusConfig.completed!;
              const studentStatus = studentStatusConfig[trip.studentStatus] ?? studentStatusConfig.scheduled!;

              return (
                <div
                  key={trip.tripId}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bus className="w-5 h-5 text-primary" />
                      <span className="font-medium text-gray-900">
                        Viaje de {trip.type === 'pickup' ? 'Ida' : 'Vuelta'}
                      </span>
                    </div>
                    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>

                  {/* Route & Driver */}
                  <p className="text-sm text-gray-600 mb-1">{trip.routeName}</p>
                  <p className="text-sm text-gray-500 mb-3">Conductor: {trip.driverName}</p>

                  {/* Student Status */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn('text-sm font-medium', studentStatus.color)}>
                      Estado: {studentStatus.label}
                    </span>
                  </div>

                  {/* Trip times */}
                  {(trip.startedAt || trip.completedAt) && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      {trip.startedAt && <span>Inicio: {formatTime(trip.startedAt)}</span>}
                      {trip.startedAt && trip.completedAt && <span className="mx-2">•</span>}
                      {trip.completedAt && <span>Fin: {formatTime(trip.completedAt)}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  {trip.status === 'in_progress' && (
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Link
                        href="/tracking"
                        className="flex items-center gap-1 text-sm text-info hover:underline"
                      >
                        <MapPin className="w-4 h-4" />
                        Ver en mapa
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
