"use client";

/**
 * NextStopCard Component
 *
 * Shared component for displaying next stop information.
 * Provides slots for app-specific actions and extra content.
 *
 * - Crew app: Uses renderActions for "Llegué"/"Omitir" buttons, renderExtra for student list
 * - Parent app: Uses the basic version with just navigate button
 * - Admin app: Can use for single trip view
 */

import { MapPin, Clock, Navigation, AlertTriangle } from "lucide-react";
import type { NextStopCardProps } from "./types";

/**
 * Get CSS classes based on delay status
 */
function getDelayClasses(status?: string) {
  switch (status) {
    case "on_time":
      return "bg-green-50 text-green-700";
    case "slight_delay":
      return "bg-yellow-50 text-yellow-700";
    case "delayed":
      return "bg-orange-50 text-orange-700";
    case "very_delayed":
      return "bg-red-50 text-red-700";
    default:
      return "bg-green-50 text-green-700";
  }
}

/**
 * Format distance for display
 */
function formatDistance(distanceKm?: number): string | null {
  if (distanceKm === undefined || distanceKm === null) return null;
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function NextStopCard({
  stopName,
  stopAddress,
  stopNumber,
  totalStops,
  etaMinutes,
  etaTime,
  distanceKm,
  delayStatus,
  latitude,
  longitude,
  showNavigateButton = true,
  renderActions,
  renderExtra,
  className = "",
}: NextStopCardProps) {
  const handleNavigate = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    window.open(mapsUrl, "_blank");
  };

  const formattedDistance = formatDistance(distanceKm);
  const etaClasses = getDelayClasses(delayStatus?.status);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    >
      {/* Main card content */}
      <div className="p-4">
        {/* Header with stop number and ETA */}
        <div className="flex items-center justify-between mb-3">
          {/* Stop badge */}
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold text-sm">
              Parada {stopNumber}/{totalStops}
            </span>
          </div>

          {/* ETA badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${etaClasses}`}>
            <Clock className="w-4 h-4" />
            {etaMinutes !== undefined && etaMinutes !== null ? (
              <span className="font-medium text-sm">
                ~{etaMinutes} min
                {etaTime && (
                  <span className="opacity-75 ml-1 text-xs">({etaTime})</span>
                )}
              </span>
            ) : (
              <span className="text-sm">Calculando...</span>
            )}
          </div>
        </div>

        {/* Delay indicator */}
        {delayStatus?.isDelayed && (
          <div className="flex items-center gap-1.5 text-xs text-orange-600 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Retraso de +{delayStatus.delayMinutes} min</span>
          </div>
        )}

        {/* Stop info and navigation */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{stopName}</h3>
            {stopAddress && (
              <p className="text-sm text-gray-500 truncate mt-0.5">{stopAddress}</p>
            )}
            {formattedDistance && (
              <p className="text-xs text-gray-400 mt-1">{formattedDistance}</p>
            )}
          </div>

          {showNavigateButton && (
            <button
              onClick={handleNavigate}
              className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>Navegar</span>
            </button>
          )}
        </div>

        {/* App-specific actions slot */}
        {renderActions && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            {renderActions()}
          </div>
        )}
      </div>

      {/* App-specific extra content slot (outside padding for full-width content) */}
      {renderExtra && (
        <div className="border-t border-gray-100">
          {renderExtra()}
        </div>
      )}
    </div>
  );
}
