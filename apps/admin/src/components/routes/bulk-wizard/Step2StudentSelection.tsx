'use client';

/**
 * Step 2: Student Selection for Bulk Route Creation
 *
 * Split view layout:
 * - Left: Google Map showing school marker and selected students
 * - Right: Route summary header and paginated student list
 *
 * PRD References:
 * - US-004 - Step 2 - Split view layout with map
 * - US-005 - Step 2 - Student list with pagination (placeholder for now)
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapPin, Users, Clock, Calendar } from 'lucide-react';
import {
  GoogleMapsProvider,
  InteractiveMap,
} from '@altaviapp/maps';
import type { MarkerInfo, LatLng } from '@altaviapp/maps';
import { cn } from '@/lib/utils';
import { useInstitution } from '@/hooks';
import type { BulkWizardStep1Data, BulkWizardStep2Data } from './BulkRouteWizard';

interface Step2StudentSelectionProps {
  step1Data: BulkWizardStep1Data;
  data: BulkWizardStep2Data;
  onChange: (data: Partial<BulkWizardStep2Data>) => void;
  onValidChange: (isValid: boolean) => void;
}

const DAYS_LABELS: Record<string, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
  sunday: 'Dom',
};

export function Step2StudentSelection({
  step1Data,
  data,
  onChange,
  onValidChange,
}: Step2StudentSelectionProps) {
  const { institution } = useInstitution();
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

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

  // School marker always visible
  const markers: MarkerInfo[] = useMemo(() => {
    const result: MarkerInfo[] = [];

    // School marker
    if (schoolLocation) {
      result.push({
        id: 'school',
        type: 'school',
        position: schoolLocation,
        title: institution?.name || 'Colegio',
      });
    }

    // Student markers will be added in US-008
    // For now, just show the school marker

    return result;
  }, [schoolLocation, institution?.name]);

  // Map center defaults to school location
  const mapCenter = schoolLocation || { lat: -0.1807, lng: -78.4678 }; // Default to Quito

  // Handle map load to store reference for bounds fitting
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Calculate selected count
  const selectedCount = data.selectedStudentIds.length;
  // Total count will come from the query in US-005
  const totalCount = 0; // Placeholder

  // Format operation days for display
  const operationDaysLabel = useMemo(() => {
    if (step1Data.operationType === 'daily') {
      return 'Lunes a Viernes';
    }
    return step1Data.selectedDays
      .map((day) => DAYS_LABELS[day] || day)
      .join(', ');
  }, [step1Data.operationType, step1Data.selectedDays]);

  // Validation: at least one student must be selected
  // For now, set valid = false since no students can be selected yet (US-007)
  useEffect(() => {
    const isValid = selectedCount > 0;
    onValidChange(isValid);
  }, [selectedCount, onValidChange]);

  return (
    <GoogleMapsProvider>
      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
        {/* Left Side: Map */}
        <div className="w-full lg:w-1/2 min-h-[300px] lg:min-h-0">
          <div className="h-full rounded-xl overflow-hidden border border-gray-200">
            <InteractiveMap
              center={mapCenter}
              zoom={13}
              markers={markers}
              onMapLoad={handleMapLoad}
              style={{ height: '100%', minHeight: '300px' }}
            />
          </div>
        </div>

        {/* Right Side: Summary and Student List */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {/* Route Summary Header */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Resumen de Configuración
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Route Type */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-primary" />
                <span>
                  {step1Data.routeType === 'pickup'
                    ? 'Recogida (casa→colegio)'
                    : step1Data.routeType === 'dropoff'
                      ? 'Entrega (colegio→casa)'
                      : 'No definido'}
                </span>
              </div>

              {/* Target Time */}
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-primary" />
                <span>
                  {step1Data.targetTime || '--:--'}
                  {step1Data.routeType === 'pickup'
                    ? ' (llegada)'
                    : step1Data.routeType === 'dropoff'
                      ? ' (salida)'
                      : ''}
                </span>
              </div>

              {/* Operation Days */}
              <div className="flex items-center gap-2 text-gray-600 col-span-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{operationDaysLabel}</span>
              </div>
            </div>
          </div>

          {/* Selection Counter */}
          <div className="flex items-center justify-between bg-primary/5 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900">
                Estudiantes seleccionados
              </span>
            </div>
            <div className="text-lg font-bold text-primary">
              {selectedCount} de {totalCount}
            </div>
          </div>

          {/* Student List Placeholder - will be implemented in US-005 */}
          <div className="flex-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center min-h-[200px]">
            <div className="text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Lista de Estudiantes</p>
              <p className="text-sm text-gray-400 mt-1">
                (Por implementar en US-005)
              </p>
            </div>
          </div>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
