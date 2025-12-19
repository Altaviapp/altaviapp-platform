'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Bus, Clock, MapPin, Users, ChevronRight, Play, CheckCircle, AlertCircle, Sun, Moon, Route as RouteIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/dates';
import { useDriverRoutesToday, useConvexAuth } from '@/hooks';
import { LoadingState } from '@/components/shared/LoadingState';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Bus }> = {
  available: { label: 'DISPONIBLE', color: 'text-warning', bg: 'bg-warning/10', icon: Calendar },
  scheduled: { label: 'PROGRAMADO', color: 'text-info', bg: 'bg-info/10', icon: Calendar },
  in_progress: { label: 'EN CURSO', color: 'text-success', bg: 'bg-success/10', icon: Bus },
  completed: { label: 'COMPLETADO', color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle },
  cancelled: { label: 'CANCELADO', color: 'text-error', bg: 'bg-error/10', icon: AlertCircle },
};

export default function TripsPage() {
  const { isDriver, isLoading: authLoading } = useConvexAuth();

  // Get routes for today (lazy trip creation)
  const { routes, isLoading: routesLoading, isEmpty } = useDriverRoutesToday();

  // Transform routes to display format
  const displayRoutes = useMemo(() => {
    return routes.map((route) => ({
      _id: route._id,
      // Map API type: pickup = morning (ida), dropoff = afternoon (vuelta)
      type: route.type === 'pickup' ? 'ida' : 'vuelta',
      status: route.tripStatus || 'available',
      tripId: route.tripId,
      canStart: route.canStart,
      route: {
        name: route.name,
        code: route.name?.substring(0, 5) ?? 'N/A',
      },
      scheduledStart: route.scheduledStartTime,
      scheduledEnd: route.scheduledEndTime,
      studentsExpected: route.studentCount,
      studentsOnBoard: 0, // Will be shown after trip starts
      stopsCompleted: 0,
      totalStops: 0, // Could be fetched separately if needed
      vehicle: {
        plate: route.vehicle?.licensePlate ?? '---',
        model: route.vehicle ? `${route.vehicle.brand} ${route.vehicle.model}` : 'Vehículo asignado',
      },
      estimatedDuration: route.estimatedDuration,
    }));
  }, [routes]);

  // Loading state
  if (authLoading || routesLoading) {
    return <LoadingState variant="page" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mis Rutas</h1>
        <span className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</span>
      </div>

      {/* Info Banner */}
      <div className="bg-info/10 border border-info/20 rounded-lg p-3 text-sm text-info">
        <RouteIcon className="w-4 h-4 inline-block mr-2" />
        Las rutas de hoy se muestran aquí. Presiona "Iniciar Viaje" cuando estés listo para comenzar.
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {displayRoutes.map((route) => {
          const status = statusConfig[route.status] ?? statusConfig.available!;
          const StatusIcon = status.icon;
          const isIda = route.type === 'ida';

          return (
            <div
              key={route._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Route Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', isIda ? 'bg-warning/10' : 'bg-primary/10')}>
                      {isIda ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ruta de {isIda ? 'Recogida' : 'Entrega'}</h3>
                      <p className="text-sm text-gray-500">{route.route.name}</p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', status.bg, status.color)}>
                    {status.label}
                  </span>
                </div>

                {/* Route Info */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{route.scheduledStart} - {route.scheduledEnd}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{route.studentsExpected} estudiantes</span>
                  </div>
                  {route.estimatedDuration && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">~{route.estimatedDuration} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Bus className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{route.vehicle.plate}</span>
                  </div>
                </div>
              </div>

              {/* Route Actions */}
              <div className="p-3 bg-gray-50 flex items-center gap-2">
                {route.canStart && isDriver && (
                  <Link
                    href={`/routes/${route._id}/start`}
                    className="flex-1 py-2 px-4 rounded-lg bg-success text-white text-sm font-medium text-center flex items-center justify-center gap-2 hover:bg-success/90 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Viaje
                  </Link>
                )}
                {route.canStart && !isDriver && (
                  <span className="flex-1 py-2 px-4 text-sm text-gray-500 text-center">
                    Programado para las {route.scheduledStart}
                  </span>
                )}
                {route.status === 'in_progress' && route.tripId && (
                  <Link
                    href={`/trips/${route.tripId}/active`}
                    className="flex-1 py-2 px-4 rounded-lg bg-primary text-white text-sm font-medium text-center flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    Ver Viaje Activo
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {route.status === 'completed' && (
                  <div className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Viaje Completado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayRoutes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <RouteIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No hay rutas programadas</h3>
          <p className="text-sm text-gray-500">No tienes rutas asignadas para hoy.</p>
        </div>
      )}
    </div>
  );
}
