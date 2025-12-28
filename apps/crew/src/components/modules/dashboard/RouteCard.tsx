'use client';

import Link from 'next/link';
import { Sunrise, Sunset, Clock, MapPin, Users, Bus, Play, CheckCircle } from 'lucide-react';
import { Card, Badge, Button } from '@/components/core';
import { TRIP_STATUS_CONFIG, ROUTE_TYPE_CONFIG } from '@/lib/constants';
import { formatDuration, formatDistance } from '@/lib/format';

export interface RouteForTodayDisplay {
  _id: string;
  name: string;
  type: 'pickup' | 'dropoff';
  scheduledStartTime: string;
  scheduledEndTime: string;
  schoolArrivalTime?: string;
  schoolDepartureTime?: string;
  optimizedPolyline?: string;
  estimatedDuration?: number;
  estimatedDistance?: number;
  vehicle: { licensePlate: string; brand: string; model: string } | null;
  studentCount: number;
  tripStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | null;
  tripId: string | null;
  canStart: boolean;
}

interface RouteCardProps {
  route: RouteForTodayDisplay;
  variant?: 'primary' | 'secondary';
}

export function RouteCard({ route, variant = 'secondary' }: RouteCardProps) {
  const isPickup = route.type === 'pickup';
  const Icon = isPickup ? Sunrise : Sunset;
  const routeTypeConfig = ROUTE_TYPE_CONFIG[route.type];
  const targetTime = isPickup ? route.schoolArrivalTime : route.schoolDepartureTime;

  const tripStatusConfig = route.tripStatus ? TRIP_STATUS_CONFIG[route.tripStatus] : null;

  return (
    <Card padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={isPickup ? 'w-5 h-5 text-yellow-500' : 'w-5 h-5 text-blue-500'} />
          <Badge variant={routeTypeConfig.variant} size="sm">
            {routeTypeConfig.label}
          </Badge>
        </div>
        {tripStatusConfig ? (
          <Badge variant={tripStatusConfig.variant} size="sm" dot>
            {tripStatusConfig.label}
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            Disponible
          </Badge>
        )}
      </div>

      {/* Route Name */}
      <h3 className="text-lg font-semibold text-gray-900">
        {route.name}
      </h3>

      {/* Route Details */}
      <div className="space-y-2 text-sm text-gray-600">
        {/* Schedule */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {route.scheduledStartTime} - {route.scheduledEndTime}
            {targetTime && (
              <span className="text-gray-400 ml-1">
                ({isPickup ? 'Llega' : 'Sale'}: {targetTime})
              </span>
            )}
          </span>
        </div>

        {/* Duration & Distance */}
        {(route.estimatedDuration || route.estimatedDistance) && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>
              {route.estimatedDuration && formatDuration(route.estimatedDuration)}
              {route.estimatedDuration && route.estimatedDistance && ' · '}
              {route.estimatedDistance && formatDistance(route.estimatedDistance)}
            </span>
          </div>
        )}

        {/* Students */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>{route.studentCount} estudiantes</span>
        </div>

        {/* Vehicle */}
        {route.vehicle && (
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 flex-shrink-0" />
            <span>
              {route.vehicle.licensePlate} - {route.vehicle.brand} {route.vehicle.model}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {route.canStart && (
        <Link href={`/routes/${route._id}/start`} className="block">
          <Button variant="primary" size="lg" leftIcon={Play} className="w-full">
            Iniciar Viaje
          </Button>
        </Link>
      )}

      {route.tripStatus === 'in_progress' && route.tripId && (
        <Link href={`/trips/${route.tripId}/active`} className="block">
          <Button variant="primary" size="lg" leftIcon={Bus} className="w-full">
            Ver Viaje Activo
          </Button>
        </Link>
      )}

      {route.tripStatus === 'completed' && (
        <div className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-600 font-medium py-3 px-4 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          Viaje Completado
        </div>
      )}

      {!route.canStart && !route.tripStatus && (
        <p className="text-center text-sm text-gray-500 py-2">
          Ruta no disponible
        </p>
      )}
    </Card>
  );
}
