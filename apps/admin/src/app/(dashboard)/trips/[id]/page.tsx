'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Bus, MapPin, Users, Clock, AlertTriangle, CheckCircle, Phone,
  MessageSquare, RefreshCw, X, Send, Loader2
} from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection } from '@/components/shared';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GoogleMapsProvider, InteractiveMap } from '@altaviapp/maps';
import type { MarkerInfo } from '@altaviapp/maps';
import { useTrip, useTripMutations } from '@/hooks';

const statusConfig: Record<string, { label: string; status: 'active' | 'inactive' | 'warning' | 'error' }> = {
  scheduled: { label: 'Programado', status: 'inactive' },
  in_progress: { label: 'En Progreso', status: 'active' },
  completed: { label: 'Completado', status: 'inactive' },
  cancelled: { label: 'Cancelado', status: 'error' },
};

/**
 * Trip Detail Page
 * Connected to real Convex data
 */
export default function TripDetailPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'other' as 'accident' | 'breakdown' | 'behavior' | 'emergency' | 'other',
    severity: 'low' as 'low' | 'medium' | 'high' | 'critical',
    title: '',
    description: '',
  });

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { trip, isLoading } = useTrip(tripId as any);
  const { cancelTrip, completeTrip } = useTripMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando viaje...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Viaje no encontrado</p>
        <Link href="/trips" className="text-primary hover:underline mt-2 inline-block">
          Volver a viajes
        </Link>
      </div>
    );
  }

  const defaultStatusInfo = { label: 'En Progreso', status: 'active' as const };
  const statusInfo = statusConfig[trip.status] ?? defaultStatusInfo;

  // Get stops and current location
  const stops = trip.stops || [];
  const currentLocation = trip.currentLocation;
  const checkins = trip.checkins || [];

  // Calculate stats from real data
  const stats = trip.stats || { totalStudents: 0, checkedIn: 0, stopsCompleted: 0 };

  // Prepare map markers
  const mapMarkers: MarkerInfo[] = [
    // Current vehicle location if available
    ...(currentLocation ? [{
      id: 'vehicle',
      position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      type: 'vehicle' as const,
      title: `${trip.vehicle?.licensePlate || 'Vehículo'}`,
      label: '',
    }] : []),
    // Stop markers
    ...stops.map((stop, index) => ({
      id: `stop-${stop._id}`,
      position: { lat: stop.latitude, lng: stop.longitude },
      type: index === stops.length - 1 ? 'school' as const : 'stop' as const,
      title: `${stop.order}. ${stop.name}`,
      label: stop.order.toString(),
    })),
  ];

  // Create polyline from stops
  const routePolyline = stops.map((stop) => ({ lat: stop.latitude, lng: stop.longitude }));

  // Calculate map center
  const mapCenter = currentLocation
    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
    : stops[0]
      ? { lat: stops[0].latitude, lng: stops[0].longitude }
      : { lat: -0.1807, lng: -78.4678 };

  const handleCreateIncident = () => {
    // TODO: Connect to incidents API when available
    console.log('Creating incident:', newIncident);
    setShowIncidentModal(false);
    setNewIncident({ type: 'other', severity: 'low', title: '', description: '' });
  };

  const handleCompleteTrip = async () => {
    if (!currentLocation) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await completeTrip(tripId as any, currentLocation.latitude, currentLocation.longitude);
    } catch (error) {
      console.error('Error completing trip:', error);
    }
  };

  const handleCancelTrip = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await cancelTrip(tripId as any, 'Cancelado por administrador');
    } catch (error) {
      console.error('Error cancelling trip:', error);
    }
  };

  return (
    <GoogleMapsProvider>
      <div>
        <PageHeader
          title={trip.route?.name || 'Viaje'}
          subtitle={`${trip.scheduledDate} • ${trip.route?.type === 'pickup' ? 'Recogida' : 'Entrega'}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Viajes', href: '/trips' },
            { label: trip.route?.name || 'Viaje' },
          ]}
          backHref="/trips"
          badge={
            <StatusBadge
              status={statusInfo.status}
              label={statusInfo.label}
            />
          }
          actions={[
            ...(trip.status === 'in_progress' ? [{
              label: 'Completar Viaje',
              onClick: handleCompleteTrip,
              icon: CheckCircle,
              variant: 'primary' as const,
            }] : []),
            {
              label: 'Reportar Incidente',
              onClick: () => setShowIncidentModal(true),
              icon: AlertTriangle,
              variant: 'danger' as const,
            },
            ...(trip.status !== 'completed' && trip.status !== 'cancelled' ? [{
              label: 'Cancelar',
              onClick: handleCancelTrip,
              icon: X,
              variant: 'secondary' as const,
            }] : []),
          ]}
        />

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.checkedIn}/{stats.totalStudents}</p>
                  <p className="text-sm text-gray-500">Estudiantes Registrados</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.stopsCompleted}/{stops.length}</p>
                  <p className="text-sm text-gray-500">Paradas Completadas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trip.startTime ? new Date(trip.startTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                  <p className="text-sm text-gray-500">Hora Inicio</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{checkins.length}</p>
                  <p className="text-sm text-gray-500">Check-ins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Map & Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Map */}
              <div id="map" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Seguimiento en Vivo</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                        autoRefresh ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      <RefreshCw className={cn('w-4 h-4', autoRefresh && 'animate-spin')} />
                      {autoRefresh ? 'Auto' : 'Pausado'}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        trip.status === 'in_progress' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      )} />
                      <span className="text-sm text-gray-500">
                        {trip.status === 'in_progress' ? 'En vivo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
                <InteractiveMap
                  center={mapCenter}
                  zoom={14}
                  markers={mapMarkers}
                  polyline={routePolyline}
                  style={{ height: '400px' }}
                />
                {/* Map Legend */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600">Vehículo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-gray-600">Paradas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success"></span>
                    <span className="text-gray-600">Escuela</span>
                  </div>
                </div>
              </div>

              {/* Trip Progress */}
              <DetailSection title="Paradas de la Ruta">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progreso General</span>
                    <span className="font-medium">{stops.length > 0 ? Math.round((stats.stopsCompleted / stops.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all bg-success'
                      )}
                      style={{ width: `${stops.length > 0 ? (stats.stopsCompleted / stops.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Stops List */}
                <div className="space-y-3">
                  {stops.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay paradas configuradas
                    </div>
                  ) : (
                    stops.map((stop, index) => {
                      const isLast = index === stops.length - 1;

                      return (
                        <div
                          key={stop._id}
                          className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-gray-50"
                        >
                          {/* Order Number */}
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                            isLast ? 'bg-success' : 'bg-primary'
                          )}>
                            {isLast ? <CheckCircle className="w-5 h-5" /> : stop.order}
                          </div>

                          {/* Stop Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{stop.name}</p>
                              {isLast && (
                                <span className="px-2 py-0.5 bg-success/10 text-success rounded text-xs">
                                  Destino
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{stop.address}</p>
                          </div>

                          {/* Scheduled Time */}
                          <div className="text-right text-sm">
                            <p className="text-gray-600">{stop.scheduledTime || '--:--'}</p>
                            <p className="text-gray-400 text-xs">programado</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </DetailSection>

              {/* Check-ins List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Registros de Estudiantes</h3>
                  <p className="text-sm text-gray-500">{checkins.length} check-ins realizados</p>
                </div>
                {checkins.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No hay registros aún</p>
                    <p className="text-sm text-gray-400">Los check-ins aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {checkins.map((checkin) => (
                      <div key={checkin._id} className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{checkin.studentName}</p>
                          <p className="text-sm text-gray-500">{checkin.stopName}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(checkin.timestamp).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-6">
              {/* Trip Info */}
              <DetailSection title="Información del Viaje">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ruta</p>
                    <Link href={`/routes/${trip.routeId}`} className="text-primary hover:underline font-medium">
                      {trip.route?.name || 'Sin nombre'}
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fecha</p>
                      <p className="font-medium text-gray-900">{trip.scheduledDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tipo</p>
                      <p className="font-medium text-gray-900">
                        {trip.route?.type === 'pickup' ? 'Recogida' : 'Entrega'}
                      </p>
                    </div>
                  </div>

                  {currentLocation && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Última Ubicación</p>
                      <div className="flex items-center gap-1 text-gray-900">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-mono text-sm">
                          {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(currentLocation.timestamp).toLocaleTimeString('es-EC')}
                      </p>
                    </div>
                  )}
                </div>
              </DetailSection>

              {/* Crew Info */}
              <DetailSection title="Tripulación">
                <div className="space-y-4">
                  {/* Driver */}
                  {trip.driver ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Conductor</p>
                        <Link href={`/fleet/drivers/${trip.driverId}`} className="font-medium text-gray-900 hover:text-primary">
                          {trip.driver.licenseNumber || 'Sin licencia'}
                        </Link>
                      </div>
                      {trip.driver.phone && (
                        <a href={`tel:${trip.driver.phone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-700">Conductor no asignado</p>
                    </div>
                  )}

                  {/* Monitor */}
                  {trip.monitor ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Monitor</p>
                        <Link href={`/fleet/monitors/${trip.monitorId}`} className="font-medium text-gray-900 hover:text-primary">
                          {trip.monitor.idNumber || 'Sin ID'}
                        </Link>
                      </div>
                      {trip.monitor.phone && (
                        <a href={`tel:${trip.monitor.phone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Sin monitor asignado</p>
                    </div>
                  )}

                  {/* Vehicle */}
                  {trip.vehicle ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Vehículo</p>
                        <Link href={`/fleet/vehicles/${trip.vehicleId}`} className="font-medium text-gray-900 hover:text-primary">
                          {trip.vehicle.licensePlate}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-700">Vehículo no asignado</p>
                    </div>
                  )}
                </div>
              </DetailSection>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Mensaje
                  </button>
                  {trip.driver?.phone && (
                    <a
                      href={`tel:${trip.driver.phone}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      Llamar
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Incident Modal */}
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowIncidentModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Reportar Incidente</h3>
                <button
                  onClick={() => setShowIncidentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Incidente</label>
                  <select
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value as typeof newIncident.type })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="behavior">Comportamiento</option>
                    <option value="breakdown">Avería</option>
                    <option value="accident">Accidente</option>
                    <option value="emergency">Emergencia</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder="Breve descripción del incidente"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Describe lo sucedido con detalle..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateIncident}
                  disabled={!newIncident.title || !newIncident.description}
                  className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Reportar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleMapsProvider>
  );
}
