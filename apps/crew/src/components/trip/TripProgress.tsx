/**
 * TripProgress Component
 *
 * Visual progress bar showing trip completion with stops and students count
 */

import { MapPin, Users } from 'lucide-react';

export interface TripProgressProps {
  /** Current stop index (0-based) */
  currentStopIndex: number;
  /** Total number of stops */
  totalStops: number;
  /** Number of students currently on board */
  studentsOnBoard: number;
  /** Total number of students assigned */
  totalStudents: number;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * Progress bar for active trip
 */
export function TripProgress({
  currentStopIndex,
  totalStops,
  studentsOnBoard,
  totalStudents,
  progress,
}: TripProgressProps) {
  const completedStops = currentStopIndex;
  const remainingStops = totalStops - currentStopIndex;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Progreso del viaje</span>
          <span className="font-semibold text-gray-900">{progress}%</span>
        </div>

        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stops Counter */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600">Paradas</p>
            <p className="text-sm font-bold text-gray-900">
              {completedStops} de {totalStops}
            </p>
          </div>
        </div>

        {/* Students Counter */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600">A bordo</p>
            <p className="text-sm font-bold text-gray-900">
              {studentsOnBoard}/{totalStudents}
            </p>
          </div>
        </div>
      </div>

      {/* Remaining Stops Info */}
      {remainingStops > 0 && (
        <div className="text-xs text-gray-600 text-center">
          {remainingStops === 1 ? (
            <span>Última parada restante</span>
          ) : (
            <span>{remainingStops} paradas restantes</span>
          )}
        </div>
      )}
    </div>
  );
}
