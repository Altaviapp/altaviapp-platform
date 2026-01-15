/**
 * @altaviapp/maps
 *
 * Google Maps components and services for Altaviapp
 *
 * Usage:
 * ```tsx
 * import { GoogleMapsProvider, InteractiveMap, optimizeStopOrder } from "@altaviapp/maps";
 *
 * function App() {
 *   return (
 *     <GoogleMapsProvider>
 *       <InteractiveMap
 *         center={{ lat: -0.1807, lng: -78.4678 }}
 *         markers={markers}
 *         onMapClick={(pos) => console.log(pos)}
 *       />
 *     </GoogleMapsProvider>
 *   );
 * }
 * ```
 */

// Config
export { MAPS_CONFIG, DEMO_SCHOOL_LOCATION, QUITO_BOUNDS } from "./config";
export type { LatLng, MapLibrary } from "./config";

// Types
export type {
  RouteStop,
  StudentLocation,
  OptimizationResult,
  GeocodingResult,
  DirectionsResult,
  MarkerType,
  MarkerInfo,
  StudentForRoute,
  OptimizedStop,
  RouteOptimizationResult,
} from "./types";

// Components
export {
  GoogleMapsProvider,
  useGoogleMapsContext,
  MapsLoadingState,
  MapsErrorState,
} from "./components/GoogleMapsProvider";
export { InteractiveMap } from "./components/InteractiveMap";
export { AddressAutocomplete } from "./components/AddressAutocomplete";
export { LocationPicker } from "./components/LocationPicker";
export type { LocationPickerProps } from "./components/LocationPicker";
export { RoutePolyline, fitMapToPolyline } from "./components/RoutePolyline";
export type { RoutePolylineProps } from "./components/RoutePolyline";
export {
  GoogleRouteMap,
  SpeedOverlay,
  ProgressOverlay,
  ETAOverlay,
} from "./components/GoogleRouteMap";
export type {
  GoogleRouteMapProps,
  RouteStopMarker,
  VehiclePosition,
  StopStatus,
} from "./components/GoogleRouteMap";
export { StaticRouteMap } from "./components/StaticRouteMap";
export type {
  StaticRouteMapProps,
  StaticRouteMapStop,
  StopMarkerStatus,
} from "./components/StaticRouteMap";

// ActiveTripView - Global active trip component
export {
  ActiveTripView,
  TripMapSection,
  NextStopCard,
  SpeedOverlay as ActiveTripSpeedOverlay,
  ProgressOverlay as ActiveTripProgressOverlay,
  CenterButton,
} from "./components/ActiveTripView";
export type {
  ActiveTripData,
  ActiveTripViewProps,
  NextStopData,
  NextStopCardProps,
  DelayStatus,
  FloatingButtonsContext,
  LayoutMode,
  TripMapSectionProps,
  TripMapSectionRef,
  SpeedOverlayProps,
  ProgressOverlayProps,
  CenterButtonProps,
} from "./components/ActiveTripView";

// Services
export { geocodeAddress, reverseGeocode, clearGeocodeCache } from "./services/geocoding";
export { calculateRoute, getRoutePolyline } from "./services/directions";
export {
  optimizeStopOrder,
  reorderStops,
  findNearestStop,
  autoAssignStudentsToStops,
  calculateHaversineDistance,
  createOptimizedRouteFromStudents,
  decodePolyline,
} from "./services/optimization";

// Hooks
export { useGeolocation } from "./hooks/useGeolocation";
export { useAnimatedPosition } from "./hooks/useAnimatedPosition";
export type { UseAnimatedPositionOptions } from "./hooks/useAnimatedPosition";
export { useDirectionsPolyline } from "./hooks/useDirectionsPolyline";
export type {
  UseDirectionsPolylineOptions,
  UseDirectionsPolylineResult,
} from "./hooks/useDirectionsPolyline";
