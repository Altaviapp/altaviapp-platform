'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Route, Sunrise, Sunset, Clock, MapPin, Users, Bus, ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCrewRoutes } from '@/hooks';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';

type RouteFilter = 'all' | 'pickup' | 'dropoff';

const recurrenceLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  one_time: 'Una vez',
};

const dayLabels: Record<string, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
  sunday: 'Dom',
};

export default function RoutesPage() {
  const { routes, isLoading, isEmpty } = useCrewRoutes();
  const [filter, setFilter] = useState<RouteFilter>('all');

  const filteredRoutes = routes.filter(route => {
    if (filter === 'all') return true;
    return route.type === filter;
  });

  const pickupCount = routes.filter(r => r.type === 'pickup').length;
  const dropoffCount = routes.filter(r => r.type === 'dropoff').length;

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={Route}
        title="Sin rutas asignadas"
        description="No tienes rutas asignadas actualmente. Contacta al administrador."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Route className="w-6 h-6 text-primary" />
          Mis Rutas
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {routes.length} ruta{routes.length !== 1 ? 's' : ''} asignada{routes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Filter className="w-4 h-4" />
          Todas ({routes.length})
        </button>
        <button
          onClick={() => setFilter('pickup')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            filter === 'pickup'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Sunrise className="w-4 h-4 text-warning" />
          Recogida ({pickupCount})
        </button>
        <button
          onClick={() => setFilter('dropoff')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            filter === 'dropoff'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Sunset className="w-4 h-4 text-info" />
          Entrega ({dropoffCount})
        </button>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {filteredRoutes.map((route) => {
          const isPickup = route.type === 'pickup';
          const Icon = isPickup ? Sunrise : Sunset;
          const typeBadge = isPickup ? 'RECOGIDA' : 'ENTREGA';
          const typeColor = isPickup ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info';

          // Format recurrence
          let recurrenceText = '';
          if (route.recurrence) {
            recurrenceText = recurrenceLabels[route.recurrence.type] || '';
            if (route.recurrence.type === 'daily' && route.recurrence.daysOfWeek) {
              const days = route.recurrence.daysOfWeek.map(d => dayLabels[d] || d).join(', ');
              recurrenceText = `Diario: ${days}`;
            }
          }

          return (
            <Link
              key={route._id}
              href={`/routes/${route._id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={isPickup ? 'w-5 h-5 text-warning' : 'w-5 h-5 text-info'} />
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', typeColor)}>
                    {typeBadge}
                  </span>
                  {route.isDriver && route.isMonitor && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      Conductor + Monitor
                    </span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Route Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {route.name}
              </h3>

              {/* Route Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {/* Schedule */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{route.scheduledStartTime} - {route.scheduledEndTime}</span>
                </div>

                {/* Stops */}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{route.stopsCount} paradas</span>
                </div>

                {/* Students */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{route.studentCount} estudiantes</span>
                </div>

                {/* Vehicle */}
                {route.vehicle && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bus className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{route.vehicle.licensePlate}</span>
                  </div>
                )}
              </div>

              {/* Recurrence info */}
              {recurrenceText && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {recurrenceText}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* No results for filter */}
      {filteredRoutes.length === 0 && !isEmpty && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay rutas de {filter === 'pickup' ? 'recogida' : 'entrega'}</p>
        </div>
      )}
    </div>
  );
}
