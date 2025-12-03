/**
 * TripHeader Component
 *
 * Displays trip status, route name, elapsed time, and options menu
 */

import { Clock, MoreVertical } from 'lucide-react';
import type { TripWithDetails } from '@/types';

export interface TripHeaderProps {
  trip: TripWithDetails;
  elapsedFormatted: string;
  onOptionsClick?: () => void;
}

/**
 * Header for active trip view
 */
export function TripHeader({ trip, elapsedFormatted, onOptionsClick }: TripHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Status & Route Name */}
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full mb-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-success uppercase">
              EN RUTA
            </span>
          </div>

          {/* Route Name */}
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {trip.route?.name || 'Ruta sin nombre'}
          </h1>

          {/* Trip Type */}
          <p className="text-sm text-gray-600">
            {trip.type === 'inbound' ? 'Viaje de Ida' : 'Viaje de Vuelta'}
          </p>
        </div>

        {/* Right: Time & Options */}
        <div className="flex items-center gap-3">
          {/* Elapsed Time */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-mono font-semibold text-gray-900">
              {elapsedFormatted}
            </span>
          </div>

          {/* Options Menu Button */}
          {onOptionsClick && (
            <button
              onClick={onOptionsClick}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Opciones"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
