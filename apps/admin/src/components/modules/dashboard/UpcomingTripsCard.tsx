'use client';

import Link from 'next/link';
import { Bus, Clock, MapPinned, ArrowRight, Users } from 'lucide-react';
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
}

interface UpcomingTripsCardProps {
  trips: UpcomingTrip[];
  isLoading: boolean;
}

export function UpcomingTripsCard({ trips, isLoading }: UpcomingTripsCardProps) {
  const getStatusBadge = (type: 'active' | 'upcoming', status: string) => {
    if (type === 'active') {
      return { label: 'En curso', variant: 'info' as const, dot: true };
    }
    if (status === 'scheduled') {
      return { label: 'Programado', variant: 'warning' as const, dot: false };
    }
    return { label: 'Proyectado', variant: 'default' as const, dot: false };
  };

  const activeTrips = trips.filter((t) => t.type === 'active');
  const upcomingTrips = trips.filter((t) => t.type === 'upcoming');

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Viajes Activos y Próximos
        </h2>
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
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="Sin viajes próximos"
          description="No hay viajes activos ni programados para las próximas horas"
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {/* Active trips first */}
          {activeTrips.map((trip) => (
            <TripRow key={`active-${trip.routeId}`} trip={trip} getStatusBadge={getStatusBadge} />
          ))}

          {/* Separator if both exist */}
          {activeTrips.length > 0 && upcomingTrips.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Próximas 6 horas
            </div>
          )}

          {/* Upcoming trips (max 5) */}
          {upcomingTrips.slice(0, 5).map((trip) => (
            <TripRow key={`upcoming-${trip.routeId}-${trip.scheduledTime}`} trip={trip} getStatusBadge={getStatusBadge} />
          ))}
        </div>
      )}
    </Card>
  );
}

function TripRow({
  trip,
  getStatusBadge,
}: {
  trip: UpcomingTrip;
  getStatusBadge: (type: 'active' | 'upcoming', status: string) => { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; dot: boolean };
}) {
  const statusBadge = getStatusBadge(trip.type, trip.status);
  const routeTypeConfig = ROUTE_TYPE_CONFIG[trip.routeType];

  return (
    <div className={cn(
      'p-4 hover:bg-gray-50 transition-colors',
      trip.type === 'active' && 'bg-blue-50/30'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            trip.type === 'active' ? 'bg-blue-100' : 'bg-gray-100'
          )}>
            <Bus className={cn(
              'w-5 h-5',
              trip.type === 'active' ? 'text-blue-600' : 'text-gray-600'
            )} />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {trip.routeName}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{trip.vehiclePlate}</span>
              <span className="text-gray-300">•</span>
              <span>{trip.driverName}</span>
            </div>
          </div>
        </div>
        <Badge variant={statusBadge.variant} dot={statusBadge.dot}>
          {statusBadge.label}
        </Badge>
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
