'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { Satellite, Smartphone, Cloud, Info, Loader2 } from 'lucide-react';
import { useVehicle, useVehicleMutations } from '@/hooks';

type GPSSourceType = 'mobile' | 'device' | 'api';

/**
 * Edit Vehicle Page
 * Connected to real Convex data
 */
export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    capacity: '',
    status: 'active',
    gpsSourceType: 'mobile' as GPSSourceType,
    gpsDeviceId: '',
    gpsProvider: '',
    gpsFallbackToMobile: false,
  });

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { vehicle, isLoading, notFound } = useVehicle(vehicleId as any);
  const { updateVehicle } = useVehicleMutations();

  // Load vehicle data into form
  useEffect(() => {
    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: String(vehicle.year || ''),
        color: vehicle.color || '',
        capacity: String(vehicle.capacity || ''),
        status: vehicle.status || 'active',
        gpsSourceType: (vehicle.gpsSourceType as GPSSourceType) || 'mobile',
        gpsDeviceId: vehicle.gpsDeviceConfig?.deviceId || '',
        gpsProvider: vehicle.gpsDeviceConfig?.provider || '',
        gpsFallbackToMobile: vehicle.gpsDeviceConfig?.fallbackToMobile || false,
      });
    }
  }, [vehicle]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateVehicle(vehicleId as any, {
        licensePlate: formData.licensePlate,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year) || 0,
        color: formData.color,
        capacity: parseInt(formData.capacity) || 0,
        status: formData.status as "active" | "maintenance" | "out_of_service",
      });
      router.push(`/fleet/vehicles/${vehicleId}`);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/fleet/vehicles/${vehicleId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando vehículo...</span>
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehículo no encontrado</p>
        <Link href="/fleet" className="text-primary hover:underline mt-2 inline-block">
          Volver a Flota
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editar Vehículo ${formData.licensePlate}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: formData.licensePlate, href: `/fleet/vehicles/${vehicleId}` },
          { label: 'Editar' },
        ]}
        backHref={`/fleet/vehicles/${vehicleId}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <FormSection title="Información Básica">
          <FormFieldRow cols={2}>
            <FormField
              label="Placa"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange('licensePlate')}
              placeholder="Ej: ABC-1234"
              required
            />
            <FormField
              label="Marca"
              name="brand"
              value={formData.brand}
              onChange={handleChange('brand')}
              placeholder="Ej: Toyota"
              required
            />
          </FormFieldRow>

          <FormFieldRow cols={2}>
            <FormField
              label="Modelo"
              name="model"
              value={formData.model}
              onChange={handleChange('model')}
              placeholder="Ej: Coaster"
              required
            />
            <FormField
              label="Año"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange('year')}
              placeholder="Ej: 2023"
              required
            />
          </FormFieldRow>

          <FormFieldRow cols={2}>
            <FormField
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleChange('color')}
              placeholder="Ej: Blanco"
            />
            <FormField
              label="Capacidad de Pasajeros"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange('capacity')}
              placeholder="Ej: 30"
              hint="Número de estudiantes"
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Estado */}
        <FormSection title="Estado">
          <FormField
            label="Estado"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange('status')}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'maintenance', label: 'En mantenimiento' },
              { value: 'out_of_service', label: 'Fuera de servicio' },
            ]}
            required
          />
        </FormSection>

        {/* GPS Configuration */}
        <FormSection title="Configuración GPS">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuente de GPS
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gpsSourceType: 'mobile' }))}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  formData.gpsSourceType === 'mobile'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">GPS Móvil</span>
                <span className="text-xs text-gray-500 mt-1">Celular del conductor</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gpsSourceType: 'device' }))}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  formData.gpsSourceType === 'device'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Satellite className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">GPS Dispositivo</span>
                <span className="text-xs text-gray-500 mt-1">Instalado en el bus</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gpsSourceType: 'api' }))}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  formData.gpsSourceType === 'api'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Cloud className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">GPS API</span>
                <span className="text-xs text-gray-500 mt-1">Servicio externo</span>
              </button>
            </div>
          </div>

          {(formData.gpsSourceType === 'device' || formData.gpsSourceType === 'api') && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg text-sm text-info">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Configure los datos del dispositivo GPS externo. El ID del dispositivo será usado
                  para identificar este vehículo cuando envíe datos GPS.
                </span>
              </div>

              <FormFieldRow cols={2}>
                <FormField
                  label="ID del Dispositivo"
                  name="gpsDeviceId"
                  value={formData.gpsDeviceId}
                  onChange={handleChange('gpsDeviceId')}
                  placeholder="Ej: GPS-001 o IMEI del dispositivo"
                  hint="Identificador único del dispositivo GPS"
                  required
                />
                <FormField
                  label="Proveedor"
                  name="gpsProvider"
                  type="select"
                  value={formData.gpsProvider}
                  onChange={handleChange('gpsProvider')}
                  options={[
                    { value: 'custom', label: 'Personalizado / Genérico' },
                    { value: 'samsara', label: 'Samsara' },
                    { value: 'garmin', label: 'Garmin Fleet' },
                    { value: 'geotab', label: 'Geotab' },
                    { value: 'other', label: 'Otro' },
                  ]}
                  placeholder="Seleccionar proveedor"
                />
              </FormFieldRow>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="gpsFallbackToMobile"
                  checked={formData.gpsFallbackToMobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, gpsFallbackToMobile: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="gpsFallbackToMobile" className="text-sm">
                  <span className="font-medium text-gray-900">Fallback a GPS móvil</span>
                  <p className="text-gray-500 mt-0.5">
                    Si el dispositivo GPS no responde después de 2 minutos, usar el GPS del celular del conductor automáticamente
                  </p>
                </label>
              </div>
            </div>
          )}

          {formData.gpsSourceType === 'mobile' && (
            <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg text-sm text-success">
              <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                El tracking GPS se realizará desde el celular del conductor o monitor asignado al viaje.
                No se requiere configuración adicional.
              </span>
            </div>
          )}
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Cambios"
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
