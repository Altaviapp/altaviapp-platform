'use client';

/**
 * RouteDetailModal Component
 *
 * Modal for viewing and editing individual route details in the bulk creation wizard.
 * Features:
 * - Dedicated map showing single route polyline
 * - Ordered list of stops with drag-and-drop reordering
 * - Editable route name
 * - Vehicle selector dropdown
 * - Recalculation of route when stops are reordered
 * - Undo functionality to revert to optimized order
 * - Remove stops/students with confirmation (US-020)
 * - Add students to existing stops (US-020)
 * - Create new stops from unassigned students (US-020)
 *
 * PRD Reference: US-018 - Step 4 - Route detail modal
 * PRD Reference: US-019 - Step 4 - Stop reordering with drag and drop
 * PRD Reference: US-020 - Step 4 - Modify stops and students in detail
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  X,
  GripVertical,
  MapPin,
  Clock,
  Navigation2,
  Loader2,
  Undo2,
  Users,
  Save,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Select } from '@/components/core';
import { ConfirmDialog } from '@/components/shared';
import type { GeneratedRoute } from './BulkRouteWizard';
import type { LatLng } from '@altaviapp/maps';

export interface RouteStop {
  id: string;
  latitude: number;
  longitude: number;
  studentIds: string[];
  order: number;
}

export interface StudentInfo {
  id: string;
  name: string;
  address?: string;
  homeLatitude?: number;
  homeLongitude?: number;
}

export interface VehicleOption {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  capacity: number;
}

interface RouteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: GeneratedRoute;
  onSave: (updatedRoute: GeneratedRoute) => void;
  vehicles: VehicleOption[];
  studentsMap: Map<string, StudentInfo>;
  routeType: 'pickup' | 'dropoff';
  schoolLocation: LatLng;
  /** US-020: Unassigned students available for adding to stops */
  unassignedStudents?: StudentInfo[];
  /** US-020: Callback when a student is removed from a stop (becomes unassigned) */
  onStudentRemoved?: (studentId: string) => void;
  /** US-020: Callback when a student is added to a stop (removed from unassigned) */
  onStudentAdded?: (studentId: string) => void;
  onRecalculateRoute?: (
    stops: RouteStop[],
    routeType: 'pickup' | 'dropoff',
    schoolLocation: LatLng
  ) => Promise<{
    polyline: string;
    duration: number;
    distance: number;
  } | null>;
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}

/**
 * Format distance in meters to human-readable string
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

export function RouteDetailModal({
  isOpen,
  onClose,
  route,
  onSave,
  vehicles,
  studentsMap,
  routeType,
  schoolLocation,
  unassignedStudents = [],
  onStudentRemoved,
  onStudentAdded,
  onRecalculateRoute,
}: RouteDetailModalProps) {
  // Local state for editing
  const [editedRoute, setEditedRoute] = useState<GeneratedRoute>(route);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [originalStopsOrder, setOriginalStopsOrder] = useState<RouteStop[]>(
    () => [...route.stops]
  );
  const [hasReordered, setHasReordered] = useState(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  // US-020: Student picker state per stop
  const [expandedStopPickers, setExpandedStopPickers] = useState<Set<number>>(
    new Set()
  );

  // US-020: New stop creation state
  const [isCreatingNewStop, setIsCreatingNewStop] = useState(false);
  const [newStopStudentId, setNewStopStudentId] = useState<string>('');

  // US-020: Confirmation dialog state for removing students/stops
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    stopIndex: number;
    studentId: string;
    studentName: string;
    isLastStudent: boolean;
  }>({
    isOpen: false,
    stopIndex: -1,
    studentId: '',
    studentName: '',
    isLastStudent: false,
  });

  // Reset state when route changes
  useEffect(() => {
    setEditedRoute(route);
    setOriginalStopsOrder([...route.stops]);
    setHasReordered(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setExpandedStopPickers(new Set());
    setIsCreatingNewStop(false);
    setNewStopStudentId('');
  }, [route]);

  // Calculate total students
  const totalStudents = useMemo(() => {
    return editedRoute.stops.reduce((sum, stop) => sum + stop.studentIds.length, 0);
  }, [editedRoute.stops]);

  // Handle name change
  const handleNameChange = useCallback((name: string) => {
    setEditedRoute((prev) => ({ ...prev, name }));
  }, []);

  // Handle vehicle change
  const handleVehicleChange = useCallback((vehicleId: string) => {
    setEditedRoute((prev) => ({ ...prev, vehicleId }));
  }, []);

  // Drag start handler
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());

      // Set drag image opacity
      if (e.currentTarget) {
        e.currentTarget.style.opacity = '0.5';
      }
    },
    []
  );

  // Drag end handler
  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;

    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);

  // Drag enter handler
  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      dragCounter.current++;

      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  // Drag leave handler
  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  }, []);

  // Drag over handler
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop handler - reorder stops
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      setDragOverIndex(null);
      dragCounter.current = 0;

      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        return;
      }

      // Reorder stops
      const newStops = [...editedRoute.stops];
      const [draggedStop] = newStops.splice(draggedIndex, 1);
      if (!draggedStop) {
        setDraggedIndex(null);
        return;
      }

      newStops.splice(dropIndex, 0, draggedStop);

      // Update order numbers
      const reorderedStops = newStops.map((stop, index) => ({
        ...stop,
        order: index + 1,
      }));

      // Update local state immediately for responsive UI
      setEditedRoute((prev) => ({
        ...prev,
        stops: reorderedStops,
      }));
      setHasReordered(true);
      setDraggedIndex(null);

      // Recalculate route if handler provided
      if (onRecalculateRoute) {
        setIsRecalculating(true);
        try {
          const result = await onRecalculateRoute(
            reorderedStops,
            routeType,
            schoolLocation
          );

          if (result) {
            setEditedRoute((prev) => ({
              ...prev,
              polyline: result.polyline,
              duration: result.duration,
              distance: result.distance,
            }));
          }
        } catch (error) {
          console.error('Failed to recalculate route:', error);
        } finally {
          setIsRecalculating(false);
        }
      }
    },
    [
      draggedIndex,
      editedRoute.stops,
      onRecalculateRoute,
      routeType,
      schoolLocation,
    ]
  );

  // Undo handler - revert to original order
  const handleUndo = useCallback(async () => {
    // Restore original order
    const restoredStops = originalStopsOrder.map((stop, index) => ({
      ...stop,
      order: index + 1,
    }));

    setEditedRoute((prev) => ({
      ...prev,
      stops: restoredStops,
    }));
    setHasReordered(false);

    // Recalculate with original order
    if (onRecalculateRoute) {
      setIsRecalculating(true);
      try {
        const result = await onRecalculateRoute(
          restoredStops,
          routeType,
          schoolLocation
        );

        if (result) {
          setEditedRoute((prev) => ({
            ...prev,
            polyline: result.polyline,
            duration: result.duration,
            distance: result.distance,
          }));
        }
      } catch (error) {
        console.error('Failed to recalculate route:', error);
      } finally {
        setIsRecalculating(false);
      }
    }
  }, [originalStopsOrder, onRecalculateRoute, routeType, schoolLocation]);

  // US-020: Toggle student picker for a stop
  const toggleStopPicker = useCallback((stopIndex: number) => {
    setExpandedStopPickers((prev) => {
      const next = new Set(prev);
      if (next.has(stopIndex)) {
        next.delete(stopIndex);
      } else {
        next.add(stopIndex);
      }
      return next;
    });
  }, []);

  // US-020: Handle removing a student from a stop
  const handleRemoveStudent = useCallback(
    (stopIndex: number, studentId: string) => {
      const stop = editedRoute.stops[stopIndex];
      if (!stop) return;

      const studentInfo = studentsMap.get(studentId);
      const studentName = studentInfo?.name || `Estudiante ${studentId.slice(-4)}`;
      const isLastStudent = stop.studentIds.length === 1;

      // Show confirmation dialog
      setConfirmDialog({
        isOpen: true,
        stopIndex,
        studentId,
        studentName,
        isLastStudent,
      });
    },
    [editedRoute.stops, studentsMap]
  );

  // US-020: Confirm student removal
  const confirmRemoveStudent = useCallback(async () => {
    const { stopIndex, studentId, isLastStudent } = confirmDialog;

    let newStops = [...editedRoute.stops];

    if (isLastStudent) {
      // Remove the entire stop if it's the last student
      newStops.splice(stopIndex, 1);
      // Reorder remaining stops
      newStops = newStops.map((stop, idx) => ({
        ...stop,
        order: idx + 1,
      }));
    } else {
      // Remove just the student from the stop
      const currentStop = newStops[stopIndex];
      if (currentStop) {
        newStops[stopIndex] = {
          ...currentStop,
          studentIds: currentStop.studentIds.filter(
            (id) => id !== studentId
          ),
        };
      }
    }

    setEditedRoute((prev) => ({
      ...prev,
      stops: newStops,
    }));

    // Notify parent that student was removed (becomes unassigned)
    if (onStudentRemoved) {
      onStudentRemoved(studentId);
    }

    // Recalculate route if stops changed significantly
    if (isLastStudent && onRecalculateRoute && newStops.length > 0) {
      setIsRecalculating(true);
      try {
        const result = await onRecalculateRoute(
          newStops,
          routeType,
          schoolLocation
        );
        if (result) {
          setEditedRoute((prev) => ({
            ...prev,
            polyline: result.polyline,
            duration: result.duration,
            distance: result.distance,
          }));
        }
      } catch (error) {
        console.error('Failed to recalculate route after removing stop:', error);
      } finally {
        setIsRecalculating(false);
      }
    }

    // Close dialog
    setConfirmDialog({
      isOpen: false,
      stopIndex: -1,
      studentId: '',
      studentName: '',
      isLastStudent: false,
    });
  }, [confirmDialog, editedRoute.stops, onStudentRemoved, onRecalculateRoute, routeType, schoolLocation]);

  // US-020: Handle adding a student to an existing stop
  const handleAddStudentToStop = useCallback(
    (stopIndex: number, studentId: string) => {
      if (!studentId) return;

      setEditedRoute((prev) => {
        const newStops = [...prev.stops];
        const currentStop = newStops[stopIndex];
        if (currentStop) {
          newStops[stopIndex] = {
            ...currentStop,
            studentIds: [...currentStop.studentIds, studentId],
          };
        }
        return {
          ...prev,
          stops: newStops,
        };
      });

      // Notify parent that student was added
      if (onStudentAdded) {
        onStudentAdded(studentId);
      }

      // Close the picker
      setExpandedStopPickers((prev) => {
        const next = new Set(prev);
        next.delete(stopIndex);
        return next;
      });
    },
    [onStudentAdded]
  );

  // US-020: Handle creating a new stop with an unassigned student
  const handleCreateNewStop = useCallback(async () => {
    if (!newStopStudentId) return;

    const selectedStudent = unassignedStudents.find(
      (s) => s.id === newStopStudentId
    );
    if (
      !selectedStudent ||
      selectedStudent.homeLatitude === undefined ||
      selectedStudent.homeLongitude === undefined
    ) {
      return;
    }

    const newStop: RouteStop = {
      id: `new-stop-${Date.now()}`,
      latitude: selectedStudent.homeLatitude,
      longitude: selectedStudent.homeLongitude,
      studentIds: [newStopStudentId],
      order: editedRoute.stops.length + 1,
    };

    const newStops = [...editedRoute.stops, newStop];

    setEditedRoute((prev) => ({
      ...prev,
      stops: newStops,
    }));

    // Notify parent that student was added
    if (onStudentAdded) {
      onStudentAdded(newStopStudentId);
    }

    // Recalculate route with new stop
    if (onRecalculateRoute) {
      setIsRecalculating(true);
      try {
        const result = await onRecalculateRoute(
          newStops,
          routeType,
          schoolLocation
        );
        if (result) {
          setEditedRoute((prev) => ({
            ...prev,
            polyline: result.polyline,
            duration: result.duration,
            distance: result.distance,
          }));
        }
      } catch (error) {
        console.error('Failed to recalculate route after adding stop:', error);
      } finally {
        setIsRecalculating(false);
      }
    }

    // Reset state
    setNewStopStudentId('');
    setIsCreatingNewStop(false);
  }, [newStopStudentId, unassignedStudents, editedRoute.stops, onStudentAdded, onRecalculateRoute, routeType, schoolLocation]);

  // US-020: Unassigned students with GPS coordinates for new stops
  const unassignedStudentsWithGps = useMemo(() => {
    return unassignedStudents.filter(
      (s) => s.homeLatitude !== undefined && s.homeLongitude !== undefined
    );
  }, [unassignedStudents]);

  // Save handler
  const handleSave = useCallback(() => {
    onSave(editedRoute);
    onClose();
  }, [editedRoute, onSave, onClose]);

  // Get students for a stop
  const getStopStudents = useCallback(
    (studentIds: string[]): StudentInfo[] => {
      return studentIds
        .map((id) => studentsMap.get(id))
        .filter((s): s is StudentInfo => s !== undefined);
    },
    [studentsMap]
  );

  // Get selected vehicle
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === editedRoute.vehicleId);
  }, [vehicles, editedRoute.vehicleId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Detalle de Ruta
              </h2>
              <p className="text-sm text-gray-500">
                {editedRoute.stops.length} paradas, {totalStudents} estudiantes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left side - Map placeholder */}
          <div className="lg:w-1/2 h-64 lg:h-auto bg-gray-100 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Vista de mapa</p>
              <p className="text-xs">(Implementación en US-017)</p>
            </div>
          </div>

          {/* Right side - Details */}
          <div className="lg:w-1/2 flex flex-col overflow-hidden">
            {/* Route info form */}
            <div className="p-4 border-b border-gray-200 space-y-4">
              {/* Route name */}
              <Input
                label="Nombre de la ruta"
                value={editedRoute.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Ruta Norte AM"
              />

              {/* Vehicle selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vehiculo asignado
                </label>
                <select
                  value={editedRoute.vehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} (
                      {vehicle.capacity} asientos)
                    </option>
                  ))}
                </select>
              </div>

              {/* Route stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    {isRecalculating ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Calculando...
                      </span>
                    ) : (
                      formatDuration(editedRoute.duration)
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-gray-400" />
                  <span>
                    {isRecalculating ? '...' : formatDistance(editedRoute.distance)}
                  </span>
                </div>
                {hasReordered && (
                  <span className="text-warning text-xs">
                    (orden modificado)
                  </span>
                )}
              </div>
            </div>

            {/* Stops header with undo */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Paradas ({editedRoute.stops.length})
              </h3>
              {hasReordered && (
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={isRecalculating}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    isRecalculating
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-primary hover:bg-primary/10'
                  )}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Restaurar orden original
                </button>
              )}
            </div>

            {/* Draggable stops list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isRecalculating && (
                <div className="flex items-center justify-center gap-2 py-3 px-4 bg-primary/5 rounded-lg text-sm text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recalculando ruta...
                </div>
              )}

              {editedRoute.stops.map((stop, index) => {
                const stopStudents = getStopStudents(stop.studentIds);
                const isDragged = draggedIndex === index;
                const isDragOver = dragOverIndex === index;
                const isPickerExpanded = expandedStopPickers.has(index);

                return (
                  <div
                    key={stop.id}
                    className={cn(
                      'rounded-lg border-2 transition-all overflow-hidden',
                      isDragged && 'opacity-50 border-primary bg-primary/5',
                      isDragOver &&
                        !isDragged &&
                        'border-primary border-dashed bg-primary/5',
                      !isDragged &&
                        !isDragOver &&
                        'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    {/* Stop Header - Draggable */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing bg-gray-50"
                    >
                      {/* Drag handle */}
                      <div className="flex flex-col items-center gap-1">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>

                      {/* Stop info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-gray-900">
                            Parada {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({stop.studentIds.length} estudiante
                            {stop.studentIds.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                        </p>
                      </div>

                      {/* US-020: Add student button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStopPicker(index);
                        }}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Agregar
                        {isPickerExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* US-020: Student Picker - Collapsible */}
                    {isPickerExpanded && (
                      <div className="px-3 py-2 bg-primary/5 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Select
                            options={unassignedStudents.map((s) => ({
                              value: s.id,
                              label: s.name,
                            }))}
                            placeholder="Seleccionar estudiante..."
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddStudentToStop(index, e.target.value);
                              }
                            }}
                            className="flex-1 text-sm"
                          />
                        </div>
                        {unassignedStudents.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            No hay estudiantes sin asignar
                          </p>
                        )}
                      </div>
                    )}

                    {/* Students List - US-020: With remove button */}
                    <div className="divide-y divide-gray-100">
                      {stopStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Users className="w-3 h-3 text-gray-500" />
                            </div>
                            <span className="text-sm text-gray-700 truncate">
                              {student.name}
                            </span>
                          </div>
                          {/* US-020: Remove student button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(index, student.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                            title="Eliminar estudiante de esta parada"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {/* Show placeholder for unknown students */}
                      {stop.studentIds.filter((id) => !studentsMap.has(id)).map((id) => (
                        <div
                          key={id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Users className="w-3 h-3 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-500 truncate">
                              Estudiante {id.slice(-4)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(index, id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                            title="Eliminar estudiante de esta parada"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Drop zone indicator for empty space */}
              {draggedIndex !== null && (
                <div
                  className={cn(
                    'h-16 border-2 border-dashed rounded-lg transition-colors',
                    dragOverIndex === editedRoute.stops.length
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  )}
                  onDragEnter={(e) =>
                    handleDragEnter(e, editedRoute.stops.length)
                  }
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, editedRoute.stops.length)}
                />
              )}

              {/* US-020: Nueva parada section */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {isCreatingNewStop ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nueva parada
                    </h4>
                    <div className="space-y-3">
                      <Select
                        label="Estudiante sin asignar"
                        options={unassignedStudentsWithGps.map((s) => ({
                          value: s.id,
                          label: s.name + (s.address ? ` - ${s.address.substring(0, 30)}...` : ''),
                        }))}
                        placeholder="Seleccionar estudiante con ubicacion..."
                        value={newStopStudentId}
                        onChange={(e) => setNewStopStudentId(e.target.value)}
                      />
                      {unassignedStudentsWithGps.length === 0 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          No hay estudiantes sin asignar con ubicacion GPS
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCreateNewStop}
                          disabled={!newStopStudentId || isRecalculating}
                          className={cn(
                            'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                            newStopStudentId && !isRecalculating
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          )}
                        >
                          {isRecalculating ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Creando...
                            </span>
                          ) : (
                            'Crear parada'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingNewStop(false);
                            setNewStopStudentId('');
                          }}
                          className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewStop(true)}
                    disabled={unassignedStudents.length === 0}
                    className={cn(
                      'w-full py-3 border-2 border-dashed rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                      unassignedStudents.length > 0
                        ? 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Nueva parada
                    {unassignedStudents.length > 0 && (
                      <span className="text-xs text-gray-500">
                        ({unassignedStudents.length} sin asignar)
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isRecalculating}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors',
              isRecalculating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            )}
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* US-020: Confirmation Dialog for removing students/stops */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({
            isOpen: false,
            stopIndex: -1,
            studentId: '',
            studentName: '',
            isLastStudent: false,
          })
        }
        onConfirm={confirmRemoveStudent}
        title={
          confirmDialog.isLastStudent
            ? 'Eliminar parada'
            : 'Eliminar estudiante'
        }
        message={
          confirmDialog.isLastStudent
            ? `${confirmDialog.studentName} es el unico estudiante en esta parada. Al eliminarlo, se eliminara la parada completa. ¿Deseas continuar?`
            : `¿Estas seguro que deseas eliminar a ${confirmDialog.studentName} de esta parada? El estudiante pasara a la lista de sin asignar.`
        }
        confirmLabel="Eliminar"
        variant={confirmDialog.isLastStudent ? 'danger' : 'warning'}
      />
    </div>
  );
}
