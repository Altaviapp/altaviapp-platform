"use client";

/**
 * NextStopInfoCard Component
 *
 * Displays next stop information with ETA and navigation button.
 * Read-only card for parent trip monitoring.
 */

import { MapPin, Clock, Navigation, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NextStopInfoCardProps {
  /** Stop name */
  stopName: string;
  /** Stop address (optional) */
  stopAddress?: string;
  /** Current stop number */
  stopNumber: number;
  /** Total stops in route */
  totalStops: number;
  /** ETA in minutes */
  etaMinutes: number | null;
  /** Formatted ETA time (e.g., "07:35") */
  etaTime?: string | null;
  /** Distance to stop in km */
  distanceKm?: number | null;
  /** Delay status */
  delayStatus?: {
    isDelayed: boolean;
    delayMinutes: number;
    status: "on_time" | "slight_delay" | "delayed" | "very_delayed";
  } | null;
  /** Stop latitude for navigation */
  latitude: number;
  /** Stop longitude for navigation */
  longitude: number;
  /** Additional CSS classes */
  className?: string;
}

export function NextStopInfoCard({
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
  className,
}: NextStopInfoCardProps) {
  const handleNavigate = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-4",
        className
      )}
    >
      {/* Header with stop number and ETA */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold text-sm">
              Parada {stopNumber}/{totalStops}
            </span>
          </div>
        </div>

        {/* ETA badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
            !delayStatus || delayStatus.status === "on_time"
              ? "bg-green-50 text-green-700"
              : delayStatus.status === "slight_delay"
                ? "bg-yellow-50 text-yellow-700"
                : delayStatus.status === "delayed"
                  ? "bg-orange-50 text-orange-700"
                  : "bg-red-50 text-red-700"
          )}
        >
          <Clock className="w-4 h-4" />
          {etaMinutes !== null ? (
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
          {distanceKm !== null && distanceKm !== undefined && (
            <p className="text-xs text-gray-400 mt-1">
              {distanceKm < 1
                ? `${Math.round(distanceKm * 1000)} m`
                : `${distanceKm.toFixed(1)} km`}
            </p>
          )}
        </div>

        <button
          onClick={handleNavigate}
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 active:scale-95 transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>Navegar</span>
        </button>
      </div>
    </div>
  );
}
