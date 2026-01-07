'use client';

import Link from 'next/link';
import { Bus, Clock, MapPinned, Users, Bell, Map, ArrowRight } from 'lucide-react';
import { Card, Badge, LoadingState, EmptyState } from '@/components/core';
import { ROUTE_TYPE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ActiveTrip {
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

interface ActiveTripsCardProps {
  trips: ActiveTrip[];
  isLoading: boolean;
}

export function ActiveTripsCard({ trips, isLoading }: ActiveTripsCardProps) {
  // Only show active (in_progress) trips
  const activeTrips = trips.filter((t) => t.type === 'active');

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Viajes Activos
          </h2>
          {activeTrips.length > 0 && (
            <Badge variant="info" dot>
              {activeTrips.length}
            </Badge>
          )}
        </div>
        <Link
          href="/dashboard/monitoring"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          <Map className="w-4 h-4" />
          Monitorear
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando viajes activos..." size="sm" />
      ) : activeTrips.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Bus}
            title="Sin viajes activos"
            description="No hay viajes en curso en este momento"
          />
          <div className="px-4 pb-4">
            <Link
              href="/dashboard/monitoring"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium text-sm"
            >
              <Map className="w-4 h-4" />
              Abrir página de monitoreo
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {activeTrips.slice(0, 5).map((trip) => (
            <ActiveTripRow key={`active-${trip.routeId}`} trip={trip} />
          ))}

          {/* Monitor all button at bottom */}
          {activeTrips.length > 0 && (
            <div className="p-3 bg-gray-50">
              <Link
                href="/dashboard/monitoring"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <Map className="w-4 h-4" />
                Ver mapa en tiempo real
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ActiveTripRow({ trip }: { trip: ActiveTrip }) {
  const routeTypeConfig = ROUTE_TYPE_CONFIG[trip.routeType];
  const hasPendingNovedades = trip.novedadesCount.pending > 0;
  const hasNovedades = trip.novedadesCount.total > 0;

  return (
    <Link
      href={trip.tripId ? `/trips/${trip.tripId}` : '#'}
      className="block p-4 hover:bg-gray-50 transition-colors bg-blue-50/30"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <Bus className="w-5 h-5 text-blue-600" />
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
          <Badge variant="info" dot>
            En curso
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
          <span className="font-medium text-gray-900">
            {trip.studentsSummary.checkedIn}
          </span>
          <span>/</span>
          <span>{trip.studentsSummary.expectedToBoard}</span>
        </span>
      </div>
    </Link>
  );
}
