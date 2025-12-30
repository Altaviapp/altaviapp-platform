/**
 * NextStopCard Component
 *
 * Displays next stop information with students list, distance, ETA, navigation,
 * and individual check-in buttons per student
 */

import { MapPin, Navigation, Clock, Users, Camera, CheckCircle, AlertCircle, User } from 'lucide-react';
import { formatDistance } from '@/lib/utils/tripCalculations';
import { cn } from '@/lib/utils';

/** Minimal stop info needed for the card */
interface StopInfo {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface StudentWithStatus {
  _id: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'checked_in' | 'checked_out' | 'absent' | 'parent_pickup';
  novedad?: { typeCategory: string } | null;
}

export interface NextStopCardProps {
  /** Next stop details */
  stop: StopInfo;
  /** Stop number in sequence */
  stopNumber: number;
  /** Distance to stop in kilometers */
  distanceKm: number;
  /** Estimated time of arrival string */
  eta: string;
  /** Students at this stop with status */
  students?: StudentWithStatus[];
  /** Route type (pickup or dropoff) */
  routeType?: 'pickup' | 'dropoff';
  /** Handler for navigate button click */
  onNavigate?: () => void;
  /** Handler for student check-in */
  onCheckin?: (studentId: string) => void;
}

// Status configuration
const statusConfig = {
  pending: { icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-100', label: 'Pendiente' },
  checked_in: { icon: CheckCircle, color: 'text-primary', bgColor: 'bg-primary/10', label: 'A bordo' },
  checked_out: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10', label: 'Entregado' },
  absent: { icon: AlertCircle, color: 'text-error', bgColor: 'bg-error/10', label: 'Ausente' },
  parent_pickup: { icon: User, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Recoge padre' },
};

/**
 * Card displaying next stop information with check-in functionality
 */
export function NextStopCard({
  stop,
  stopNumber,
  distanceKm,
  eta,
  students = [],
  routeType = 'pickup',
  onNavigate,
  onCheckin,
}: NextStopCardProps) {
  // Filter out absent and parent_pickup students for check-in
  const checkableStudents = students.filter(
    (s) => s.status !== 'absent' && s.status !== 'parent_pickup'
  );
  const nonCheckableStudents = students.filter(
    (s) => s.status === 'absent' || s.status === 'parent_pickup'
  );

  return (
    <div className="bg-white border-2 border-primary/20 rounded-xl p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Stop Number Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">
              PARADA {stopNumber}
            </span>
          </div>

          {/* Stop Name */}
          <h3 className="text-base font-bold text-gray-900 mb-0.5">
            {stop.name}
          </h3>

          {/* Address */}
          <p className="text-sm text-gray-600 line-clamp-1">
            {stop.address}
          </p>
        </div>

        {/* Navigate Button */}
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="flex-shrink-0 w-11 h-11 bg-primary hover:bg-primary/90 rounded-lg flex items-center justify-center transition-colors shadow-sm"
            aria-label="Navegar"
          >
            <Navigation className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Distance & ETA */}
      <div className="flex gap-3 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{formatDistance(distanceKm)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{eta}</span>
        </div>
      </div>

      {/* Students List with Check-in */}
      {students.length > 0 && (
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Users className="w-4 h-4 text-gray-600" />
              <span>Estudiantes ({students.length})</span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {/* Checkable students */}
            {checkableStudents.map((student) => {
              const config = statusConfig[student.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const isCheckable = student.status === 'pending' ||
                (routeType === 'dropoff' && student.status === 'checked_in');

              return (
                <div
                  key={student._id}
                  className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded-lg"
                >
                  {/* Status Icon */}
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', config.bgColor)}>
                    <StatusIcon className={cn('w-3 h-3', config.color)} />
                  </div>

                  {/* Name */}
                  <span className="flex-1 text-sm text-gray-900 truncate">
                    {student.firstName} {student.lastName}
                  </span>

                  {/* Check-in Button */}
                  {isCheckable && onCheckin ? (
                    <button
                      onClick={() => onCheckin(student._id)}
                      className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-medium rounded hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Check-in</span>
                    </button>
                  ) : (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
                      {config.label}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Non-checkable students (absent, parent pickup) */}
            {nonCheckableStudents.map((student) => {
              const config = statusConfig[student.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div
                  key={student._id}
                  className="flex items-center gap-2 py-1.5 px-2 bg-gray-50/50 rounded-lg opacity-60"
                >
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', config.bgColor)}>
                    <StatusIcon className={cn('w-3 h-3', config.color)} />
                  </div>
                  <span className="flex-1 text-sm text-gray-500 truncate line-through">
                    {student.firstName} {student.lastName}
                  </span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
