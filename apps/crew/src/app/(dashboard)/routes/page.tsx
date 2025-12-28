'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Route, Sunrise, Sunset, Clock, MapPin, Users, Bus, ChevronRight } from 'lucide-react';
import { LoadingState, EmptyState, Card, Badge, Tabs, TabsList, Tab, TabsPanel } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { ROUTE_TYPE_CONFIG } from '@/lib/constants';
import { useCrewRoutes } from '@/hooks';

const recurrenceLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  one_time: 'Una vez',
};

const dayLabels: Record<string, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mie',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sab',
  sunday: 'Dom',
};

export default function RoutesPage() {
  const { routes, isLoading, isEmpty } = useCrewRoutes();
  const [filter, setFilter] = useState<'all' | 'pickup' | 'dropoff'>('all');

  const filteredRoutes = routes.filter(route => {
    if (filter === 'all') return true;
    return route.type === filter;
  });

  const pickupCount = routes.filter(r => r.type === 'pickup').length;
  const dropoffCount = routes.filter(r => r.type === 'dropoff').length;

  if (isLoading) {
    return <LoadingState message="Cargando rutas..." size="lg" />;
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
    <div className="space-y-4 pb-20">
      {/* Header */}
      <PageHeader
        title="Mis Rutas"
        subtitle={`${routes.length} ruta${routes.length !== 1 ? 's' : ''} asignada${routes.length !== 1 ? 's' : ''}`}
      />

      {/* Filter Tabs */}
      <Tabs value={filter} onChange={(v) => setFilter(v as 'all' | 'pickup' | 'dropoff')}>
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <Tab value="all">Todas ({routes.length})</Tab>
          <Tab value="pickup">Recogida ({pickupCount})</Tab>
          <Tab value="dropoff">Entrega ({dropoffCount})</Tab>
        </TabsList>
      </Tabs>

      {/* Routes List */}
      <div className="space-y-3">
        {filteredRoutes.map((route) => {
          const isPickup = route.type === 'pickup';
          const Icon = isPickup ? Sunrise : Sunset;
          const routeConfig = ROUTE_TYPE_CONFIG[route.type];

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
              className="block"
            >
              <Card hover padding="md">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={isPickup ? 'w-5 h-5 text-yellow-500' : 'w-5 h-5 text-blue-500'} />
                    <Badge variant={routeConfig.variant} size="sm">
                      {routeConfig.label}
                    </Badge>
                    {route.isDriver && route.isMonitor && (
                      <Badge variant="purple" size="sm">
                        Conductor + Monitor
                      </Badge>
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
              </Card>
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
