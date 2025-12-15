'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Users, Clock, Bus, Phone, Edit, Play, Trash2,
  ChevronRight, GraduationCap, Route, User, CheckCircle
} from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, ConfirmDialog } from '@/components/shared';
import { cn } from '@/lib/utils';
import { GoogleMapsProvider, InteractiveMap } from '@altaviapp/maps';
import type { MarkerInfo } from '@altaviapp/maps';

// Import mock data from routes page
import { mockRoutes, mockStudents, mockStops } from '../page';

// Type labels for route types
const typeLabels: Record<string, { label: string; color: string }> = {
  pickup: { label: 'Recogida', color: 'bg-blue-100 text-blue-700' },
  dropoff: { label: 'Entrega', color: 'bg-purple-100 text-purple-700' },
  ida: { label: 'Ida', color: 'bg-blue-100 text-blue-700' },
  retorno: { label: 'Retorno', color: 'bg-purple-100 text-purple-700' },
  ambas: { label: 'Ida/Retorno', color: 'bg-green-100 text-green-700' },
};

/**
 * Route Detail Page
 * Shows route information with interactive map, stops, and assigned students
 */
export default function RouteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find route in mock data
  const route = mockRoutes.find(r => r._id === routeId);
  const stops = mockStops[routeId as keyof typeof mockStops] || [];
  const students = mockStudents.filter(s => s.routeId === routeId);

  if (!route) {
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

  // Prepare map markers
  const mapMarkers: MarkerInfo[] = stops.map((stop, index) => ({
    id: `stop-${stop.id}`,
    position: { lat: stop.lat, lng: stop.lng },
    type: index === stops.length - 1 ? 'school' : 'stop',
    title: `${stop.order}. ${stop.name}`,
    label: stop.order.toString(),
  }));

  // Create polyline from stops
  const routePolyline = stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }));

  // Calculate map center (use first stop or default to Quito)
  const firstStop = stops[0];
  const mapCenter = firstStop
    ? { lat: firstStop.lat, lng: firstStop.lng }
    : { lat: -0.1807, lng: -78.4678 };

  // Group students by stop
  const studentsByStop = stops.reduce((acc, stop) => {
    acc[stop.id] = students.filter(s => s.stopId === stop.id);
    return acc;
  }, {} as Record<string, typeof students>);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/routes');
  };

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
              label: 'Iniciar Viaje',
              onClick: () => console.log('Start trip'),
              icon: Play,
              variant: 'primary',
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
                  <p className="text-2xl font-bold text-gray-900">{route.vehicleCapacity}</p>
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
                  polyline={routePolyline}
                  style={{ height: '400px' }}
                />
                {/* Map Legend */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-gray-600">Paradas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success"></span>
                    <span className="text-gray-600">Escuela</span>
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
                  {stops.map((stop, index) => {
                    const stopStudents = studentsByStop[stop.id] || [];
                    const isSchool = index === stops.length - 1;

                    return (
                      <div key={stop.id} className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Order Number */}
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                            isSchool ? 'bg-success' : 'bg-primary'
                          )}>
                            {isSchool ? <CheckCircle className="w-5 h-5" /> : stop.order}
                          </div>

                          {/* Stop Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{stop.name}</p>
                              {isSchool && (
                                <span className="px-2 py-0.5 bg-success/10 text-success rounded text-xs">
                                  Destino Final
                                </span>
                              )}
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
                  })}
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

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ocupación</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            (students.length / route.vehicleCapacity) > 0.8 ? 'bg-warning' : 'bg-success'
                          )}
                          style={{ width: `${Math.min((students.length / route.vehicleCapacity) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {students.length}/{route.vehicleCapacity}
                      </span>
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Crew Info */}
              <DetailSection title="Tripulación">
                <div className="space-y-4">
                  {/* Driver */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Conductor</p>
                      <Link href={`/fleet/drivers/${route.driverId}`} className="font-medium text-gray-900 hover:text-primary">
                        {route.driverName}
                      </Link>
                    </div>
                    {route.driverPhone && (
                      <a href={`tel:${route.driverPhone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Monitor */}
                  {route.monitorId ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Monitor</p>
                        <Link href={`/fleet/monitors/${route.monitorId}`} className="font-medium text-gray-900 hover:text-primary">
                          {route.monitorName}
                        </Link>
                      </div>
                      {route.monitorPhone && (
                        <a href={`tel:${route.monitorPhone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
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
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Vehículo</p>
                      <Link href={`/fleet/vehicles/${route.vehicleId}`} className="font-medium text-gray-900 hover:text-primary">
                        {route.vehiclePlate}
                      </Link>
                      <p className="text-xs text-gray-500">{route.vehicleModel}</p>
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Students List */}
              <div id="students" className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Estudiantes Asignados</h3>
                    <p className="text-sm text-gray-500">{students.length} estudiantes</p>
                  </div>
                  <Link
                    href={`/routes/${route._id}/students`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Ver todos <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {students.map((student) => {
                    const stop = stops.find(s => s.id === student.stopId);
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
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    <Play className="w-4 h-4" />
                    Iniciar Viaje
                  </button>
                  <Link
                    href={`/routes/${route._id}/edit`}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
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
