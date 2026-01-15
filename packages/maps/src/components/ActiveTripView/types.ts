/**
 * ActiveTripView Types
 *
 * Shared interfaces for the global active trip view component
 * used across Admin, Crew, and Parent apps.
 */

import type { LatLng } from "../../types/maps";
import type { RouteStopMarker, VehiclePosition, StopStatus } from "../GoogleRouteMap";

// Re-export for convenience
export type { LatLng, RouteStopMarker, VehiclePosition, StopStatus };

// ============================================
// ACTIVE TRIP DATA
// ============================================

/**
 * Delay status for ETA display
 */
export type DelayStatus = {
  isDelayed: boolean;
  delayMinutes: number;
  status: "on_time" | "slight_delay" | "delayed" | "very_delayed";
};

/**
 * Next stop information
 */
export type NextStopData = {
  id: string;
  name: string;
  address?: string;
  etaMinutes?: number;
  etaTime?: string;
  distanceKm?: number;
  latitude: number;
  longitude: number;
  delayStatus?: DelayStatus;
};

/**
 * Core trip data that all apps can provide.
 * Each app transforms its own hook data to this interface.
 */
export interface ActiveTripData {
  /** Trip identification */
  tripId: string;
  routeName: string;
  routeType: "pickup" | "dropoff";

  /** Vehicle position and GPS data */
  vehiclePosition: VehiclePosition | null;
  currentSpeed: number; // km/h

  /** Route data */
  stops: RouteStopMarker[];
  polyline: LatLng[];
  completedStops: number;
  totalStops: number;
  currentStopIndex: number;

  /** School marker (optional) */
  schoolPosition?: LatLng;
  schoolName?: string;

  /** Next stop info (optional - not all apps calculate this) */
  nextStop?: NextStopData;
}

// ============================================
// ACTIVE TRIP VIEW PROPS
// ============================================

/**
 * Render prop context for floating buttons
 */
export type FloatingButtonsContext = {
  /** Centers the map on the vehicle position */
  centerOnVehicle: () => void;
  /** Reference to the Google Map instance */
  mapRef: google.maps.Map | null;
};

/**
 * Layout mode for the component
 */
export type LayoutMode = "stacked" | "side-by-side" | "auto";

/**
 * Props for ActiveTripView
 */
export interface ActiveTripViewProps {
  /** Required trip data */
  data: ActiveTripData;

  /** Layout mode: 'stacked' (mobile), 'side-by-side' (desktop), or 'auto' (responsive) */
  layout?: LayoutMode;
  /** Width of the side panel in desktop mode (default: '400px') */
  sidePanelWidth?: string;

  /** Map configuration */
  mapHeight?: string | number; // default '60vh' for mobile, 'calc(100vh - header)' for desktop
  showSpeedOverlay?: boolean;
  showProgressOverlay?: boolean;
  autoFitBounds?: boolean;
  /** Index of stop to highlight (e.g., student's stop in parent app) */
  highlightedStopIndex?: number;
  /** Show differentiated polyline (gray for completed, color for remaining) */
  showDifferentiatedPolyline?: boolean;

  /** Callbacks */
  onMapLoad?: (map: google.maps.Map) => void;
  onStopClick?: (stopId: string) => void;

  /** Render prop for header content */
  renderHeader?: () => React.ReactNode;
  /** Render prop for floating buttons on the map */
  renderFloatingButtons?: (context: FloatingButtonsContext) => React.ReactNode;
  /** Render prop for side/bottom panel content */
  renderSidePanel?: () => React.ReactNode;

  /** Additional CSS class for the container */
  className?: string;
}

// ============================================
// NEXT STOP CARD PROPS
// ============================================

/**
 * Props for the shared NextStopCard component
 */
export interface NextStopCardProps {
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
  /** Delay status for coloring */
  delayStatus?: DelayStatus;
  /** Stop latitude for navigation */
  latitude: number;
  /** Stop longitude for navigation */
  longitude: number;

  /** Whether to show the navigate button (default: true) */
  showNavigateButton?: boolean;
  /** Render prop for additional action buttons (crew: Llegué, Omitir) */
  renderActions?: () => React.ReactNode;
  /** Render prop for extra content below (crew: student list) */
  renderExtra?: () => React.ReactNode;

  /** Additional CSS classes */
  className?: string;
}

// ============================================
// MAP OVERLAYS PROPS
// ============================================

/**
 * Props for SpeedOverlay
 */
export interface SpeedOverlayProps {
  /** Current speed in km/h */
  speed: number;
  /** Show pulsing indicator dot */
  showPulse?: boolean;
}

/**
 * Props for ProgressOverlay
 */
export interface ProgressOverlayProps {
  /** Number of completed stops */
  current: number;
  /** Total number of stops */
  total: number;
}

/**
 * Props for CenterButton
 */
export interface CenterButtonProps {
  /** Click handler to center on vehicle */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
}
