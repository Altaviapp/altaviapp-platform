/**
 * ActiveTripView Module
 *
 * Global components for displaying active trip information
 * across Admin, Crew, and Parent apps.
 */

// Main component
export { ActiveTripView } from "./ActiveTripView";

// Sub-components
export { TripMapSection } from "./TripMapSection";
export type { TripMapSectionProps, TripMapSectionRef } from "./TripMapSection";

export { NextStopCard } from "./NextStopCard";

export { SpeedOverlay, ProgressOverlay, CenterButton } from "./MapOverlays";

// Types
export type {
  // Data types
  ActiveTripData,
  NextStopData,
  DelayStatus,
  // Prop types
  ActiveTripViewProps,
  NextStopCardProps,
  FloatingButtonsContext,
  LayoutMode,
  // Overlay prop types
  SpeedOverlayProps,
  ProgressOverlayProps,
  CenterButtonProps,
  // Re-exported from GoogleRouteMap
  LatLng,
  RouteStopMarker,
  VehiclePosition,
  StopStatus,
} from "./types";
