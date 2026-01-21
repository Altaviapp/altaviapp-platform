'use client';

/**
 * Step 5: Vehicle and Personnel Assignment for Bulk Route Creation
 *
 * Displays generated routes as assignment cards.
 * Each card has vehicle, driver, and monitor (optional) dropdowns.
 * Implements auto-suggestion based on vehicle capacity matching route size.
 * Prevents double-assignment of vehicles, drivers, and monitors.
 *
 * PRD Reference:
 * - US-023 - Step 5 - Vehicle and personnel assignment
 * - US-024 - Step 5 - Monitor assignment and summary
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useQuery } from 'convex/react';
import {
  Bus,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MapPin,
  Clock,
  Shield,
  Route,
} from 'lucide-react';
import { api } from '../../../../../../convex/_generated/api';
import { cn } from '@/lib/utils';
import { useConvexAuth } from '@/hooks';
import { Select } from '@/components/core';
import type {
  BulkWizardStep5Data,
  GeneratedRoute,
  RouteAssignment,
} from './BulkRouteWizard';

// Vehicle data from getVehiclesForBulkCreation query
interface VehicleOption {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  capacity: number;
  status: string;
}

// Driver data from getCrewForBulkAssignment query
interface DriverOption {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: number;
  licenseExpired: boolean;
  hasValidLicense: boolean;
}

// Monitor data from getCrewForBulkAssignment query
interface MonitorOption {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  firstAidCertified?: boolean;
}

/**
 * Format license expiry date for display
 * Returns formatted date string (e.g., "15/03/2026")
 */
function formatLicenseExpiry(expiryTimestamp: number | undefined): string {
  if (!expiryTimestamp) return '';
  const date = new Date(expiryTimestamp);
  return date.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Build driver label with name and license status
 * Shows: name, license expiry (if valid), or "(Licencia vencida)" if expired
 */
function buildDriverLabel(driver: DriverOption): string {
  if (!driver.hasValidLicense) {
    return `${driver.name} (Licencia vencida)`;
  }
  if (driver.licenseExpiry) {
    const expiryDate = formatLicenseExpiry(driver.licenseExpiry);
    return `${driver.name} (Vence: ${expiryDate})`;
  }
  return driver.name;
}

interface Step5AssignmentProps {
  generatedRoutes: GeneratedRoute[];
  data: BulkWizardStep5Data;
  onChange: (data: Partial<BulkWizardStep5Data>) => void;
  onValidChange: (isValid: boolean) => void;
}

export function Step5Assignment({
  generatedRoutes,
  data,
  onChange,
  onValidChange,
}: Step5AssignmentProps) {
  const { userId, institutionId } = useConvexAuth();

  // Query available vehicles
  const vehicles = useQuery(
    api.routes.getVehiclesForBulkCreation,
    userId && institutionId
      ? {
          userId,
          institutionId,
        }
      : 'skip'
  ) as VehicleOption[] | undefined;

  // Query available crew (drivers and monitors)
  const crewData = useQuery(
    api.routes.getCrewForBulkAssignment,
    userId && institutionId
      ? {
          userId,
          institutionId,
        }
      : 'skip'
  ) as { drivers: DriverOption[]; monitors: MonitorOption[] } | undefined;

  const drivers = crewData?.drivers ?? [];
  const monitors = crewData?.monitors ?? [];

  // Initialize assignments when routes or vehicles change
  useEffect(() => {
    if (
      generatedRoutes.length === 0 ||
      !vehicles ||
      vehicles.length === 0
    ) {
      return;
    }

    // Only initialize if no assignments exist yet
    if (data.routeAssignments.length === 0) {
      const initialAssignments: RouteAssignment[] = generatedRoutes.map(
        (route) => {
          // Auto-suggest vehicle based on capacity matching route size
          const studentCount = route.stops.reduce(
            (sum, stop) => sum + stop.studentIds.length,
            0
          );
          const suggestedVehicle = vehicles.find(
            (v) => v.capacity >= studentCount
          );

          return {
            routeId: route.id,
            vehicleId: suggestedVehicle?.id || '',
            driverId: '',
            monitorId: undefined,
          };
        }
      );
      onChange({ routeAssignments: initialAssignments });
    }
  }, [generatedRoutes, vehicles, data.routeAssignments.length, onChange]);

  // Track assigned items to prevent double-assignment
  const assignedVehicleIds = useMemo(() => {
    return new Set(
      data.routeAssignments.map((a) => a.vehicleId).filter(Boolean)
    );
  }, [data.routeAssignments]);

  const assignedDriverIds = useMemo(() => {
    return new Set(
      data.routeAssignments.map((a) => a.driverId).filter(Boolean)
    );
  }, [data.routeAssignments]);

  const assignedMonitorIds = useMemo(() => {
    return new Set(
      data.routeAssignments
        .map((a) => a.monitorId)
        .filter((id): id is string => !!id)
    );
  }, [data.routeAssignments]);

  // Count how many times each driver is assigned (for conflict detection)
  const driverAssignmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const assignment of data.routeAssignments) {
      if (assignment.driverId) {
        counts.set(assignment.driverId, (counts.get(assignment.driverId) || 0) + 1);
      }
    }
    return counts;
  }, [data.routeAssignments]);

  // Count how many times each monitor is assigned (for conflict detection)
  const monitorAssignmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const assignment of data.routeAssignments) {
      if (assignment.monitorId) {
        counts.set(assignment.monitorId, (counts.get(assignment.monitorId) || 0) + 1);
      }
    }
    return counts;
  }, [data.routeAssignments]);

  // Get available options for dropdowns (excluding already assigned items)
  const getAvailableVehicles = useCallback(
    (currentRouteId: string) => {
      if (!vehicles) return [];
      const currentAssignment = data.routeAssignments.find(
        (a) => a.routeId === currentRouteId
      );
      return vehicles.filter(
        (v) =>
          !assignedVehicleIds.has(v.id) ||
          v.id === currentAssignment?.vehicleId
      );
    },
    [vehicles, assignedVehicleIds, data.routeAssignments]
  );

  const getAvailableDrivers = useCallback(
    (currentRouteId: string) => {
      const currentAssignment = data.routeAssignments.find(
        (a) => a.routeId === currentRouteId
      );
      return drivers.filter(
        (d) =>
          !assignedDriverIds.has(d.id) ||
          d.id === currentAssignment?.driverId
      );
    },
    [drivers, assignedDriverIds, data.routeAssignments]
  );

  const getAvailableMonitors = useCallback(
    (currentRouteId: string) => {
      const currentAssignment = data.routeAssignments.find(
        (a) => a.routeId === currentRouteId
      );
      return monitors.filter(
        (m) =>
          !assignedMonitorIds.has(m.id) ||
          m.id === currentAssignment?.monitorId
      );
    },
    [monitors, assignedMonitorIds, data.routeAssignments]
  );

  // Update assignment for a specific route
  const updateAssignment = useCallback(
    (routeId: string, field: keyof RouteAssignment, value: string) => {
      const newAssignments = data.routeAssignments.map((a) =>
        a.routeId === routeId
          ? { ...a, [field]: value || (field === 'monitorId' ? undefined : '') }
          : a
      );
      onChange({ routeAssignments: newAssignments });
    },
    [data.routeAssignments, onChange]
  );

  // Validate step - all routes must have vehicle and driver assigned
  useEffect(() => {
    const allAssigned = data.routeAssignments.every(
      (a) => a.vehicleId && a.driverId
    );
    const hasRoutes = generatedRoutes.length > 0;
    const hasMatchingAssignments =
      data.routeAssignments.length === generatedRoutes.length;

    onValidChange(hasRoutes && hasMatchingAssignments && allAssigned);
  }, [data.routeAssignments, generatedRoutes.length, onValidChange]);

  // Count fully assigned routes
  const fullyAssignedCount = useMemo(() => {
    return data.routeAssignments.filter((a) => a.vehicleId && a.driverId)
      .length;
  }, [data.routeAssignments]);

  // Calculate summary statistics for the summary section
  const summaryStats = useMemo(() => {
    const totalRoutes = generatedRoutes.length;
    const totalStudents = generatedRoutes.reduce(
      (sum, route) =>
        sum + route.stops.reduce((s, stop) => s + stop.studentIds.length, 0),
      0
    );
    const totalStops = generatedRoutes.reduce(
      (sum, route) => sum + route.stops.length,
      0
    );
    const uniqueVehicles = new Set(
      data.routeAssignments.filter((a) => a.vehicleId).map((a) => a.vehicleId)
    ).size;
    const assignedDrivers = new Set(
      data.routeAssignments.filter((a) => a.driverId).map((a) => a.driverId)
    ).size;
    const assignedMonitors = new Set(
      data.routeAssignments.filter((a) => a.monitorId).map((a) => a.monitorId)
    ).size;

    return {
      totalRoutes,
      totalStudents,
      totalStops,
      uniqueVehicles,
      assignedDrivers,
      assignedMonitors,
    };
  }, [generatedRoutes, data.routeAssignments]);

  // Get vehicle by ID for display
  const getVehicleById = useCallback(
    (vehicleId: string) => vehicles?.find((v) => v.id === vehicleId),
    [vehicles]
  );

  // Loading state
  if (vehicles === undefined || crewData === undefined) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
        {/* Assignment cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {generatedRoutes.length} ruta
                {generatedRoutes.length !== 1 ? 's' : ''} para asignar
              </p>
              <p className="text-sm text-gray-500">
                Asigna vehiculo, conductor y monitor a cada ruta
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                'text-lg font-bold',
                fullyAssignedCount === generatedRoutes.length
                  ? 'text-success'
                  : 'text-warning'
              )}
            >
              {fullyAssignedCount} / {generatedRoutes.length}
            </div>
            <div className="text-xs text-gray-500">completas</div>
          </div>
        </div>
      </div>

      {/* Warning if insufficient resources */}
      {(vehicles.length < generatedRoutes.length ||
        drivers.length < generatedRoutes.length) && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                Recursos insuficientes
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {vehicles.length < generatedRoutes.length &&
                  `Tienes ${vehicles.length} vehiculos para ${generatedRoutes.length} rutas. `}
                {drivers.length < generatedRoutes.length &&
                  `Tienes ${drivers.length} conductores para ${generatedRoutes.length} rutas.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Cards */}
      <div className="space-y-4">
        {generatedRoutes.map((route) => {
          const assignment = data.routeAssignments.find(
            (a) => a.routeId === route.id
          );
          const studentCount = route.stops.reduce(
            (sum, stop) => sum + stop.studentIds.length,
            0
          );
          const selectedVehicle = assignment?.vehicleId
            ? getVehicleById(assignment.vehicleId)
            : null;
          const isFullyAssigned =
            assignment?.vehicleId && assignment?.driverId;

          // Check if vehicle capacity is sufficient
          const capacityWarning =
            selectedVehicle && selectedVehicle.capacity < studentCount;

          // Check if assigned driver is used in another route (conflict)
          const driverUsedElsewhere = assignment?.driverId
            ? (driverAssignmentCounts.get(assignment.driverId) || 0) > 1
            : false;

          // Check if assigned monitor is used in another route (conflict)
          const monitorUsedElsewhere = assignment?.monitorId
            ? (monitorAssignmentCounts.get(assignment.monitorId) || 0) > 1
            : false;

          return (
            <div
              key={route.id}
              className={cn(
                'rounded-xl border-2 p-6 transition-all',
                isFullyAssigned
                  ? 'border-success/30 bg-success/5'
                  : 'border-gray-200 bg-white'
              )}
            >
              {/* Route Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isFullyAssigned ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{route.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {route.stops.length} parada
                        {route.stops.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {studentCount} estudiante
                        {studentCount !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {route.duration} min
                      </span>
                    </div>
                  </div>
                </div>
                {isFullyAssigned && (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                    Asignada
                  </span>
                )}
              </div>

              {/* Capacity Warning */}
              {capacityWarning && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      Capacidad insuficiente: {selectedVehicle?.capacity} asientos
                      para {studentCount} estudiantes
                    </span>
                  </div>
                </div>
              )}

              {/* Assignment Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Vehicle Dropdown */}
                <div>
                  <Select
                    label="Vehiculo"
                    required
                    value={assignment?.vehicleId || ''}
                    onChange={(e) =>
                      updateAssignment(route.id, 'vehicleId', e.target.value)
                    }
                    placeholder="Seleccionar vehiculo"
                    options={getAvailableVehicles(route.id).map((v) => ({
                      value: v.id,
                      label: `${v.licensePlate} - ${v.brand} ${v.model} (${v.capacity} asientos)`,
                      disabled: v.capacity < studentCount,
                    }))}
                  />
                  {!assignment?.vehicleId && (
                    <p className="text-xs text-warning mt-1">
                      Requerido
                    </p>
                  )}
                </div>

                {/* Driver Dropdown */}
                <div>
                  <Select
                    label="Conductor"
                    required
                    value={assignment?.driverId || ''}
                    onChange={(e) =>
                      updateAssignment(route.id, 'driverId', e.target.value)
                    }
                    placeholder="Seleccionar conductor"
                    options={getAvailableDrivers(route.id).map((d) => ({
                      value: d.id,
                      label: buildDriverLabel(d),
                      disabled: !d.hasValidLicense,
                    }))}
                  />
                  {!assignment?.driverId ? (
                    <p className="text-xs text-warning mt-1">
                      Requerido
                    </p>
                  ) : driverUsedElsewhere ? (
                    <p className="text-xs text-warning mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Asignado a multiples rutas
                    </p>
                  ) : null}
                </div>

                {/* Monitor Dropdown (Optional) */}
                <div>
                  <Select
                    label="Monitor"
                    value={assignment?.monitorId || ''}
                    onChange={(e) =>
                      updateAssignment(route.id, 'monitorId', e.target.value)
                    }
                    placeholder="Sin monitor"
                    options={[
                      { value: '', label: 'Sin monitor' },
                      ...getAvailableMonitors(route.id).map((m) => ({
                        value: m.id,
                        label: `${m.name}${m.firstAidCertified ? ' (Primeros auxilios)' : ''}`,
                      })),
                    ]}
                  />
                  {monitorUsedElsewhere ? (
                    <p className="text-xs text-warning mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Asignado a multiples rutas
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Opcional</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Resumen de Asignacion</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
              <Route className="w-3 h-3" />
              Rutas
            </div>
            <p className="text-xl font-bold text-gray-900">
              {summaryStats.totalRoutes}
            </p>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
              <Users className="w-3 h-3" />
              Estudiantes
            </div>
            <p className="text-xl font-bold text-gray-900">
              {summaryStats.totalStudents}
            </p>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
              <MapPin className="w-3 h-3" />
              Paradas
            </div>
            <p className="text-xl font-bold text-gray-900">
              {summaryStats.totalStops}
            </p>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
              <Bus className="w-3 h-3" />
              Vehiculos
            </div>
            <p className="text-xl font-bold text-gray-900">
              {summaryStats.uniqueVehicles}
            </p>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
              <User className="w-3 h-3" />
              Conductores
            </div>
            <p className="text-xl font-bold text-gray-900">
              {summaryStats.assignedDrivers}
            </p>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
              <Shield className="w-3 h-3" />
              Monitores
            </div>
            <p className="text-xl font-bold text-gray-900">
              {summaryStats.assignedMonitors}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
