'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bus, Clock, MapPin, MapPinned, Navigation, ArrowRight } from 'lucide-react';
import { Card, Badge, LoadingState, EmptyState } from '@/components/core';
import { TRIP_STATUS_CONFIG, ROUTE_TYPE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Trip {
  _id: string;
  status: string;
  routeName?: string;
  vehiclePlate?: string;
  scheduledDate?: string;
  routeType?: 'pickup' | 'dropoff';
}

interface ActiveTripsCardProps {
  trips: Trip[];
  isLoading: boolean;
}

export function ActiveTripsCard({ trips, isLoading }: ActiveTripsCardProps) {
  const router = useRouter();

  const getStatusConfig = (status: string) => {
    const config = TRIP_STATUS_CONFIG[status as keyof typeof TRIP_STATUS_CONFIG];
    return config || TRIP_STATUS_CONFIG.scheduled;
  };

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Viajes en Tiempo Real
        </h2>
        <Link
          href="/trips"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando viajes..." size="sm" />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="Sin viajes activos"
          description="No hay viajes activos en este momento"
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {trips.slice(0, 3).map((trip) => {
            const statusConfig = getStatusConfig(trip.status);
            const routeTypeConfig = trip.routeType
              ? ROUTE_TYPE_CONFIG[trip.routeType]
              : null;

            return (
              <div
                key={trip._id}
                onClick={() => router.push(`/trips/${trip._id}`)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {trip.routeName || 'Sin ruta'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vehículo: {trip.vehiclePlate || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusVariant(trip.status)}
                    dot
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                  {trip.scheduledDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {trip.scheduledDate}
                    </span>
                  )}
                  {routeTypeConfig && (
                    <span className="flex items-center gap-1">
                      <MapPinned className="w-4 h-4" />
                      {routeTypeConfig.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/trips/${trip._id}#map`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Ver en mapa
                  </Link>
                  <Link
                    href={`/trips/${trip._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Detalles
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
