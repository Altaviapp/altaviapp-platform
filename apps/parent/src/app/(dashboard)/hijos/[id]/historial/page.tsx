'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  Bus,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudent, useTripHistory } from '@/hooks';
import type { Id } from '../../../../../../../../convex/_generated/dataModel';
import { LoadingState, EmptyState, Card, CardContent, Button } from '@/components/core';
import { PageHeader } from '@/components/shared';

type PeriodFilter = 7 | 30 | 90;

export default function StudentHistorialPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as Id<"students">;

  const [periodDays, setPeriodDays] = useState<PeriodFilter>(30);

  const { student, isLoading: studentLoading } = useStudent(studentId);
  const { trips, isLoading: tripsLoading, isEmpty } = useTripHistory(studentId, periodDays);

  const isLoading = studentLoading || tripsLoading;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-EC', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Format time from timestamp
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group trips by date
  const groupedTrips = trips.reduce((acc, trip) => {
    const dateKey = trip.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(trip);
    return acc;
  }, {} as Record<string, typeof trips>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedTrips).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Historial de Viajes"
          subtitle="Cargando..."
          backHref={`/hijos/${studentId}`}
        />
        <LoadingState message="Cargando historial..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Historial de Viajes"
          backHref="/hijos"
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Estudiante no encontrado</h2>
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Historial de Viajes"
        subtitle={`${student.firstName} ${student.lastName}`}
        backHref={`/hijos/${studentId}`}
      />

      {/* Period Filter */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 mr-2">Período:</span>
            <div className="flex gap-2">
              {([7, 30, 90] as PeriodFilter[]).map((days) => (
                <Button
                  key={days}
                  type="button"
                  variant={periodDays === days ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPeriodDays(days)}
                >
                  {days === 7 ? '7 días' : days === 30 ? '30 días' : '3 meses'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trips List */}
      {isEmpty ? (
        <EmptyState
          icon={Bus}
          title="Sin viajes en este período"
          description={`No se encontraron viajes en los últimos ${periodDays} días`}
        />
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="space-y-2">
              {/* Date header */}
              <div className="flex items-center gap-2 px-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-700 capitalize">
                  {formatDate(dateKey)}
                </h3>
              </div>

              {/* Trips for this date */}
              <div className="space-y-2">
                {groupedTrips[dateKey]?.map((trip) => (
                  <div
                    key={trip.tripId}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      {/* Trip type and status */}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          trip.type === 'pickup' ? 'bg-green-50' : 'bg-blue-50'
                        )}>
                          <Bus className={cn(
                            'w-5 h-5',
                            trip.type === 'pickup' ? 'text-green-600' : 'text-blue-600'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {trip.type === 'pickup' ? 'Ida al colegio' : 'Vuelta a casa'}
                          </p>
                          <p className="text-xs text-gray-500">{trip.routeName}</p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className={cn(
                        'px-2.5 py-1 rounded-full flex items-center gap-1.5',
                        trip.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : trip.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-50 text-gray-600'
                      )}>
                        {trip.status === 'completed' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : trip.status === 'cancelled' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span className="text-xs font-medium capitalize">
                          {trip.status === 'completed' ? 'Completado' :
                            trip.status === 'cancelled' ? 'Cancelado' :
                              trip.status === 'in_progress' ? 'En curso' : trip.status}
                        </span>
                      </div>
                    </div>

                    {/* Trip details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {/* Times */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {formatTime(trip.startedAt)}
                          {' → '}
                          {formatTime(trip.completedAt)}
                        </span>
                      </div>

                      {/* Driver */}
                      {trip.driverName && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{trip.driverName}</span>
                        </div>
                      )}
                    </div>

                    {/* Student status in trip */}
                    {trip.studentStatus && trip.studentStatus !== 'scheduled' && (
                      <div className={cn(
                        'mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2',
                        trip.studentStatus === 'absent'
                          ? 'bg-orange-50 text-orange-700'
                          : trip.studentStatus === 'parent_pickup'
                            ? 'bg-blue-50 text-blue-700'
                            : trip.studentStatus === 'stop_changed'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-gray-50 text-gray-600'
                      )}>
                        {trip.studentStatus === 'absent' && (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Ausente
                          </>
                        )}
                        {trip.studentStatus === 'parent_pickup' && (
                          <>
                            <User className="w-3.5 h-3.5" />
                            Recogido por padre
                          </>
                        )}
                        {trip.studentStatus === 'stop_changed' && (
                          <>
                            <MapPin className="w-3.5 h-3.5" />
                            Cambio de parada
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
