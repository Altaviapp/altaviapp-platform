/**
 * NextStopCard Component
 *
 * Displays next stop information with students list, distance, ETA, and navigation button
 */

import { MapPin, Navigation, Clock, Users } from 'lucide-react';
import type { Stop } from '@/types';
import { formatDistance } from '@/lib/utils/tripCalculations';

export interface NextStopCardProps {
  /** Next stop details */
  stop: Stop;
  /** Stop number in sequence */
  stopNumber: number;
  /** Distance to stop in kilometers */
  distanceKm: number;
  /** Estimated time of arrival string */
  eta: string;
  /** Students at this stop */
  students?: Array<{ _id: string; firstName: string; lastName: string }>;
  /** Handler for navigate button click */
  onNavigate?: () => void;
}

/**
 * Card displaying next stop information
 */
export function NextStopCard({
  stop,
  stopNumber,
  distanceKm,
  eta,
  students = [],
  onNavigate,
}: NextStopCardProps) {
  return (
    <div className="bg-white border-2 border-primary/20 rounded-xl p-4 space-y-4 shadow-sm">
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
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {stop.name}
          </h3>

          {/* Address */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {stop.address}
          </p>
        </div>

        {/* Navigate Button */}
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="flex-shrink-0 w-12 h-12 bg-primary hover:bg-primary/90 rounded-lg flex items-center justify-center transition-colors shadow-sm"
            aria-label="Navegar"
          >
            <Navigation className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Distance & ETA */}
      <div className="grid grid-cols-2 gap-3">
        {/* Distance */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600">Distancia</p>
            <p className="text-sm font-bold text-gray-900">
              {formatDistance(distanceKm)}
            </p>
          </div>
        </div>

        {/* ETA */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600">Llegada en</p>
            <p className="text-sm font-bold text-gray-900">{eta}</p>
          </div>
        </div>
      </div>

      {/* Students List */}
      {students.length > 0 && (
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Users className="w-4 h-4 text-gray-600" />
            <span>Estudiantes en esta parada ({students.length})</span>
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto">
            {students.map((student) => (
              <div
                key={student._id}
                className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded text-sm"
              >
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {student.firstName[0]}{student.lastName[0]}
                  </span>
                </div>
                <span className="text-gray-900 truncate">
                  {student.firstName} {student.lastName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
