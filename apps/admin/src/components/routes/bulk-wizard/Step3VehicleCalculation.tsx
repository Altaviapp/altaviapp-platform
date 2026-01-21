'use client';

/**
 * Step 3: Vehicle Selection for Bulk Route Creation
 *
 * Displays selected students summary and available vehicles.
 * Allows selecting vehicles to include in route calculation.
 * Shows running capacity total vs selected students.
 * Includes advanced parameters for route calculation.
 *
 * PRD References:
 * - US-010 - Step 3 - Layout and vehicle list display
 * - US-011 - Step 3 - Capacity validation and parameters
 * - US-014 - Step 3 - Calculate routes button and flow
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import {
  Bus,
  Users,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Settings2,
  Loader2,
  Calculator,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../../../../convex/_generated/api';
import { cn } from '@/lib/utils';
import { useConvexAuth, useInstitution } from '@/hooks';
import { Input } from '@/components/core';
import type { BulkWizardStep3Data, BulkWizardStep1Data, GeneratedRoute } from './BulkRouteWizard';
import {
  clusterStudentsForRoutes,
  type ClusteringStudent,
  type ClusteringVehicle,
} from '@/services/routeClustering';
import {
  optimizeRouteOrder,
  type OptimizationStop,
} from '@/services/routeOptimization';

interface Step3VehicleCalculationProps {
  step1Data: BulkWizardStep1Data;
  selectedStudentIds: string[];
  data: BulkWizardStep3Data;
  onChange: (data: Partial<BulkWizardStep3Data>) => void;
  onValidChange: (isValid: boolean) => void;
  onCalculationComplete: (routes: GeneratedRoute[], unassignedStudentIds: string[]) => void;
  onAdvanceToStep4: () => void;
}

export function Step3VehicleCalculation({
  step1Data,
  selectedStudentIds,
  data,
  onChange,
  onValidChange,
  onCalculationComplete,
  onAdvanceToStep4,
}: Step3VehicleCalculationProps) {
  const { userId, institutionId } = useConvexAuth();
  const { institution } = useInstitution();
  const [isParamsExpanded, setIsParamsExpanded] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Derived state
  const selectedStudentCount = selectedStudentIds.length;

  // Query active vehicles
  const vehicles = useQuery(
    api.routes.getVehiclesForBulkCreation,
    userId && institutionId
      ? {
          userId,
          institutionId,
        }
      : 'skip'
  );

  // Query students for clustering (only when calculating)
  const studentsData = useQuery(
    api.routes.getStudentsMapData,
    userId && institutionId && selectedStudentIds.length > 0
      ? {
          userId,
          institutionId,
          studentIds: selectedStudentIds,
        }
      : 'skip'
  );

  // School location
  const schoolLocation = useMemo(() => {
    if (institution?.schoolLatitude && institution?.schoolLongitude) {
      return {
        lat: institution.schoolLatitude,
        lng: institution.schoolLongitude,
      };
    }
    return null;
  }, [institution?.schoolLatitude, institution?.schoolLongitude]);

  // Calculate selected capacity
  const selectedCapacity = useMemo(() => {
    if (!vehicles) return 0;
    return vehicles
      .filter((v) => data.selectedVehicleIds.includes(v.id))
      .reduce((sum, v) => sum + v.capacity, 0);
  }, [vehicles, data.selectedVehicleIds]);

  // Check if capacity meets student count
  const hasEnoughCapacity = selectedCapacity >= selectedStudentCount;

  // Validate step - at least one vehicle selected
  useEffect(() => {
    const isValid = data.selectedVehicleIds.length > 0;
    onValidChange(isValid);
  }, [data.selectedVehicleIds, onValidChange]);

  const handleVehicleToggle = (vehicleId: string) => {
    const currentIds = data.selectedVehicleIds;
    const newIds = currentIds.includes(vehicleId)
      ? currentIds.filter((id) => id !== vehicleId)
      : [...currentIds, vehicleId];
    onChange({ selectedVehicleIds: newIds });
  };

  const handleSelectAll = () => {
    if (!vehicles) return;
    onChange({ selectedVehicleIds: vehicles.map((v) => v.id) });
  };

  const handleClearSelection = () => {
    onChange({ selectedVehicleIds: [] });
  };

  // Calculate routes handler
  const handleCalculateRoutes = useCallback(async () => {
    // Validate prerequisites
    if (!schoolLocation) {
      setCalculationError('La ubicación del colegio no está configurada');
      return;
    }

    if (!studentsData?.students || studentsData.students.length === 0) {
      setCalculationError('No hay estudiantes seleccionados');
      return;
    }

    if (!vehicles || data.selectedVehicleIds.length === 0) {
      setCalculationError('Debes seleccionar al menos un vehículo');
      return;
    }

    if (!hasEnoughCapacity) {
      setCalculationError(
        `Capacidad insuficiente. Faltan ${selectedStudentCount - selectedCapacity} asientos.`
      );
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      // Prepare students for clustering
      const clusteringStudents: ClusteringStudent[] = studentsData.students
        .filter((s) => s.hasGps && s.homeLatitude && s.homeLongitude)
        .map((s) => ({
          id: s.id,
          name: s.fullName,
          position: {
            lat: s.homeLatitude!,
            lng: s.homeLongitude!,
          },
        }));

      // Prepare selected vehicles for clustering
      const selectedVehicles = vehicles.filter((v) =>
        data.selectedVehicleIds.includes(v.id)
      );
      const clusteringVehicles: ClusteringVehicle[] = selectedVehicles.map((v) => ({
        id: v.id,
        capacity: v.capacity,
      }));

      // Step 1: Cluster students into route groups
      const clusterResult = clusterStudentsForRoutes(
        clusteringStudents,
        clusteringVehicles,
        schoolLocation,
        {
          groupingRadius: data.groupingRadius,
        }
      );

      // Step 2: Optimize each cluster's route order
      const routeType = step1Data.routeType as 'pickup' | 'dropoff';
      const generatedRoutes: GeneratedRoute[] = [];

      for (let i = 0; i < clusterResult.clusters.length; i++) {
        const cluster = clusterResult.clusters[i];
        if (!cluster || cluster.stops.length === 0) continue;

        // Prepare stops for optimization
        const optimizationStops: OptimizationStop[] = cluster.stops.map((stop) => ({
          id: stop.id,
          position: stop.position,
          studentIds: stop.studentIds,
        }));

        // Optimize route order
        const optimizationResult = await optimizeRouteOrder(
          schoolLocation,
          optimizationStops,
          routeType
        );

        // Generate route name
        const routeName =
          routeType === 'pickup'
            ? `Ruta Recogida ${i + 1}`
            : `Ruta Entrega ${i + 1}`;

        // Build generated route
        const route: GeneratedRoute = {
          id: `route-${Date.now()}-${i}`,
          name: routeName,
          vehicleId: cluster.vehicleId,
          stops: optimizationResult.stops.map((stop) => ({
            id: stop.id,
            latitude: stop.position.lat,
            longitude: stop.position.lng,
            studentIds: stop.studentIds,
            order: stop.order,
          })),
          polyline: optimizationResult.encodedPolyline,
          duration: optimizationResult.totalDuration,
          distance: optimizationResult.totalDistance,
        };

        generatedRoutes.push(route);
      }

      // Collect unassigned student IDs
      const unassignedStudentIds = [
        ...clusterResult.unassignedStudents.map((s) => s.id),
        ...clusterResult.studentsWithoutGps.map((s) => s.id),
      ];

      // Store results and advance to Step 4
      onCalculationComplete(generatedRoutes, unassignedStudentIds);
      onAdvanceToStep4();
    } catch (error) {
      console.error('Route calculation error:', error);
      setCalculationError(
        error instanceof Error
          ? `Error al calcular rutas: ${error.message}`
          : 'Error desconocido al calcular rutas. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsCalculating(false);
    }
  }, [
    schoolLocation,
    studentsData,
    vehicles,
    data.selectedVehicleIds,
    data.groupingRadius,
    hasEnoughCapacity,
    selectedStudentCount,
    selectedCapacity,
    step1Data.routeType,
    onCalculationComplete,
    onAdvanceToStep4,
  ]);

  // Check if calculation can proceed
  const canCalculate =
    data.selectedVehicleIds.length > 0 &&
    hasEnoughCapacity &&
    schoolLocation !== null &&
    studentsData?.students &&
    studentsData.students.length > 0;

  // Loading state
  if (vehicles === undefined) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
        {/* Vehicle list skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Students Selected Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {selectedStudentCount} estudiante{selectedStudentCount !== 1 ? 's' : ''} seleccionado{selectedStudentCount !== 1 ? 's' : ''} para asignar a rutas
            </p>
            <p className="text-sm text-gray-500">
              Selecciona los vehiculos disponibles para el calculo de rutas
            </p>
          </div>
        </div>
      </div>

      {/* Capacity Summary */}
      <div
        className={cn(
          'rounded-xl p-4 flex items-center justify-between',
          hasEnoughCapacity
            ? 'bg-success/10 border border-success/20'
            : 'bg-warning/10 border border-warning/20'
        )}
      >
        <div className="flex items-center gap-3">
          {hasEnoughCapacity ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <XCircle className="w-5 h-5 text-warning" />
          )}
          <span className="font-medium text-gray-900">
            Capacidad seleccionada: {selectedCapacity} / {selectedStudentCount} estudiantes
          </span>
        </div>
        {!hasEnoughCapacity && selectedStudentCount > 0 && (
          <span className="text-sm text-warning">
            Faltan {selectedStudentCount - selectedCapacity} asientos
          </span>
        )}
      </div>

      {/* Vehicle Selection Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Vehiculos disponibles ({vehicles.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Seleccionar todos
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Vehicle List */}
      {vehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No hay vehiculos disponibles</p>
          <p className="text-sm">Asegurate de tener vehiculos activos configurados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vehicles.map((vehicle) => {
            const isSelected = data.selectedVehicleIds.includes(vehicle.id);
            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handleVehicleToggle(vehicle.id)}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Vehicle Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    <Bus className="w-5 h-5" />
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {vehicle.licensePlate}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          vehicle.status === 'active'
                            ? 'bg-success/10 text-success'
                            : vehicle.status === 'maintenance'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {vehicle.status === 'active'
                          ? 'Activo'
                          : vehicle.status === 'maintenance'
                            ? 'Mantenimiento'
                            : 'Fuera de servicio'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  </div>

                  {/* Capacity */}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {vehicle.capacity}
                    </div>
                    <div className="text-xs text-gray-500">asientos</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Advanced Parameters Section - Collapsible */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsParamsExpanded(!isParamsExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">Parámetros Avanzados</span>
          </div>
          {isParamsExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isParamsExpanded && (
          <div className="p-4 space-y-6 bg-white border-t border-gray-200">
            {/* Grouping Radius */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Radio de agrupación (metros)"
                type="number"
                min={50}
                max={500}
                value={data.groupingRadius}
                onChange={(e) =>
                  onChange({ groupingRadius: Math.min(500, Math.max(50, parseInt(e.target.value) || 100)) })
                }
                hint="Estudiantes dentro de este radio compartirán parada (50-500m)"
              />

              <Input
                label="Tiempo máximo de ruta (minutos)"
                type="number"
                min={30}
                max={120}
                value={data.maxRouteTime}
                onChange={(e) =>
                  onChange({ maxRouteTime: Math.min(120, Math.max(30, parseInt(e.target.value) || 60)) })
                }
                hint="Duración máxima por ruta (30-120 min)"
              />
            </div>

            {/* Optimization Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priorizar
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onChange({ optimizationPriority: 'less_stops' })}
                  className={cn(
                    'flex-1 p-4 rounded-lg border-2 text-left transition-all',
                    data.optimizationPriority === 'less_stops'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        data.optimizationPriority === 'less_stops'
                          ? 'border-primary'
                          : 'border-gray-300'
                      )}
                    >
                      {data.optimizationPriority === 'less_stops' && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Menos paradas</span>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Agrupa más estudiantes por parada
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ optimizationPriority: 'less_distance' })}
                  className={cn(
                    'flex-1 p-4 rounded-lg border-2 text-left transition-all',
                    data.optimizationPriority === 'less_distance'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        data.optimizationPriority === 'less_distance'
                          ? 'border-primary'
                          : 'border-gray-300'
                      )}
                    >
                      {data.optimizationPriority === 'less_distance' && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Menor distancia</span>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Optimiza el recorrido total
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {calculationError && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-error">Error en el cálculo</p>
              <p className="text-sm text-gray-600 mt-1">{calculationError}</p>
            </div>
            <button
              type="button"
              onClick={() => setCalculationError(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Calculate Routes Button */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          {/* Summary Info */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                canCalculate ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
              )}
            >
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {data.selectedVehicleIds.length} vehículo{data.selectedVehicleIds.length !== 1 ? 's' : ''} seleccionado{data.selectedVehicleIds.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500">
                {hasEnoughCapacity
                  ? 'Listo para calcular rutas'
                  : 'Selecciona más vehículos para cubrir la demanda'}
              </p>
            </div>
          </div>

          {/* Calcular Rutas Button */}
          <button
            type="button"
            onClick={handleCalculateRoutes}
            disabled={!canCalculate || isCalculating}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors',
              canCalculate && !isCalculating
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Calculando...</span>
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>Calcular Rutas</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Text during calculation */}
        {isCalculating && (
          <p className="text-sm text-gray-500 mt-3 text-center">
            Calculando rutas... (puede tomar unos segundos)
          </p>
        )}
      </div>
    </div>
  );
}
