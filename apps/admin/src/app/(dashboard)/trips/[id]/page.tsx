'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Bus, MapPin, Users, Clock, AlertTriangle, CheckCircle, Phone,
  Navigation, Play, Pause, Square, MessageSquare, FileText, Plus,
  RefreshCw, X, Send, AlertCircle, Info
} from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection } from '@/components/shared';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GoogleMapsProvider, InteractiveMap } from '@altaviapp/maps';
import type { MarkerInfo } from '@altaviapp/maps';

// Mock trip data - Extended with coordinates
const mockTrips: Record<string, {
  id: string;
  route: { id: string; name: string };
  driver: { id: string; name: string; phone: string };
  monitor: { id: string; name: string; phone: string } | null;
  vehicle: { id: string; plate: string; model: string; currentLocation: { lat: number; lng: number } };
  status: 'scheduled' | 'in_progress' | 'picking_up' | 'completed' | 'delayed' | 'cancelled';
  type: 'pickup' | 'dropoff';
  progress: number;
  students: {
    total: number;
    onBoard: number;
    delivered: number;
    absent: number;
  };
  stops: Array<{
    id: string;
    order: number;
    name: string;
    reference: string;
    status: 'pending' | 'arrived' | 'completed' | 'skipped';
    arrivedAt: string | null;
    departedAt: string | null;
    students: number;
    studentsBoarded: number;
    lat: number;
    lng: number;
  }>;
  timeline: Array<{
    id: string;
    time: string;
    event: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }>;
  incidents: Array<{
    id: string;
    type: 'accident' | 'breakdown' | 'behavior' | 'emergency' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    reportedBy: string;
    reportedAt: string;
    status: 'open' | 'investigating' | 'resolved' | 'closed';
  }>;
  startTime: string;
  scheduledStart: string;
  eta: string;
  currentLocation: string;
  delayMinutes: number;
  date: string;
  notes: string;
  schoolLocation: { lat: number; lng: number };
}> = {
  '1': {
    id: '1',
    route: { id: '1', name: 'Ruta Centro - Escuela A' },
    driver: { id: '1', name: 'Juan Pérez', phone: '+593 99 123 4567' },
    monitor: { id: '1', name: 'Ana Torres', phone: '+593 98 765 4321' },
    vehicle: { id: '1', plate: 'ABC-1234', model: 'Toyota Coaster', currentLocation: { lat: -0.1825, lng: -78.4835 } },
    status: 'in_progress',
    type: 'pickup',
    progress: 75,
    students: { total: 28, onBoard: 23, delivered: 0, absent: 2 },
    stops: [
      { id: '1', order: 1, name: 'Centro Comercial', reference: 'Entrada principal', status: 'completed', arrivedAt: '07:05', departedAt: '07:08', students: 5, studentsBoarded: 5, lat: -0.1750, lng: -78.4820 },
      { id: '2', order: 2, name: 'Parque Central', reference: 'Esquina norte', status: 'completed', arrivedAt: '07:15', departedAt: '07:18', students: 8, studentsBoarded: 7, lat: -0.1780, lng: -78.4850 },
      { id: '3', order: 3, name: 'Iglesia San Juan', reference: 'Frente a la plaza', status: 'completed', arrivedAt: '07:25', departedAt: '07:28', students: 6, studentsBoarded: 6, lat: -0.1810, lng: -78.4870 },
      { id: '4', order: 4, name: 'Plaza Mayor', reference: 'Junto a la fuente', status: 'arrived', arrivedAt: '07:35', departedAt: null, students: 5, studentsBoarded: 5, lat: -0.1830, lng: -78.4890 },
      { id: '5', order: 5, name: 'Av. Principal', reference: 'Parada de bus', status: 'pending', arrivedAt: null, departedAt: null, students: 4, studentsBoarded: 0, lat: -0.1860, lng: -78.4910 },
      { id: '6', order: 6, name: 'Escuela A', reference: 'Entrada principal', status: 'pending', arrivedAt: null, departedAt: null, students: 0, studentsBoarded: 0, lat: -0.1900, lng: -78.4950 },
    ],
    timeline: [
      { id: '1', time: '07:00', event: 'Viaje iniciado', type: 'info' },
      { id: '2', time: '07:05', event: 'Llegada a Centro Comercial', type: 'info' },
      { id: '3', time: '07:08', event: '5 estudiantes abordaron', type: 'success' },
      { id: '4', time: '07:15', event: 'Llegada a Parque Central', type: 'info' },
      { id: '5', time: '07:16', event: '1 estudiante marcado como ausente', type: 'warning' },
      { id: '6', time: '07:18', event: '7 estudiantes abordaron', type: 'success' },
      { id: '7', time: '07:25', event: 'Llegada a Iglesia San Juan', type: 'info' },
      { id: '8', time: '07:28', event: '6 estudiantes abordaron', type: 'success' },
      { id: '9', time: '07:35', event: 'Llegada a Plaza Mayor', type: 'info' },
    ],
    incidents: [
      {
        id: '1',
        type: 'behavior',
        severity: 'low',
        title: 'Estudiante mareado',
        description: 'Un estudiante reportó sentirse mareado durante el trayecto. Se le dio agua y mejoró.',
        reportedBy: 'Ana Torres (Monitor)',
        reportedAt: '07:20',
        status: 'resolved',
      },
    ],
    startTime: '07:00',
    scheduledStart: '07:00',
    eta: '08:15',
    currentLocation: 'Plaza Mayor',
    delayMinutes: 0,
    date: '10/12/2024',
    notes: '',
    schoolLocation: { lat: -0.1900, lng: -78.4950 },
  },
  '2': {
    id: '2',
    route: { id: '2', name: 'Ruta Norte - Escuela B' },
    driver: { id: '2', name: 'María González', phone: '+593 99 234 5678' },
    monitor: { id: '2', name: 'Luis Mendoza', phone: '+593 98 876 5432' },
    vehicle: { id: '2', plate: 'DEF-5678', model: 'Hyundai County', currentLocation: { lat: -0.1650, lng: -78.4750 } },
    status: 'picking_up',
    type: 'pickup',
    progress: 40,
    students: { total: 25, onBoard: 12, delivered: 0, absent: 0 },
    stops: [
      { id: '1', order: 1, name: 'Residencial Norte', reference: 'Entrada', status: 'completed', arrivedAt: '06:35', departedAt: '06:40', students: 4, studentsBoarded: 4, lat: -0.1600, lng: -78.4700 },
      { id: '2', order: 2, name: 'Parque del Arbolito', reference: 'Esquina', status: 'completed', arrivedAt: '06:50', departedAt: '06:55', students: 5, studentsBoarded: 5, lat: -0.1630, lng: -78.4720 },
      { id: '3', order: 3, name: 'Av. El Inca', reference: 'Parada', status: 'arrived', arrivedAt: '07:05', departedAt: null, students: 3, studentsBoarded: 3, lat: -0.1660, lng: -78.4740 },
      { id: '4', order: 4, name: 'Centro Norte', reference: 'Plaza', status: 'pending', arrivedAt: null, departedAt: null, students: 6, studentsBoarded: 0, lat: -0.1690, lng: -78.4780 },
      { id: '5', order: 5, name: 'Escuela B', reference: 'Puerta principal', status: 'pending', arrivedAt: null, departedAt: null, students: 7, studentsBoarded: 0, lat: -0.1720, lng: -78.4820 },
    ],
    timeline: [
      { id: '1', time: '06:30', event: 'Viaje iniciado', type: 'info' },
      { id: '2', time: '06:35', event: 'Llegada a Residencial Norte', type: 'info' },
      { id: '3', time: '06:40', event: '4 estudiantes abordaron', type: 'success' },
      { id: '4', time: '06:50', event: 'Llegada a Parque del Arbolito', type: 'info' },
      { id: '5', time: '06:55', event: '5 estudiantes abordaron', type: 'success' },
      { id: '6', time: '07:05', event: 'Llegada a Av. El Inca', type: 'info' },
    ],
    incidents: [],
    startTime: '06:30',
    scheduledStart: '06:30',
    eta: '07:45',
    currentLocation: 'Av. El Inca',
    delayMinutes: 0,
    date: '10/12/2024',
    notes: '',
    schoolLocation: { lat: -0.1720, lng: -78.4820 },
  },
  '3': {
    id: '3',
    route: { id: '3', name: 'Ruta Sur - Escuela A' },
    driver: { id: '3', name: 'Carlos Ruiz', phone: '+593 99 345 6789' },
    monitor: null,
    vehicle: { id: '3', plate: 'GHI-9012', model: 'Mercedes Sprinter', currentLocation: { lat: -0.1900, lng: -78.4950 } },
    status: 'completed',
    type: 'pickup',
    progress: 100,
    students: { total: 22, onBoard: 0, delivered: 22, absent: 0 },
    stops: [
      { id: '1', order: 1, name: 'Quitumbe', reference: 'Terminal', status: 'completed', arrivedAt: '06:20', departedAt: '06:25', students: 6, studentsBoarded: 6, lat: -0.2950, lng: -78.5500 },
      { id: '2', order: 2, name: 'Av. Morán Valverde', reference: 'Estación', status: 'completed', arrivedAt: '06:35', departedAt: '06:40', students: 8, studentsBoarded: 8, lat: -0.2700, lng: -78.5350 },
      { id: '3', order: 3, name: 'El Recreo', reference: 'Centro comercial', status: 'completed', arrivedAt: '06:55', departedAt: '07:00', students: 8, studentsBoarded: 8, lat: -0.2450, lng: -78.5200 },
      { id: '4', order: 4, name: 'Escuela A', reference: 'Entrada principal', status: 'completed', arrivedAt: '07:30', departedAt: '07:35', students: 0, studentsBoarded: 0, lat: -0.1900, lng: -78.4950 },
    ],
    timeline: [
      { id: '1', time: '06:15', event: 'Viaje iniciado', type: 'info' },
      { id: '2', time: '06:20', event: 'Llegada a Quitumbe', type: 'info' },
      { id: '3', time: '06:25', event: '6 estudiantes abordaron', type: 'success' },
      { id: '4', time: '06:35', event: 'Llegada a Av. Morán Valverde', type: 'info' },
      { id: '5', time: '06:40', event: '8 estudiantes abordaron', type: 'success' },
      { id: '6', time: '06:55', event: 'Llegada a El Recreo', type: 'info' },
      { id: '7', time: '07:00', event: '8 estudiantes abordaron', type: 'success' },
      { id: '8', time: '07:30', event: 'Llegada a Escuela A', type: 'info' },
      { id: '9', time: '07:35', event: 'Viaje completado - 22 estudiantes entregados', type: 'success' },
    ],
    incidents: [],
    startTime: '06:15',
    scheduledStart: '06:15',
    eta: '07:30',
    currentLocation: 'Escuela A',
    delayMinutes: 0,
    date: '10/12/2024',
    notes: '',
    schoolLocation: { lat: -0.1900, lng: -78.4950 },
  },
};

const statusConfig: Record<string, { label: string; status: 'active' | 'inactive' | 'warning' | 'error' }> = {
  scheduled: { label: 'Programado', status: 'inactive' },
  in_progress: { label: 'En Progreso', status: 'active' },
  picking_up: { label: 'Recogiendo', status: 'active' },
  completed: { label: 'Completado', status: 'inactive' },
  delayed: { label: 'Retrasado', status: 'error' },
  cancelled: { label: 'Cancelado', status: 'error' },
};

const stopStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: 'text-gray-500', bg: 'bg-gray-200' },
  arrived: { label: 'En parada', color: 'text-blue-600', bg: 'bg-blue-500' },
  completed: { label: 'Completada', color: 'text-green-600', bg: 'bg-green-500' },
  skipped: { label: 'Omitida', color: 'text-amber-600', bg: 'bg-amber-500' },
};

const timelineTypeConfig: Record<string, { color: string; bg: string }> = {
  info: { color: 'text-blue-600', bg: 'bg-blue-100' },
  warning: { color: 'text-amber-600', bg: 'bg-amber-100' },
  success: { color: 'text-green-600', bg: 'bg-green-100' },
  error: { color: 'text-red-600', bg: 'bg-red-100' },
};

const incidentTypeConfig: Record<string, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  accident: { label: 'Accidente', color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle },
  breakdown: { label: 'Avería', color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertCircle },
  behavior: { label: 'Comportamiento', color: 'text-amber-600', bg: 'bg-amber-100', icon: Info },
  emergency: { label: 'Emergencia', color: 'text-red-700', bg: 'bg-red-200', icon: AlertTriangle },
  other: { label: 'Otro', color: 'text-gray-600', bg: 'bg-gray-100', icon: Info },
};

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Baja', color: 'text-green-600', bg: 'bg-green-100' },
  medium: { label: 'Media', color: 'text-amber-600', bg: 'bg-amber-100' },
  high: { label: 'Alta', color: 'text-orange-600', bg: 'bg-orange-100' },
  critical: { label: 'Crítica', color: 'text-red-600', bg: 'bg-red-100' },
};

const incidentStatusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Abierto', color: 'text-red-600' },
  investigating: { label: 'Investigando', color: 'text-amber-600' },
  resolved: { label: 'Resuelto', color: 'text-green-600' },
  closed: { label: 'Cerrado', color: 'text-gray-600' },
};

/**
 * Trip Detail Page
 * Real-time monitoring view for an active trip with map and incidents
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

  const trip = mockTrips[tripId];

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

  // Prepare map markers
  const mapMarkers: MarkerInfo[] = [
    // Vehicle marker
    {
      id: 'vehicle',
      position: trip.vehicle.currentLocation,
      type: 'vehicle',
      title: `${trip.vehicle.plate} - ${trip.driver.name}`,
      label: '',
    },
    // School marker
    {
      id: 'school',
      position: trip.schoolLocation,
      type: 'school',
      title: 'Escuela',
    },
    // Stop markers
    ...trip.stops.map((stop) => ({
      id: `stop-${stop.id}`,
      position: { lat: stop.lat, lng: stop.lng },
      type: 'stop' as const,
      title: `${stop.order}. ${stop.name}`,
      label: stop.order.toString(),
    })),
  ];

  // Create polyline from stops
  const routePolyline = trip.stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }));

  // Calculate map center (use vehicle location or first stop)
  const mapCenter = trip.vehicle.currentLocation;

  const handleCreateIncident = () => {
    // In a real app, this would call an API
    console.log('Creating incident:', newIncident);
    setShowIncidentModal(false);
    setNewIncident({ type: 'other', severity: 'low', title: '', description: '' });
  };

  return (
    <GoogleMapsProvider>
      <div>
        <PageHeader
          title={trip.route.name}
          subtitle={`${trip.date} • ${trip.type === 'pickup' ? 'Recogida' : 'Entrega'}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Viajes', href: '/trips' },
            { label: trip.route.name },
          ]}
          backHref="/trips"
          badge={
            <div className="flex items-center gap-2">
              <StatusBadge
                status={statusInfo.status}
                label={statusInfo.label}
              />
              {trip.delayMinutes > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  +{trip.delayMinutes} min
                </span>
              )}
            </div>
          }
          actions={[
            {
              label: 'Reportar Incidente',
              onClick: () => setShowIncidentModal(true),
              icon: AlertTriangle,
              variant: 'danger',
            },
            {
              label: 'Ver Historial',
              href: `/trips/${trip.id}/history`,
              icon: FileText,
              variant: 'secondary',
            },
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
                  <p className="text-2xl font-bold text-gray-900">{trip.students.onBoard}/{trip.students.total}</p>
                  <p className="text-sm text-gray-500">Estudiantes a Bordo</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trip.stops.filter(s => s.status === 'completed').length}/{trip.stops.length}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">{trip.eta}</p>
                  <p className="text-sm text-gray-500">Hora Estimada Llegada</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  trip.incidents.length > 0 ? 'bg-amber-100' : 'bg-gray-100'
                )}>
                  <AlertTriangle className={cn(
                    'w-6 h-6',
                    trip.incidents.length > 0 ? 'text-amber-600' : 'text-gray-400'
                  )} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{trip.incidents.length}</p>
                  <p className="text-sm text-gray-500">Incidentes</p>
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
                        autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      )} />
                      <span className="text-sm text-gray-500">
                        {autoRefresh ? 'Actualizando' : 'Pausado'}
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
              <DetailSection title="Progreso del Viaje">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progreso General</span>
                    <span className="font-medium">{trip.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        trip.status === 'delayed' ? 'bg-error' : 'bg-success'
                      )}
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stops List */}
                <div className="space-y-3">
                  {trip.stops.map((stop) => {
                    const defaultStopStatus = { label: 'Pendiente', color: 'text-gray-500', bg: 'bg-gray-400' };
                    const stopStatus = stopStatusConfig[stop.status] ?? defaultStopStatus;
                    const isActive = stop.status === 'arrived';

                    return (
                      <div
                        key={stop.id}
                        className={cn(
                          'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                          isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                        )}
                      >
                        {/* Order Number */}
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                          stopStatus.bg
                        )}>
                          {stop.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            stop.order
                          )}
                        </div>

                        {/* Stop Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{stop.name}</p>
                            {isActive && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                Actual
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{stop.reference}</p>
                        </div>

                        {/* Students */}
                        <div className="text-right text-sm">
                          <p className={cn(
                            'font-medium',
                            stop.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                          )}>
                            {stop.studentsBoarded}/{stop.students}
                          </p>
                          <p className="text-gray-400 text-xs">estudiantes</p>
                        </div>

                        {/* Times */}
                        <div className="text-right text-sm w-20">
                          {stop.arrivedAt && (
                            <p className="text-gray-600">{stop.arrivedAt}</p>
                          )}
                          {stop.departedAt && (
                            <p className="text-gray-400 text-xs">→ {stop.departedAt}</p>
                          )}
                          {!stop.arrivedAt && (
                            <p className="text-gray-400">--:--</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DetailSection>

              {/* Incidents Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Incidentes del Viaje</h3>
                  <button
                    onClick={() => setShowIncidentModal(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Reportar
                  </button>
                </div>
                {trip.incidents.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
                    <p className="text-gray-500">No hay incidentes reportados</p>
                    <p className="text-sm text-gray-400">El viaje transcurre sin novedades</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {trip.incidents.map((incident) => {
                      const typeInfo = incidentTypeConfig[incident.type] ?? incidentTypeConfig.other!;
                      const severityInfo = severityConfig[incident.severity] ?? severityConfig.low!;
                      const statusInfo = incidentStatusConfig[incident.status] ?? incidentStatusConfig.open!;
                      const TypeIcon = typeInfo.icon;

                      return (
                        <div key={incident.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn('p-2 rounded-lg', typeInfo.bg)}>
                              <TypeIcon className={cn('w-5 h-5', typeInfo.color)} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-medium text-gray-900">{incident.title}</h4>
                                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', severityInfo.bg, severityInfo.color)}>
                                  {severityInfo.label}
                                </span>
                                <span className={cn('text-xs', statusInfo.color)}>
                                  • {statusInfo.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{incident.reportedBy}</span>
                                <span>{incident.reportedAt}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Info & Timeline */}
            <div className="space-y-6">
              {/* Trip Info */}
              <DetailSection title="Información del Viaje">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ruta</p>
                    <Link href={`/routes/${trip.route.id}`} className="text-primary hover:underline font-medium">
                      {trip.route.name}
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Inicio Programado</p>
                      <p className="font-medium text-gray-900">{trip.scheduledStart}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Inicio Real</p>
                      <p className="font-medium text-gray-900">{trip.startTime}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ubicación Actual</p>
                    <div className="flex items-center gap-1 text-gray-900">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{trip.currentLocation}</span>
                    </div>
                  </div>

                  {trip.notes && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">{trip.notes}</p>
                    </div>
                  )}
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
                      <Link href={`/fleet/drivers/${trip.driver.id}`} className="font-medium text-gray-900 hover:text-primary">
                        {trip.driver.name}
                      </Link>
                    </div>
                    <a href={`tel:${trip.driver.phone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Monitor */}
                  {trip.monitor && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Monitor</p>
                        <Link href={`/fleet/monitors/${trip.monitor.id}`} className="font-medium text-gray-900 hover:text-primary">
                          {trip.monitor.name}
                        </Link>
                      </div>
                      <a href={`tel:${trip.monitor.phone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Vehicle */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Vehículo</p>
                      <Link href={`/fleet/vehicles/${trip.vehicle.id}`} className="font-medium text-gray-900 hover:text-primary">
                        {trip.vehicle.plate}
                      </Link>
                      <p className="text-xs text-gray-500">{trip.vehicle.model}</p>
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Timeline */}
              <DetailSection title="Línea de Tiempo">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {trip.timeline.slice().reverse().map((event) => {
                    const defaultTimelineType = { label: 'Info', color: 'text-gray-600', bg: 'bg-gray-100' };
                    const typeConfig = timelineTypeConfig[event.type] ?? defaultTimelineType;
                    return (
                      <div key={event.id} className="flex gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          typeConfig.bg.replace('bg-', 'bg-').replace('-100', '-500')
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{event.event}</p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                      </div>
                    );
                  })}
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
                  <a
                    href={`tel:${trip.driver.phone}`}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Llamar
                  </a>
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

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['low', 'medium', 'high', 'critical'] as const).map((sev) => {
                      const sevInfo = severityConfig[sev];
                      return (
                        <button
                          key={sev}
                          onClick={() => setNewIncident({ ...newIncident, severity: sev })}
                          className={cn(
                            'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors',
                            newIncident.severity === sev
                              ? `${sevInfo?.bg} ${sevInfo?.color} border-current`
                              : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                          )}
                        >
                          {sevInfo?.label}
                        </button>
                      );
                    })}
                  </div>
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
                  Reportar Incidente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleMapsProvider>
  );
}
