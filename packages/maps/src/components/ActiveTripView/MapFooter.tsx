"use client";

/**
 * MapFooter Component
 *
 * Footer displayed below the map with next stop information
 * and a center button. Part of the ActiveTripView system.
 */

import { MapPin, Navigation, Clock, Route as RouteIcon } from "lucide-react";
import type { DelayStatus } from "./types";

export interface MapFooterProps {
  /** Stop name */
  stopName: string;
  /** Stop address (optional) */
  stopAddress?: string;
  /** Current stop number in sequence */
  stopNumber: number;
  /** Total stops in route */
  totalStops: number;
  /** ETA in minutes */
  etaMinutes?: number;
  /** Formatted ETA time (e.g., "07:35") */
  etaTime?: string;
  /** Distance to stop in km */
  distanceKm?: number;
  /** Delay status */
  delayStatus?: DelayStatus;
  /** Click handler for center button */
  onCenterClick: () => void;
  /** Whether center button is disabled */
  centerDisabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode for desktop side-by-side layout */
  compact?: boolean;
}

/**
 * Format ETA display with delay info
 */
function formatEtaDisplay(
  etaMinutes?: number,
  delayStatus?: DelayStatus
): { text: string; color: string } {
  if (etaMinutes === undefined) {
    return { text: "Calculando...", color: "text-muted-foreground" };
  }

  const baseText = `~${etaMinutes} min`;

  if (!delayStatus || delayStatus.status === "on_time") {
    return { text: baseText, color: "text-emerald-600" };
  }

  const delayText = `+${delayStatus.delayMinutes} min`;
  switch (delayStatus.status) {
    case "slight_delay":
      return { text: `${baseText} • ${delayText}`, color: "text-amber-500" };
    case "delayed":
      return { text: `${baseText} • ${delayText}`, color: "text-orange-500" };
    case "very_delayed":
      return { text: `${baseText} • ${delayText}`, color: "text-red-500" };
    default:
      return { text: baseText, color: "text-muted-foreground" };
  }
}

export function MapFooter({
  stopName,
  stopAddress,
  stopNumber,
  totalStops,
  etaMinutes,
  etaTime,
  distanceKm,
  delayStatus,
  onCenterClick,
  centerDisabled = false,
  className = "",
  compact = false,
}: MapFooterProps) {
  const { text: etaText, color: etaColor } = formatEtaDisplay(etaMinutes, delayStatus);

  if (compact) {
    // Compact layout for desktop side-by-side
    return (
      <div className={`bg-white border-t p-3 ${className}`}>
        <div className="flex items-center justify-between gap-3">
          {/* Left: Stop info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                <MapPin className="h-3 w-3" />
                {stopNumber}/{totalStops}
              </span>
              <span className="font-medium text-sm truncate">{stopName}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {distanceKm !== undefined && (
                <span className="flex items-center gap-1">
                  <RouteIcon className="h-3 w-3" />
                  {distanceKm.toFixed(1)} km
                </span>
              )}
              <span className={`flex items-center gap-1 ${etaColor}`}>
                <Clock className="h-3 w-3" />
                {etaText}
              </span>
            </div>
          </div>

          {/* Right: Center button */}
          <button
            onClick={onCenterClick}
            disabled={centerDisabled}
            className="flex-shrink-0 p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Centrar en vehículo"
          >
            <Navigation className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
    );
  }

  // Full layout for mobile
  return (
    <div className={`bg-white border-t p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Stop info */}
        <div className="flex-1 min-w-0">
          {/* Badge + Stop name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              <MapPin className="h-3 w-3" />
              Parada {stopNumber}/{totalStops}
            </span>
          </div>
          <h3 className="font-semibold text-base truncate mb-0.5">{stopName}</h3>
          {stopAddress && (
            <p className="text-sm text-muted-foreground truncate mb-2">{stopAddress}</p>
          )}

          {/* Info row: ETA, distance, delay */}
          <div className="flex items-center gap-3 text-sm">
            {distanceKm !== undefined && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <RouteIcon className="h-4 w-4" />
                {distanceKm.toFixed(1)} km
              </span>
            )}
            <span className={`flex items-center gap-1 font-medium ${etaColor}`}>
              <Clock className="h-4 w-4" />
              {etaText}
            </span>
            {etaTime && (
              <span className="text-muted-foreground">
                ({etaTime})
              </span>
            )}
          </div>
        </div>

        {/* Right: Center button */}
        <button
          onClick={onCenterClick}
          disabled={centerDisabled}
          className="flex-shrink-0 p-3 bg-white border rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Centrar en vehículo"
        >
          <Navigation className="h-6 w-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
