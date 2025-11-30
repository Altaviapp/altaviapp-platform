/**
 * MapControls Component
 *
 * Custom zoom controls for Leaflet map
 */

import { Plus, Minus, Locate } from 'lucide-react';

export interface MapControlsProps {
  /** Handler for zoom in */
  onZoomIn: () => void;
  /** Handler for zoom out */
  onZoomOut: () => void;
  /** Handler for center on current location */
  onCenterLocation?: () => void;
}

/**
 * Custom map controls for zoom and location
 */
export function MapControls({ onZoomIn, onZoomOut, onCenterLocation }: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-colors"
        aria-label="Acercar"
      >
        <Plus className="w-5 h-5 text-gray-700" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-colors"
        aria-label="Alejar"
      >
        <Minus className="w-5 h-5 text-gray-700" />
      </button>

      {/* Center on Location */}
      {onCenterLocation && (
        <button
          onClick={onCenterLocation}
          className="w-10 h-10 bg-primary hover:bg-primary/90 border border-primary rounded-lg shadow-md flex items-center justify-center transition-colors mt-2"
          aria-label="Centrar en ubicación actual"
        >
          <Locate className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
