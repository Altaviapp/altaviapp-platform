'use client';

/**
 * Step 1: Route Planning
 *
 * Collect basic route information:
 * - Route type (pickup/dropoff)
 * - Target time (arrival for pickup, departure for dropoff)
 * - Vehicle selection
 * - Driver assignment
 * - Monitor assignment (optional)
 * - Route name (auto-generated or custom)
 */

import { useState, useEffect } from 'react';
import { Bus, Clock, Users, UserCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVehicles, useDrivers, useMonitors, useInstitution } from '@/hooks';

export interface Step1Data {
  routeType: 'pickup' | 'dropoff' | '';
  targetTime: string; // HH:mm - arrival (pickup) or departure (dropoff)
  vehicleId: string;
  driverId: string;
  monitorId: string;
  routeName: string;
  useAutoName: boolean;
}

interface Step1PlanningProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  onValidChange: (isValid: boolean) => void;
}

export function Step1Planning({ data, onChange, onValidChange }: Step1PlanningProps) {
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { monitors } = useMonitors();
  const { institution } = useInstitution();

  // Check if school location is configured
  const hasSchoolLocation = institution?.schoolLatitude && institution?.schoolLongitude;

  // Build dropdown options
  const vehicleOptions = vehicles
    .filter(v => v.isActive && v.status === 'active')
    .map(v => ({
      value: v._id,
      label: `${v.licensePlate} - ${v.brand} ${v.model}`,
      capacity: v.capacity,
    }));

  const driverOptions = drivers
    .filter(d => d.isActive)
    .map(d => ({
      value: d._id,
      label: d.user?.name || 'Sin nombre',
    }));

  const monitorOptions = monitors
    .filter(m => m.isActive)
    .map(m => ({
      value: m._id,
      label: m.user?.name || 'Sin nombre',
    }));

  // Get selected vehicle capacity
  const selectedVehicle = vehicles.find(v => v._id === data.vehicleId);
  const vehicleCapacity = selectedVehicle?.capacity || 0;

  // Auto-generate route name
  useEffect(() => {
    if (data.useAutoName && data.routeType && data.targetTime) {
      const typeLabel = data.routeType === 'pickup' ? 'Recogida' : 'Entrega';
      const timeLabel = data.targetTime.replace(':', 'h');
      const autoName = `Ruta ${typeLabel} ${timeLabel}`;
      if (data.routeName !== autoName) {
        onChange({ ...data, routeName: autoName });
      }
    }
  }, [data.useAutoName, data.routeType, data.targetTime]);

  // Validate step
  useEffect(() => {
    const isValid = !!(
      hasSchoolLocation &&
      data.routeType &&
      data.targetTime &&
      data.vehicleId &&
      data.driverId &&
      data.routeName.trim()
    );
    onValidChange(isValid);
  }, [data, hasSchoolLocation, onValidChange]);

  const handleChange = <K extends keyof Step1Data>(field: K, value: Step1Data[K]) => {
    onChange({ ...data, [field]: value });
  };

  // Warning if school location not configured
  if (!hasSchoolLocation) {
    return (
      <div className="space-y-6">
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning">Ubicación del colegio no configurada</h3>
              <p className="text-sm text-gray-600 mt-1">
                Para crear rutas optimizadas, primero debes configurar la ubicación del colegio.
                Esta ubicación se usará como punto de origen o destino para todas las rutas.
              </p>
              <a
                href="/settings/school"
                className="inline-block mt-4 px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors text-sm font-medium"
              >
                Configurar Ubicación del Colegio
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Route Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Ruta *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleChange('routeType', 'pickup')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              data.routeType === 'pickup'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                data.routeType === 'pickup' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              )}>
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <p className={cn(
                  'font-semibold',
                  data.routeType === 'pickup' ? 'text-primary' : 'text-gray-900'
                )}>
                  Recogida (Pickup)
                </p>
                <p className="text-xs text-gray-500">Estudiantes → Colegio</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('routeType', 'dropoff')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              data.routeType === 'dropoff'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                data.routeType === 'dropoff' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              )}>
                <Bus className="w-5 h-5 rotate-180" />
              </div>
              <div>
                <p className={cn(
                  'font-semibold',
                  data.routeType === 'dropoff' ? 'text-primary' : 'text-gray-900'
                )}>
                  Entrega (Dropoff)
                </p>
                <p className="text-xs text-gray-500">Colegio → Estudiantes</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Target Time */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {data.routeType === 'pickup'
              ? 'Hora de llegada al colegio *'
              : data.routeType === 'dropoff'
                ? 'Hora de salida del colegio *'
                : 'Hora objetivo *'}
          </div>
        </label>
        <input
          type="time"
          value={data.targetTime}
          onChange={(e) => handleChange('targetTime', e.target.value)}
          className="w-full md:w-48 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <p className="text-xs text-gray-500">
          {data.routeType === 'pickup'
            ? 'Los horarios de recogida se calcularán hacia atrás desde esta hora'
            : data.routeType === 'dropoff'
              ? 'Los horarios de entrega se calcularán hacia adelante desde esta hora'
              : 'Selecciona primero el tipo de ruta'}
        </p>
      </div>

      {/* Vehicle & Driver */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4" />
              Vehículo *
            </div>
          </label>
          <select
            value={data.vehicleId}
            onChange={(e) => handleChange('vehicleId', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">Seleccionar vehículo</option>
            {vehicleOptions.map(v => (
              <option key={v.value} value={v.value}>
                {v.label} ({v.capacity} pasajeros)
              </option>
            ))}
          </select>
          {vehicleCapacity > 0 && (
            <p className="text-xs text-gray-500">
              Capacidad: {vehicleCapacity} pasajeros
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Conductor *
            </div>
          </label>
          <select
            value={data.driverId}
            onChange={(e) => handleChange('driverId', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">Seleccionar conductor</option>
            {driverOptions.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Monitor (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Monitor (Opcional)
          </div>
        </label>
        <select
          value={data.monitorId}
          onChange={(e) => handleChange('monitorId', e.target.value)}
          className="w-full md:w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="">Sin monitor asignado</option>
          {monitorOptions.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Route Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Nombre de la Ruta *
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={data.useAutoName}
              onChange={(e) => handleChange('useAutoName', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Auto-generar nombre
          </label>
        </div>
        <input
          type="text"
          value={data.routeName}
          onChange={(e) => {
            handleChange('routeName', e.target.value);
            if (data.useAutoName) {
              handleChange('useAutoName', false);
            }
          }}
          placeholder="Ej: Ruta Norte AM"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </div>
  );
}
