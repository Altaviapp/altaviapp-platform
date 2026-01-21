'use client';

/**
 * Step 4: Route Review for Bulk Route Creation
 *
 * Split view layout:
 * - Left: Scrollable list of route cards (1/3)
 * - Right: Google Map showing selected route(s) (2/3)
 *
 * PRD Reference: US-015 - Step 4 - Split view with route cards
 * PRD Reference: US-016 - Step 4 - Route card selection and map toggle
 * PRD Reference: US-017 - Step 4 - Multi-route map visualization
 * PRD Reference: US-021 - Step 4 - Unassigned students panel
 * PRD Reference: US-022 - Step 4 - Validation warnings and navigation
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import {
  MapPin,
  Users,
  Clock,
  Route,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  Pencil,
  Square,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  UserX,
  UserPlus,
  Home,
  Loader2,
} from 'lucide-react';
import {
  GoogleMapsProvider,
  useGoogleMapsContext,
  MapsLoadingState,
  MapsErrorState,
  decodePolyline,
  MAPS_CONFIG,
} from '@altaviapp/maps';
import type { LatLng } from '@altaviapp/maps';
import { api } from '../../../../../../convex/_generated/api';
import { cn } from '@/lib/utils';
import { useInstitution, useConvexAuth } from '@/hooks';
import type { BulkWizardStep1Data, BulkWizardStep4Data, BulkWizardStep3Data, GeneratedRoute } from './BulkRouteWizard';
import { RouteDetailModal, type VehicleOption, type StudentInfo } from './RouteDetailModal';

// Color palette for routes (10 distinct colors) - US-017
const ROUTE_COLORS = [
  '#042940', // Primary blue
  '#E63946', // Red
  '#2A9D8F', // Teal
  '#E9C46A', // Yellow
  '#9B59B6', // Purple
  '#F4A261', // Orange
  '#1D3557', // Navy
  '#2ECC71', // Green
  '#E91E63', // Pink
  '#00BCD4', // Cyan
];

// School marker icon path (building/school icon) - US-017
const SCHOOL_ICON_PATH = 'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z';

// Map container style - US-017
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px',
};

// InfoWindow data type for stops - US-017
interface StopInfoWindowData {
  routeId: string;
  routeName: string;
  stopIndex: number;
  stopOrder: number;
  studentNames: string[];
  position: LatLng;
}

// InfoWindow data type for polylines - US-017
interface PolylineInfoWindowData {
  routeId: string;
  routeName: string;
  position: LatLng;
}

interface Step4RouteReviewProps {
  step1Data: BulkWizardStep1Data;
  data: BulkWizardStep4Data;
  step3Data: BulkWizardStep3Data;
  onChange: (data: Partial<BulkWizardStep4Data>) => void;
  onValidChange: (isValid: boolean) => void;
  onConfirm?: () => void;
  onBack?: () => void;
}

interface RouteCardProps {
  route: GeneratedRoute;
  index: number;
  isSelected: boolean;
  isVisibleOnMap: boolean;
  onSelect: () => void;
  onToggleMapVisibility: () => void;
  onViewDetails: () => void;
  onNameChange: (newName: string) => void;
  vehiclePlate?: string;
  routeColor: string;
}

/**
 * Route Card Component
 * Displays route summary: number, students, duration, distance
 * US-016: Includes checkbox for map visibility, editable name field
 */
function RouteCard({
  route,
  index,
  isSelected,
  isVisibleOnMap,
  onSelect,
  onToggleMapVisibility,
  onViewDetails,
  onNameChange,
  vehiclePlate,
  routeColor,
}: RouteCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(route.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when route name changes externally
  useEffect(() => {
    setEditedName(route.name);
  }, [route.name]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  // Calculate total students from all stops
  const studentCount = useMemo(() => {
    return route.stops.reduce((sum, stop) => sum + stop.studentIds.length, 0);
  }, [route.stops]);

  // Format duration (minutes)
  const formattedDuration = useMemo(() => {
    if (route.duration < 60) {
      return `${Math.round(route.duration)} min`;
    }
    const hours = Math.floor(route.duration / 60);
    const mins = Math.round(route.duration % 60);
    return `${hours}h ${mins}min`;
  }, [route.duration]);

  // Format distance (meters to km)
  const formattedDistance = useMemo(() => {
    if (route.distance < 1000) {
      return `${Math.round(route.distance)} m`;
    }
    return `${(route.distance / 1000).toFixed(1)} km`;
  }, [route.distance]);

  // Handle name edit save
  const handleSaveName = useCallback(() => {
    const trimmedName = editedName.trim();
    if (trimmedName && trimmedName !== route.name) {
      onNameChange(trimmedName);
    } else {
      setEditedName(route.name); // Revert if empty
    }
    setIsEditingName(false);
  }, [editedName, route.name, onNameChange]);

  // Handle key press in name input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveName();
      } else if (e.key === 'Escape') {
        setEditedName(route.name);
        setIsEditingName(false);
      }
    },
    [handleSaveName, route.name]
  );

  return (
    <div
      className={cn(
        'w-full p-4 rounded-xl border-2 text-left transition-all',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      )}
    >
      {/* Route Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Map visibility checkbox - US-016, US-017 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMapVisibility();
            }}
            className={cn(
              'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              isVisibleOnMap
                ? 'text-white'
                : 'bg-white border-gray-300 hover:border-gray-400'
            )}
            style={isVisibleOnMap ? { backgroundColor: routeColor, borderColor: routeColor } : {}}
            title={isVisibleOnMap ? 'Ocultar en mapa' : 'Mostrar en mapa'}
          >
            {isVisibleOnMap && <Check className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={onSelect}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
              isSelected
                ? 'text-white'
                : 'bg-gray-100 text-gray-600'
            )}
            style={isSelected ? { backgroundColor: routeColor } : {}}
          >
            {index + 1}
          </button>

          {/* Editable route name - US-016 */}
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm font-semibold text-gray-900 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                <h4
                  className="font-semibold text-gray-900 text-sm truncate cursor-pointer hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }}
                  title="Clic para editar nombre"
                >
                  {route.name}
                </h4>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }}
                  className="flex-shrink-0 p-0.5 text-gray-400 hover:text-primary transition-colors"
                  title="Editar nombre"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
            {vehiclePlate && (
              <p className="text-xs text-gray-500 truncate">{vehiclePlate}</p>
            )}
          </div>
        </div>

        {/* Color indicator - US-017 */}
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: routeColor }}
          title={`Color de ruta: ${route.name}`}
        />
      </div>

      {/* Route Stats - US-017 */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {/* Students */}
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" style={{ color: routeColor }} />
          <span>
            {studentCount} estudiante{studentCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Stops */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" style={{ color: routeColor }} />
          <span>
            {route.stops.length} parada{route.stops.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" style={{ color: routeColor }} />
          <span>{formattedDuration}</span>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-2 text-gray-600">
          <Route className="w-4 h-4" style={{ color: routeColor }} />
          <span>{formattedDistance}</span>
        </div>
      </div>

      {/* Ver detalles button - US-018 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver Detalle
        </button>
      </div>
    </div>
  );
}

/**
 * Warning banner component for validation messages
 */
interface ValidationWarning {
  id: string;
  message: string;
  detail?: string;
  type: 'warning' | 'info';
}

function ValidationBanner({ warnings }: { warnings: ValidationWarning[] }) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((warning) => (
        <div
          key={warning.id}
          className={cn(
            'rounded-xl p-3 border',
            warning.type === 'warning'
              ? 'bg-warning/10 border-warning/20'
              : 'bg-blue-50 border-blue-200'
          )}
        >
          <div className="flex items-start gap-2">
            <AlertCircle
              className={cn(
                'w-4 h-4 flex-shrink-0 mt-0.5',
                warning.type === 'warning' ? 'text-warning' : 'text-blue-500'
              )}
            />
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  warning.type === 'warning' ? 'text-warning' : 'text-blue-700'
                )}
              >
                {warning.message}
              </p>
              {warning.detail && (
                <p className="text-xs text-gray-600 mt-1">{warning.detail}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Generate auto route name based on route type - US-016
 */
function generateRouteName(routeType: 'pickup' | 'dropoff' | '', index: number): string {
  const typeLabel = routeType === 'pickup' ? 'Recogida' : routeType === 'dropoff' ? 'Entrega' : 'Ruta';
  return `Ruta ${typeLabel} ${index + 1}`;
}

/**
 * Multi-Route Map Component - US-017
 * Renders multiple routes with distinct colors, stop markers, and InfoWindows
 */
interface MultiRouteMapProps {
  routes: GeneratedRoute[];
  visibleRouteIds: Set<string>;
  schoolLocation: LatLng | null;
  schoolName: string;
  studentsMap: Map<string, StudentInfo>;
}

function MultiRouteMap({
  routes,
  visibleRouteIds,
  schoolLocation,
  schoolName,
  studentsMap,
}: MultiRouteMapProps) {
  const { isLoaded, loadError } = useGoogleMapsContext();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [stopInfoWindow, setStopInfoWindow] = useState<StopInfoWindowData | null>(null);
  const [polylineInfoWindow, setPolylineInfoWindow] = useState<PolylineInfoWindowData | null>(null);
  const prevVisibleIdsRef = useRef<string>('');

  // Get visible routes
  const visibleRoutes = useMemo(() => {
    return routes.filter((route) => visibleRouteIds.has(route.id));
  }, [routes, visibleRouteIds]);

  // Build route index map for consistent color assignment
  const routeColorMap = useMemo(() => {
    const map = new Map<string, string>();
    routes.forEach((route, index) => {
      const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
      if (color) {
        map.set(route.id, color);
      }
    });
    return map;
  }, [routes]);

  // Decode polylines for visible routes
  const decodedPolylines = useMemo(() => {
    const polylines: { routeId: string; path: LatLng[]; color: string; name: string }[] = [];
    visibleRoutes.forEach((route) => {
      if (route.polyline) {
        try {
          const decoded = decodePolyline(route.polyline);
          const defaultColor = ROUTE_COLORS[0] ?? '#042940';
          polylines.push({
            routeId: route.id,
            path: decoded,
            color: routeColorMap.get(route.id) ?? defaultColor,
            name: route.name,
          });
        } catch {
          // Skip invalid polylines
        }
      }
    });
    return polylines;
  }, [visibleRoutes, routeColorMap]);

  // Calculate map center from all visible elements
  const mapCenter = useMemo(() => {
    if (schoolLocation) return schoolLocation;
    const firstRoute = visibleRoutes[0];
    const firstStop = firstRoute?.stops[0];
    if (firstRoute && firstStop) {
      return { lat: firstStop.latitude, lng: firstStop.longitude };
    }
    return { lat: -0.1807, lng: -78.4678 }; // Default to Quito
  }, [schoolLocation, visibleRoutes]);

  // Auto-fit bounds when visible routes change - US-017
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const visibleIdsStr = Array.from(visibleRouteIds).sort().join(',');
    if (visibleIdsStr === prevVisibleIdsRef.current) return;
    prevVisibleIdsRef.current = visibleIdsStr;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    // Add school to bounds
    if (schoolLocation) {
      bounds.extend(schoolLocation);
      hasPoints = true;
    }

    // Add all visible route stops to bounds
    visibleRoutes.forEach((route) => {
      route.stops.forEach((stop) => {
        bounds.extend({ lat: stop.latitude, lng: stop.longitude });
        hasPoints = true;
      });
    });

    if (hasPoints) {
      mapRef.current.fitBounds(bounds, 50);
    }
  }, [isLoaded, visibleRouteIds, visibleRoutes, schoolLocation]);

  // Handle map load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle stop marker click - US-017
  const handleStopClick = useCallback(
    (routeId: string, routeName: string, stopIndex: number, stop: GeneratedRoute['stops'][0]) => {
      const studentNames = stop.studentIds.map((id) => {
        const student = studentsMap.get(id);
        return student?.name || `Estudiante ${id.slice(-4)}`;
      });
      setStopInfoWindow({
        routeId,
        routeName,
        stopIndex,
        stopOrder: stop.order,
        studentNames,
        position: { lat: stop.latitude, lng: stop.longitude },
      });
      setPolylineInfoWindow(null);
    },
    [studentsMap]
  );

  // Handle polyline click - US-017
  const handlePolylineClick = useCallback(
    (routeId: string, routeName: string, event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        setPolylineInfoWindow({
          routeId,
          routeName,
          position: { lat: event.latLng.lat(), lng: event.latLng.lng() },
        });
        setStopInfoWindow(null);
      }
    },
    []
  );

  // Close InfoWindow
  const handleInfoWindowClose = useCallback(() => {
    setStopInfoWindow(null);
    setPolylineInfoWindow(null);
  }, []);

  if (loadError) {
    return <MapsErrorState error={loadError} />;
  }

  if (!isLoaded) {
    return <MapsLoadingState />;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={13}
      onLoad={handleMapLoad}
      options={{
        styles: MAPS_CONFIG.mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {/* School marker - US-017 */}
      {schoolLocation && (
        <Marker
          position={schoolLocation}
          icon={{
            path: SCHOOL_ICON_PATH,
            fillColor: '#042940',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 1,
            scale: 1.5,
            anchor: new google.maps.Point(12, 12),
          }}
          title={schoolName}
          zIndex={1000}
        />
      )}

      {/* Route polylines - US-017 */}
      {decodedPolylines.map((polyline) => (
        <Polyline
          key={`polyline-${polyline.routeId}`}
          path={polyline.path}
          options={{
            strokeColor: polyline.color,
            strokeOpacity: 0.8,
            strokeWeight: 4,
            geodesic: true,
            clickable: true,
          }}
          onClick={(e) => handlePolylineClick(polyline.routeId, polyline.name, e)}
        />
      ))}

      {/* Stop markers for visible routes - US-017 */}
      {visibleRoutes.map((route) => {
        const routeColor = routeColorMap.get(route.id) || ROUTE_COLORS[0];
        return route.stops.map((stop, stopIndex) => (
          <Marker
            key={`stop-${route.id}-${stop.id}`}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: routeColor,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            label={{
              text: String(stop.order),
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: '10px',
            }}
            title={`Parada ${stop.order} - ${route.name}`}
            onClick={() => handleStopClick(route.id, route.name, stopIndex, stop)}
            zIndex={100 + stop.order}
          />
        ));
      })}

      {/* Stop InfoWindow - US-017 */}
      {stopInfoWindow && (
        <InfoWindow
          position={stopInfoWindow.position}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="p-1 max-w-[200px]">
            <p className="font-semibold text-gray-900 text-sm mb-1">
              Parada {stopInfoWindow.stopOrder}
            </p>
            <p className="text-xs text-gray-500 mb-2">{stopInfoWindow.routeName}</p>
            <div className="border-t border-gray-200 pt-2">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Estudiantes ({stopInfoWindow.studentNames.length}):
              </p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {stopInfoWindow.studentNames.slice(0, 5).map((name, idx) => (
                  <li key={idx}>- {name}</li>
                ))}
                {stopInfoWindow.studentNames.length > 5 && (
                  <li className="text-gray-400">
                    ... y {stopInfoWindow.studentNames.length - 5} mas
                  </li>
                )}
              </ul>
            </div>
          </div>
        </InfoWindow>
      )}

      {/* Polyline InfoWindow - US-017 */}
      {polylineInfoWindow && (
        <InfoWindow
          position={polylineInfoWindow.position}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="p-1">
            <p className="font-semibold text-gray-900 text-sm">
              {polylineInfoWindow.routeName}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

/**
 * Unassigned Student info type from the Convex query
 * US-021
 */
interface UnassignedStudent {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  grade?: string;
  address?: string;
  homeLatitude?: number;
  homeLongitude?: number;
  hasGps: boolean;
}

/**
 * Props for UnassignedStudentRow
 */
interface UnassignedStudentRowProps {
  student: UnassignedStudent;
  routes: Array<{ id: string; name: string; stops: Array<{ id: string; order: number; studentIds: string[] }> }>;
  onAssign: (studentId: string, routeId: string, stopId: string | null) => void;
}

/**
 * Single unassigned student row with assignment dropdown
 * US-021: Shows name, address, and Asignar button with dropdown
 */
function UnassignedStudentRow({ student, routes, onAssign }: UnassignedStudentRowProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get stops for selected route
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const stops = selectedRoute?.stops || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle assignment
  const handleAssign = useCallback(() => {
    if (selectedRouteId) {
      onAssign(student.id, selectedRouteId, selectedStopId);
      setIsDropdownOpen(false);
      setSelectedRouteId('');
      setSelectedStopId(null);
    }
  }, [student.id, selectedRouteId, selectedStopId, onAssign]);

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 px-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      {/* Student info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">
          {student.fullName}
        </p>
        {student.address && (
          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
            <Home className="w-3 h-3 flex-shrink-0" />
            {student.address.length > 40
              ? `${student.address.substring(0, 40)}...`
              : student.address}
          </p>
        )}
        {!student.hasGps && (
          <p className="text-xs text-warning font-medium mt-0.5">Sin GPS</p>
        )}
      </div>

      {/* Assignment dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Asignar
          <ChevronDown className={cn('w-3 h-3 transition-transform', isDropdownOpen && 'rotate-180')} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 space-y-3">
            {/* Route selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Seleccionar ruta</label>
              <select
                value={selectedRouteId}
                onChange={(e) => {
                  setSelectedRouteId(e.target.value);
                  setSelectedStopId(null); // Reset stop when route changes
                }}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Seleccionar --</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.stops.reduce((sum, s) => sum + s.studentIds.length, 0)} est.)
                  </option>
                ))}
              </select>
            </div>

            {/* Stop selector (only shown if route selected) */}
            {selectedRouteId && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Seleccionar parada</label>
                <select
                  value={selectedStopId || ''}
                  onChange={(e) => setSelectedStopId(e.target.value || null)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Nueva parada (ubicacion del estudiante)</option>
                  {stops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      Parada {stop.order} ({stop.studentIds.length} est.)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedRouteId}
              className={cn(
                'w-full py-2 text-xs font-medium rounded-lg transition-colors',
                selectedRouteId
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              Confirmar asignacion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Collapsible panel for unassigned students
 * US-021: Shows unassigned students with assignment functionality
 */
interface UnassignedStudentsPanelProps {
  unassignedStudents: UnassignedStudent[];
  routes: Array<{ id: string; name: string; stops: Array<{ id: string; order: number; studentIds: string[]; latitude: number; longitude: number }> }>;
  onAssignStudent: (studentId: string, routeId: string, stopId: string | null) => void;
  isLoading: boolean;
}

function UnassignedStudentsPanel({
  unassignedStudents,
  routes,
  onAssignStudent,
  isLoading,
}: UnassignedStudentsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const count = unassignedStudents.length;

  if (count === 0) return null;

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-warning/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <UserX className="w-4 h-4 text-warning" />
          <span className="font-semibold text-sm text-warning">
            {count} estudiante{count !== 1 ? 's' : ''} sin asignar
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-warning" />
        ) : (
          <ChevronDown className="w-4 h-4 text-warning" />
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t border-warning/20 bg-white max-h-[250px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Cargando estudiantes...</span>
            </div>
          ) : (
            unassignedStudents.map((student) => (
              <UnassignedStudentRow
                key={student.id}
                student={student}
                routes={routes}
                onAssign={onAssignStudent}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Step 4 Route Review Component
 */
export function Step4RouteReview({
  step1Data,
  data,
  step3Data,
  onChange,
  onValidChange,
  onConfirm,
  onBack,
}: Step4RouteReviewProps) {
  const { institution } = useInstitution();
  const { userId } = useConvexAuth();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  // Track which routes are visible on the map - US-016
  const [visibleRouteIds, setVisibleRouteIds] = useState<Set<string>>(new Set());
  // Track if route names have been auto-generated
  const hasAutoGeneratedNames = useRef(false);

  // US-018: Modal state for route details
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRouteId, setDetailRouteId] = useState<string | null>(null);

  const { generatedRoutes, unassignedStudentIds } = data;
  const { maxRouteTime } = step3Data;
  const { routeType } = step1Data;

  // US-021: Query unassigned student details
  const unassignedStudentsData = useQuery(
    api.routes.getUnassignedStudentDetails,
    userId && institution && unassignedStudentIds.length > 0
      ? {
          userId,
          institutionId: institution._id,
          studentIds: unassignedStudentIds,
        }
      : 'skip'
  );
  const isLoadingUnassigned = unassignedStudentsData === undefined && unassignedStudentIds.length > 0;
  const unassignedStudents: UnassignedStudent[] = unassignedStudentsData?.students || [];

  // Auto-generate route names on first render if not already named - US-016
  useEffect(() => {
    if (generatedRoutes.length > 0 && !hasAutoGeneratedNames.current) {
      const needsAutoNaming = generatedRoutes.some(
        (route) => !route.name || route.name.startsWith('Ruta ')
      );
      if (needsAutoNaming) {
        const updatedRoutes = generatedRoutes.map((route, index) => ({
          ...route,
          name: route.name && !route.name.match(/^Ruta \d+$/)
            ? route.name
            : generateRouteName(routeType, index),
        }));
        onChange({ generatedRoutes: updatedRoutes });
        hasAutoGeneratedNames.current = true;
      }
    }
  }, [generatedRoutes, routeType, onChange]);

  // Initialize all routes as visible on map when routes change - US-016
  useEffect(() => {
    if (generatedRoutes.length > 0 && visibleRouteIds.size === 0) {
      setVisibleRouteIds(new Set(generatedRoutes.map((r) => r.id)));
    }
  }, [generatedRoutes, visibleRouteIds.size]);

  // Select first route by default when routes are available
  useEffect(() => {
    const firstRoute = generatedRoutes[0];
    if (firstRoute && !selectedRouteId) {
      setSelectedRouteId(firstRoute.id);
    }
  }, [generatedRoutes, selectedRouteId]);

  // Calculate totals
  const totalAssignedStudents = useMemo(() => {
    return generatedRoutes.reduce((sum, route) => {
      return sum + route.stops.reduce((s, stop) => s + stop.studentIds.length, 0);
    }, 0);
  }, [generatedRoutes]);

  const hasUnassignedStudents = unassignedStudentIds.length > 0;

  // Calculate validation warnings - US-022
  const validationWarnings = useMemo((): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];

    // Warning: Unassigned students
    if (unassignedStudentIds.length > 0) {
      warnings.push({
        id: 'unassigned-students',
        message: `${unassignedStudentIds.length} estudiante${unassignedStudentIds.length !== 1 ? 's' : ''} sin asignar`,
        detail: 'Revisa la capacidad de los vehiculos o modifica las rutas manualmente.',
        type: 'warning',
      });
    }

    // Warning: Routes exceeding max time
    const routesExceedingTime = generatedRoutes.filter(
      (route) => route.duration > maxRouteTime
    );
    if (routesExceedingTime.length > 0) {
      const routeNames = routesExceedingTime
        .map((r, i) => r.name || `Ruta ${generatedRoutes.indexOf(r) + 1}`)
        .slice(0, 3)
        .join(', ');
      const suffix = routesExceedingTime.length > 3
        ? ` y ${routesExceedingTime.length - 3} mas`
        : '';
      warnings.push({
        id: 'routes-exceed-time',
        message: `${routesExceedingTime.length} ruta${routesExceedingTime.length !== 1 ? 's' : ''} excede${routesExceedingTime.length === 1 ? '' : 'n'} el tiempo maximo (${maxRouteTime} min)`,
        detail: `Rutas: ${routeNames}${suffix}`,
        type: 'warning',
      });
    }

    // Warning: Routes with only 1 student (inefficient)
    const inefficientRoutes = generatedRoutes.filter((route) => {
      const studentCount = route.stops.reduce(
        (sum, stop) => sum + stop.studentIds.length,
        0
      );
      return studentCount === 1;
    });
    if (inefficientRoutes.length > 0) {
      const routeNames = inefficientRoutes
        .map((r) => r.name || `Ruta ${generatedRoutes.indexOf(r) + 1}`)
        .slice(0, 3)
        .join(', ');
      const suffix = inefficientRoutes.length > 3
        ? ` y ${inefficientRoutes.length - 3} mas`
        : '';
      warnings.push({
        id: 'inefficient-routes',
        message: `${inefficientRoutes.length} ruta${inefficientRoutes.length !== 1 ? 's' : ''} con solo 1 estudiante (ineficiente)`,
        detail: `Rutas: ${routeNames}${suffix}`,
        type: 'warning',
      });
    }

    return warnings;
  }, [generatedRoutes, unassignedStudentIds, maxRouteTime]);

  // Check if there are any warnings (all are non-blocking per US-022)
  const hasWarnings = validationWarnings.length > 0;

  // School location from institution
  const schoolLocation: LatLng | null = useMemo(() => {
    if (institution?.schoolLatitude && institution?.schoolLongitude) {
      return {
        lat: institution.schoolLatitude,
        lng: institution.schoolLongitude,
      };
    }
    return null;
  }, [institution?.schoolLatitude, institution?.schoolLongitude]);

  // Map center defaults to school location
  const mapCenter = schoolLocation || { lat: -0.1807, lng: -78.4678 }; // Default to Quito

  // Handle route selection
  const handleRouteSelect = useCallback((routeId: string) => {
    setSelectedRouteId(routeId);
  }, []);

  // US-018: Handle view route details - opens modal
  const handleViewDetails = useCallback((routeId: string) => {
    setDetailRouteId(routeId);
    setDetailModalOpen(true);
  }, []);

  // US-018: Handle modal close
  const handleDetailModalClose = useCallback(() => {
    setDetailModalOpen(false);
    setDetailRouteId(null);
  }, []);

  // US-018: Handle save from modal
  const handleSaveRouteFromModal = useCallback(
    (updatedRoute: GeneratedRoute) => {
      const updatedRoutes = generatedRoutes.map((route) =>
        route.id === updatedRoute.id ? updatedRoute : route
      );
      onChange({ generatedRoutes: updatedRoutes });
    },
    [generatedRoutes, onChange]
  );

  // US-018: Get the currently viewed route for modal
  const detailRoute = useMemo(() => {
    if (!detailRouteId) return null;
    return generatedRoutes.find((r) => r.id === detailRouteId) || null;
  }, [detailRouteId, generatedRoutes]);

  // US-018: Build vehicles list for modal dropdown
  const modalVehicles: VehicleOption[] = useMemo(() => {
    // Get unique vehicle IDs from all routes
    const vehicleIds = new Set(generatedRoutes.map((r) => r.vehicleId));
    // Return vehicle options - simplified for now
    return Array.from(vehicleIds).map((id) => ({
      id,
      licensePlate: id.slice(-6).toUpperCase(),
      brand: 'Vehiculo',
      model: '',
      capacity: 40,
    }));
  }, [generatedRoutes]);

  // US-018: Build students map for modal
  const modalStudentsMap: Map<string, StudentInfo> = useMemo(() => {
    const map = new Map<string, StudentInfo>();
    // Build from all routes' stops
    generatedRoutes.forEach((route) => {
      route.stops.forEach((stop) => {
        stop.studentIds.forEach((studentId) => {
          if (!map.has(studentId)) {
            map.set(studentId, {
              id: studentId,
              name: `Estudiante ${studentId.slice(-4)}`,
              homeLatitude: stop.latitude,
              homeLongitude: stop.longitude,
            });
          }
        });
      });
    });
    return map;
  }, [generatedRoutes]);

  // Toggle single route map visibility - US-016
  const handleToggleMapVisibility = useCallback((routeId: string) => {
    setVisibleRouteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  }, []);

  // Select all routes for map visibility - US-016
  const handleSelectAll = useCallback(() => {
    setVisibleRouteIds(new Set(generatedRoutes.map((r) => r.id)));
  }, [generatedRoutes]);

  // Deselect all routes from map visibility - US-016
  const handleDeselectAll = useCallback(() => {
    setVisibleRouteIds(new Set());
  }, []);

  // Handle route name change - US-016
  const handleRouteNameChange = useCallback(
    (routeId: string, newName: string) => {
      const updatedRoutes = generatedRoutes.map((route) =>
        route.id === routeId ? { ...route, name: newName } : route
      );
      onChange({ generatedRoutes: updatedRoutes });
    },
    [generatedRoutes, onChange]
  );

  // US-021: Handle assigning an unassigned student to a route
  const handleAssignStudent = useCallback(
    (studentId: string, routeId: string, stopId: string | null) => {
      // Find the student data
      const student = unassignedStudents.find((s) => s.id === studentId);
      if (!student) return;

      // Update routes with the new student assignment
      const updatedRoutes = generatedRoutes.map((route) => {
        if (route.id !== routeId) return route;

        if (stopId) {
          // Add student to existing stop
          return {
            ...route,
            stops: route.stops.map((stop) =>
              stop.id === stopId
                ? { ...stop, studentIds: [...stop.studentIds, studentId] }
                : stop
            ),
          };
        } else {
          // Create new stop with student's location
          const newStopId = `stop-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const newOrder = route.stops.length + 1;
          const newStop = {
            id: newStopId,
            latitude: student.homeLatitude || 0,
            longitude: student.homeLongitude || 0,
            studentIds: [studentId],
            order: newOrder,
          };
          return {
            ...route,
            stops: [...route.stops, newStop],
          };
        }
      });

      // Remove student from unassigned list
      const updatedUnassignedIds = unassignedStudentIds.filter((id) => id !== studentId);

      // Update both in a single onChange call
      onChange({
        generatedRoutes: updatedRoutes,
        unassignedStudentIds: updatedUnassignedIds,
      });
    },
    [generatedRoutes, unassignedStudentIds, unassignedStudents, onChange]
  );

  // Count how many routes are visible on map
  const visibleCount = visibleRouteIds.size;
  const allVisible = visibleCount === generatedRoutes.length;
  const noneVisible = visibleCount === 0;

  // Get route color by index - US-017
  const getRouteColor = useCallback((index: number): string => {
    return ROUTE_COLORS[index % ROUTE_COLORS.length] ?? '#042940';
  }, []);

  // Validation: at least one route must exist
  useEffect(() => {
    const isValid = generatedRoutes.length > 0;
    onValidChange(isValid);
  }, [generatedRoutes.length, onValidChange]);

  // Empty state - no routes calculated
  if (generatedRoutes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="text-center">
          <Route className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No hay rutas calculadas</p>
          <p className="text-sm text-gray-400 mt-1">
            Regresa al paso anterior para calcular las rutas
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMapsProvider>
      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
        {/* Left Side: Route Cards (1/3) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          {/* Summary Header */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Resumen de Rutas
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Rutas generadas:</span>
                <span className="font-semibold text-gray-900">
                  {generatedRoutes.length}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estudiantes asignados:</span>
                <span className="font-semibold text-gray-900">
                  {totalAssignedStudents}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Sin asignar:</span>
                <span
                  className={cn(
                    'font-semibold',
                    hasUnassignedStudents ? 'text-warning' : 'text-gray-900'
                  )}
                >
                  {unassignedStudentIds.length}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Visibles en mapa:</span>
                <span className="font-semibold text-gray-900">
                  {visibleCount} / {generatedRoutes.length}
                </span>
              </div>
            </div>

            {/* Bulk selection buttons - US-016 */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={allVisible}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                  allVisible
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Seleccionar todas
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                disabled={noneVisible}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                  noneVisible
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Square className="w-3.5 h-3.5" />
                Deseleccionar todas
              </button>
            </div>
          </div>

          {/* Validation Warnings - US-022 */}
          <ValidationBanner warnings={validationWarnings} />

          {/* US-021: Unassigned Students Panel */}
          {unassignedStudentIds.length > 0 && (
            <UnassignedStudentsPanel
              unassignedStudents={unassignedStudents}
              routes={generatedRoutes}
              onAssignStudent={handleAssignStudent}
              isLoading={isLoadingUnassigned}
            />
          )}

          {/* Route Cards List */}
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0 max-h-[400px] lg:max-h-none">
            {generatedRoutes.map((route, index) => (
              <RouteCard
                key={route.id}
                route={route}
                index={index}
                onViewDetails={() => handleViewDetails(route.id)}
                isSelected={selectedRouteId === route.id}
                isVisibleOnMap={visibleRouteIds.has(route.id)}
                onSelect={() => handleRouteSelect(route.id)}
                onToggleMapVisibility={() => handleToggleMapVisibility(route.id)}
                onNameChange={(newName) => handleRouteNameChange(route.id, newName)}
                routeColor={getRouteColor(index)}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Map (2/3) - US-017 */}
        <div className="w-full lg:w-2/3 min-h-[300px] lg:min-h-0">
          <div className="h-full rounded-xl overflow-hidden border border-gray-200">
            <MultiRouteMap
              routes={generatedRoutes}
              visibleRouteIds={visibleRouteIds}
              schoolLocation={schoolLocation}
              schoolName={institution?.name || 'Colegio'}
              studentsMap={modalStudentsMap}
            />
          </div>
        </div>
      </div>

      {/* Navigation Section - US-022 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Atras
          </button>

          {/* Validation Summary and Confirm Button */}
          <div className="flex items-center gap-4">
            {/* Validation Status */}
            <div className="flex items-center gap-2 text-sm">
              {hasWarnings ? (
                <>
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span className="text-warning font-medium">
                    {validationWarnings.length} advertencia{validationWarnings.length !== 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-success font-medium">
                    Sin advertencias
                  </span>
                </>
              )}
            </div>

            {/* Confirm Routes Button */}
            <button
              type="button"
              onClick={onConfirm}
              disabled={generatedRoutes.length === 0}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors',
                generatedRoutes.length > 0
                  ? hasWarnings
                    ? 'bg-warning text-white hover:bg-warning/90'
                    : 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {hasWarnings ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Confirmar Rutas
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Rutas
                </>
              )}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* US-018: Route Detail Modal */}
      {detailRoute && schoolLocation && (
        <RouteDetailModal
          isOpen={detailModalOpen}
          onClose={handleDetailModalClose}
          route={detailRoute}
          onSave={handleSaveRouteFromModal}
          vehicles={modalVehicles}
          studentsMap={modalStudentsMap}
          routeType={routeType || 'pickup'}
          schoolLocation={schoolLocation}
          unassignedStudents={unassignedStudentIds.map((id) => ({
            id,
            name: `Estudiante ${id.slice(-4)}`,
          }))}
        />
      )}
    </GoogleMapsProvider>
  );
}
