'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, Sunrise, Sunset, Users, AlertTriangle, Bus, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Id } from '../../../../../convex/_generated/dataModel';

interface RouteScheduleItemProps {
  routeId: Id<"routes">;
  routeName: string;
  routeType: 'pickup' | 'dropoff';
  vehiclePlate: string;
  scheduledTime: string;
  date: string; // YYYY-MM-DD format
  status: 'projected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  tripId?: Id<"trips">;
  studentCount: number;
  novedadCount: number;
  role: 'driver' | 'monitor' | 'both';
}

const STATUS_CONFIG = {
  projected: { label: 'Programado', color: 'bg-gray-100 text-gray-600' },
  scheduled: { label: 'Programado', color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'En Ruta', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export function RouteScheduleItem({
  routeId,
  routeName,
  routeType,
  vehiclePlate,
  scheduledTime,
  date,
  status,
  tripId,
  studentCount,
  novedadCount,
  role,
}: RouteScheduleItemProps) {
  const router = useRouter();

  // Format time for display (assumes HH:mm format)
  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // Check if this trip can be started (is today and hasn't started)
  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  const canStart = isToday && (status === 'projected' || status === 'scheduled');

  // Navigate to appropriate page
  const handleClick = () => {
    if (status === 'in_progress' && tripId) {
      // Active trip - go to active page
      router.push(`/trips/${tripId}/active`);
    } else if (tripId && (status === 'completed' || status === 'cancelled')) {
      // Completed/cancelled trip - go to trip detail
      router.push(`/trips/${tripId}`);
    } else if (tripId && status === 'scheduled') {
      // Scheduled trip (created but not started) - go to trip detail
      router.push(`/trips/${tripId}`);
    } else if (canStart) {
      // Today's projected trip - go to route page to start
      router.push(`/routes/${routeId}`);
    } else {
      // Future projected trip - go to scheduled detail page
      router.push(`/routes/${routeId}/scheduled?date=${date}`);
    }
  };

  const Icon = routeType === 'pickup' ? Sunrise : Sunset;
  const typeColor = routeType === 'pickup' ? 'text-amber-600 bg-amber-100' : 'text-sky-600 bg-sky-100';
  const statusConfig = STATUS_CONFIG[status];

  return (
    <button
      className="w-full bg-white rounded-lg border border-gray-100 overflow-hidden flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
      onClick={handleClick}
    >
      {/* Time */}
      <div className="w-14 text-center">
        <span className="text-sm font-semibold text-gray-900">
          {formatDisplayTime(scheduledTime)}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-gray-200" />

      {/* Route type icon */}
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', typeColor)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Route info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{routeName}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Bus className="w-3 h-3" />
          <span>{vehiclePlate}</span>
          <span className="text-gray-300">|</span>
          <Users className="w-3 h-3" />
          <span>{studentCount}</span>
        </div>
      </div>

      {/* Novedad indicator */}
      {novedadCount > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
          <AlertTriangle className="w-3 h-3" />
          <span>{novedadCount}</span>
        </div>
      )}

      {/* Status badge or Start indicator */}
      {canStart ? (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          <Play className="w-3 h-3" />
          <span className="hidden sm:inline">Iniciar</span>
        </div>
      ) : status !== 'projected' && status !== 'scheduled' ? (
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusConfig.color)}>
          {statusConfig.label}
        </span>
      ) : null}

      {/* Navigate icon */}
      <div className="flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </button>
  );
}
