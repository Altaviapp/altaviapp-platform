'use client';

import { useState } from 'react';
import { Bus, Clock, MapPin, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NovedadContextButton } from '@/components/home/NovedadContextButton';
import { Id } from '../../../../../convex/_generated/dataModel';

interface TripScheduleItemProps {
  studentId: Id<"students">;
  studentName: string;
  studentPhoto?: string | null;
  routeName: string;
  routeType: 'pickup' | 'dropoff';
  stopName: string;
  scheduledTime: string;
  date?: string; // For future novedades
  hasNovedad?: boolean;
  novedadStatus?: 'pending' | 'approved' | 'rejected';
}

export function TripScheduleItem({
  studentId,
  studentName,
  studentPhoto,
  routeName,
  routeType,
  stopName,
  scheduledTime,
  date,
  hasNovedad,
  novedadStatus,
}: TripScheduleItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      {/* Main row */}
      <button
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
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
        <div className="flex-1 min-w-0 text-left">
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

        {/* Expand icon */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100">
          <div className="pt-3 space-y-3">
            {/* Stop info */}
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2.5">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Parada</p>
                <p className="text-sm text-gray-600">{stopName}</p>
              </div>
            </div>

            {/* Route type badge and scheduled time */}
            <div className="flex items-center justify-between">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                routeType === 'pickup'
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
              )}>
                <Bus className="w-3.5 h-3.5" />
                <span>{routeType === 'pickup' ? 'Recogida (Ida)' : 'Entrega (Vuelta)'}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDisplayTime(scheduledTime)}</span>
              </div>
            </div>

            {/* Novedad button */}
            <NovedadContextButton
              studentId={studentId}
              date={date}
              routeType={routeType}
              variant="full"
              label="Reportar novedad para este viaje"
            />
          </div>
        </div>
      )}
    </div>
  );
}
