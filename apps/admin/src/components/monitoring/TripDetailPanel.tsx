'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Bus,
  User,
  MapPin,
  Clock,
  Users,
  Bell,
  CheckCircle2,
  Circle,
  AlertCircle,
  UserPlus,
  UserMinus,
  Navigation,
  Play,
  WifiOff,
  Wifi,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Badge, LoadingState } from '@/components/core';
import { Tabs, TabsList, Tab, TabsPanel } from '@/components/core/Tabs';
import { ROUTE_TYPE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { MonitoringStop, TimelineEvent, TripNovedad } from '@/hooks';

interface TripDetailPanelProps {
  trip: {
    id: string;
    status: string;
    startTime?: number;
    scheduledDate: string;
  } | null;
  route: {
    id: string;
    name: string;
    type: 'pickup' | 'dropoff';
    scheduledStartTime: string;
  } | null;
  vehicle: {
    id: string;
    licensePlate: string;
  } | null;
  driver: {
    id: string;
    name: string;
  } | null;
  monitor: {
    id: string;
    name: string;
  } | null;
  stops: MonitoringStop[];
  stats: {
    totalStudents: number;
    checkedIn: number;
    expectedToBoard: number;
    completedStops: number;
    totalStops: number;
  } | null;
  timeline: TimelineEvent[];
  novedades: TripNovedad[];
  pendingNovedadesCount: number;
  isLoading: boolean;
  onBack: () => void;
}

export function TripDetailPanel({
  trip,
  route,
  vehicle,
  driver,
  monitor,
  stops,
  stats,
  timeline,
  novedades,
  pendingNovedadesCount,
  isLoading,
  onBack,
}: TripDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('info');

  if (isLoading) {
    return <LoadingState message="Cargando detalles del viaje..." size="sm" />;
  }

  if (!trip || !route) {
    return (
      <div className="p-4 text-center text-gray-500">
        No se encontró el viaje
      </div>
    );
  }

  const routeTypeConfig = ROUTE_TYPE_CONFIG[route.type];

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a lista
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10">
            <Bus className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{route.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Badge variant="info" dot size="sm">
                En curso
              </Badge>
              <Badge variant="default" size="sm">
                {routeTypeConfig?.label || route.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-semibold text-gray-900">
                {stats.checkedIn}/{stats.expectedToBoard}
              </div>
              <div className="text-xs text-gray-500">Estudiantes</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-semibold text-gray-900">
                {stats.completedStops}/{stats.totalStops}
              </div>
              <div className="text-xs text-gray-500">Paradas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-semibold text-gray-900">
                {pendingNovedadesCount}
              </div>
              <div className="text-xs text-gray-500">Pendientes</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="px-4 pt-2">
          <Tab value="info">Info</Tab>
          <Tab value="novedades">
            Novedades
            {pendingNovedadesCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                {pendingNovedadesCount}
              </span>
            )}
          </Tab>
          <Tab value="timeline">Historial</Tab>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsPanel value="info" className="p-4 mt-0">
            <InfoTab
              vehicle={vehicle}
              driver={driver}
              monitor={monitor}
              route={route}
              stops={stops}
            />
          </TabsPanel>

          <TabsPanel value="novedades" className="p-4 mt-0">
            <NovedadesTab novedades={novedades} />
          </TabsPanel>

          <TabsPanel value="timeline" className="p-4 mt-0">
            <TimelineTab events={timeline} />
          </TabsPanel>
        </div>
      </Tabs>
    </div>
  );
}

// Info Tab
function InfoTab({
  vehicle,
  driver,
  monitor,
  route,
  stops,
}: {
  vehicle: TripDetailPanelProps['vehicle'];
  driver: TripDetailPanelProps['driver'];
  monitor: TripDetailPanelProps['monitor'];
  route: TripDetailPanelProps['route'];
  stops: MonitoringStop[];
}) {
  return (
    <div className="space-y-6">
      {/* Crew info */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Tripulación</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <Bus className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {vehicle?.licensePlate || 'Sin vehículo'}
              </p>
              <p className="text-xs text-gray-500">Vehículo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {driver?.name || 'Sin conductor'}
              </p>
              <p className="text-xs text-gray-500">Conductor</p>
            </div>
          </div>
          {monitor && (
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{monitor.name}</p>
                <p className="text-xs text-gray-500">Monitor</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stops */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Paradas ({stops.length})
        </h4>
        <div className="space-y-1">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={cn(
                'flex items-start gap-3 p-2 rounded-lg',
                stop.status === 'current' && 'bg-primary/10 border border-primary/20',
                stop.status === 'completed' && 'bg-green-50',
                stop.status === 'pending' && 'bg-gray-50'
              )}
            >
              <div className="flex flex-col items-center">
                {stop.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : stop.status === 'current' ? (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {index + 1}
                    </span>
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                {index < stops.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 h-8 mt-1',
                      stop.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {stop.name}
                  </p>
                  {stop.etaTime && stop.status !== 'completed' && (
                    <span className="text-xs text-gray-500">
                      ETA {stop.etaTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {stop.scheduledTime || 'Sin hora'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stop.studentsCheckedIn}/{stop.studentsExpected}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Novedades Tab
function NovedadesTab({ novedades }: { novedades: TripNovedad[] }) {
  if (novedades.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No hay novedades para este viaje</p>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
      case 'acknowledged':
      case 'applied':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-3">
      {novedades.map((novedad) => (
        <div
          key={novedad.id}
          className={cn(
            'p-3 rounded-lg border',
            novedad.status === 'pending'
              ? 'border-amber-200 bg-amber-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell
                className={cn(
                  'w-4 h-4',
                  novedad.status === 'pending'
                    ? 'text-amber-600'
                    : 'text-gray-400'
                )}
              />
              <span className="font-medium text-gray-900">
                {novedad.studentName}
              </span>
            </div>
            <Badge
              variant={getStatusVariant(novedad.status) as any}
              size="sm"
            >
              {novedad.statusLabel}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">{novedad.typeLabel}</p>
          {novedad.reason && (
            <p className="text-xs text-gray-500">{novedad.reason}</p>
          )}
          {novedad.tripStudentStatus === 'stop_changed' && novedad.originalStopName && (
            <p className="text-xs text-gray-500 mt-1">
              <span className="line-through">{novedad.originalStopName}</span>
              {' → '}
              <span className="font-medium">{novedad.stopName}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Timeline Tab
function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No hay eventos registrados</p>
      </div>
    );
  }

  const getEventIcon = (type: string, icon: string) => {
    const iconMap: Record<string, any> = {
      play: Play,
      'check-circle': CheckCircle2,
      'x-circle': AlertCircle,
      'map-pin': MapPin,
      navigation: Navigation,
      'user-plus': UserPlus,
      'user-minus': UserMinus,
      'wifi-off': WifiOff,
      wifi: Wifi,
      'log-in': LogIn,
      'log-out': LogOut,
      bell: Bell,
      check: CheckCircle2,
      x: AlertCircle,
    };

    const IconComponent = iconMap[icon] || Circle;
    return IconComponent;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-1">
      {events.map((event, index) => {
        const Icon = getEventIcon(event.type, event.icon);

        return (
          <div key={event.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-6 bg-gray-200 mt-1" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {event.title}
                </p>
                <span className="text-xs text-gray-500">
                  {formatTime(event.timestamp)}
                </span>
              </div>
              {event.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {event.description}
                </p>
              )}
              {event.studentName && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {event.studentName}
                  {event.stopName && ` en ${event.stopName}`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
