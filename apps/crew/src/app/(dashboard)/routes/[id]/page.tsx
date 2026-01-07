'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sunrise,
  Sunset,
  Clock,
  MapPin,
  Users,
  Bus,
  Calendar,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserX,
  MapPinned,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouteWithStudents, useDriverRoutesToday, useNovedadesForRoute } from '@/hooks';
import { StudentListSheet } from '@/components/sheets/StudentListSheet';

interface RouteDetailPageProps {
  params: Promise<{ id: string }>;
}

const dayLabels: Record<string, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
  sunday: 'Dom',
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
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando ruta...</p>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
        <MapPin className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-600 mb-4">Ruta no encontrada</p>
        <Link href="/dashboard" className="text-primary font-medium">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const isPickup = route.type === 'pickup';
  const Icon = isPickup ? Sunrise : Sunset;
  const typeLabel = isPickup ? 'Recogida' : 'Entrega';
  const typeBgLight = isPickup ? 'bg-amber-50' : 'bg-sky-50';
  const typeBgMedium = isPickup ? 'bg-amber-100' : 'bg-sky-100';
  const typeTextColor = isPickup ? 'text-amber-600' : 'text-sky-600';

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
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className={cn('flex-shrink-0 safe-area-pt', typeBgLight)}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', typeBgMedium)}>
            <Icon className={cn('w-5 h-5', typeTextColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{route.name}</h1>
            <p className="text-sm text-gray-500">{typeLabel} · {route.scheduledStartTime}</p>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-4 space-y-3">
          {/* Today's Trip Card */}
          {(canStartToday || tripInProgress) && (
            <section className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-gray-900 text-sm">Viaje de Hoy</span>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  tripInProgress ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                )}>
                  {tripInProgress ? 'En progreso' : 'Listo'}
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl py-2 px-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{expectedStudents}</p>
                  <p className="text-[11px] text-gray-500">Estudiantes</p>
                </div>
                <div className="bg-gray-50 rounded-xl py-2 px-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{route.stops?.length || 0}</p>
                  <p className="text-[11px] text-gray-500">Paradas</p>
                </div>
                <div className={cn(
                  'rounded-xl py-2 px-3 text-center',
                  summary.total > 0 ? 'bg-amber-50' : 'bg-gray-50'
                )}>
                  <p className={cn('text-lg font-bold', summary.total > 0 ? 'text-amber-600' : 'text-gray-900')}>
                    {summary.total}
                  </p>
                  <p className="text-[11px] text-gray-500">Novedades</p>
                </div>
              </div>

              {/* Novedades Alert */}
              {summary.total > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-amber-700">
                      {summary.total} novedad{summary.total !== 1 ? 'es' : ''} para revisar
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.absences > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                        <UserX className="w-3 h-3 text-red-500 flex-shrink-0" />
                        {summary.absences} ausencia{summary.absences !== 1 ? 's' : ''}
                      </span>
                    )}
                    {summary.parentPickups > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                        <UserCheck className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        {summary.parentPickups} padre recoge
                      </span>
                    )}
                    {summary.stopChanges > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                        <MapPinned className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        {summary.stopChanges} cambio{summary.stopChanges !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {tripInProgress && tripId ? (
                <button
                  onClick={() => router.push(`/trips/${tripId}/active`)}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-primary active:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Bus className="w-5 h-5" />
                  Ver Viaje Activo
                </button>
              ) : canStartToday && (
                <button
                  onClick={() => router.push(`/routes/${id}/start`)}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-primary active:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Viaje
                </button>
              )}
            </section>
          )}

          {/* Route not for today message */}
          {!canStartToday && !tripInProgress && (
            <section className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Esta ruta no está programada para hoy</p>
            </section>
          )}

          {/* Route Info */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Información
            </h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  {route.scheduledStartTime} - {route.scheduledEndTime}
                </span>
              </div>
              {route.vehicle && (
                <div className="flex items-center gap-3">
                  <Bus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">
                    {route.vehicle.licensePlate}
                    {route.vehicle.brand && ` · ${route.vehicle.brand}`}
                  </span>
                </div>
              )}
              {route.estimatedDuration && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {route.estimatedDuration} min
                    {route.estimatedDistance && ` · ${(route.estimatedDistance / 1000).toFixed(1)} km`}
                  </span>
                </div>
              )}
              {recurrenceText && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{recurrenceText}</span>
                </div>
              )}
            </div>
          </section>

          {/* Stops */}
          {route.stops && route.stops.length > 0 && (
            <section className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Paradas ({route.stops.length})
              </h2>
              <div>
                {route.stops.map((stop: { _id: string; name: string; address: string; scheduledTime: string; order: number }, index: number) => (
                  <div key={stop._id} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        index === 0 ? 'bg-green-500 text-white' :
                        index === route.stops.length - 1 ? 'bg-primary text-white' :
                        'bg-gray-200 text-gray-600'
                      )}>
                        {stop.order}
                      </div>
                      {index < route.stops.length - 1 && (
                        <div className="w-0.5 h-6 bg-gray-200" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{stop.name}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{stop.scheduledTime}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{stop.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Students */}
          {route.students && route.students.length > 0 && (
            <button
              onClick={() => setShowStudentSheet(true)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm text-left active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Estudiantes ({totalStudents})
                </h2>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Avatars */}
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {route.students.filter(Boolean).slice(0, 4).map((student, index) => {
                    if (!student) return null;
                    const hasNovedad = studentsWithNovedades.has(student.id);
                    return (
                      <div
                        key={String(student.id)}
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white',
                          hasNovedad ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                        )}
                        style={{ zIndex: 4 - index }}
                      >
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                    );
                  })}
                  {totalStudents > 4 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 border-2 border-white">
                      +{totalStudents - 4}
                    </div>
                  )}
                </div>

                <div className="ml-3 flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {totalStudents - studentsWithNovedades.size}
                  </span>
                  {studentsWithNovedades.size > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      {studentsWithNovedades.size}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )}

          {/* Bottom spacing for safe area */}
          <div className="h-4" />
        </div>
      </main>

      {/* Student List Sheet */}
      <StudentListSheet
        isOpen={showStudentSheet}
        onClose={() => setShowStudentSheet(false)}
        students={route.students || []}
        novedades={novedades}
      />
    </div>
  );
}
