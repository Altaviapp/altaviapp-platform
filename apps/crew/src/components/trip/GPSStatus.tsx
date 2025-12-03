/**
 * GPSStatus Component
 *
 * Displays GPS status indicator, current speed, and map link
 */

import { Navigation, Map } from 'lucide-react';
import Link from 'next/link';

export interface GPSStatusProps {
  /** Current speed in km/h */
  speed: number;
  /** GPS accuracy in meters */
  accuracy?: number;
  /** Whether GPS is active */
  isActive?: boolean;
  /** Trip ID for map link */
  tripId: string;
}

/**
 * GPS status indicator with speed and map link
 */
export function GPSStatus({
  speed,
  accuracy = 10,
  isActive = true,
  tripId,
}: GPSStatusProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: GPS Status & Speed */}
        <div className="flex items-center gap-3">
          {/* GPS Indicator */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <div className="relative w-3 h-3">
                  <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-75" />
                  <div className="relative w-3 h-3 bg-success rounded-full" />
                </div>
                <span className="text-sm font-semibold text-success">GPS Activo</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
                <span className="text-sm font-semibold text-gray-600">GPS Inactivo</span>
              </>
            )}
          </div>

          {/* Speed Display */}
          {isActive && (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <Navigation className="w-4 h-4 text-primary" />
              <div>
                <span className="text-lg font-bold text-gray-900">{speed}</span>
                <span className="text-xs text-gray-600 ml-1">km/h</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: View Map Link */}
        <Link
          href={`/trips/${tripId}/map`}
          className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
        >
          <Map className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Ver Mapa</span>
        </Link>
      </div>

      {/* Accuracy Info (optional, only show if poor) */}
      {isActive && accuracy && accuracy > 20 && (
        <div className="mt-2 text-xs text-warning">
          Precisión GPS: ±{Math.round(accuracy)}m
        </div>
      )}
    </div>
  );
}
