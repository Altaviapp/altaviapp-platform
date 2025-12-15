'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, Clock, Users, ChevronRight, CheckCircle, AlertTriangle, Sun, Moon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTripHistory } from '@/hooks';
import { EmptyState } from '@/components/shared/EmptyState';

const periods = [
  { value: 'week', label: 'Última semana', limit: 20 },
  { value: 'month', label: 'Último mes', limit: 50 },
  { value: 'quarter', label: 'Últimos 3 meses', limit: 100 },
];

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]!);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

  // Use real Convex data
  const { tripsByDate, stats, isLoading, isEmpty } = useTripHistory(selectedPeriod.limit);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Historial de Viajes</h1>
      </div>

      {/* Period Selector */}
      <div className="relative">
        <button
          onClick={() => setShowPeriodSelector(!showPeriodSelector)}
          className="w-full bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
        >
          <span className="text-sm text-gray-900">{selectedPeriod.label}</span>
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', showPeriodSelector && 'rotate-180')} />
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

      {/* Stats Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del período</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-primary">{stats.totalTrips}</p>
            <p className="text-xs text-gray-500">Viajes</p>
          </div>
          <div>
            <p className="text-xl font-bold text-success">{stats.totalStudents}</p>
            <p className="text-xs text-gray-500">Estudiantes</p>
          </div>
          <div>
            <p className="text-xl font-bold text-info">{stats.avgDuration}m</p>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div>
            <p className="text-xl font-bold text-warning">{stats.totalIncidents}</p>
            <p className="text-xs text-gray-500">Incidentes</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <EmptyState
          icon={Calendar}
          title="No hay viajes completados"
          description="Tus viajes completados aparecerán aquí."
          action={
            <Link
              href="/trips"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver Viajes Programados
            </Link>
          }
        />
      )}

      {/* Trip History */}
      {tripsByDate.map((day) => (
        <div key={day.date}>
          {/* Date Header */}
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {formatDateLabel(day.date)}
            </span>
          </div>

          {/* Trips */}
          <div className="space-y-3">
            {day.trips.map((trip) => {
              const isIda = trip.type === 'ida';

              return (
                <div
                  key={trip._id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', isIda ? 'bg-warning/10' : 'bg-primary/10')}>
                        {isIda ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Viaje de {isIda ? 'Ida' : 'Vuelta'}</h3>
                        <p className="text-xs text-gray-500">{trip.route}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      COMPLETADO
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{trip.startTime} - {trip.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{trip.studentsTransported} estudiantes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Duración: {trip.duration} min</span>
                  </div>

                  {/* Incidents */}
                  {trip.incidents > 0 ? (
                    <div className="mt-3 p-2 bg-warning/10 rounded-lg flex items-center gap-2 text-sm text-warning-dark">
                      <AlertTriangle className="w-4 h-4" />
                      {trip.incidents} incidente(s)
                    </div>
                  ) : (
                    <div className="mt-3 p-2 bg-success/10 rounded-lg flex items-center gap-2 text-sm text-success-dark">
                      <CheckCircle className="w-4 h-4" />
                      Sin incidentes
                    </div>
                  )}

                  {/* View Details */}
                  <Link
                    href={`/trips/${trip._id}`}
                    className="mt-3 flex items-center justify-center gap-1 text-sm text-primary hover:underline"
                  >
                    Ver detalles
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to format date labels
function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dateStr === today) return `Hoy - ${formatDate(dateStr)}`;
  if (dateStr === yesterday) return `Ayer - ${formatDate(dateStr)}`;
  return formatDate(dateStr);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
