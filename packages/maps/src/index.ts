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

// Services
export { geocodeAddress, reverseGeocode, clearGeocodeCache } from "./services/geocoding";
export { calculateRoute, getRoutePolyline } from "./services/directions";
export {
  optimizeStopOrder,
  reorderStops,
  findNearestStop,
  autoAssignStudentsToStops,
  calculateHaversineDistance,
} from "./services/optimization";

// Hooks
export { useGeolocation } from "./hooks/useGeolocation";
