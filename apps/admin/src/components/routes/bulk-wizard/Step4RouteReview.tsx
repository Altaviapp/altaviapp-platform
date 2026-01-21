'use client';

/**
 * Step 4: Route Review for Bulk Route Creation
 *
 * Split view layout:
 * - Left: Scrollable list of route cards (1/3)
 * - Right: Google Map showing selected route(s) (2/3)
 *
 * PRD Reference: US-015 - Step 4 - Split view with route cards
 * PRD Reference: US-022 - Step 4 - Validation warnings and navigation
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MapPin,
  Users,
  Clock,
  Route,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  GoogleMapsProvider,
  InteractiveMap,
} from '@altaviapp/maps';
import type { LatLng } from '@altaviapp/maps';
import { cn } from '@/lib/utils';
import { useInstitution } from '@/hooks';
import type { BulkWizardStep4Data, BulkWizardStep3Data, GeneratedRoute } from './BulkRouteWizard';

interface Step4RouteReviewProps {
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
  onSelect: () => void;
  vehiclePlate?: string;
}

/**
 * Route Card Component
 * Displays route summary: number, students, duration, distance
 */
function RouteCard({
  route,
  index,
  isSelected,
  onSelect,
  vehiclePlate,
}: RouteCardProps) {
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

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full p-4 rounded-xl border-2 text-left transition-all',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      )}
    >
      {/* Route Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
              isSelected
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              {route.name || `Ruta ${index + 1}`}
            </h4>
            {vehiclePlate && (
              <p className="text-xs text-gray-500">{vehiclePlate}</p>
            )}
          </div>
        </div>
        {/* Selection Indicator */}
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 transition-colors',
            isSelected
              ? 'bg-primary border-primary'
              : 'bg-white border-gray-300'
          )}
        >
          {isSelected && (
            <svg
              className="w-full h-full text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="6" />
            </svg>
          )}
        </div>
      </div>

      {/* Route Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {/* Students */}
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4 text-primary" />
          <span>
            {studentCount} estudiante{studentCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Stops */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-primary" />
          <span>
            {route.stops.length} parada{route.stops.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 text-primary" />
          <span>{formattedDuration}</span>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-2 text-gray-600">
          <Route className="w-4 h-4 text-primary" />
          <span>{formattedDistance}</span>
        </div>
      </div>
    </button>
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
 * Step 4 Route Review Component
 */
export function Step4RouteReview({
  data,
  step3Data,
  onChange,
  onValidChange,
  onConfirm,
  onBack,
}: Step4RouteReviewProps) {
  const { institution } = useInstitution();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const { generatedRoutes, unassignedStudentIds } = data;
  const { maxRouteTime } = step3Data;

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
            </div>
          </div>

          {/* Warning Banner: Unassigned Students */}
          {hasUnassignedStudents && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">
                    {unassignedStudentIds.length} estudiante{unassignedStudentIds.length !== 1 ? 's' : ''} sin asignar
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Revisa la capacidad de los vehiculos o modifica las rutas manualmente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Route Cards List */}
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0 max-h-[400px] lg:max-h-none">
            {generatedRoutes.map((route, index) => (
              <RouteCard
                key={route.id}
                route={route}
                index={index}
                isSelected={selectedRouteId === route.id}
                onSelect={() => handleRouteSelect(route.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Map (2/3) */}
        <div className="w-full lg:w-2/3 min-h-[300px] lg:min-h-0">
          <div className="h-full rounded-xl overflow-hidden border border-gray-200">
            <InteractiveMap
              center={mapCenter}
              zoom={13}
              markers={schoolLocation ? [{
                id: 'school',
                type: 'school',
                position: schoolLocation,
                title: institution?.name || 'Colegio',
              }] : []}
              showInfoWindow={true}
              style={{ height: '100%', minHeight: '300px' }}
            />
          </div>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
