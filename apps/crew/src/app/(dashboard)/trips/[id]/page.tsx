'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sunrise, Sunset, Clock, MapPin, Users, Bus, Play, AlertTriangle,
  CheckCircle, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrip, useTripStudents, useTripTimeline } from '@/hooks';
import { LoadingState, EmptyState, Card, CardContent, Button, Badge } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { TripDetailTabs, TripHistorialTab, type TripDetailTab } from '@/components/trip';
import type { Id } from '../../../../../../../convex/_generated/dataModel';

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  scheduled: { label: 'PROGRAMADO', color: 'bg-blue-50 text-blue-700', icon: Clock },
  in_progress: { label: 'EN CURSO', color: 'bg-green-50 text-green-700', icon: Bus },
  completed: { label: 'COMPLETADO', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
  cancelled: { label: 'CANCELADO', color: 'bg-red-50 text-red-700', icon: XCircle },
};

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<TripDetailTab>('general');

  const { trip, isLoading: tripLoading } = useTrip(id as Id<"trips">);
  const { students, isLoading: studentsLoading } = useTripStudents(id);
  const { total: eventCount } = useTripTimeline(id as Id<"trips">);

  const isLoading = tripLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader title="Viaje" backHref="/trips" />
        <LoadingState message="Cargando viaje..." />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader title="Viaje" backHref="/trips" />
        <EmptyState
          icon={MapPin}
          title="Viaje no encontrado"
          description="El viaje que buscas no existe o no tienes acceso."
          action={{ label: 'Volver a viajes', onClick: () => router.push('/trips') }}
        />
      </div>
    );
  }

  const isPickup = trip.route?.type === 'pickup';
  const Icon = isPickup ? Sunrise : Sunset;
  const typeColor = isPickup ? 'text-warning' : 'text-info';

  const tripStatus = trip.status ?? 'scheduled';
  const status = statusConfig[tripStatus] ?? statusConfig.scheduled!;

  const isActive = trip.status === 'in_progress';
  const isScheduled = trip.status === 'scheduled';

  // Calculate student stats
  const totalStudents = students.length;
  const checkedInStudents = students.filter((s: { checkedIn?: boolean }) => s.checkedIn).length;
  const absentStudents = students.filter((s: { status?: string }) => s.status === 'absent').length;
  const stopsCount = trip.stops?.length ?? 0;

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <PageHeader
        title={trip.route?.name || 'Viaje'}
        subtitle={trip.scheduledDate}
        backHref="/trips"
        badge={
          <div className="flex items-center gap-2">
            <Icon className={cn('w-5 h-5', typeColor)} />
            <Badge variant={tripStatus === 'completed' ? 'success' : tripStatus === 'in_progress' ? 'success' : tripStatus === 'cancelled' ? 'danger' : 'info'}>
              {status.label}
            </Badge>
          </div>
        }
      />

      {/* Action Buttons */}
      {isActive && (
        <Button
          onClick={() => router.push(`/trips/${id}/active`)}
          leftIcon={Bus}
          className="w-full"
        >
          VER VIAJE ACTIVO
        </Button>
      )}

      {isScheduled && (
        <Button
          onClick={() => router.push(`/trips/${id}/start`)}
          leftIcon={Play}
          className="w-full bg-success hover:bg-success/90"
        >
          INICIAR VIAJE
        </Button>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-primary">{totalStudents}</p>
            <p className="text-xs text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-success">{checkedInStudents}</p>
            <p className="text-xs text-gray-500">Check-in</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-error">{absentStudents}</p>
            <p className="text-xs text-gray-500">Ausentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <TripDetailTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentsCount={totalStudents}
        stopsCount={stopsCount}
        eventCount={eventCount}
      />

      {/* Tab Content */}
      {activeTab === 'general' && (
        <>
          {/* Trip Info Card */}
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacion del Viaje</h2>

              <div className="space-y-3">
                {/* Schedule */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {trip.scheduledDate}
                    </p>
                    <p className="text-xs text-gray-500">Fecha programada</p>
                  </div>
                </div>

                {/* Vehicle */}
                {trip.vehicle && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{trip.vehicle.licensePlate}</p>
                      <p className="text-xs text-gray-500">Vehiculo asignado</p>
                    </div>
                  </div>
                )}

                {/* Start/End Times */}
                {trip.startTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Play className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(trip.startTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500">Hora de inicio real</p>
                    </div>
                  </div>
                )}

                {trip.endTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(trip.endTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500">Hora de finalizacion</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/trips/${id}/students`)}
              leftIcon={Users}
              className="justify-center"
            >
              Ver Estudiantes
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push(`/trips/${id}/incidents`)}
              leftIcon={AlertTriangle}
              className="justify-center"
            >
              Reportar Incidente
            </Button>
          </div>
        </>
      )}

      {activeTab === 'estudiantes' && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Estudiantes</h2>
              <Button
                size="sm"
                onClick={() => router.push(`/trips/${id}/students`)}
              >
                Ver Lista Completa
              </Button>
            </div>

            {students.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No hay estudiantes asignados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.slice(0, 5).map((student: any) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        student.checkedIn ? 'bg-success text-white' :
                        student.status === 'absent' ? 'bg-error text-white' :
                        'bg-gray-200 text-gray-600'
                      )}>
                        {student.firstName?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{student.grade}</p>
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      student.checkedIn ? 'bg-green-100 text-green-700' :
                      student.status === 'absent' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {student.checkedIn ? 'Abordo' : student.status === 'absent' ? 'Ausente' : 'Pendiente'}
                    </span>
                  </div>
                ))}
                {students.length > 5 && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    +{students.length - 5} estudiantes mas
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'paradas' && (
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Paradas ({stopsCount})
            </h2>

            {trip.stops && trip.stops.length > 0 ? (
              <div className="space-y-3">
                {trip.stops.map((stop, index: number) => {
                  const isCompleted = false;
                  const isCurrent = false;
                  const order = index + 1;

                  return (
                    <div key={stop._id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          isCompleted ? 'bg-success text-white' :
                          isCurrent ? 'bg-primary text-white' :
                          'bg-gray-200 text-gray-600'
                        )}>
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : order}
                        </div>
                        {index < trip.stops.length - 1 && (
                          <div className={cn(
                            'w-0.5 h-8 mt-1',
                            isCompleted ? 'bg-success' : 'bg-gray-200'
                          )} />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={cn(
                          'text-sm font-medium',
                          isCompleted ? 'text-gray-400' : 'text-gray-900'
                        )}>
                          {stop.name}
                        </p>
                        <p className="text-xs text-gray-500">{stop.address}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No hay paradas configuradas</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'historial' && (
        <TripHistorialTab tripId={id as Id<"trips">} />
      )}
    </div>
  );
}
