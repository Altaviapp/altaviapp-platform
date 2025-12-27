'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sunrise, Sunset, Clock, MapPin, Users, Bus, Play, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrip, useTripStudents } from '@/hooks';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
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
  const { id } = use(params);
  const { trip, isLoading: tripLoading } = useTrip(id as Id<"trips">);
  const { students, isLoading: studentsLoading } = useTripStudents(id);

  const isLoading = tripLoading || studentsLoading;

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (!trip) {
    return (
      <EmptyState
        icon={MapPin}
        title="Viaje no encontrado"
        description="El viaje que buscas no existe o no tienes acceso."
        action={
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a viajes
          </Link>
        }
      />
    );
  }

  const isPickup = trip.route?.type === 'pickup';
  const Icon = isPickup ? Sunrise : Sunset;
  const typeBadge = isPickup ? 'RECOGIDA' : 'ENTREGA';
  const typeColor = isPickup ? 'text-warning' : 'text-info';

  const tripStatus = trip.status ?? 'scheduled';
  const status = statusConfig[tripStatus] ?? statusConfig.scheduled!;
  const StatusIcon = status.icon;

  const isActive = trip.status === 'in_progress';
  const isScheduled = trip.status === 'scheduled';

  // Calculate student stats
  const totalStudents = students.length;
  const checkedInStudents = students.filter((s: { checkedIn?: boolean }) => s.checkedIn).length;
  const absentStudents = students.filter((s: { status?: string }) => s.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/trips"
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
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', status.color)}>
              {status.label}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {trip.route?.name || 'Viaje'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {trip.scheduledDate}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {isActive && (
        <Link
          href={`/trips/${id}/active`}
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-4 rounded-xl text-center transition-colors"
        >
          <Bus className="w-5 h-5" />
          VER VIAJE ACTIVO
        </Link>
      )}

      {isScheduled && (
        <Link
          href={`/trips/${id}/start`}
          className="flex items-center justify-center gap-2 w-full bg-success hover:bg-success/90 text-white font-bold py-4 px-4 rounded-xl text-center transition-colors"
        >
          <Play className="w-5 h-5" />
          INICIAR VIAJE
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalStudents}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-success">{checkedInStudents}</p>
          <p className="text-xs text-gray-500">Check-in</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-error">{absentStudents}</p>
          <p className="text-xs text-gray-500">Ausentes</p>
        </div>
      </div>

      {/* Trip Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Viaje</h2>

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
                <p className="text-xs text-gray-500">Vehículo asignado</p>
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
                <p className="text-xs text-gray-500">Hora de finalización</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stops Progress */}
      {trip.stops && trip.stops.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Paradas ({trip.stops.length})
          </h2>

          <div className="space-y-3">
            {trip.stops.map((stop, index: number) => {
              // TODO: Get stop completion status from trip data
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
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/trips/${id}/students`}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <Users className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-gray-900">Ver Estudiantes</span>
        </Link>
        <Link
          href={`/trips/${id}/incidents`}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <AlertTriangle className="w-5 h-5 text-warning" />
          <span className="text-sm font-medium text-gray-900">Reportar Incidente</span>
        </Link>
      </div>
    </div>
  );
}
