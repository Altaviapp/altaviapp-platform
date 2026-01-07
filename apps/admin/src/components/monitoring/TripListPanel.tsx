'use client';

import { Bus, Clock, Users, Bell, MapPinned } from 'lucide-react';
import { Badge, LoadingState, EmptyState } from '@/components/core';
import { ROUTE_TYPE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ActiveTripWithPosition } from '@/hooks';

interface TripListPanelProps {
  trips: ActiveTripWithPosition[];
  isLoading: boolean;
  selectedTripId: string | null;
  onSelectTrip: (tripId: string) => void;
}

export function TripListPanel({
  trips,
  isLoading,
  selectedTripId,
  onSelectTrip,
}: TripListPanelProps) {
  if (isLoading) {
    return <LoadingState message="Cargando viajes activos..." size="sm" />;
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        icon={Bus}
        title="Sin viajes activos"
        description="No hay viajes en curso en este momento"
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {trips.map((trip) => (
        <TripListItem
          key={trip.tripId}
          trip={trip}
          isSelected={selectedTripId === trip.tripId}
          onSelect={() => onSelectTrip(trip.tripId)}
        />
      ))}
    </div>
  );
}

function TripListItem({
  trip,
  isSelected,
  onSelect,
}: {
  trip: ActiveTripWithPosition;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const routeTypeConfig = ROUTE_TYPE_CONFIG[trip.routeType];
  const hasPendingNovedades = trip.novedadesCount.pending > 0;
  const hasNovedades = trip.novedadesCount.total > 0;
  const hasGps = trip.gps !== null;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-4 text-left transition-colors',
        isSelected
          ? 'bg-primary/10 border-l-4 border-primary'
          : 'hover:bg-gray-50'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              hasGps ? 'bg-green-100' : 'bg-gray-100'
            )}
          >
            <Bus
              className={cn(
                'w-5 h-5',
                hasGps ? 'text-green-600' : 'text-gray-400'
              )}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">{trip.routeName}</p>
            <p className="text-sm text-gray-500">
              {trip.vehiclePlate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
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
              <Bell
                className={cn('w-3 h-3', hasPendingNovedades && 'animate-pulse')}
              />
              {trip.novedadesCount.total}
            </div>
          )}

          {/* GPS status */}
          <Badge variant={hasGps ? 'success' : 'default'} size="sm">
            {hasGps ? 'GPS' : 'Sin GPS'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {trip.scheduledTime}
        </span>
        <span className="flex items-center gap-1">
          <MapPinned className="w-3.5 h-3.5" />
          {routeTypeConfig?.label || trip.routeType}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span className="font-medium text-gray-900">
            {trip.studentsSummary.checkedIn}
          </span>
          /{trip.studentsSummary.expectedToBoard}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 ml-13">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Paradas</span>
          <span>
            {trip.progress.completedStops}/{trip.progress.totalStops}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${
                trip.progress.totalStops > 0
                  ? (trip.progress.completedStops / trip.progress.totalStops) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </button>
  );
}
