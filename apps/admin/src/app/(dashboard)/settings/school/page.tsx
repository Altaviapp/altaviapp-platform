'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Loader2, CheckCircle, AlertCircle, Building, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInstitution, useSchoolLocationMutation } from '@/hooks';
import { GoogleMapsProvider, LocationPicker } from '@altaviapp/maps';
import type { LatLng } from '@altaviapp/maps';

/**
 * School Location Settings Page
 *
 * Allows admin to configure the school's location for route planning.
 * All routes use this location as origin (dropoff) or destination (pickup).
 */
export default function SchoolLocationPage() {
  const [location, setLocation] = useState<{
    position: LatLng | undefined;
    address: string;
  }>({
    position: undefined,
    address: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { institution, isLoading } = useInstitution();
  const { updateSchoolLocation } = useSchoolLocationMutation();

  // Load existing location
  useEffect(() => {
    if (institution) {
      if (institution.schoolLatitude && institution.schoolLongitude) {
        setLocation({
          position: {
            lat: institution.schoolLatitude,
            lng: institution.schoolLongitude,
          },
          address: institution.schoolAddress || '',
        });
      }
    }
  }, [institution]);

  const handleLocationSelect = useCallback((newLocation: { position: LatLng; address: string }) => {
    setLocation(newLocation);
    setSaveStatus('idle');
  }, []);

  const handleSave = async () => {
    if (!location.position) {
      setErrorMessage('Por favor selecciona una ubicación en el mapa');
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      await updateSchoolLocation({
        schoolLatitude: location.position.lat,
        schoolLongitude: location.position.lng,
        schoolAddress: location.address,
      });
      setSaveStatus('success');
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving location:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al guardar la ubicación');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando...</span>
      </div>
    );
  }

  const hasExistingLocation = institution?.schoolLatitude && institution?.schoolLongitude;

  return (
    <GoogleMapsProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ubicación del Colegio</h1>
            <p className="text-gray-500">Configura la ubicación para el cálculo de rutas</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-info/10 border border-info/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-info">Importante para rutas</p>
              <p className="text-sm text-gray-600 mt-1">
                Esta ubicación se usa como punto de origen para rutas de regreso (dropoff) y como
                destino para rutas de recogida (pickup). Google Maps calculará la ruta óptima
                desde/hacia esta ubicación.
              </p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {!hasExistingLocation && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Ubicación no configurada</p>
                <p className="text-sm text-gray-600 mt-1">
                  Configura la ubicación del colegio para poder crear rutas optimizadas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {saveStatus === 'success' && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <p className="text-sm font-medium text-success">Ubicación guardada correctamente</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {saveStatus === 'error' && errorMessage && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error" />
              <p className="text-sm text-error">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">
                {institution?.name || 'Tu Colegio'}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Busca la dirección del colegio o haz clic en el mapa para seleccionar la ubicación exacta.
            </p>
          </div>

          <div className="p-6">
            <LocationPicker
              initialPosition={location.position}
              initialAddress={location.address}
              onLocationSelect={handleLocationSelect}
              placeholder="Buscar dirección del colegio..."
              mapHeight="400px"
              label="Ubicación del Colegio"
              helpText="Puedes arrastrar el marcador para ajustar la posición exacta"
            />
          </div>

          {/* Current Location Display */}
          {location.position && (
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ubicación seleccionada</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {location.address || 'Dirección no disponible'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {location.position.lat.toFixed(6)}, {location.position.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !location.position}
                className={cn(
                  'px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                  location.position
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Guardado
                  </>
                ) : (
                  'Guardar Ubicación'
                )}
              </button>

              <Link
                href="/settings"
                className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Volver a Configuración
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
