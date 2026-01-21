'use client';

/**
 * Step 6: Final Confirmation and Save for Bulk Route Creation
 *
 * Displays final review of routes and handles save with:
 * - Compact card grid showing all routes
 * - Progress indicator during creation
 * - Success screen with navigation options
 * - Error handling with retry capability
 * - Optional trip generation for next 7 days
 *
 * PRD References:
 * - US-025 - Step 6 - Final review display
 * - US-027 - Step 6 - Save progress and success feedback
 * - US-028 - Optional trip generation after route creation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Users,
  Bus,
  UserCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit3,
  Clock,
  CalendarPlus,
} from 'lucide-react';
import { api } from '../../../../../../convex/_generated/api';
import { cn } from '@/lib/utils';
import { useConvexAuth } from '@/hooks';
import type {
  BulkWizardStep1Data,
  BulkWizardStep4Data,
  BulkWizardStep5Data,
  GeneratedRoute,
} from './BulkRouteWizard';
import type { Id } from '../../../../../../convex/_generated/dataModel';

interface Step6ConfirmationProps {
  step1Data: BulkWizardStep1Data;
  step4Data: BulkWizardStep4Data;
  step5Data: BulkWizardStep5Data;
  onValidChange: (isValid: boolean) => void;
  onSaveComplete: (result: SaveResult) => void;
  onReset: () => void;
  onEditStep: (step: number) => void;
}

interface SaveResult {
  success: boolean;
  routesCreated: number;
  studentsAssigned: number;
  errors: Array<{ routeName: string; error: string }>;
  tripsGenerated?: number;
  tripErrors?: Array<{ routeName: string; date: string; error: string }>;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'partial_success' | 'error' | 'prompt_trips' | 'generating_trips';

// Day labels mapping
const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export function Step6Confirmation({
  step1Data,
  step4Data,
  step5Data,
  onValidChange,
  onSaveComplete,
  onReset,
  onEditStep,
}: Step6ConfirmationProps) {
  const router = useRouter();
  const { userId, institutionId } = useConvexAuth();

  // Save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Collapsible route state for showing stops
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Mutations
  const createBulkRoutes = useMutation(api.routes.createBulkRoutes);
  const createTrip = useMutation(api.trips.createTrip);

  // Store created route IDs for trip generation
  const [createdRouteIds, setCreatedRouteIds] = useState<Id<'routes'>[]>([]);
  const [tripProgress, setTripProgress] = useState({ current: 0, total: 0 });

  // Get routes with their assignments
  const routes = step4Data.generatedRoutes;
  const assignments = step5Data.routeAssignments;

  // Always valid in step 6 - just reviewing
  useEffect(() => {
    onValidChange(true);
  }, [onValidChange]);

  // Calculate totals
  const totalStudents = routes.reduce(
    (sum, r) => sum + r.stops.reduce((s, stop) => s + stop.studentIds.length, 0),
    0
  );
  const totalStops = routes.reduce((sum, r) => sum + r.stops.length, 0);
  const totalDuration = routes.reduce((sum, r) => sum + r.duration, 0);

  // Toggle route expansion
  const toggleRouteExpand = (routeId: string) => {
    setExpandedRouteId((prev) => (prev === routeId ? null : routeId));
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  // Format operation days
  const formatOperationDays = () => {
    if (step1Data.operationType === 'daily') {
      return 'Diario (Lunes a Viernes)';
    }
    return step1Data.selectedDays.map((d) => DAY_LABELS[d] || d).join(', ');
  };

  // Get assignment for a route
  const getRouteAssignment = (routeId: string) => {
    return assignments.find((a) => a.routeId === routeId);
  };

  // Build routes data for mutation
  const buildMutationRoutes = () => {
    return routes.map((route) => {
      const assignment = getRouteAssignment(route.id);
      const routeType = step1Data.routeType as 'pickup' | 'dropoff';

      // Calculate scheduled times based on route type
      // For pickup: target time is arrival at school, so start earlier
      // For dropoff: target time is departure from school, so end later
      const targetTime = step1Data.targetTime;
      const durationMinutes = Math.round(route.duration / 60);

      let scheduledStartTime: string;
      let scheduledEndTime: string;
      let schoolArrivalTime: string | undefined;
      let schoolDepartureTime: string | undefined;

      if (routeType === 'pickup') {
        // Start time = target time - route duration
        const [hoursStr, minutesStr] = targetTime.split(':');
        const hours = parseInt(hoursStr ?? '0', 10);
        const minutes = parseInt(minutesStr ?? '0', 10);
        const startDate = new Date();
        startDate.setHours(hours, minutes - durationMinutes, 0, 0);
        scheduledStartTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
        scheduledEndTime = targetTime;
        schoolArrivalTime = targetTime;
      } else {
        // Dropoff: start at target time, end = target + duration
        scheduledStartTime = targetTime;
        const [hoursStr2, minutesStr2] = targetTime.split(':');
        const hours2 = parseInt(hoursStr2 ?? '0', 10);
        const minutes2 = parseInt(minutesStr2 ?? '0', 10);
        const endDate = new Date();
        endDate.setHours(hours2, minutes2 + durationMinutes, 0, 0);
        scheduledEndTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        schoolDepartureTime = targetTime;
      }

      return {
        name: route.name,
        type: routeType,
        vehicleId: route.vehicleId as Id<'vehicles'>,
        driverId: (assignment?.driverId || '') as Id<'drivers'>,
        monitorId: assignment?.monitorId ? (assignment.monitorId as Id<'monitors'>) : undefined,
        scheduledStartTime,
        scheduledEndTime,
        schoolArrivalTime,
        schoolDepartureTime,
        optimizedPolyline: route.polyline,
        estimatedDuration: Math.round(route.duration),
        estimatedDistance: Math.round(route.distance),
        isActive: true,
        stops: route.stops.map((stop, index) => ({
          name: `Parada ${index + 1}`,
          address: `Parada ${index + 1}`, // Will be geocoded or updated later
          latitude: stop.latitude,
          longitude: stop.longitude,
          scheduledTime: scheduledStartTime, // Will be calculated by optimization
          order: stop.order,
          geofenceRadius: 100,
          studentIds: stop.studentIds as Id<'students'>[],
        })),
      };
    });
  };

  // Build recurrence from step 1 data
  const buildRecurrence = () => {
    if (step1Data.operationType === 'daily') {
      return {
        type: 'weekly' as const,
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      };
    }
    return {
      type: 'weekly' as const,
      daysOfWeek: step1Data.selectedDays,
    };
  };

  // Handle save
  const handleSave = async () => {
    if (!userId || !institutionId) {
      setSaveError('No se encontró la sesión de usuario');
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    setSaveProgress({ current: 0, total: routes.length });
    setSaveError(null);

    try {
      const mutationRoutes = buildMutationRoutes();
      const recurrence = buildRecurrence();

      // Simulate progress updates (since mutation is atomic)
      setSaveProgress({ current: Math.ceil(routes.length / 2), total: routes.length });

      const result = await createBulkRoutes({
        userId,
        institutionId,
        recurrence,
        routes: mutationRoutes,
      });

      setSaveProgress({ current: routes.length, total: routes.length });

      const saveRes: SaveResult = {
        success: result.success,
        routesCreated: result.routesCreated,
        studentsAssigned: result.studentsAssigned,
        errors: result.errors,
      };

      setSaveResult(saveRes);
      setCreatedRouteIds(result.routeIds || []);

      if (result.errors.length === 0 && result.success) {
        // Show trip generation prompt instead of going directly to success
        setSaveStatus('prompt_trips');
      } else if (result.routesCreated > 0) {
        // Partial success - still offer trip generation for created routes
        setSaveStatus('prompt_trips');
      } else {
        setSaveStatus('error');
        setSaveError('No se pudo crear ninguna ruta');
        onSaveComplete(saveRes);
      }
    } catch (err) {
      console.error('Error creating bulk routes:', err);
      setSaveError(err instanceof Error ? err.message : 'Error al crear las rutas');
      setSaveStatus('error');
    }
  };

  // Handle retry
  const handleRetry = () => {
    setSaveStatus('idle');
    setSaveError(null);
    setSaveResult(null);
  };

  // Get the next 7 days that match the route's recurrence
  const getNextDaysForTrips = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    const recurrenceDays = step1Data.operationType === 'daily'
      ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      : step1Data.selectedDays;

    // Map day names to JavaScript day numbers (0=Sunday, 1=Monday, etc.)
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const recurrenceDayNumbers = recurrenceDays.map((d) => dayMap[d]);

    // Get next 7 days, filtering by recurrence days
    for (let i = 1; i <= 14 && dates.length < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      if (recurrenceDayNumbers.includes(dayOfWeek)) {
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr) {
          dates.push(dateStr);
        }
      }
    }

    return dates;
  };

  // Handle trip generation
  const handleGenerateTrips = async () => {
    if (!userId || createdRouteIds.length === 0) return;

    setSaveStatus('generating_trips');
    const dates = getNextDaysForTrips();
    const totalTrips = createdRouteIds.length * dates.length;
    setTripProgress({ current: 0, total: totalTrips });

    let tripsGenerated = 0;
    const tripErrors: Array<{ routeName: string; date: string; error: string }> = [];
    let current = 0;

    for (const routeId of createdRouteIds) {
      // Find route name for error messages
      const routeIndex = createdRouteIds.indexOf(routeId);
      const routeName = routes[routeIndex]?.name || `Ruta ${routeIndex + 1}`;

      for (const date of dates) {
        try {
          await createTrip({
            userId,
            routeId,
            scheduledDate: date,
          });
          tripsGenerated++;
        } catch (err) {
          // Don't fail the whole flow, just record the error
          tripErrors.push({
            routeName,
            date,
            error: err instanceof Error ? err.message : 'Error desconocido',
          });
        }
        current++;
        setTripProgress({ current, total: totalTrips });
      }
    }

    // Update save result with trip info
    const updatedResult: SaveResult = {
      ...saveResult!,
      tripsGenerated,
      tripErrors: tripErrors.length > 0 ? tripErrors : undefined,
    };
    setSaveResult(updatedResult);

    if (tripErrors.length === 0) {
      setSaveStatus('success');
    } else if (tripsGenerated > 0) {
      setSaveStatus('partial_success');
    } else {
      // Even if all trips fail, routes were created successfully
      setSaveStatus('success');
    }

    onSaveComplete(updatedResult);
  };

  // Skip trip generation
  const handleSkipTrips = () => {
    setSaveStatus('success');
    if (saveResult) {
      onSaveComplete(saveResult);
    }
  };

  // Navigate to routes list
  const handleViewRoutes = () => {
    router.push('/routes');
  };

  // Reset wizard for creating more routes
  const handleCreateMore = () => {
    onReset();
  };

  // Render success screen
  if (saveStatus === 'success' || saveStatus === 'partial_success') {
    return (
      <div className="space-y-6">
        {/* Success Banner */}
        <div
          className={cn(
            'rounded-xl p-6 text-center',
            saveStatus === 'success'
              ? 'bg-success/10 border border-success/20'
              : 'bg-warning/10 border border-warning/20'
          )}
        >
          {saveStatus === 'success' ? (
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          ) : (
            <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
          )}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {saveStatus === 'success'
              ? '¡Rutas creadas exitosamente!'
              : 'Rutas creadas con advertencias'}
          </h3>
          <p className="text-gray-600 mb-4">
            {saveStatus === 'success'
              ? 'Todas las rutas han sido configuradas correctamente.'
              : 'Algunas rutas no pudieron ser creadas.'}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {saveResult?.routesCreated || 0}
              </div>
              <div className="text-sm text-gray-500">Rutas creadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {saveResult?.studentsAssigned || 0}
              </div>
              <div className="text-sm text-gray-500">Estudiantes asignados</div>
            </div>
            {saveResult?.tripsGenerated !== undefined && saveResult.tripsGenerated > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {saveResult.tripsGenerated}
                </div>
                <div className="text-sm text-gray-500">Viajes generados</div>
              </div>
            )}
          </div>
        </div>

        {/* Trip Errors List (if any) */}
        {saveResult?.tripErrors && saveResult.tripErrors.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <span className="font-medium text-warning">
                {saveResult.tripErrors.length} viaje{saveResult.tripErrors.length !== 1 ? 's' : ''} no pudieron ser generados
              </span>
            </div>
            <ul className="space-y-1 max-h-32 overflow-y-auto">
              {saveResult.tripErrors.slice(0, 10).map((err, index) => (
                <li key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{err.routeName}</span> ({err.date}): {err.error}
                </li>
              ))}
              {saveResult.tripErrors.length > 10 && (
                <li className="text-sm text-gray-400 italic">
                  ... y {saveResult.tripErrors.length - 10} errores mas
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Errors List (for partial success) */}
        {saveResult?.errors && saveResult.errors.length > 0 && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-error" />
              <span className="font-medium text-error">
                {saveResult.errors.length} ruta{saveResult.errors.length !== 1 ? 's' : ''} con errores
              </span>
            </div>
            <ul className="space-y-2">
              {saveResult.errors.map((err, index) => (
                <li key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{err.routeName}:</span> {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            type="button"
            onClick={handleViewRoutes}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Ver Rutas
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCreateMore}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Más
          </button>
        </div>
      </div>
    );
  }

  // Render saving state
  if (saveStatus === 'saving') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Creando rutas...
          </h3>
          <p className="text-gray-500">
            {saveProgress.current} de {saveProgress.total} rutas procesadas
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Esto puede tomar unos segundos
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${saveProgress.total > 0 ? (saveProgress.current / saveProgress.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    );
  }

  // Render trip generation prompt
  if (saveStatus === 'prompt_trips') {
    return (
      <div className="space-y-6">
        {/* Success Banner */}
        <div className="bg-success/10 border border-success/20 rounded-xl p-6 text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Rutas creadas exitosamente!
          </h3>
          <p className="text-gray-600">
            Se crearon {saveResult?.routesCreated || 0} rutas con {saveResult?.studentsAssigned || 0} estudiantes asignados.
          </p>
        </div>

        {/* Trip Generation Prompt */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
          <CalendarPlus className="w-12 h-12 text-primary mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            ¿Generar viajes para los proximos 7 dias?
          </h4>
          <p className="text-gray-600 mb-6">
            Puedes crear automaticamente los viajes programados para los proximos dias de operacion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={handleGenerateTrips}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <CalendarPlus className="w-5 h-5" />
              Si, generar viajes
            </button>
            <button
              type="button"
              onClick={handleSkipTrips}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              No, mas tarde
            </button>
          </div>
        </div>

        {/* Route creation errors if any */}
        {saveResult?.errors && saveResult.errors.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <span className="font-medium text-warning">
                {saveResult.errors.length} ruta{saveResult.errors.length !== 1 ? 's' : ''} no pudieron ser creadas
              </span>
            </div>
            <ul className="space-y-2">
              {saveResult.errors.map((err, index) => (
                <li key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{err.routeName}:</span> {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Render generating trips state
  if (saveStatus === 'generating_trips') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Generando viajes...
          </h3>
          <p className="text-gray-500">
            {tripProgress.current} de {tripProgress.total} viajes creados
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Esto puede tomar unos segundos
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${tripProgress.total > 0 ? (tripProgress.current / tripProgress.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    );
  }

  // Render error state
  if (saveStatus === 'error') {
    return (
      <div className="space-y-6">
        <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center">
          <XCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error al crear las rutas
          </h3>
          <p className="text-gray-600 mb-4">
            {saveError || 'Ocurrió un error inesperado'}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>

        {/* Error details if available */}
        {saveResult?.errors && saveResult.errors.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-3">Detalle de errores:</h4>
            <ul className="space-y-2">
              {saveResult.errors.map((err, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium">{err.routeName}:</span> {err.error}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Render review screen (idle state)
  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Resumen Final
            </h3>
            <p className="text-sm text-gray-500">
              Revisa los detalles antes de crear las rutas
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Rutas</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{routes.length}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Estudiantes</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{totalStudents}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Bus className="w-4 h-4" />
              <span className="text-sm">Paradas</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{totalStops}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Duracion</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{formatDuration(totalDuration)}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm">Tripulacion</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {assignments.filter((a) => a.driverId).length}
            </span>
          </div>
        </div>
      </div>

      {/* Operation Days Reminder with Edit Button */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500">Dias de operacion:</span>{' '}
            <span className="font-medium text-gray-900">{formatOperationDays()}</span>
            <span className="text-sm text-gray-500 ml-2">|</span>{' '}
            <span className="text-sm text-gray-500">Tipo:</span>{' '}
            <span className="font-medium text-gray-900">
              {step1Data.routeType === 'pickup' ? 'Recogida' : 'Entrega'}
            </span>{' '}
            <span className="text-sm text-gray-500">| Hora:</span>{' '}
            <span className="font-medium text-gray-900">{step1Data.targetTime}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEditStep(1)}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
        >
          <Edit3 className="w-4 h-4" />
          Editar
        </button>
      </div>

      {/* Route Cards with Edit Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            Rutas a crear ({routes.length})
          </h4>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
            >
              <Edit3 className="w-4 h-4" />
              Editar Rutas
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => onEditStep(5)}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
            >
              <Edit3 className="w-4 h-4" />
              Editar Tripulacion
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => {
            const assignment = getRouteAssignment(route.id);
            const studentCount = route.stops.reduce(
              (sum, stop) => sum + stop.studentIds.length,
              0
            );
            const isExpanded = expandedRouteId === route.id;

            return (
              <div
                key={route.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
              >
                <div className="p-4">
                  {/* Route Name */}
                  <h5 className="font-semibold text-gray-900 mb-3 truncate">
                    {route.name}
                  </h5>

                  {/* Route Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Bus className="w-4 h-4" />
                        Vehiculo
                      </span>
                      <span className="font-medium text-gray-900 truncate max-w-[120px]">
                        {route.vehicleId ? 'Asignado' : 'Sin asignar'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        Conductor
                      </span>
                      <span className="font-medium text-gray-900">
                        {assignment?.driverId ? 'Asignado' : 'Sin asignar'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Monitor
                      </span>
                      <span className="font-medium text-gray-900">
                        {assignment?.monitorId ? 'Asignado' : 'Sin monitor'}
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span>{route.stops.length} paradas</span>
                    <span>{studentCount} estudiantes</span>
                    <span>{formatDuration(route.duration)}</span>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    type="button"
                    onClick={() => toggleRouteExpand(route.id)}
                    className="mt-3 flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium w-full justify-center"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ocultar paradas
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver paradas ({route.stops.length})
                      </>
                    )}
                  </button>
                </div>

                {/* Collapsible Stops Detail */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <div className="space-y-2">
                      {route.stops
                        .sort((a, b) => a.order - b.order)
                        .map((stop, index) => (
                          <div
                            key={stop.id}
                            className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-100"
                          >
                            {/* Stop Number */}
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            {/* Stop Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900">
                                Parada {index + 1}
                              </p>
                              <p className="text-xs text-gray-500">
                                {stop.studentIds.length} estudiante
                                {stop.studentIds.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={!userId || !institutionId}
          className={cn(
            'flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-lg transition-colors',
            userId && institutionId
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <CheckCircle className="w-5 h-5" />
          Crear Rutas
        </button>
      </div>
    </div>
  );
}
