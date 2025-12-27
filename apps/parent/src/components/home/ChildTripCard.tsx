'use client';

import { useState } from 'react';
import { Bus, MapPin, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentTracking } from '@/hooks/useMyStudents';
import { ActiveTripView } from './ActiveTripView';
import { NovedadContextButton } from './NovedadContextButton';
import { Id } from '../../../../../convex/_generated/dataModel';

interface ChildTripCardProps {
  student: {
    _id: Id<"students">;
    firstName: string;
    lastName: string;
    grade?: string;
    section?: string;
    photoUrl?: string | null;
  };
}

type TripStatus = 'active' | 'scheduled' | 'at_home' | 'at_school' | 'completed';

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  icon: typeof Bus;
}

const statusConfigs: Record<TripStatus, StatusConfig> = {
  active: {
    label: 'En Viaje',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: Bus,
  },
  scheduled: {
    label: 'Programado',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: Clock,
  },
  at_home: {
    label: 'En Casa',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: MapPin,
  },
  at_school: {
    label: 'En el Colegio',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: MapPin,
  },
  completed: {
    label: 'Viaje Completado',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    icon: Bus,
  },
};

export function ChildTripCard({ student }: ChildTripCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { tracking, hasActiveTrip, isLoading, progress, etaMinutes, etaTime, delayStatus } = useStudentTracking(student._id);

  // Determine status based on tracking data
  const getStatus = (): TripStatus => {
    if (isLoading) return 'at_home';
    if (hasActiveTrip && tracking) {
      const tripStatus = tracking.trip?.status;
      if (tripStatus === 'in_progress') return 'active';
      if (tripStatus === 'completed') return 'completed';
    }
    return 'at_home';
  };

  const status = getStatus();
  const config = statusConfigs[status];
  const StatusIcon = config.icon;

  // Get initials for avatar fallback
  const initials = `${student.firstName[0] ?? ''}${student.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main card content */}
      <div
        className={cn(
          "p-4 cursor-pointer transition-colors",
          hasActiveTrip && "hover:bg-gray-50"
        )}
        onClick={() => hasActiveTrip && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </h3>
                {student.grade && (
                  <p className="text-sm text-gray-500">
                    {student.grade}{student.section ? ` - ${student.section}` : ''}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <div className={cn(
                "px-2.5 py-1 rounded-full flex items-center gap-1.5",
                config.bgColor
              )}>
                <StatusIcon className={cn("w-3.5 h-3.5", config.textColor)} />
                <span className={cn("text-xs font-medium", config.textColor)}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* Active trip info */}
            {hasActiveTrip && tracking && (
              <div className="mt-3 space-y-2">
                {/* Route info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bus className="w-4 h-4 text-gray-400" />
                  <span>{tracking.route?.name ?? 'Ruta'}</span>
                  <span className="text-gray-300">•</span>
                  <span className="capitalize">
                    {tracking.route?.type === 'pickup' ? 'Ida' : 'Vuelta'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium w-10 text-right">
                    {Math.round(progress)}%
                  </span>
                </div>

                {/* ETA and driver */}
                <div className="flex items-center justify-between text-sm">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg",
                    !delayStatus || delayStatus.status === 'on_time'
                      ? 'bg-green-50 text-green-700'
                      : delayStatus.status === 'slight_delay'
                        ? 'bg-yellow-50 text-yellow-700'
                        : delayStatus.status === 'delayed'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-red-50 text-red-700'
                  )}>
                    <Clock className="w-4 h-4" />
                    {etaMinutes !== null ? (
                      <span className="font-medium">
                        ~{etaMinutes} min
                        {etaTime && <span className="opacity-75 ml-1">({etaTime})</span>}
                      </span>
                    ) : (
                      <span>Calculando...</span>
                    )}
                    {delayStatus?.isDelayed && (
                      <span className="text-xs opacity-75">
                        (+{delayStatus.delayMinutes} min)
                      </span>
                    )}
                  </div>
                  {tracking.driver && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-xs">{tracking.driver.name}</span>
                    </div>
                  )}
                </div>

                {/* Expand button */}
                <button
                  className="w-full flex items-center justify-center gap-1 pt-2 text-sm text-primary font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Ocultar mapa
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Ver en mapa
                    </>
                  )}
                </button>
              </div>
            )}

            {/* No active trip - show novedad option */}
            {!hasActiveTrip && !isLoading && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-500">Sin viaje activo</p>
                <NovedadContextButton
                  studentId={student._id}
                  variant="small"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded view with map */}
      {isExpanded && hasActiveTrip && tracking && (
        <ActiveTripView
          tracking={tracking}
          studentId={student._id}
          studentName={`${student.firstName} ${student.lastName}`}
        />
      )}
    </div>
  );
}
