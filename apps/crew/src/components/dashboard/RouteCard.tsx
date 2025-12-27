import Link from 'next/link';
import { Sunrise, Sunset, Clock, MapPin, Users, Bus, Play, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Route type matching what useConvexDashboard returns
interface RouteForTodayDisplay {
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

const statusConfig = {
  scheduled: { label: 'PROGRAMADO', color: 'bg-info/10 text-info' },
  in_progress: { label: 'EN CURSO', color: 'bg-success/10 text-success' },
  completed: { label: 'COMPLETADO', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'CANCELADO', color: 'bg-error/10 text-error' },
};

export function RouteCard({ route, variant = 'secondary' }: RouteCardProps) {
  const isPickup = route.type === 'pickup';
  const Icon = isPickup ? Sunrise : Sunset;
  const typeBadge = isPickup ? 'RUTA DE RECOGIDA' : 'RUTA DE ENTREGA';
  const targetTime = isPickup ? route.schoolArrivalTime : route.schoolDepartureTime;

  // Determine status display
  const statusInfo = route.tripStatus ? statusConfig[route.tripStatus] : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={isPickup ? 'w-5 h-5 text-warning' : 'w-5 h-5 text-info'} />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {typeBadge}
          </span>
        </div>
        {statusInfo ? (
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusInfo.color)}>
            {statusInfo.label}
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
            DISPONIBLE
          </span>
        )}
      </div>

      {/* Route Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {route.name}
      </h3>

      {/* Route Details */}
      <div className="space-y-2 mb-4">
        {/* Schedule */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
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
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {route.estimatedDuration && `${route.estimatedDuration} min`}
              {route.estimatedDuration && route.estimatedDistance && ' · '}
              {route.estimatedDistance && `${(route.estimatedDistance / 1000).toFixed(1)} km`}
            </span>
          </div>
        )}

        {/* Students */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{route.studentCount} estudiantes asignados</span>
        </div>

        {/* Vehicle */}
        {route.vehicle && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bus className="w-4 h-4" />
            <span>
              {route.vehicle.licensePlate} - {route.vehicle.brand} {route.vehicle.model}
            </span>
          </div>
        )}
      </div>

      {/* Action Button - Both roles can start trips */}
      {route.canStart && (
        // Route can be started - go to preview page
        <Link
          href={`/routes/${route._id}/start`}
          className="flex items-center justify-center gap-2 w-full bg-success hover:bg-success/90 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
        >
          <Play className="w-5 h-5" />
          INICIAR VIAJE
        </Link>
      )}

      {route.tripStatus === 'in_progress' && route.tripId && (
        // Trip in progress - view active trip
        <Link
          href={`/trips/${route.tripId}/active`}
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
        >
          <Bus className="w-5 h-5" />
          VER VIAJE ACTIVO
        </Link>
      )}

      {route.tripStatus === 'completed' && (
        // Trip completed
        <div className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-600 font-medium py-3 px-4 rounded-lg text-center">
          <CheckCircle className="w-5 h-5" />
          VIAJE COMPLETADO
        </div>
      )}

      {!route.canStart && !route.tripStatus && (
        // Cannot start (already has a scheduled trip from legacy system)
        <div className="text-center text-sm text-gray-500 py-2">
          Ruta no disponible para iniciar
        </div>
      )}
    </div>
  );
}
