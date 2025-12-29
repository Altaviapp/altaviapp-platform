'use client';

import { Bus, Clock, Users, FileText, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/core';
import { cn } from '@/lib/utils';
import { Id } from '../../../../../convex/_generated/dataModel';

export interface ProjectedTripData {
  date: string;
  scheduledTime: string;
  routeId: Id<"routes">;
  routeName: string;
  routeType: "pickup" | "dropoff";
  vehicleId: Id<"vehicles">;
  vehiclePlate: string;
  driverId: Id<"drivers">;
  driverName: string;
  monitorId?: Id<"monitors">;
  monitorName?: string;
  status: "projected" | "scheduled" | "in_progress" | "completed" | "cancelled";
  tripId?: Id<"trips">;
  totalStudents: number;
  novedades: {
    total: number;
    pending: number;
    approved: number;
  };
}

interface ProjectedTripCardProps {
  trip: ProjectedTripData;
  onClick?: () => void;
  showDate?: boolean;
  compact?: boolean;
}

const STATUS_CONFIG = {
  projected: { label: 'Proyectado', variant: 'default' as const, dotColor: 'bg-gray-400' },
  scheduled: { label: 'Programado', variant: 'warning' as const, dotColor: 'bg-yellow-500' },
  in_progress: { label: 'En Ruta', variant: 'success' as const, dotColor: 'bg-green-500' },
  completed: { label: 'Completado', variant: 'default' as const, dotColor: 'bg-blue-500' },
  cancelled: { label: 'Cancelado', variant: 'danger' as const, dotColor: 'bg-red-500' },
};

export function ProjectedTripCard({ trip, onClick, showDate = false, compact = false }: ProjectedTripCardProps) {
  const statusConfig = STATUS_CONFIG[trip.status];

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50 hover:border-gray-300'
      )}
    >
      {/* Time indicator */}
      <div className="flex flex-col items-center min-w-[60px]">
        <div className={cn('w-3 h-3 rounded-full mb-1', statusConfig.dotColor)} />
        <span className="text-sm font-medium text-gray-900">{trip.scheduledTime}</span>
        {showDate && (
          <span className="text-xs text-gray-500">{trip.date}</span>
        )}
      </div>

      {/* Route info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-900 truncate">{trip.routeName}</h4>
          <Badge variant={trip.routeType === 'pickup' ? 'info' : 'purple'} size="sm">
            {trip.routeType === 'pickup' ? 'Recogida' : 'Entrega'}
          </Badge>
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.label}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Bus className="w-4 h-4" />
            {trip.vehiclePlate}
          </span>
          <span>{trip.driverName}</span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {trip.totalStudents}
          </span>
        </div>
      </div>

      {/* Novedades badge */}
      {trip.novedades.total > 0 && (
        <div className="flex items-center gap-2">
          <Badge
            variant={trip.novedades.pending > 0 ? 'warning' : 'info'}
            size="sm"
            icon={FileText}
          >
            {trip.novedades.total}
            {trip.novedades.pending > 0 && (
              <span className="text-xs opacity-80 ml-1">
                ({trip.novedades.pending} pend.)
              </span>
            )}
          </Badge>
        </div>
      )}

      {/* Action indicator */}
      {onClick && (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );
}

// Compact version for timeline
export function ProjectedTripRow({ trip, onClick }: { trip: ProjectedTripData; onClick?: () => void }) {
  const statusConfig = STATUS_CONFIG[trip.status];

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50'
      )}
    >
      <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', statusConfig.dotColor)} />
      <span className="text-sm font-medium text-gray-700 w-14">{trip.scheduledTime}</span>
      <span className="flex-1 text-sm text-gray-900 truncate">{trip.routeName}</span>
      <Badge variant={trip.routeType === 'pickup' ? 'info' : 'purple'} size="sm">
        {trip.routeType === 'pickup' ? 'R' : 'E'}
      </Badge>
      {trip.novedades.total > 0 && (
        <Badge variant={trip.novedades.pending > 0 ? 'warning' : 'info'} size="sm">
          {trip.novedades.total}
        </Badge>
      )}
    </div>
  );
}
