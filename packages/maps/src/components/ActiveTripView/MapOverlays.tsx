"use client";

/**
 * Map Overlay Components
 *
 * Reusable overlays for the ActiveTripView map:
 * - SpeedOverlay: Shows current speed with optional pulse indicator
 * - ProgressOverlay: Shows stop progress (X/Y paradas)
 * - CenterButton: Button to center map on vehicle
 */

import { Crosshair, MapPin } from "lucide-react";
import type { SpeedOverlayProps, ProgressOverlayProps, CenterButtonProps } from "./types";

/**
 * Speed overlay showing current vehicle speed
 */
export function SpeedOverlay({ speed, showPulse = true }: SpeedOverlayProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center gap-2">
        {showPulse && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-900">{Math.round(speed)}</span>
          <span className="text-xs text-gray-500">km/h</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Progress overlay showing stops completed
 */
export function ProgressOverlay({ current, total }: ProgressOverlayProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-lg font-bold text-primary">{current}</span>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-600">{total}</span>
        <span className="text-xs text-gray-500 ml-0.5">paradas</span>
      </div>
    </div>
  );
}

/**
 * Button to center map on vehicle position
 */
export function CenterButton({ onClick, disabled = false }: CenterButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Centrar en vehículo"
    >
      <Crosshair className="w-5 h-5 text-gray-700" />
    </button>
  );
}
