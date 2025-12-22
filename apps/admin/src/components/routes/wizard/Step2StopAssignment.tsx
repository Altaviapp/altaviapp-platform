'use client';

/**
 * Step 2: Stop Assignment
 *
 * Student selection and route optimization:
 * - List available students (with home location)
 * - Select students for this route
 * - Calculate optimized route with Google Maps
 * - Display route on map with polyline
 * - Show ETAs for each stop
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Filter, MapPin, Clock, Users, Route, AlertCircle,
  CheckCircle, Loader2, RefreshCw, GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentsWithRoutes, useInstitution } from '@/hooks';
import {
  GoogleMapsProvider,
  InteractiveMap,
  RoutePolyline,
  createOptimizedRouteFromStudents,
  fitMapToPolyline,
  decodePolyline,
} from '@altaviapp/maps';
import type { LatLng, OptimizedStop, RouteOptimizationResult } from '@altaviapp/maps';
import type { Step1Data } from './Step1Planning';

export interface Step2Data {
  selectedStudentIds: string[];
  optimizationResult: RouteOptimizationResult | null;
  isOptimizing: boolean;
}

interface Step2StopAssignmentProps {
  step1Data: Step1Data;
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  onValidChange: (isValid: boolean) => void;
}

type TabType = 'available' | 'selected';

export function Step2StopAssignment({
  step1Data,
  data,
  onChange,
  onValidChange,
}: Step2StopAssignmentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { students } = useStudentsWithRoutes();
  const { institution } = useInstitution();
  const currentRouteType = step1Data.routeType; // 'pickup' or 'dropoff'

  // School location
  const schoolLocation: LatLng | null = institution?.schoolLatitude && institution?.schoolLongitude
    ? { lat: institution.schoolLatitude, lng: institution.schoolLongitude }
    : null;

  // Filter students with valid home location
  const studentsWithLocation = useMemo(() => {
    return students.filter(s =>
      s.isActive &&
      s.homeLatitude !== undefined &&
      s.homeLongitude !== undefined
    );
  }, [students]);

  // Get unique grades for filter
  const grades = useMemo(() => {
    const gradeSet = new Set(studentsWithLocation.map(s => s.grade));
    const uniqueGrades = Array.from(gradeSet);
    return uniqueGrades.sort();
  }, [studentsWithLocation]);

  // Filter available students (not selected, with location)
  const availableStudents = useMemo(() => {
    return studentsWithLocation
      .filter(s => !data.selectedStudentIds.includes(s._id))
      .filter(s => {
        if (searchTerm) {
          const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
          if (!fullName.includes(searchTerm.toLowerCase())) return false;
        }
        if (gradeFilter && s.grade !== gradeFilter) return false;
        return true;
      });
  }, [studentsWithLocation, data.selectedStudentIds, searchTerm, gradeFilter]);

  // Get selected students with their data
  const selectedStudents = useMemo(() => {
    return data.selectedStudentIds
      .map(id => studentsWithLocation.find(s => s._id === id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
  }, [data.selectedStudentIds, studentsWithLocation]);

  // Vehicle capacity check
  const vehicleCapacity = step1Data.vehicleId ? 30 : 0; // TODO: Get from vehicle data

  // Validate step
  useEffect(() => {
    const isValid = data.selectedStudentIds.length > 0 && data.optimizationResult !== null;
    onValidChange(isValid);
  }, [data, onValidChange]);

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    const newSelected = data.selectedStudentIds.includes(studentId)
      ? data.selectedStudentIds.filter(id => id !== studentId)
      : [...data.selectedStudentIds, studentId];

    onChange({
      ...data,
      selectedStudentIds: newSelected,
      optimizationResult: null, // Clear optimization when selection changes
    });
  };

  // Calculate optimized route
  const calculateRoute = useCallback(async () => {
    if (!schoolLocation || selectedStudents.length === 0 || !step1Data.targetTime) {
      return;
    }

    onChange({ ...data, isOptimizing: true });

    try {
      const studentsForRoute = selectedStudents.map(s => ({
        id: s._id,
        name: `${s.firstName} ${s.lastName}`,
        position: {
          lat: s.homeLatitude!,
          lng: s.homeLongitude!,
        },
        address: s.address,
      }));

      const result = await createOptimizedRouteFromStudents(
        schoolLocation,
        studentsForRoute,
        step1Data.routeType as 'pickup' | 'dropoff',
        step1Data.targetTime
      );

      onChange({
        ...data,
        optimizationResult: result,
        isOptimizing: false,
      });

      // Fit map to route
      if (result && mapInstance) {
        fitMapToPolyline(mapInstance, result.encodedPolyline);
      }
    } catch (error) {
      console.error('Route optimization error:', error);
      onChange({
        ...data,
        optimizationResult: null,
        isOptimizing: false,
      });
    }
  }, [schoolLocation, selectedStudents, step1Data, data, onChange, mapInstance]);

  // Build map markers
  const mapMarkers = useMemo(() => {
    const markers: Array<{
      id: string;
      position: LatLng;
      type: 'school' | 'stop' | 'student';
      label?: string;
      title?: string;
    }> = [];

    // School marker
    if (schoolLocation) {
      markers.push({
        id: 'school',
        position: schoolLocation,
        type: 'school',
        title: institution?.name || 'Colegio',
      });
    }

    // Student markers
    if (data.optimizationResult) {
      // Show stops from optimization
      data.optimizationResult.stops.forEach((stop, index) => {
        markers.push({
          id: stop.studentId,
          position: stop.position,
          type: 'stop',
          label: String(index + 1),
          title: `${stop.studentName} - ${stop.estimatedArrivalTime}`,
        });
      });
    } else {
      // Show selected students
      selectedStudents.forEach(s => {
        markers.push({
          id: s._id,
          position: { lat: s.homeLatitude!, lng: s.homeLongitude! },
          type: 'student',
          title: `${s.firstName} ${s.lastName}`,
        });
      });
    }

    return markers;
  }, [schoolLocation, institution, selectedStudents, data.optimizationResult]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}min`;
    }
    return `${minutes} min`;
  };

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <GoogleMapsProvider>
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Users className="w-4 h-4" />
              Seleccionados
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {data.selectedStudentIds.length}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="w-4 h-4" />
              Duración Est.
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {data.optimizationResult
                ? formatDuration(data.optimizationResult.totalDuration)
                : '--'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Route className="w-4 h-4" />
              Distancia
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {data.optimizationResult
                ? formatDistance(data.optimizationResult.totalDistance)
                : '--'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="w-4 h-4" />
              {step1Data.routeType === 'pickup' ? 'Inicio' : 'Fin'}
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {data.optimizationResult
                ? step1Data.routeType === 'pickup'
                  ? data.optimizationResult.startTime
                  : data.optimizationResult.endTime
                : '--'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Student Selection Panel */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('available')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'available'
                    ? 'bg-primary/5 text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                Disponibles ({availableStudents.length})
              </button>
              <button
                onClick={() => setActiveTab('selected')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'selected'
                    ? 'bg-primary/5 text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                Seleccionados ({data.selectedStudentIds.length})
              </button>
            </div>

            {/* Search & Filter */}
            {activeTab === 'available' && (
              <div className="p-3 border-b border-gray-100 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar estudiante..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="">Todos los grados</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Student List */}
            <div className="max-h-80 overflow-y-auto">
              {activeTab === 'available' ? (
                availableStudents.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No hay estudiantes disponibles</p>
                    <p className="text-xs mt-1">
                      Solo se muestran estudiantes con ubicación configurada
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {availableStudents.map(student => {
                      // Check if student already has a route of the same type
                      const hasExistingRoute = currentRouteType === 'pickup'
                        ? student.hasPickupRoute
                        : student.hasDropoffRoute;
                      const existingRouteNames = currentRouteType === 'pickup'
                        ? student.pickupRouteNames
                        : student.dropoffRouteNames;

                      return (
                        <button
                          key={student._id}
                          onClick={() => toggleStudent(student._id)}
                          className={cn(
                            "w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left",
                            hasExistingRoute && "bg-amber-50/50"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                            hasExistingRoute ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                          )}>
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {student.grade} • {student.address || 'Sin dirección'}
                            </p>
                            {hasExistingRoute && (
                              <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                                <AlertCircle className="w-3 h-3" />
                                Ya en: {existingRouteNames?.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                data.selectedStudentIds.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No hay estudiantes seleccionados</p>
                    <p className="text-xs mt-1">
                      Selecciona estudiantes de la pestaña "Disponibles"
                    </p>
                  </div>
                ) : data.optimizationResult ? (
                  // Show optimized order
                  <div className="divide-y divide-gray-100">
                    {data.optimizationResult.stops.map((stop, index) => (
                      <div
                        key={stop.studentId}
                        className="p-3 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {stop.studentName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {stop.address || 'Sin dirección'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            {stop.estimatedArrivalTime}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleStudent(stop.studentId)}
                          className="text-red-500 hover:text-red-600 p-1"
                          title="Quitar estudiante"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Show unoptimized selection
                  <div className="divide-y divide-gray-100">
                    {selectedStudents.map(student => (
                      <button
                        key={student._id}
                        onClick={() => toggleStudent(student._id)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {student.grade} • {student.address || 'Sin dirección'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Calculate Route Button */}
            {data.selectedStudentIds.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={calculateRoute}
                  disabled={data.isOptimizing}
                  className={cn(
                    'w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                    data.isOptimizing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  )}
                >
                  {data.isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calculando ruta óptima...
                    </>
                  ) : data.optimizationResult ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Recalcular Ruta
                    </>
                  ) : (
                    <>
                      <Route className="w-4 h-4" />
                      Calcular Ruta Óptima
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Map Panel */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="h-[400px]">
              <InteractiveMap
                center={schoolLocation || { lat: -0.1807, lng: -78.4678 }}
                zoom={12}
                markers={mapMarkers.map(m => ({
                  id: m.id,
                  position: m.position,
                  type: m.type,
                  label: m.label,
                  title: m.title,
                }))}
                onMapLoad={setMapInstance}
              />
              {/* Render polyline separately */}
              {mapInstance && data.optimizationResult?.encodedPolyline && (
                <RoutePolyline
                  map={mapInstance}
                  encodedPolyline={data.optimizationResult.encodedPolyline}
                  strokeColor="#042940"
                  strokeWeight={4}
                  strokeOpacity={0.8}
                />
              )}
            </div>

            {/* Map Legend */}
            <div className="p-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                Colegio
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary rounded-full" />
                Paradas
              </div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-1 bg-primary rounded" />
                Ruta
              </div>
            </div>
          </div>
        </div>

        {/* Warning if no optimization yet */}
        {data.selectedStudentIds.length > 0 && !data.optimizationResult && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
              <p className="text-sm text-warning">
                Haz clic en "Calcular Ruta Óptima" para generar la ruta y ver los horarios estimados.
              </p>
            </div>
          </div>
        )}
      </div>
    </GoogleMapsProvider>
  );
}
