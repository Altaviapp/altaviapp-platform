'use client';

import { useState, useMemo } from 'react';
import {
  Bus,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTripHistory } from '@/hooks';

const periods = [
  { value: 20, label: 'Ultima semana' },
  { value: 50, label: 'Ultimo mes' },
  { value: 100, label: 'Ultimos 3 meses' },
];

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

export default function HistorialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[1]!);
  const [showFilters, setShowFilters] = useState(false);

  const { tripsByDate, isLoading, isEmpty } = useTripHistory(selectedPeriod.value);

  // Count total trips
  const totalTrips = useMemo(() => {
    return tripsByDate.reduce((sum, day) => sum + day.trips.length, 0);
  }, [tripsByDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando historial...</p>
        </div>
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
            {totalTrips} viajes en {selectedPeriod.label.toLowerCase()}
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
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="text-xs font-medium text-gray-500 mb-2 block">Periodo</label>
          <div className="flex flex-wrap gap-2">
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
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sin viajes registrados</h3>
          <p className="text-sm text-gray-500">
            No hay viajes completados en el periodo seleccionado.
          </p>
        </div>
      )}

      {/* Trip History */}
      {tripsByDate.map((group) => (
        <div key={group.date} className="space-y-2">
          {/* Date Header */}
          <div className="flex items-center gap-2 px-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 capitalize">{formatDateLabel(group.date)}</h3>
            <span className="text-xs text-gray-400">({group.date})</span>
          </div>

          {/* Trips */}
          <div className="space-y-2">
            {group.trips.map((trip) => (
              <div
                key={trip._id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  {/* Trip type and route */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      trip.type === 'ida' ? 'bg-green-50' : 'bg-blue-50'
                    )}>
                      <Bus className={cn(
                        'w-5 h-5',
                        trip.type === 'ida' ? 'text-green-600' : 'text-blue-600'
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {trip.type === 'ida' ? 'Ida al colegio' : 'Vuelta a casa'}
                      </p>
                      <p className="text-xs text-gray-500">{trip.route}</p>
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
                    <span className="text-xs font-medium">
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
                      {trip.startTime} → {trip.endTime}
                    </span>
                  </div>

                  {/* Students */}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{trip.studentsTransported} estudiantes</span>
                  </div>

                  {/* Duration */}
                  {trip.duration > 0 && (
                    <span className="text-gray-400">
                      {trip.duration} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
