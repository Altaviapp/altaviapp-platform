'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, MapPin, Clock, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LatLng {
  lat: number;
  lng: number;
}

interface StopData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  scheduledTime: string;
  geofenceRadius: number;
}

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StopData) => Promise<void>;
  initialData?: Partial<StopData>;
  existingStops?: Array<{ lat: number; lng: number; name: string }>;
  mode?: 'add' | 'edit';
}

// Default center: La Carolina, Quito
const DEFAULT_CENTER: LatLng = { lat: -0.1807, lng: -78.4678 };

export function AddStopModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingStops = [],
  mode = 'add',
}: AddStopModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Form state
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime || '07:00');
  const [geofenceRadius, setGeofenceRadius] = useState(initialData?.geofenceRadius || 100);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(
    initialData?.latitude && initialData?.longitude
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setAddress(initialData?.address || '');
      setScheduledTime(initialData?.scheduledTime || '07:00');
      setGeofenceRadius(initialData?.geofenceRadius || 100);
      setSelectedLocation(
        initialData?.latitude && initialData?.longitude
          ? { lat: initialData.latitude, lng: initialData.longitude }
          : null
      );
      setError('');
    }
  }, [isOpen, initialData]);

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setError('');

    // Try to reverse geocode to get address
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=es`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        setAddress(data.results[0].formatted_address);
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }
  }, []);

  // Handle address search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchQuery + ', Quito, Ecuador'
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=es`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setSelectedLocation({ lat, lng });
        setAddress(data.results[0].formatted_address);
      } else {
        setError('No se encontró la dirección');
      }
    } catch (err) {
      setError('Error buscando dirección');
    }
    setIsSearching(false);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!selectedLocation) {
      setError('Selecciona una ubicación en el mapa');
      return;
    }
    if (!scheduledTime) {
      setError('La hora es requerida');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave({
        name: name.trim(),
        address: address.trim() || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        scheduledTime,
        geofenceRadius,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando parada');
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'add' ? 'Agregar Parada' : 'Editar Parada'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)]">
          {/* Map Section */}
          <div className="flex-1 relative bg-gray-100">
            {/* Search bar */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar dirección..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
                </button>
              </div>
            </div>

            {/* Map placeholder - In production, use GoogleMapsProvider and InteractiveMap */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Mapa Interactivo</p>
                <p className="text-sm mb-4">
                  {selectedLocation
                    ? `Ubicación: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
                    : 'Haz clic en el mapa para seleccionar ubicación'}
                </p>
                {!selectedLocation && (
                  <button
                    onClick={() => handleMapClick(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                  >
                    Usar ubicación por defecto (La Carolina)
                  </button>
                )}
              </div>
            </div>

            {/* Selected location indicator */}
            {selectedLocation && (
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="font-medium">Ubicación seleccionada</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="w-full lg:w-80 p-6 border-t lg:border-t-0 lg:border-l overflow-y-auto">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la parada *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Centro Comercial"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dirección completa"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora programada *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Geofence Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radio de geofence (metros)
                </label>
                <input
                  type="number"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(parseInt(e.target.value) || 100)}
                  min={50}
                  max={500}
                  step={10}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Área donde se detecta llegada del vehículo
                </p>
              </div>

              {/* Coordinates display */}
              {selectedLocation && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Coordenadas
                  </label>
                  <p className="text-sm font-mono text-gray-700">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-error/10 text-error text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Existing stops info */}
              {existingStops.length > 0 && (
                <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg">
                  <p className="font-medium">Paradas existentes: {existingStops.length}</p>
                  <p className="text-xs mt-1">
                    Las paradas existentes se muestran en el mapa
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedLocation}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-colors',
              'bg-primary text-white hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                {mode === 'add' ? 'Agregar Parada' : 'Guardar Cambios'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
