"use client";

/**
 * ActiveTripView Component
 *
 * Global component for displaying active trip information across all apps.
 * Provides a consistent layout with:
 * - Map with vehicle tracking and route
 * - Overlays for speed and progress
 * - Responsive layout (stacked on mobile, side-by-side on desktop)
 * - Slots for app-specific content (header, floating buttons, side panel)
 *
 * Usage:
 * ```tsx
 * <ActiveTripView
 *   data={tripData}
 *   renderHeader={() => <MyHeader />}
 *   renderFloatingButtons={({ centerOnVehicle }) => <SOSButton />}
 *   renderSidePanel={() => <NextStopCard ... />}
 * />
 * ```
 */

import { useRef, useEffect, useState } from "react";
import { TripMapSection, type TripMapSectionRef } from "./TripMapSection";
import type { ActiveTripViewProps, LayoutMode } from "./types";

/**
 * Hook to detect viewport width for responsive layout
 */
function useViewport() {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width, isDesktop: width >= 768 };
}

/**
 * Determine actual layout based on mode and viewport
 */
function getActualLayout(mode: LayoutMode, isDesktop: boolean): "stacked" | "side-by-side" {
  if (mode === "auto") {
    return isDesktop ? "side-by-side" : "stacked";
  }
  return mode;
}

export function ActiveTripView({
  data,
  layout = "auto",
  sidePanelWidth = "400px",
  mapHeight,
  showSpeedOverlay = true,
  showProgressOverlay = true,
  autoFitBounds = true,
  highlightedStopIndex,
  showDifferentiatedPolyline = false,
  onMapLoad,
  onStopClick,
  renderHeader,
  renderFloatingButtons,
  renderSidePanel,
  className = "",
}: ActiveTripViewProps) {
  const mapRef = useRef<TripMapSectionRef>(null);
  const { isDesktop } = useViewport();
  const actualLayout = getActualLayout(layout, isDesktop);

  // Calculate map height based on layout
  const computedMapHeight = mapHeight ?? (actualLayout === "stacked" ? "60vh" : "100%");

  // Stacked layout (mobile)
  if (actualLayout === "stacked") {
    return (
      <div className={`flex flex-col min-h-screen bg-gray-50 ${className}`}>
        {/* Header */}
        {renderHeader && renderHeader()}

        {/* Map section */}
        <TripMapSection
          ref={mapRef}
          data={data}
          height={computedMapHeight}
          showSpeedOverlay={showSpeedOverlay}
          showProgressOverlay={showProgressOverlay}
          autoFitBounds={autoFitBounds}
          highlightedStopIndex={highlightedStopIndex}
          showDifferentiatedPolyline={showDifferentiatedPolyline}
          onMapLoad={onMapLoad}
          onStopClick={onStopClick}
          renderFloatingButtons={renderFloatingButtons}
        />

        {/* Side panel as bottom panel */}
        {renderSidePanel && (
          <div className="flex-1 bg-white overflow-auto">
            {renderSidePanel()}
          </div>
        )}
      </div>
    );
  }

  // Side-by-side layout (desktop)
  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {renderHeader && renderHeader()}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map section - takes remaining space */}
        <div className="flex-1 relative">
          <TripMapSection
            ref={mapRef}
            data={data}
            height="100%"
            showSpeedOverlay={showSpeedOverlay}
            showProgressOverlay={showProgressOverlay}
            autoFitBounds={autoFitBounds}
            highlightedStopIndex={highlightedStopIndex}
            showDifferentiatedPolyline={showDifferentiatedPolyline}
            onMapLoad={onMapLoad}
            onStopClick={onStopClick}
            renderFloatingButtons={renderFloatingButtons}
          />
        </div>

        {/* Side panel */}
        {renderSidePanel && (
          <div
            className="bg-white border-l border-gray-200 overflow-auto"
            style={{ width: sidePanelWidth, minWidth: sidePanelWidth }}
          >
            {renderSidePanel()}
          </div>
        )}
      </div>
    </div>
  );
}
