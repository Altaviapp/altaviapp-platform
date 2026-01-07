'use client';

import Link from 'next/link';
import { Bus, Clock, MapPinned, ArrowRight, Users, Bell, CalendarClock } from 'lucide-react';
import { Card, Badge, LoadingState, EmptyState } from '@/components/core';
import { ROUTE_TYPE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface UpcomingTrip {
  type: 'active' | 'upcoming';
  date: string;
  scheduledTime: string;
  routeId: string;
  routeName: string;
  routeType: 'pickup' | 'dropoff';
  vehiclePlate: string;
  driverName: string;
  status: string;
  tripId?: string;
  totalStudents: number;
  novedadesCount: { total: number; pending: number };
  studentsSummary: { checkedIn: number; expectedToBoard: number };
}

interface UpcomingTripsCardProps {
  trips: UpcomingTrip[];
  isLoading: boolean;
}

export function UpcomingTripsCard({ trips, isLoading }: UpcomingTripsCardProps) {
  // Only show upcoming trips (not active)
  const upcomingTrips = trips.filter((t) => t.type === 'upcoming');

  const getStatusBadge = (status: string) => {
    if (status === 'scheduled') {
      return { label: 'Programado', variant: 'warning' as const };
    }
    return { label: 'Proyectado', variant: 'default' as const };
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Viajes Próximos
          </h2>
          {upcomingTrips.length > 0 && (
            <span className="text-sm text-gray-500">
              (próximas 6 horas)
            </span>
          )}
        </div>
        <Link
          href="/trips"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          Ver calendario
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando viajes..." size="sm" />
      ) : upcomingTrips.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Sin viajes próximos"
          description="No hay viajes programados para las próximas horas"
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {upcomingTrips.slice(0, 6).map((trip) => (
            <UpcomingTripRow
              key={`upcoming-${trip.routeId}-${trip.scheduledTime}`}
              trip={trip}
              statusBadge={getStatusBadge(trip.status)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function UpcomingTripRow({
  trip,
  statusBadge,
}: {
  trip: UpcomingTrip;
  statusBadge: { label: string; variant: 'default' | 'warning' };
}) {
  const routeTypeConfig = ROUTE_TYPE_CONFIG[trip.routeType];
  const hasPendingNovedades = trip.novedadesCount.pending > 0;
  const hasNovedades = trip.novedadesCount.total > 0;

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
            <Bus className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {trip.routeName}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{trip.vehiclePlate}</span>
              <span className="text-gray-300">|</span>
              <span>{trip.driverName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Novedad indicator */}
          {hasNovedades && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                hasPendingNovedades
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              )}
              title={hasPendingNovedades
                ? `${trip.novedadesCount.pending} novedad(es) pendiente(s) de revisar`
                : `${trip.novedadesCount.total} novedad(es)`
              }
            >
              <Bell className={cn('w-3 h-3', hasPendingNovedades && 'animate-pulse')} />
              {trip.novedadesCount.total}
              {hasPendingNovedades && (
                <span className="ml-0.5 text-amber-800">
                  ({trip.novedadesCount.pending})
                </span>
              )}
            </div>
          )}
          <Badge variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {trip.scheduledTime}
        </span>
        <span className="flex items-center gap-1">
          <MapPinned className="w-4 h-4" />
          {routeTypeConfig?.label || trip.routeType}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {trip.totalStudents} estudiantes
        </span>
      </div>
    </div>
  );
}
