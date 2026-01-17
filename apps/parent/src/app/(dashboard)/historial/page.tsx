'use client';

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  Bus,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyStudents, useTripHistory } from '@/hooks';
import type { Id } from '../../../../../../convex/_generated/dataModel';

const periods = [
  { value: 7, label: 'Última semana' },
  { value: 30, label: 'Último mes' },
  { value: 90, label: 'Últimos 3 meses' },
];

interface TripData {
  tripId: Id<"trips">;
  date: string;
  type: 'pickup' | 'dropoff';
  routeName: string;
  status: string;
  driverName: string;
  studentStatus: 'scheduled' | 'absent' | 'parent_pickup' | 'stop_changed' | 'third_party_pickup';
  startedAt?: number;
  completedAt?: number;
}

interface EnrichedTrip extends TripData {
  studentId: Id<"students">;
  studentName: string;
}

// Group trips by date
function groupTripsByDate(trips: EnrichedTrip[]) {
  const groups: { [key: string]: EnrichedTrip[] } = {};

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
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '--:--';
  return new Date(timestamp).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistorialPage() {
  const { students, isLoading: studentsLoading, isEmpty: noStudents } = useMyStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<Id<"students"> | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState(periods[1]!); // Default to last month
  const [showFilters, setShowFilters] = useState(false);

  // Get trip history for each student
  const student1 = students[0];
  const student2 = students[1];
  const student3 = students[2];

  const { trips: trips1, isLoading: loading1 } = useTripHistory(
    student1?._id ?? null,
    selectedPeriod.value
  );
  const { trips: trips2, isLoading: loading2 } = useTripHistory(
    student2?._id ?? null,
    selectedPeriod.value
  );
  const { trips: trips3, isLoading: loading3 } = useTripHistory(
    student3?._id ?? null,
    selectedPeriod.value
  );

  const isLoading = studentsLoading || (student1 && loading1) || (student2 && loading2) || (student3 && loading3);

  // Combine and enrich all trips
  const allTrips = useMemo(() => {
    const enriched: EnrichedTrip[] = [];

    if (student1 && trips1) {
      trips1.forEach(trip => {
        enriched.push({
          ...trip,
          studentId: student1._id,
          studentName: `${student1.firstName} ${student1.lastName}`,
        });
      });
    }
    if (student2 && trips2) {
      trips2.forEach(trip => {
        enriched.push({
          ...trip,
          studentId: student2._id,
          studentName: `${student2.firstName} ${student2.lastName}`,
        });
      });
    }
    if (student3 && trips3) {
      trips3.forEach(trip => {
        enriched.push({
          ...trip,
          studentId: student3._id,
          studentName: `${student3.firstName} ${student3.lastName}`,
        });
      });
    }

    return enriched;
  }, [student1, student2, student3, trips1, trips2, trips3]);

  // Filter by selected student
  const filteredTrips = useMemo(() => {
    if (selectedStudentId === 'all') return allTrips;
    return allTrips.filter(trip => trip.studentId === selectedStudentId);
  }, [allTrips, selectedStudentId]);

  // Group trips by date
  const groupedTrips = useMemo(() => groupTripsByDate(filteredTrips), [filteredTrips]);

  const noTrips = filteredTrips.length === 0;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Historial de Viajes</h1>
          <p className="text-sm text-gray-500">
            {selectedStudentId === 'all'
              ? `Todos los hijos • ${filteredTrips.length} viajes`
              : `${students.find(s => s._id === selectedStudentId)?.firstName ?? ''} • ${filteredTrips.length} viajes`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {/* Student filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Hijo</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStudentId('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  selectedStudentId === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Todos
              </button>
              {students.map(student => (
                <button
                  key={student._id}
                  onClick={() => setSelectedStudentId(student._id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedStudentId === student._id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {student.firstName}
                </button>
              ))}
            </div>
          </div>

          {/* Period filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Período</label>
            <div className="flex gap-2">
              {periods.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedPeriod.value === period.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && students.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && noTrips && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sin viajes registrados</h3>
          <p className="text-sm text-gray-500">
            No hay viajes en el período seleccionado.
          </p>
        </div>
      )}

      {/* Trip History */}
      {!isLoading && groupedTrips.map((group) => (
        <div key={group.date} className="space-y-2">
          {/* Date Header */}
          <div className="flex items-center gap-2 px-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 capitalize">{group.formattedDate}</h3>
            <span className="text-xs text-gray-400">({group.date})</span>
          </div>

          {/* Trips */}
          <div className="space-y-2">
            {group.trips.map((trip) => (
              <div
                key={`${trip.tripId}-${trip.studentId}`}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  {/* Trip type and student */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      trip.type === 'pickup' ? 'bg-green-50' : 'bg-blue-50'
                    )}>
                      <Bus className={cn(
                        'w-5 h-5',
                        trip.type === 'pickup' ? 'text-green-600' : 'text-blue-600'
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {trip.type === 'pickup' ? 'Ida al colegio' : 'Vuelta a casa'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{trip.studentName}</span>
                        <span className="text-gray-300">•</span>
                        <span>{trip.routeName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={cn(
                    'px-2.5 py-1 rounded-full flex items-center gap-1.5',
                    trip.status === 'completed'
                      ? 'bg-green-50 text-green-700'
                      : trip.status === 'cancelled'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-50 text-gray-600'
                  )}>
                    {trip.status === 'completed' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : trip.status === 'cancelled' ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span className="text-xs font-medium capitalize">
                      {trip.status === 'completed' ? 'Completado' :
                        trip.status === 'cancelled' ? 'Cancelado' :
                          trip.status === 'in_progress' ? 'En curso' : trip.status}
                    </span>
                  </div>
                </div>

                {/* Trip details */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {/* Times */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                      {formatTime(trip.startedAt)} → {formatTime(trip.completedAt)}
                    </span>
                  </div>

                  {/* Driver */}
                  {trip.driverName && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{trip.driverName}</span>
                    </div>
                  )}
                </div>

                {/* Student status */}
                {trip.studentStatus && trip.studentStatus !== 'scheduled' && (
                  <div className={cn(
                    'mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2',
                    trip.studentStatus === 'absent'
                      ? 'bg-orange-50 text-orange-700'
                      : trip.studentStatus === 'parent_pickup'
                        ? 'bg-blue-50 text-blue-700'
                        : trip.studentStatus === 'third_party_pickup'
                          ? 'bg-blue-50 text-blue-700'
                          : trip.studentStatus === 'stop_changed'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-50 text-gray-600'
                  )}>
                    {trip.studentStatus === 'absent' && (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Ausente
                      </>
                    )}
                    {trip.studentStatus === 'parent_pickup' && (
                      <>
                        <User className="w-3.5 h-3.5" />
                        Recogido por padre
                      </>
                    )}
                    {trip.studentStatus === 'third_party_pickup' && (
                      <>
                        <User className="w-3.5 h-3.5" />
                        Recogida por tercero
                      </>
                    )}
                    {trip.studentStatus === 'stop_changed' && (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        Cambio de parada
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
