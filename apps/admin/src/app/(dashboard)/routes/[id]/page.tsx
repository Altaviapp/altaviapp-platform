'use client';

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Users, Clock, Bus, Phone, Edit, Trash2,
  ChevronRight, GraduationCap, Route, User, Loader2
} from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, ConfirmDialog } from '@/components/shared';
import { cn } from '@/lib/utils';
import { GoogleMapsProvider, InteractiveMap, RoutePolyline } from '@altaviapp/maps';
import type { MarkerInfo } from '@altaviapp/maps';
import { useRoute, useRouteMutations } from '@/hooks';

// Type labels for route types
const typeLabels: Record<string, { label: string; color: string }> = {
  pickup: { label: 'Recogida', color: 'bg-blue-100 text-blue-700' },
  dropoff: { label: 'Entrega', color: 'bg-purple-100 text-purple-700' },
};

/**
 * Route Detail Page
 * Connected to real Convex data
 */
export default function RouteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Handler for when map loads
  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { route, isLoading, notFound } = useRoute(routeId as any);
  const { deactivateRoute } = useRouteMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando ruta...</span>
      </div>
    );
  }

  if (notFound || !route) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Ruta no encontrada</p>
        <Link href="/routes" className="text-primary hover:underline mt-2 inline-block">
          Volver a rutas
        </Link>
      </div>
    );
  }

  const typeInfo = typeLabels[route.type] || { label: 'Ruta', color: 'bg-gray-100 text-gray-700' };
  const stops = route.stops || [];
  // Filter out any null students and type the result properly
  const students = (route.students || []).filter((s): s is NonNullable<typeof s> => s !== null);

  // Prepare map markers - all stops are student stops
  const mapMarkers: MarkerInfo[] = stops.map((stop) => ({
    id: `stop-${stop._id}`,
    position: { lat: stop.latitude, lng: stop.longitude },
    type: 'stop',
    title: `${stop.order}. ${stop.name}`,
    label: stop.order.toString(),
  }));

  // Create polyline from stops
  const routePolyline = stops.map((stop) => ({ lat: stop.latitude, lng: stop.longitude }));

  // Calculate map center (use first stop or default to Quito)
  const firstStop = stops[0];
  const mapCenter = firstStop
    ? { lat: firstStop.latitude, lng: firstStop.longitude }
    : { lat: -0.1807, lng: -78.4678 };

  // Group students by stop
  const studentsByStop = stops.reduce((acc, stop) => {
    acc[stop._id] = students.filter(s => s.stopId === stop._id);
    return acc;
  }, {} as Record<string, typeof students>);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deactivateRoute(routeId as any);
      router.push('/routes');
    } catch (error) {
      console.error('Error deactivating route:', error);
      setIsDeleting(false);
    }
  };

  const vehicleCapacity = route.vehicle?.capacity || 0;

  return (
    <GoogleMapsProvider>
      <div>
        <PageHeader
          title={route.name}
          subtitle={`${route.scheduledStartTime} - ${route.scheduledEndTime}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Rutas', href: '/routes' },
            { label: route.name },
          ]}
          backHref="/routes"
          badge={
            <div className="flex items-center gap-2">
              <span className={cn('px-2 py-1 text-xs rounded-full', typeInfo.color)}>
                {typeInfo.label}
              </span>
              <StatusBadge
                status={route.isActive ? 'active' : 'inactive'}
                label={route.isActive ? 'Activa' : 'Inactiva'}
              />
            </div>
          }
          actions={[
            {
              label: 'Editar Ruta',
              href: `/routes/${route._id}/edit`,
              icon: Edit,
              variant: 'secondary',
            },
            {
              label: 'Eliminar',
              onClick: () => setShowDeleteDialog(true),
              icon: Trash2,
              variant: 'danger',
            },
          ]}
        />

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stops.length}</p>
                  <p className="text-sm text-gray-500">Paradas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                  <p className="text-sm text-gray-500">Estudiantes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{vehicleCapacity}</p>
                  <p className="text-sm text-gray-500">Capacidad</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateDuration(route.scheduledStartTime, route.scheduledEndTime)}
                  </p>
                  <p className="text-sm text-gray-500">Duración</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Map & Stops */}
            <div className="lg:col-span-2 space-y-6">
              {/* Route Map */}
              <div id="map" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Mapa de Ruta</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Route className="w-4 h-4" />
                    <span>{stops.length} paradas optimizadas</span>
                  </div>
                </div>
                <InteractiveMap
                  center={mapCenter}
                  zoom={13}
                  markers={mapMarkers}
                  polyline={route.optimizedPolyline ? undefined : routePolyline}
                  style={{ height: '400px' }}
                  onMapLoad={handleMapLoad}
                />
                {/* Use RoutePolyline for optimized route visualization */}
                {route.optimizedPolyline && (
                  <RoutePolyline
                    map={map}
                    encodedPolyline={route.optimizedPolyline}
                    strokeColor="#042940"
                    strokeWeight={5}
                    strokeOpacity={0.8}
                  />
                )}
                {/* Map Legend */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-gray-600">Paradas de estudiantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-primary"></span>
                    <span className="text-gray-600">Ruta optimizada</span>
                  </div>
                </div>
              </div>

              {/* Stops List */}
              <div id="stops" className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Paradas de la Ruta</h3>
                  <p className="text-sm text-gray-500">Orden optimizado por proximidad de estudiantes</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {stops.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No hay paradas configuradas
                    </div>
                  ) : (
                    stops.map((stop) => {
                      const stopStudents = studentsByStop[stop._id] || [];

                      return (
                        <div key={stop._id} className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Order Number */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-primary">
                              {stop.order}
                            </div>

                            {/* Stop Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{stop.name}</p>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">{stop.address}</p>

                              {/* Students at this stop */}
                              {stopStudents.length > 0 && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {stopStudents.length} estudiante{stopStudents.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {stopStudents.map(student => (
                                      <Link
                                        key={student.id}
                                        href={`/students/${student.id}`}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200 text-xs hover:border-primary hover:text-primary transition-colors"
                                      >
                                        <User className="w-3 h-3" />
                                        {student.firstName} {student.lastName}
                                        <span className="text-gray-400">({student.grade})</span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Scheduled Time */}
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{stop.scheduledTime}</p>
                              <p className="text-xs text-gray-500">hora programada</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Info & Students */}
            <div className="space-y-6">
              {/* Route Info */}
              <DetailSection title="Información de la Ruta">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tipo</p>
                      <span className={cn('px-2 py-1 text-xs rounded-full', typeInfo.color)}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Estado</p>
                      <StatusBadge
                        status={route.isActive ? 'active' : 'inactive'}
                        label={route.isActive ? 'Activa' : 'Inactiva'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hora Inicio</p>
                      <p className="font-medium text-gray-900">{route.scheduledStartTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hora Fin</p>
                      <p className="font-medium text-gray-900">{route.scheduledEndTime}</p>
                    </div>
                  </div>

                  {vehicleCapacity > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ocupación</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              (students.length / vehicleCapacity) > 0.8 ? 'bg-warning' : 'bg-success'
                            )}
                            style={{ width: `${Math.min((students.length / vehicleCapacity) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {students.length}/{vehicleCapacity}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </DetailSection>

              {/* Crew Info */}
              <DetailSection title="Tripulación">
                <div className="space-y-4">
                  {/* Driver */}
                  {route.driver ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Conductor</p>
                        <Link href={`/fleet/drivers/${route.driver.id}`} className="font-medium text-gray-900 hover:text-primary">
                          {route.driver.name || 'Sin nombre'}
                        </Link>
                      </div>
                      {route.driver.phone && (
                        <a href={`tel:${route.driver.phone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-amber-600">Conductor</p>
                        <p className="font-medium text-amber-700">Sin asignar</p>
                      </div>
                    </div>
                  )}

                  {/* Monitor */}
                  {route.monitor ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Monitor</p>
                        <Link href={`/fleet/monitors/${route.monitor.id}`} className="font-medium text-gray-900 hover:text-primary">
                          {route.monitor.name || 'Sin nombre'}
                        </Link>
                      </div>
                      {route.monitor.phone && (
                        <a href={`tel:${route.monitor.phone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-amber-600">Monitor</p>
                        <p className="font-medium text-amber-700">Sin asignar</p>
                      </div>
                    </div>
                  )}

                  {/* Vehicle */}
                  {route.vehicle ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Vehículo</p>
                        <Link href={`/fleet/vehicles/${route.vehicle.id}`} className="font-medium text-gray-900 hover:text-primary">
                          {route.vehicle.licensePlate}
                        </Link>
                        <p className="text-xs text-gray-500">{route.vehicle.brand} {route.vehicle.model}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-amber-600">Vehículo</p>
                        <p className="font-medium text-amber-700">Sin asignar</p>
                      </div>
                    </div>
                  )}
                </div>
              </DetailSection>

              {/* Students List */}
              <div id="students" className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Estudiantes Asignados</h3>
                    <p className="text-sm text-gray-500">{students.length} estudiantes</p>
                  </div>
                  {students.length > 0 && (
                    <Link
                      href={`/routes/${route._id}/students`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Ver todos <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {students.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No hay estudiantes asignados
                    </div>
                  ) : (
                    students.map((student) => {
                      const stop = stops.find(s => s._id === student.stopId);
                      return (
                        <Link
                          key={student.id}
                          href={`/students/${student.id}`}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {student.grade} • {stop?.name || 'Sin parada'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <Link
                    href={`/routes/${route._id}/edit`}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Ruta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Eliminar Ruta"
          message={`¿Estás seguro de que deseas eliminar la ruta "${route.name}"? Los estudiantes asignados quedarán sin ruta.`}
          confirmLabel="Eliminar"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </GoogleMapsProvider>
  );
}

// Helper function to calculate duration
function calculateDuration(start: string, end: string): string {
  const startParts = start.split(':').map(Number);
  const endParts = end.split(':').map(Number);

  const startHour = startParts[0] ?? 0;
  const startMin = startParts[1] ?? 0;
  const endHour = endParts[0] ?? 0;
  const endMin = endParts[1] ?? 0;

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const durationMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
