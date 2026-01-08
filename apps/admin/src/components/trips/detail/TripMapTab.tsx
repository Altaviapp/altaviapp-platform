'use client';

import { useCallback, useRef } from 'react';
import { GoogleMapsProvider } from '@altaviapp/maps';
import { MapPin, Navigation, Clock, RefreshCw, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TripMapView } from './TripMapView';

interface Stop {
  _id: string;
  name: string;
  address?: string;
  order: number;
  latitude: number;
  longitude: number;
  scheduledTime?: string;
  estimatedArrivalTime?: string;
  isCompleted?: boolean;
  isNext?: boolean;
  etaMinutes?: number | null;
  etaTime?: string | null;
  delayStatus?: {
    isDelayed: boolean;
    delayMinutes: number;
    status: string;
  };
}

interface TripMapTabProps {
  stops: Stop[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
    speed?: number;
    heading?: number;
  } | null;
  optimizedPolyline?: string | null;
  vehiclePlate?: string;
  tripStatus: string;
  autoRefresh?: boolean;
  onAutoRefreshChange?: (value: boolean) => void;
  onStopClick?: (stop: Stop) => void;
  selectedStopId?: string | null;
  className?: string;
}

export function TripMapTab({
  stops,
  currentLocation,
  optimizedPolyline,
  tripStatus,
  autoRefresh = true,
  onAutoRefreshChange,
  onStopClick,
  selectedStopId,
  className,
}: TripMapTabProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleStopClick = useCallback((stop: Stop) => {
    if (onStopClick) {
      onStopClick(stop);
    }
    if (mapRef.current) {
      mapRef.current.panTo({ lat: stop.latitude, lng: stop.longitude });
      mapRef.current.setZoom(16);
    }
  }, [onStopClick]);

  const handleStopIdClick = useCallback((stopId: string) => {
    const stop = stops.find(s => s._id === stopId);
    if (stop) {
      handleStopClick(stop);
    }
  }, [stops, handleStopClick]);

  const stopsCompleted = stops.filter(s => s.isCompleted).length;

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
      {/* Map Section - Takes 2 columns */}
      <div className="lg:col-span-2">
        <GoogleMapsProvider>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mapa de Ruta</h3>
              <div className="flex items-center gap-3">
                {onAutoRefreshChange && (
                  <button
                    onClick={() => onAutoRefreshChange(!autoRefresh)}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                      autoRefresh ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <RefreshCw className={cn('w-4 h-4', autoRefresh && 'animate-spin')} />
                    {autoRefresh ? 'Auto' : 'Pausado'}
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    tripStatus === 'in_progress' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  )} />
                  <span className="text-sm text-gray-500">
                    {tripStatus === 'in_progress' ? 'En vivo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
            <TripMapView
              stops={stops}
              currentLocation={currentLocation}
              optimizedPolyline={optimizedPolyline}
              tripStatus={tripStatus}
              onStopClick={handleStopIdClick}
              selectedStopId={selectedStopId}
              style={{ height: '500px' }}
              onMapLoad={handleMapLoad}
            />
            {/* Map Legend */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-3 bg-[url('/icons/scholarbus.svg')] bg-contain bg-no-repeat bg-center" />
                <span className="text-gray-600">Vehículo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-600">Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Siguiente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">Completada</span>
              </div>
            </div>
          </div>
        </GoogleMapsProvider>
      </div>

      {/* Stops List - Side panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Paradas</h3>
            <p className="text-sm text-gray-500">{stopsCompleted}/{stops.length} completadas</p>
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-success"
                style={{ width: `${stops.length > 0 ? (stopsCompleted / stops.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Stops List - Scrollable */}
          <div className="flex-1 overflow-y-auto max-h-[450px]">
            {stops.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                No hay paradas configuradas
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stops.map((stop) => (
                  <button
                    key={stop._id}
                    onClick={() => handleStopClick(stop)}
                    className={cn(
                      'w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3',
                      selectedStopId === stop._id && 'bg-primary/5 border-l-4 border-l-primary',
                      stop.isNext && tripStatus === 'in_progress' && 'bg-blue-50/50',
                      stop.isCompleted && 'bg-green-50/30'
                    )}
                  >
                    {/* Order Number / Status Icon */}
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                      stop.isCompleted
                        ? 'bg-green-500 text-white'
                        : stop.isNext && tripStatus === 'in_progress'
                          ? 'bg-blue-500 text-white animate-pulse'
                          : selectedStopId === stop._id
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-700'
                    )}>
                      {stop.isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        stop.order
                      )}
                    </div>

                    {/* Stop Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'font-medium',
                          stop.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                        )}>
                          {stop.name}
                        </p>
                        {stop.isNext && tripStatus === 'in_progress' && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Siguiente
                          </span>
                        )}
                      </div>
                      {stop.address && (
                        <p className="text-sm text-gray-500 truncate">{stop.address}</p>
                      )}

                      {/* ETA Information */}
                      <div className="flex items-center gap-3 mt-1.5">
                        {/* Scheduled Time */}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {stop.scheduledTime || stop.estimatedArrivalTime || '--:--'}
                          </span>
                        </div>

                        {/* Dynamic ETA */}
                        {tripStatus === 'in_progress' && !stop.isCompleted && stop.etaMinutes !== null && stop.etaMinutes !== undefined && (
                          <>
                            <span className="text-gray-300">&rarr;</span>
                            <div className={cn(
                              'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
                              !stop.delayStatus || stop.delayStatus.status === 'on_time'
                                ? 'bg-green-100 text-green-700'
                                : stop.delayStatus.status === 'slight_delay'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : stop.delayStatus.status === 'delayed'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-red-100 text-red-700'
                            )}>
                              <Navigation className="w-3 h-3" />
                              <span>~{stop.etaMinutes} min</span>
                              {stop.etaTime && (
                                <span className="opacity-75">({stop.etaTime})</span>
                              )}
                            </div>
                          </>
                        )}

                        {/* Completed indicator */}
                        {stop.isCompleted && (
                          <span className="text-xs text-green-600 font-medium">
                            Completada
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      selectedStopId === stop._id ? 'text-primary' : 'text-gray-300'
                    )} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
