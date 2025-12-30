'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Id } from '../../../../../convex/_generated/dataModel';

interface TripScheduleItemProps {
  studentId: Id<"students">;
  studentName: string;
  studentPhoto?: string | null;
  routeId: Id<"routes">;
  routeName: string;
  routeType: 'pickup' | 'dropoff';
  stopName: string;
  scheduledTime: string;
  date: string; // YYYY-MM-DD format
  tripId?: Id<"trips">; // Only exists if trip has started
  hasNovedad?: boolean;
  novedadStatus?: 'pending' | 'approved' | 'rejected';
}

export function TripScheduleItem({
  studentId,
  studentName,
  studentPhoto,
  routeId,
  routeName,
  routeType,
  stopName,
  scheduledTime,
  date,
  tripId,
  hasNovedad,
  novedadStatus,
}: TripScheduleItemProps) {
  const router = useRouter();

  // Get initials for avatar fallback
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Format time for display (assumes HH:mm format)
  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // Navigate to trip detail page
  const handleClick = () => {
    if (tripId) {
      // Real trip exists - navigate to trip detail
      router.push(`/trips/${tripId}?studentId=${studentId}`);
    } else {
      // Projected trip - navigate to scheduled trip page with all context
      const params = new URLSearchParams({
        routeId,
        date,
        studentId,
        routeName,
        routeType,
        stopName,
        scheduledTime,
        ...(hasNovedad && { hasNovedad: 'true' }),
        ...(novedadStatus && { novedadStatus }),
      });
      router.push(`/trips/scheduled?${params.toString()}`);
    }
  };

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

      {/* Student avatar */}
      <div className="flex-shrink-0">
        {studentPhoto ? (
          <img
            src={studentPhoto}
            alt={studentName}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-xs">{initials}</span>
          </div>
        )}
      </div>

      {/* Trip info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{studentName}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {routeType === 'pickup' ? (
            <ArrowRight className="w-3 h-3 text-green-600" />
          ) : (
            <ArrowLeft className="w-3 h-3 text-blue-600" />
          )}
          <span>{routeType === 'pickup' ? 'Ida' : 'Vuelta'}</span>
          <span className="text-gray-300">•</span>
          <span className="truncate">{routeName}</span>
        </div>
      </div>

      {/* Novedad indicator */}
      {hasNovedad && (
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            novedadStatus === 'approved'
              ? 'bg-green-50 text-green-700'
              : novedadStatus === 'rejected'
                ? 'bg-red-50 text-red-700'
                : 'bg-yellow-50 text-yellow-700'
          )}
        >
          {novedadStatus === 'approved' ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertTriangle className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">
            {novedadStatus === 'approved'
              ? 'Aprobada'
              : novedadStatus === 'rejected'
                ? 'Rechazada'
                : 'Pendiente'}
          </span>
        </div>
      )}

      {/* Navigate icon */}
      <div className="flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </button>
  );
}
