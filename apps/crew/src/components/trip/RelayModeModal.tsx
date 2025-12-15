'use client';

/**
 * Relay Mode Modal (Modo Relevo)
 *
 * Allows crew members to change the vehicle mid-trip when needed
 * (breakdown, capacity issues, scheduled relay, etc.)
 */

import { useState, useEffect } from 'react';
import { X, Bus, AlertTriangle, Satellite, Smartphone, Loader2, ArrowRight, Users } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { useConvexAuth } from '@/hooks';

interface AvailableVehicle {
  id: Id<'vehicles'>;
  licensePlate: string;
  brand: string;
  model: string;
  capacity: number;
  gpsSourceType: 'mobile' | 'device' | 'api';
  hasExternalGps: boolean;
}

interface RelayModeModalProps {
  tripId: Id<'trips'>;
  currentVehiclePlate: string;
  isOpen: boolean;
  onClose: () => void;
  onRelayComplete?: (newVehicle: AvailableVehicle) => void;
}

type RelayReason = 'breakdown' | 'relay' | 'capacity' | 'other';

const REASON_OPTIONS: { value: RelayReason; label: string; icon: typeof AlertTriangle }[] = [
  { value: 'breakdown', label: 'Falla mecánica', icon: AlertTriangle },
  { value: 'relay', label: 'Relevo programado', icon: ArrowRight },
  { value: 'capacity', label: 'Capacidad insuficiente', icon: Users },
  { value: 'other', label: 'Otra razón', icon: Bus },
];

export function RelayModeModal({
  tripId,
  currentVehiclePlate,
  isOpen,
  onClose,
  onRelayComplete,
}: RelayModeModalProps) {
  const { userId } = useConvexAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<AvailableVehicle | null>(null);
  const [reason, setReason] = useState<RelayReason>('breakdown');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get available vehicles
  const availableVehicles = useQuery(
    api.trips.getAvailableVehiclesForRelay,
    userId ? { userId, tripId } : 'skip'
  );

  // Reassign mutation
  const reassignVehicle = useMutation(api.trips.reassignVehicle);

  // Get current GPS location
  useEffect(() => {
    if (isOpen && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Silently fail - location is optional
        }
      );
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVehicle(null);
      setReason('breakdown');
      setNotes('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!userId || !selectedVehicle) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await reassignVehicle({
        userId,
        tripId,
        newVehicleId: selectedVehicle.id,
        reason,
        notes: notes.trim() || undefined,
        currentLocation: currentLocation || undefined,
      });

      if (result.success) {
        onRelayComplete?.(selectedVehicle);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reasignar vehículo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Modo Relevo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Vehicle */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Vehículo actual</p>
            <p className="font-medium text-gray-900">{currentVehiclePlate}</p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón del cambio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REASON_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setReason(option.value)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border transition-colors text-left',
                    reason === option.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe la situación..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={2}
            />
          </div>

          {/* Available Vehicles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar nuevo vehículo
            </label>
            {availableVehicles === undefined ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : availableVehicles.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No hay vehículos disponibles
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableVehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left',
                      selectedVehicle?.id === vehicle.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-500">
                        {vehicle.brand} {vehicle.model} - {vehicle.capacity} pasajeros
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {vehicle.hasExternalGps ? (
                        <Satellite className="w-4 h-4 text-success" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-info" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Vehicle GPS Info */}
          {selectedVehicle && (
            <div className={cn(
              'p-3 rounded-lg text-sm',
              selectedVehicle.hasExternalGps ? 'bg-success/10 text-success-dark' : 'bg-info/10 text-info-dark'
            )}>
              <div className="flex items-center gap-2">
                {selectedVehicle.hasExternalGps ? (
                  <>
                    <Satellite className="w-4 h-4" />
                    <span>Este vehículo tiene GPS externo instalado</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Se usará el GPS de tu celular</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-error/10 rounded-lg text-sm text-error">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedVehicle || isSubmitting}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
              selectedVehicle && !isSubmitting
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              'Confirmar cambio'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
