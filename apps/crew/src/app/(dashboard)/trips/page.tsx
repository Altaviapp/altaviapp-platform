'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Bus, Clock, MapPin, Users, ChevronRight, Play, CheckCircle, AlertCircle, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/dates';
import { useMyTrips, useConvexAuth } from '@/hooks';
import { LoadingState } from '@/components/shared/LoadingState';

const filters = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'all', label: 'Todos' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Bus }> = {
  scheduled: { label: 'PROGRAMADO', color: 'text-info', bg: 'bg-info/10', icon: Calendar },
  in_progress: { label: 'EN CURSO', color: 'text-success', bg: 'bg-success/10', icon: Bus },
  completed: { label: 'COMPLETADO', color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle },
  cancelled: { label: 'CANCELADO', color: 'text-error', bg: 'bg-error/10', icon: AlertCircle },
};

export default function TripsPage() {
  const [selectedFilter, setSelectedFilter] = useState('today');
  const { isDriver, isAuthenticated, isLoading: authLoading } = useConvexAuth();

  // Get date for query based on filter
  const queryDate = useMemo(() => {
    if (selectedFilter === 'today') {
      return new Date().toISOString().split('T')[0];
    }
    return undefined; // All trips
  }, [selectedFilter]);

  const { trips: convexTrips, isLoading: tripsLoading, isEmpty } = useMyTrips(queryDate);

  // Transform Convex trips to UI format
  // API returns: { route: { id, name, type: "pickup"|"dropoff" }, vehicle: { licensePlate } }
  const trips = useMemo(() => {
    return convexTrips.map((trip: {
      _id: string;
      status: "scheduled" | "in_progress" | "completed" | "cancelled";
      scheduledDate: string;
      route?: { id: string; name: string; type: "pickup" | "dropoff" } | null;
      vehicle?: { licensePlate: string } | null;
    }) => ({
      _id: trip._id,
      // Map API type: pickup = morning (ida), dropoff = afternoon (vuelta)
      type: trip.route?.type === 'pickup' ? 'ida' : 'vuelta',
      status: trip.status,
      route: {
        name: trip.route?.name ?? 'Ruta sin asignar',
        code: trip.route?.name?.substring(0, 5) ?? 'N/A',
      },
      scheduledStart: '07:00', // Default times - API doesn't include these
      scheduledEnd: '08:00',
      studentsExpected: 0, // TODO: Get from route stops
      studentsOnBoard: 0,
      stopsCompleted: 0,
      totalStops: 0, // TODO: Get from route stops
      vehicle: {
        plate: trip.vehicle?.licensePlate ?? '---',
        model: 'Vehículo asignado',
      },
      hasChecklist: false, // API doesn't track this yet
    }));
  }, [convexTrips]);

  // Loading state
  if (authLoading || tripsLoading) {
    return <LoadingState variant="page" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mis Viajes</h1>
        <span className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              selectedFilter === filter.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => {
          const status = statusConfig[trip.status] ?? statusConfig.pending!;
          const StatusIcon = status.icon;
          const isIda = trip.type === 'ida';

          return (
            <div
              key={trip._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Trip Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', isIda ? 'bg-warning/10' : 'bg-primary/10')}>
                      {isIda ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Viaje de {isIda ? 'Ida' : 'Vuelta'}</h3>
                      <p className="text-sm text-gray-500">{trip.route.name}</p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', status.bg, status.color)}>
                    {status.label}
                  </span>
                </div>

                {/* Trip Info */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{trip.scheduledStart} - {trip.scheduledEnd}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{trip.studentsOnBoard}/{trip.studentsExpected} estudiantes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{trip.stopsCompleted}/{trip.totalStops} paradas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Bus className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{trip.vehicle.plate}</span>
                  </div>
                </div>
              </div>

              {/* Trip Actions */}
              <div className="p-3 bg-gray-50 flex items-center gap-2">
                {trip.status === 'scheduled' && isDriver && !trip.hasChecklist && (
                  <Link
                    href={`/trips/${trip._id}/checklist`}
                    className="flex-1 py-2 px-4 rounded-lg bg-warning text-white text-sm font-medium text-center hover:bg-warning-dark transition-colors"
                  >
                    Completar Checklist
                  </Link>
                )}
                {trip.status === 'scheduled' && isDriver && trip.hasChecklist && (
                  <Link
                    href={`/trips/${trip._id}/start`}
                    className="flex-1 py-2 px-4 rounded-lg bg-success text-white text-sm font-medium text-center flex items-center justify-center gap-2 hover:bg-success-dark transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Viaje
                  </Link>
                )}
                {trip.status === 'scheduled' && !isDriver && (
                  <span className="flex-1 py-2 px-4 text-sm text-gray-500 text-center">
                    Programado para las {trip.scheduledStart}
                  </span>
                )}
                {(trip.status === 'in_progress' || trip.status === 'completed') && (
                  <Link
                    href={`/trips/${trip._id}/active`}
                    className="flex-1 py-2 px-4 rounded-lg bg-primary text-white text-sm font-medium text-center flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    Ver Detalles
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {trips.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No hay viajes programados</h3>
          <p className="text-sm text-gray-500">No tienes viajes asignados para el período seleccionado.</p>
        </div>
      )}
    </div>
  );
}
