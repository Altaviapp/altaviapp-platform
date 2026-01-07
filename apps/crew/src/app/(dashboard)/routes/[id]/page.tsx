'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sunrise,
  Sunset,
  Clock,
  MapPin,
  Users,
  Bus,
  Calendar,
  Play,
  ChevronRight,
  AlertTriangle,
  UserX,
  MapPinned,
  UserCheck,
  CheckCircle,
  Route as RouteIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouteWithStudents, useDriverRoutesToday, useNovedadesForRoute } from '@/hooks';
import { LoadingState, EmptyState, Card, CardContent, Button, Badge } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { StudentListSheet } from '@/components/sheets/StudentListSheet';

interface RouteDetailPageProps {
  params: Promise<{ id: string }>;
}

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
  const router = useRouter();
  const { id } = use(params);
  const { route, isLoading } = useRouteWithStudents(id);
  const { routes: todayRoutes } = useDriverRoutesToday();
  const { novedades, summary } = useNovedadesForRoute(id);

  const [showStudentSheet, setShowStudentSheet] = useState(false);

  // Check if this route is available to start today
  const todayRoute = todayRoutes.find(r => r._id === id);
  const canStartToday = todayRoute?.canStart ?? false;
  const tripInProgress = todayRoute?.tripStatus === 'in_progress';
  const tripId = todayRoute?.tripId;

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader title="Cargando..." backHref="/dashboard" />
        <LoadingState message="Cargando información de la ruta..." />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader title="Ruta" backHref="/dashboard" />
        <EmptyState
          icon={MapPin}
          title="Ruta no encontrada"
          description="La ruta que buscas no existe o no tienes acceso."
          action={{ label: 'Volver al inicio', onClick: () => router.push('/dashboard') }}
        />
      </div>
    );
  }

  const isPickup = route.type === 'pickup';
  const Icon = isPickup ? Sunrise : Sunset;
  const typeLabel = isPickup ? 'Recogida' : 'Entrega';
  const typeColor = isPickup ? 'warning' : 'info';
  const typeBgColor = isPickup ? 'bg-warning/10' : 'bg-info/10';
  const typeTextColor = isPickup ? 'text-warning' : 'text-info';

  // Format recurrence
  let recurrenceText = '';
  if (route.recurrence?.type === 'daily' && route.recurrence.daysOfWeek) {
    recurrenceText = route.recurrence.daysOfWeek.map((d: string) => dayLabels[d] || d).join(', ');
  }

  // Calculate students with novedades
  const studentsWithNovedades = new Set(novedades.map(n => n.studentId));
  const totalStudents = route.students?.length || 0;
  const expectedStudents = totalStudents - summary.absences - summary.parentPickups;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Custom Header with Hero */}
      <div className={cn(
        'pt-4 pb-6 px-4',
        isPickup ? 'bg-gradient-to-b from-warning/20 to-gray-50' : 'bg-gradient-to-b from-info/20 to-gray-50'
      )}>
        <PageHeader title="" backHref="/dashboard" />

        {/* Hero Content */}
        <div className="mt-4 flex items-start gap-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            typeBgColor
          )}>
            <Icon className={cn('w-8 h-8', typeTextColor)} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{route.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={typeColor}>{typeLabel}</Badge>
              <span className="text-sm text-gray-500">{route.scheduledStartTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4">
        {/* Today's Status Card - Only show if route is for today */}
        {(canStartToday || tripInProgress) && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Viaje de Hoy</p>
                  <p className="text-sm text-gray-500">
                    {tripInProgress ? 'En progreso' : 'Listo para iniciar'}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-primary">{expectedStudents}</p>
                  <p className="text-xs text-gray-500">Estudiantes</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-primary">{route.stops?.length || 0}</p>
                  <p className="text-xs text-gray-500">Paradas</p>
                </div>
                <div className={cn(
                  'rounded-lg p-2 text-center',
                  summary.total > 0 ? 'bg-warning/10' : 'bg-white'
                )}>
                  <p className={cn(
                    'text-lg font-bold',
                    summary.total > 0 ? 'text-warning' : 'text-primary'
                  )}>{summary.total}</p>
                  <p className="text-xs text-gray-500">Novedades</p>
                </div>
              </div>

              {/* Novedades Banner - Only if there are novedades */}
              {summary.total > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">
                      {summary.total} novedad{summary.total !== 1 ? 'es' : ''} para hoy
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.absences > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full">
                        <UserX className="w-3 h-3 text-error" />
                        <span className="text-gray-600">{summary.absences} ausencia{summary.absences !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {summary.parentPickups > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full">
                        <UserCheck className="w-3 h-3 text-orange-500" />
                        <span className="text-gray-600">{summary.parentPickups} recoge padre</span>
                      </div>
                    )}
                    {summary.stopChanges > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full">
                        <MapPinned className="w-3 h-3 text-blue-500" />
                        <span className="text-gray-600">{summary.stopChanges} cambio{summary.stopChanges !== 1 ? 's' : ''} parada</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {tripInProgress && tripId ? (
                <Button
                  onClick={() => router.push(`/trips/${tripId}/active`)}
                  leftIcon={Bus}
                  className="w-full"
                >
                  Ver Viaje Activo
                </Button>
              ) : canStartToday && (
                <Button
                  onClick={() => router.push(`/routes/${id}/start`)}
                  leftIcon={Play}
                  className="w-full bg-success hover:bg-success/90"
                >
                  {summary.total > 0
                    ? `Iniciar Viaje (${summary.total} novedad${summary.total !== 1 ? 'es' : ''})`
                    : 'Iniciar Viaje'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Route Info - Compact Version */}
        <Card>
          <CardContent>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <RouteIcon className="w-4 h-4" />
              Información de la Ruta
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Schedule */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {route.scheduledStartTime} - {route.scheduledEndTime}
                  </p>
                </div>
              </div>

              {/* Vehicle */}
              {route.vehicle && (
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{route.vehicle.licensePlate}</p>
                  </div>
                </div>
              )}

              {/* Duration */}
              {route.estimatedDuration && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {route.estimatedDuration} min
                    {route.estimatedDistance && ` · ${(route.estimatedDistance / 1000).toFixed(1)} km`}
                  </p>
                </div>
              )}

              {/* Recurrence */}
              {recurrenceText && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600 truncate">{recurrenceText}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stops Timeline */}
        {route.stops && route.stops.length > 0 && (
          <Card>
            <CardContent>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Paradas ({route.stops.length})
              </h2>

              <div className="relative">
                {route.stops.map((stop: { _id: string; name: string; address: string; scheduledTime: string; order: number }, index: number) => (
                  <div key={stop._id} className="flex items-start gap-3 pb-4 last:pb-0">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        index === 0 ? 'bg-success text-white' :
                        index === route.stops.length - 1 ? 'bg-primary text-white' :
                        'bg-gray-200 text-gray-600'
                      )}>
                        {stop.order}
                      </div>
                      {index < route.stops.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 min-h-[24px] mt-1" />
                      )}
                    </div>

                    {/* Stop Info */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{stop.name}</p>
                        <span className="text-xs text-gray-400 ml-2">{stop.scheduledTime}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{stop.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Section - Clickable */}
        {route.students && route.students.length > 0 && (
          <Card
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowStudentSheet(true)}
          >
            <CardContent>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Estudiantes ({totalStudents})
                </h2>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Student Avatars Preview */}
              <div className="flex items-center mt-3">
                <div className="flex -space-x-2">
                  {route.students.filter(Boolean).slice(0, 5).map((student, index) => {
                    if (!student) return null;
                    const hasNovedad = studentsWithNovedades.has(student.id);
                    return (
                      <div
                        key={String(student.id)}
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white',
                          hasNovedad ? 'bg-warning/20 text-warning' : 'bg-accent text-primary'
                        )}
                        style={{ zIndex: 5 - index }}
                      >
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                    );
                  })}
                  {totalStudents > 5 && (
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                      +{totalStudents - 5}
                    </div>
                  )}
                </div>

                {/* Status indicators */}
                <div className="ml-4 flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    <span className="text-gray-600">{totalStudents - studentsWithNovedades.size}</span>
                  </div>
                  {studentsWithNovedades.size > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                      <span className="text-gray-600">{studentsWithNovedades.size}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Toca para ver la lista completa
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student List Sheet */}
      <StudentListSheet
        isOpen={showStudentSheet}
        onClose={() => setShowStudentSheet(false)}
        students={route.students || []}
        novedades={novedades}
      />

      {/* Floating Action Button - Only when not showing today's card */}
      {!canStartToday && !tripInProgress && (
        <div className="fixed bottom-20 left-4 right-4">
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">
              Esta ruta no está programada para hoy
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
