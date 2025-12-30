'use client';

import { Bus, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UpcomingTrip } from '@/hooks/useProjectedTrips';

interface UpcomingTripCardProps {
  trip: UpcomingTrip;
}

/**
 * UpcomingTripCard - Card for displaying upcoming trips in dashboard
 *
 * Shows:
 * - Student photo and name
 * - Scheduled time and relative time ("en 2 horas")
 * - Route name and type (ida/vuelta)
 * - Novedad indicator if applicable
 */
export function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
  // Get initials for avatar fallback
  const initials = trip.studentName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Format relative time (e.g., "en 2 horas", "en 30 min")
  const formatRelativeTime = (scheduledTime: string): string => {
    const now = new Date();
    const parts = scheduledTime.split(':');
    const hours = parseInt(parts[0] ?? '0', 10);
    const minutes = parseInt(parts[1] ?? '0', 10);
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    // If scheduled time is earlier than now, it might be tomorrow
    if (scheduled < now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const diffMs = scheduled.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    if (diffMinutes < 60) {
      return `en ${diffMinutes} min`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours === 1) {
      return 'en 1 hora';
    }
    return `en ${diffHours} horas`;
  };

  const relativeTime = formatRelativeTime(trip.scheduledTime);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {trip.studentPhoto ? (
            <img
              src={trip.studentPhoto}
              alt={trip.studentName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{trip.studentName}</h3>
              <p className="text-sm text-gray-500">
                {trip.scheduledTime} ({relativeTime})
              </p>
            </div>

            {/* Time badge */}
            <div className="px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-blue-50">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              <span className="text-xs font-medium text-blue-700">Próximo</span>
            </div>
          </div>

          {/* Route info */}
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Bus className="w-4 h-4 text-gray-400" />
            <span>{trip.routeName}</span>
            <span className="text-gray-300">•</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                trip.routeType === 'pickup'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-orange-50 text-orange-700'
              )}
            >
              {trip.routeType === 'pickup' ? 'Ida' : 'Vuelta'}
            </span>
          </div>

          {/* Stop and driver info */}
          <div className="mt-2 text-sm text-gray-500">
            <span>{trip.stopName}</span>
            {trip.driverName && (
              <>
                <span className="mx-2 text-gray-300">•</span>
                <span>{trip.driverName}</span>
              </>
            )}
          </div>

          {/* Novedad indicator */}
          {trip.hasNovedad && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700 font-medium">
                Novedad activa
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
