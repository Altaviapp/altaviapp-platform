"use client";

/**
 * TripMapSection Component
 *
 * Wrapper around GoogleRouteMap with standardized overlays
 * and floating button positioning for the ActiveTripView.
 */

import { useCallback, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { GoogleRouteMap } from "../GoogleRouteMap";
import { SpeedOverlay, ProgressOverlay, CenterButton } from "./MapOverlays";
import type { ActiveTripData, FloatingButtonsContext } from "./types";

export interface TripMapSectionProps {
  /** Trip data for rendering */
  data: ActiveTripData;
  /** Map height (CSS value) */
  height?: string | number;
  /** Show speed overlay */
  showSpeedOverlay?: boolean;
  /** Show progress overlay */
  showProgressOverlay?: boolean;
  /** Auto fit bounds to stops */
  autoFitBounds?: boolean;
  /** Index of highlighted stop (parent app) */
  highlightedStopIndex?: number;
  /** Show differentiated polyline */
  showDifferentiatedPolyline?: boolean;
  /** Callback when stop is clicked */
  onStopClick?: (stopId: string) => void;
  /** Callback when map loads */
  onMapLoad?: (map: google.maps.Map) => void;
  /** Render prop for custom floating buttons */
  renderFloatingButtons?: (context: FloatingButtonsContext) => React.ReactNode;
  /** Hide center button from floating buttons (use when rendering in footer) */
  hideCenterButton?: boolean;
  /** Render prop for footer below the map */
  renderFooter?: (context: FloatingButtonsContext) => React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export interface TripMapSectionRef {
  centerOnVehicle: () => void;
  getMap: () => google.maps.Map | null;
}

export const TripMapSection = forwardRef<TripMapSectionRef, TripMapSectionProps>(
  function TripMapSection(
    {
      data,
      height = "60vh",
      showSpeedOverlay = true,
      showProgressOverlay = true,
      autoFitBounds = true,
      highlightedStopIndex,
      showDifferentiatedPolyline = false,
      onStopClick,
      onMapLoad,
      renderFloatingButtons,
      hideCenterButton = false,
      renderFooter,
      className = "",
    },
    ref
  ) {
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    // Center the map on the vehicle position
    const centerOnVehicle = useCallback(() => {
      if (mapRef.current && data.vehiclePosition?.position) {
        mapRef.current.panTo(data.vehiclePosition.position);
        mapRef.current.setZoom(16);
      }
    }, [data.vehiclePosition?.position]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      centerOnVehicle,
      getMap: () => mapRef.current,
    }));

    // Handle map load
    const handleMapLoad = useCallback(
      (map: google.maps.Map) => {
        mapRef.current = map;
        setMapInstance(map);
        onMapLoad?.(map);
      },
      [onMapLoad]
    );

    // Floating buttons context
    const floatingContext: FloatingButtonsContext = {
      centerOnVehicle,
      mapRef: mapInstance,
    };

    // Compute completed stop index for differentiated polyline
    const completedStopIndex = data.currentStopIndex > 0 ? data.currentStopIndex - 1 : undefined;

    // Should we show the floating buttons container?
    const showFloatingButtons = !hideCenterButton || renderFloatingButtons;

    // Determine if we should use flex-based sizing (for "100%" height in flex containers)
    const useFlexHeight = height === "100%";

    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Map container */}
        <div
          className={`relative ${useFlexHeight ? "flex-1 min-h-0" : "flex-shrink-0"}`}
          style={useFlexHeight ? undefined : { height: typeof height === "number" ? `${height}px` : height }}
        >
          <GoogleRouteMap
            stops={data.stops}
            currentStopIndex={data.currentStopIndex}
            polyline={data.polyline}
            vehiclePosition={data.vehiclePosition}
            showVehicle={!!data.vehiclePosition}
            animateVehicle
            schoolPosition={data.schoolPosition}
            schoolName={data.schoolName}
            completedStopIndex={completedStopIndex}
            showDifferentiatedPolyline={showDifferentiatedPolyline}
            highlightedStopIndex={highlightedStopIndex}
            autoFitBounds={autoFitBounds}
            showZoomControl={false}
            onStopClick={onStopClick}
            onMapLoad={handleMapLoad}
            style={{ width: "100%", height: "100%" }}
            overlays={{
              // Speed overlay (top-left)
              topLeft: showSpeedOverlay && data.currentSpeed > 0 ? (
                <SpeedOverlay speed={data.currentSpeed} showPulse />
              ) : undefined,
              // Progress overlay (top-right)
              topRight: showProgressOverlay ? (
                <ProgressOverlay current={data.completedStops} total={data.totalStops} />
              ) : undefined,
            }}
          />

          {/* Floating buttons container - bottom of map */}
          {showFloatingButtons && (
            <div className="absolute bottom-4 left-0 right-0 px-4 z-10">
              <div className="flex items-end justify-between">
                {/* Left side - Center button (unless hidden) */}
                {!hideCenterButton ? (
                  <CenterButton
                    onClick={centerOnVehicle}
                    disabled={!data.vehiclePosition}
                  />
                ) : (
                  <div /> // Spacer for flex justify-between
                )}

                {/* Right side - Custom floating buttons */}
                {renderFloatingButtons && (
                  <div className="flex flex-col gap-2">
                    {renderFloatingButtons(floatingContext)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer (rendered outside the map, below it) */}
        {renderFooter && renderFooter(floatingContext)}
      </div>
    );
  }
);
