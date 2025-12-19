'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudent, useStudentLocationMutation } from '@/hooks';
import { GoogleMapsProvider, LocationPicker } from '@altaviapp/maps';
import type { LatLng } from '@altaviapp/maps';
import type { Id } from '../../../../../../../../convex/_generated/dataModel';

/**
 * Student Location Page
 *
 * Allows parents to set/update their child's home location
 * for route optimization.
 */
export default function StudentLocationPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as Id<"students">;

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

  const { student, isLoading } = useStudent(studentId);
  const { updateLocation } = useStudentLocationMutation();

  // Load existing location
  useEffect(() => {
    if (student) {
      if (student.homeLatitude && student.homeLongitude) {
        setLocation({
          position: {
            lat: student.homeLatitude,
            lng: student.homeLongitude,
          },
          address: student.address || '',
        });
      }
    }
  }, [student]);

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
      await updateLocation(studentId, {
        homeLatitude: location.position.lat,
        homeLongitude: location.position.lng,
        homeAddress: location.address,
      });
      setSaveStatus('success');
      // Auto-redirect after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
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

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estudiante no encontrado</p>
        <Link href="/dashboard" className="text-primary hover:underline mt-2 inline-block">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const studentName = `${student.firstName} ${student.lastName}`;
  const hasExistingLocation = student.homeLatitude && student.homeLongitude;

  return (
    <GoogleMapsProvider>
      <div className="space-y-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Ubicación del Hogar</h1>
            <p className="text-sm text-gray-500">{studentName}</p>
          </div>
        </div>

        {/* Status Banner */}
        {!hasExistingLocation && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Ubicación no configurada</p>
                <p className="text-xs text-gray-600 mt-1">
                  La ubicación del hogar es necesaria para que tu hijo pueda ser asignado a una ruta de transporte.
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
              <div>
                <p className="text-sm font-medium text-success">Ubicación guardada correctamente</p>
                <p className="text-xs text-gray-600">Redirigiendo...</p>
              </div>
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

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Seleccionar Ubicación</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Busca la dirección de tu hogar o haz clic directamente en el mapa para seleccionar la ubicación exacta.
            Puedes arrastrar el marcador para ajustar la posición.
          </p>

          <LocationPicker
            initialPosition={location.position}
            initialAddress={location.address}
            onLocationSelect={handleLocationSelect}
            placeholder="Buscar dirección del hogar..."
            mapHeight="400px"
          />
        </div>

        {/* Save Button */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !location.position || saveStatus === 'success'}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2',
              location.position && saveStatus !== 'success'
                ? 'bg-primary text-white hover:bg-primary-600'
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
            href="/dashboard"
            className="block w-full py-3 text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
