'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { Satellite, Smartphone, Cloud, Info } from 'lucide-react';

// Mock data for dropdowns
const mockDrivers = [
  { value: '1', label: 'Juan Pérez' },
  { value: '2', label: 'María González' },
  { value: '3', label: 'Carlos Ruiz' },
];

const mockRoutes = [
  { value: '1', label: 'Ruta Centro' },
  { value: '2', label: 'Ruta Norte' },
  { value: '3', label: 'Ruta Sur' },
];

// GPS Source type
type GPSSourceType = 'mobile' | 'device' | 'api';

// Mock vehicle data
const mockVehicles: Record<string, {
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  capacity: string;
  registrationNumber: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  lastInspection: string;
  nextInspection: string;
  status: string;
  driverId: string;
  routeId: string;
  notes: string;
  // GPS Configuration
  gpsSourceType: GPSSourceType;
  gpsDeviceId: string;
  gpsProvider: string;
  gpsFallbackToMobile: boolean;
}> = {
  '1': {
    plate: 'ABC-1234',
    brand: 'Toyota',
    model: 'Coaster',
    year: '2022',
    color: 'Blanco',
    capacity: '30',
    registrationNumber: 'REG-2022-001234',
    insurancePolicy: 'POL-123456789',
    insuranceExpiry: '2025-08-15',
    lastInspection: '2024-10-01',
    nextInspection: '2025-04-01',
    status: 'active',
    driverId: '1',
    routeId: '1',
    notes: 'Vehículo en excelente estado. Última revisión sin novedades.',
    gpsSourceType: 'device',
    gpsDeviceId: 'GPS-TOYOTA-001',
    gpsProvider: 'custom',
    gpsFallbackToMobile: true,
  },
  '2': {
    plate: 'XYZ-5678',
    brand: 'Mitsubishi',
    model: 'Rosa',
    year: '2021',
    color: 'Amarillo',
    capacity: '25',
    registrationNumber: 'REG-2021-005678',
    insurancePolicy: 'POL-987654321',
    insuranceExpiry: '2025-06-20',
    lastInspection: '2024-09-15',
    nextInspection: '2025-03-15',
    status: 'maintenance',
    driverId: '',
    routeId: '',
    notes: 'En mantenimiento: cambio de frenos programado.',
    gpsSourceType: 'mobile',
    gpsDeviceId: '',
    gpsProvider: '',
    gpsFallbackToMobile: false,
  },
};

/**
 * Edit Vehicle Page
 * Based on ADMIN_WIREFRAMES.md Section 2.2
 */
export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    capacity: '',
    registrationNumber: '',
    insurancePolicy: '',
    insuranceExpiry: '',
    lastInspection: '',
    nextInspection: '',
    status: 'active',
    driverId: '',
    routeId: '',
    notes: '',
    // GPS Configuration
    gpsSourceType: 'mobile' as GPSSourceType,
    gpsDeviceId: '',
    gpsProvider: '',
    gpsFallbackToMobile: false,
  });

  // Load vehicle data
  useEffect(() => {
    const vehicle = mockVehicles[vehicleId];
    if (vehicle) {
      setFormData(vehicle);
    }
  }, [vehicleId]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to vehicle detail after save
    router.push(`/fleet/vehicles/${vehicleId}`);
  };

  const handleCancel = () => {
    router.push(`/fleet/vehicles/${vehicleId}`);
  };

  if (!mockVehicles[vehicleId]) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehículo no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editar Vehículo ${formData.plate}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: formData.plate, href: `/fleet/vehicles/${vehicleId}` },
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
              name="plate"
              value={formData.plate}
              onChange={handleChange('plate')}
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

        {/* Documentación */}
        <FormSection title="Documentación">
          <FormFieldRow cols={2}>
            <FormField
              label="Número de Registro"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange('registrationNumber')}
              placeholder="Número de matrícula"
            />
            <FormField
              label="Póliza de Seguro"
              name="insurancePolicy"
              value={formData.insurancePolicy}
              onChange={handleChange('insurancePolicy')}
              placeholder="Número de póliza"
            />
          </FormFieldRow>

          <FormFieldRow cols={3}>
            <FormField
              label="Vencimiento Seguro"
              name="insuranceExpiry"
              type="date"
              value={formData.insuranceExpiry}
              onChange={handleChange('insuranceExpiry')}
              required
            />
            <FormField
              label="Última Revisión Técnica"
              name="lastInspection"
              type="date"
              value={formData.lastInspection}
              onChange={handleChange('lastInspection')}
              required
            />
            <FormField
              label="Próxima Revisión Técnica"
              name="nextInspection"
              type="date"
              value={formData.nextInspection}
              onChange={handleChange('nextInspection')}
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Estado y Asignación */}
        <FormSection title="Estado y Asignación">
          <FormField
            label="Estado"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange('status')}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'maintenance', label: 'En mantenimiento' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
            required
          />

          <FormFieldRow cols={2}>
            <FormField
              label="Conductor Asignado"
              name="driverId"
              type="select"
              value={formData.driverId}
              onChange={handleChange('driverId')}
              options={mockDrivers}
              placeholder="Seleccionar conductor"
            />
            <FormField
              label="Ruta Asignada"
              name="routeId"
              type="select"
              value={formData.routeId}
              onChange={handleChange('routeId')}
              options={mockRoutes}
              placeholder="Seleccionar ruta"
            />
          </FormFieldRow>
        </FormSection>

        {/* GPS Configuration */}
        <FormSection title="Configuración GPS">
          {/* GPS Source Type Selection */}
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

          {/* External GPS Configuration - Only shown for device or api */}
          {(formData.gpsSourceType === 'device' || formData.gpsSourceType === 'api') && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg text-sm text-info-dark">
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

              {/* Fallback to Mobile */}
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

          {/* Mobile GPS Info */}
          {formData.gpsSourceType === 'mobile' && (
            <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg text-sm text-success-dark">
              <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                El tracking GPS se realizará desde el celular del conductor o monitor asignado al viaje.
                No se requiere configuración adicional.
              </span>
            </div>
          )}
        </FormSection>

        {/* Notas Adicionales */}
        <FormSection title="Notas Adicionales">
          <FormField
            label="Notas"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Información adicional sobre el vehículo..."
          />
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Cambios"
            isLoading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
