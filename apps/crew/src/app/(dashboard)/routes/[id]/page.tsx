'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sunrise, Sunset, Clock, MapPin, Users, Bus, Calendar, Play, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouteWithStudents, useDriverRoutesToday } from '@/hooks';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';

interface RouteDetailPageProps {
  params: Promise<{ id: string }>;
}

const recurrenceLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  one_time: 'Una vez',
};

const dayLabels: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export default function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { id } = use(params);
  const { route, isLoading } = useRouteWithStudents(id);
  const { routes: todayRoutes } = useDriverRoutesToday();

  // Check if this route is available to start today
  const todayRoute = todayRoutes.find(r => r._id === id);
  const canStartToday = todayRoute?.canStart ?? false;
  const tripInProgress = todayRoute?.tripStatus === 'in_progress';
  const tripId = todayRoute?.tripId;

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!route) {
    return (
      <EmptyState
        icon={MapPin}
        title="Ruta no encontrada"
        description="La ruta que buscas no existe o no tienes acceso."
        action={
          <Link
            href="/routes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a rutas
          </Link>
        }
      />
    );
  }

  const isPickup = route.type === 'pickup';
  const Icon = isPickup ? Sunrise : Sunset;
  const typeBadge = isPickup ? 'RUTA DE RECOGIDA' : 'RUTA DE ENTREGA';
  const typeColor = isPickup ? 'text-warning' : 'text-info';

  // Format recurrence
  let recurrenceText = '';
  if (route.recurrence) {
    recurrenceText = recurrenceLabels[route.recurrence.type] || '';
    if (route.recurrence.type === 'daily' && route.recurrence.daysOfWeek) {
      const days = route.recurrence.daysOfWeek.map((d: string) => dayLabels[d] || d).join(', ');
      recurrenceText = days;
    } else if (route.recurrence.type === 'weekly' && route.recurrence.dayOfWeek) {
      recurrenceText = `Cada ${dayLabels[route.recurrence.dayOfWeek] || route.recurrence.dayOfWeek}`;
    } else if (route.recurrence.type === 'one_time' && route.recurrence.specificDate) {
      recurrenceText = `Fecha: ${route.recurrence.specificDate}`;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/routes"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={cn('w-5 h-5', typeColor)} />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {typeBadge}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{route.name}</h1>
        </div>
      </div>

      {/* Action Buttons */}
      {canStartToday && (
        <Link
          href={`/routes/${id}/start`}
          className="flex items-center justify-center gap-2 w-full bg-success hover:bg-success/90 text-white font-bold py-4 px-4 rounded-xl text-center transition-colors"
        >
          <Play className="w-5 h-5" />
          INICIAR VIAJE DE HOY
        </Link>
      )}

      {tripInProgress && tripId && (
        <Link
          href={`/trips/${tripId}/active`}
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-4 rounded-xl text-center transition-colors"
        >
          <Bus className="w-5 h-5" />
          VER VIAJE ACTIVO
        </Link>
      )}

      {/* Route Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Ruta</h2>

        <div className="space-y-3">
          {/* Schedule */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {route.scheduledStartTime} - {route.scheduledEndTime}
              </p>
              <p className="text-xs text-gray-500">Horario programado</p>
            </div>
          </div>

          {/* Recurrence */}
          {recurrenceText && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{recurrenceText}</p>
                <p className="text-xs text-gray-500">Frecuencia</p>
              </div>
            </div>
          )}

          {/* Vehicle */}
          {route.vehicle && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Bus className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{route.vehicle.licensePlate}</p>
                <p className="text-xs text-gray-500">
                  {route.vehicle.brand} {route.vehicle.model}
                </p>
              </div>
            </div>
          )}

          {/* Duration & Distance */}
          {(route.estimatedDuration || route.estimatedDistance) && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {route.estimatedDuration && `${route.estimatedDuration} min`}
                  {route.estimatedDuration && route.estimatedDistance && ' · '}
                  {route.estimatedDistance && `${(route.estimatedDistance / 1000).toFixed(1)} km`}
                </p>
                <p className="text-xs text-gray-500">Duración estimada</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stops Section */}
      {route.stops && route.stops.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Paradas ({route.stops.length})
          </h2>

          <div className="space-y-3">
            {route.stops.map((stop: { _id: string; name: string; address: string; scheduledTime: string; order: number }, index: number) => (
              <div key={stop._id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {stop.order}
                  </div>
                  {index < route.stops.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-medium text-gray-900">{stop.name}</p>
                  <p className="text-xs text-gray-500">{stop.address}</p>
                  <p className="text-xs text-gray-400 mt-1">{stop.scheduledTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Section */}
      {route.students && route.students.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Estudiantes ({route.students.length})
          </h2>

          <div className="space-y-2">
            {route.students.filter(Boolean).slice(0, 10).map((student) => {
              if (!student) return null;
              return (
                <div key={String(student.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {student.grade}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>

          {route.students.length > 10 && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Y {route.students.length - 10} estudiantes más...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
