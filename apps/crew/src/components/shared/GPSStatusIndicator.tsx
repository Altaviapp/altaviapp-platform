'use client';

import { MapPin, MapPinOff, Signal, SignalLow, SignalZero, Loader2, Satellite, Smartphone, Cloud, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GPSTrackingState, GPSPosition, GPSSourceType } from '@/hooks';

interface GPSStatusIndicatorProps {
  state: GPSTrackingState;
  position?: GPSPosition | null;
  variant?: 'compact' | 'detailed';
  className?: string;
  onActivateFallback?: () => void;
}

/**
 * GPS Status Indicator Component
 *
 * Shows the current GPS tracking status with visual feedback.
 * - compact: Small badge for headers/nav
 * - detailed: Full card with position info
 *
 * Now supports multiple GPS sources:
 * - mobile: GPS from driver's phone
 * - device: GPS from installed hardware
 * - api: GPS from external API
 */
export function GPSStatusIndicator({
  state,
  position,
  variant = 'compact',
  className,
  onActivateFallback,
}: GPSStatusIndicatorProps) {
  const {
    isTracking,
    isSupported,
    permissionStatus,
    error,
    lastUpdateTime,
    updateCount,
    gpsSource,
    isExternalGpsActive,
    fallbackActive,
  } = state;

  // Get GPS source icon and label
  const getSourceInfo = (source: GPSSourceType) => {
    switch (source) {
      case 'device':
        return { Icon: Satellite, label: 'GPS Vehículo' };
      case 'api':
        return { Icon: Cloud, label: 'GPS Externo' };
      default:
        return { Icon: Smartphone, label: 'GPS Móvil' };
    }
  };

  // Determine status and colors
  const getStatus = () => {
    if (!isSupported && gpsSource === 'mobile') {
      return { label: 'No soportado', color: 'text-gray-500', bg: 'bg-gray-100', Icon: MapPinOff };
    }
    if (permissionStatus === 'denied' && gpsSource === 'mobile') {
      return { label: 'Sin permiso', color: 'text-error', bg: 'bg-error/10', Icon: MapPinOff };
    }
    if (error) {
      return { label: 'Error GPS', color: 'text-error', bg: 'bg-error/10', Icon: SignalZero };
    }
    if (fallbackActive) {
      return { label: 'Fallback activo', color: 'text-warning', bg: 'bg-warning/10', Icon: AlertTriangle };
    }
    if (isTracking) {
      if (isExternalGpsActive) {
        return { label: 'GPS externo', color: 'text-success', bg: 'bg-success/10', Icon: Satellite };
      }
      return { label: 'Rastreando', color: 'text-success', bg: 'bg-success/10', Icon: Signal };
    }
    return { label: 'GPS listo', color: 'text-info', bg: 'bg-info/10', Icon: MapPin };
  };

  const status = getStatus();
  const Icon = status.Icon;
  const sourceInfo = getSourceInfo(gpsSource);

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdateTime) return 'Sin actualizar';
    const seconds = Math.floor((Date.now() - lastUpdateTime) / 1000);
    if (seconds < 60) return `Hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `Hace ${minutes}m`;
  };

  // Get accuracy indicator
  const getAccuracyIcon = () => {
    if (!position?.accuracy) return SignalZero;
    if (position.accuracy <= 10) return Signal;
    if (position.accuracy <= 50) return SignalLow;
    return SignalZero;
  };

  if (variant === 'compact') {
    const SourceIcon = sourceInfo.Icon;
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
          status.bg,
          status.color,
          className
        )}
      >
        {isTracking ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Icon className="w-3 h-3" />
        )}
        <span>{status.label}</span>
        {isTracking && gpsSource !== 'mobile' && (
          <SourceIcon className="w-3 h-3 ml-0.5" />
        )}
        {isTracking && updateCount > 0 && (
          <span className="text-[10px] opacity-70">({updateCount})</span>
        )}
      </div>
    );
  }

  // Detailed variant
  const AccuracyIcon = getAccuracyIcon();
  const SourceIcon = sourceInfo.Icon;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Estado GPS
        </h3>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
            status.bg,
            status.color
          )}
        >
          {isTracking ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Icon className="w-3 h-3" />
          )}
          <span>{status.label}</span>
        </div>
      </div>

      {/* GPS Source Info */}
      {isTracking && (
        <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <SourceIcon className="w-4 h-4 text-primary" />
            <span className="text-sm text-gray-700">{sourceInfo.label}</span>
          </div>
          {fallbackActive && (
            <span className="text-xs text-warning-dark bg-warning/10 px-2 py-0.5 rounded-full">
              Fallback
            </span>
          )}
        </div>
      )}

      {/* Position Details */}
      {position && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Coordenadas</span>
            <span className="font-mono text-gray-900">
              {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Precisión</span>
            <span className="flex items-center gap-1 text-gray-900">
              <AccuracyIcon className="w-3 h-3" />
              {position.accuracy.toFixed(0)}m
            </span>
          </div>
          {position.speed !== null && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Velocidad</span>
              <span className="text-gray-900">
                {(position.speed * 3.6).toFixed(1)} km/h
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tracking Stats */}
      {isTracking && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">Última actualización</span>
          <span className="text-gray-700">{formatLastUpdate()}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-2 bg-error/10 rounded-lg text-xs text-error">
          {error.message}
        </div>
      )}

      {/* External GPS Error with Fallback Option */}
      {error && isExternalGpsActive === false && gpsSource !== 'mobile' && !fallbackActive && onActivateFallback && (
        <button
          onClick={onActivateFallback}
          className="mt-2 w-full py-2 px-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Activar GPS del móvil
        </button>
      )}

      {/* Permission Warning */}
      {permissionStatus === 'prompt' && !isTracking && gpsSource === 'mobile' && (
        <div className="mt-3 p-2 bg-warning/10 rounded-lg text-xs text-warning-dark">
          Se requiere permiso de ubicación para rastrear el viaje.
        </div>
      )}
    </div>
  );
}
