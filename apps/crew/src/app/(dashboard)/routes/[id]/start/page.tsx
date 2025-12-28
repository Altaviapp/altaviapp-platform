'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Users,
  Bus,
  Clock,
  MapPin,
  AlertTriangle,
  UserX,
  UserCheck,
  MapPinned,
  Loader2,
  Sunrise,
  Sunset,
  CheckCircle,
  ClipboardCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouteWithStudents, useNovedadesForRoute, useTripOperations } from '@/hooks';
import { LoadingState, Card, CardContent, Button } from '@/components/core';
import { PageHeader } from '@/components/shared';

const novedadTypeConfig = {
  absence: {
    label: 'No viajará',
    color: 'text-error',
    bg: 'bg-error/10',
    icon: UserX,
  },
  parent_pickup: {
    label: 'Padre recoge',
    color: 'text-warning',
    bg: 'bg-warning/10',
    icon: UserCheck,
  },
  stop_change: {
    label: 'Cambio de parada',
    color: 'text-info',
    bg: 'bg-info/10',
    icon: MapPinned,
  },
  early_pickup: {
    label: 'Salida temprana',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    icon: Clock,
  },
  late_arrival: {
    label: 'Llegada tarde',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    icon: Clock,
  },
};

export default function RouteStartPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = (params?.id as string) || null;

  const { route, isLoading: routeLoading } = useRouteWithStudents(routeId);
  const { novedades, summary, isLoading: novedadesLoading } = useNovedadesForRoute(routeId);
  const { startTripFromRoute } = useTripOperations();

  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Error getting location:', err);
          // Use default location if GPS fails
          setLocation({ latitude: -2.1894, longitude: -79.8891 }); // Guayaquil
        }
      );
    } else {
      setLocation({ latitude: -2.1894, longitude: -79.8891 }); // Guayaquil
    }
  }, []);

  // Show checklist decision modal
  const handleStartTrip = () => {
    if (!location) {
      setError('No se pudo obtener la ubicación GPS. Por favor, permite el acceso a tu ubicación.');
      return;
    }
    setError(null);
    setShowChecklistModal(true);
  };

  // Actually start the trip and navigate
  const confirmStartTrip = async (goToChecklist: boolean) => {
    setShowChecklistModal(false);
    setIsStarting(true);
    setError(null);

    try {
      if (!routeId || !location) {
        setError('ID de ruta o ubicación no válidos');
        return;
      }

      const result = await startTripFromRoute(
        routeId,
        location.latitude,
        location.longitude
      );

      if (result.success && result.tripId) {
        // Navigate based on user choice
        if (goToChecklist) {
          router.push(`/trips/${result.tripId}/checklist`);
        } else {
          router.push(`/trips/${result.tripId}/active`);
        }
      } else {
        setError('Error al iniciar el viaje. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error starting trip:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar el viaje');
    } finally {
      setIsStarting(false);
    }
  };

  // Loading state
  if (routeLoading) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader title="Iniciar Viaje" backHref="/routes" />
        <LoadingState message="Cargando ruta..." />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Ruta no encontrada</p>
        <Link href="/trips" className="text-primary mt-4 inline-block">
          Volver a rutas
        </Link>
      </div>
    );
  }

  const isPickup = route.type === 'pickup';
  const TypeIcon = isPickup ? Sunrise : Sunset;

  // Calculate expected students (total - absences - parent_pickups)
  const expectedStudents = (route.students?.length || 0) - summary.absences - summary.parentPickups;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/trips" className="p-2 -ml-2 rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Iniciar Viaje</h1>
            <p className="text-sm text-white/70">{route.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Route Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isPickup ? 'bg-warning/10' : 'bg-info/10'
            )}>
              <TypeIcon className={cn('w-5 h-5', isPickup ? 'text-warning' : 'text-info')} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Ruta de {isPickup ? 'Recogida' : 'Entrega'}
              </h2>
              <p className="text-sm text-gray-500">{route.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{route.scheduledStartTime} - {route.scheduledEndTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{expectedStudents} estudiantes esperados</span>
            </div>
            {route.vehicle && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bus className="w-4 h-4 text-gray-400" />
                <span>{route.vehicle.licensePlate}</span>
              </div>
            )}
            {route.stops && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{route.stops.length} paradas</span>
              </div>
            )}
          </div>
        </div>

        {/* Novedades Section */}
        {summary.total > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Novedades del Día ({summary.total})
            </h3>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {summary.absences > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                  {summary.absences} ausencia{summary.absences > 1 ? 's' : ''}
                </span>
              )}
              {summary.parentPickups > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  {summary.parentPickups} padre recoge
                </span>
              )}
              {summary.stopChanges > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-info/10 text-info">
                  {summary.stopChanges} cambio{summary.stopChanges > 1 ? 's' : ''} de parada
                </span>
              )}
            </div>

            {/* Novedades list */}
            {!novedadesLoading && (
              <div className="space-y-2">
                {novedades.map((novedad) => {
                  const config = novedadTypeConfig[novedad.type] || novedadTypeConfig.absence;
                  const Icon = config.icon;

                  return (
                    <div
                      key={novedad._id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg',
                        config.bg
                      )}
                    >
                      <Icon className={cn('w-5 h-5 mt-0.5', config.color)} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium text-sm', config.color)}>
                          {novedad.studentName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {config.label}
                          {novedad.stopName && ` - ${novedad.stopName}`}
                        </p>
                        {novedad.reason && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {novedad.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Students List */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Estudiantes Asignados ({route.students?.length || 0})
          </h3>

          {route.students && route.students.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {route.students.filter(Boolean).map((student) => {
                if (!student) return null;

                // Check if student has a novedad
                const studentNovedad = novedades.find(
                  (n) => n.studentId === student.id
                );
                const hasNovedad = !!studentNovedad;
                const novedadConfig = studentNovedad
                  ? novedadTypeConfig[studentNovedad.type]
                  : null;

                return (
                  <div
                    key={student.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg',
                      hasNovedad ? novedadConfig?.bg : 'bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                      hasNovedad ? novedadConfig?.bg : 'bg-primary/10 text-primary'
                    )}>
                      {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        hasNovedad ? novedadConfig?.color : 'text-gray-900'
                      )}>
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.grade}
                        {hasNovedad && ` - ${novedadConfig?.label}`}
                      </p>
                    </div>
                    {hasNovedad && novedadConfig && (
                      <novedadConfig.icon className={cn('w-4 h-4', novedadConfig.color)} />
                    )}
                    {!hasNovedad && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay estudiantes asignados a esta ruta
            </p>
          )}
        </div>

        {/* GPS Status */}
        <div className={cn(
          'rounded-lg p-3 text-sm flex items-center gap-2',
          location ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
        )}>
          <MapPin className="w-4 h-4" />
          {location
            ? 'GPS listo'
            : 'Obteniendo ubicación GPS...'
          }
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 mb-4">
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-error text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Start Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-pb">
        <button
          onClick={handleStartTrip}
          disabled={isStarting || !location}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors',
            isStarting || !location
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-success hover:bg-success/90 text-white'
          )}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Iniciando...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Confirmar e Iniciar Viaje
            </>
          )}
        </button>
      </div>

      {/* Checklist Decision Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowChecklistModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Inspección del Vehículo
              </h3>
              <p className="text-sm text-gray-600">
                ¿Deseas realizar la inspección del vehículo antes de iniciar el viaje?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => confirmStartTrip(true)}
                className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <ClipboardCheck className="w-5 h-5" />
                Sí, hacer inspección
              </button>
              <button
                onClick={() => confirmStartTrip(false)}
                className="w-full py-3 px-4 bg-success text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-success/90 transition-colors"
              >
                <Play className="w-5 h-5" />
                No, iniciar directamente
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              La inspección es opcional pero recomendada
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
