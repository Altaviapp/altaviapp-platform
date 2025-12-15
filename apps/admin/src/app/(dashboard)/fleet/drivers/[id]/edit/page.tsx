'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useDriver, useDriverMutations, useVehicles } from '@/hooks';

const licenseTypes = [
  { value: 'C', label: 'Tipo C - Vehículos livianos' },
  { value: 'D', label: 'Tipo D - Transporte de pasajeros' },
  { value: 'E', label: 'Tipo E - Vehículos pesados' },
];

/**
 * Edit Driver Page
 * Connected to real Convex data
 */
export default function EditDriverPage() {
  const router = useRouter();
  const params = useParams();
  const driverId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseExpiry: '',
    phone: '',
    emergencyContact: '',
    isActive: true,
  });

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { driver, isLoading, notFound } = useDriver(driverId as any);
  const { updateDriver } = useDriverMutations();
  const { vehicles } = useVehicles();

  // Build vehicle options
  const vehicleOptions = vehicles.map(v => ({
    value: v._id,
    label: `${v.licensePlate} - ${v.brand} ${v.model}`,
  }));

  // Load driver data into form
  useEffect(() => {
    if (driver) {
      setFormData({
        licenseNumber: driver.licenseNumber || '',
        licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] ?? '' : '',
        phone: driver.phone || '',
        emergencyContact: driver.emergencyContact || '',
        isActive: driver.isActive ?? true,
      });
    }
  }, [driver]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDriver(driverId as any, {
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry ? new Date(formData.licenseExpiry).getTime() : undefined,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        isActive: formData.isActive,
      });
      router.push(`/fleet/drivers/${driverId}`);
    } catch (error) {
      console.error('Error updating driver:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/fleet/drivers/${driverId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando conductor...</span>
      </div>
    );
  }

  if (notFound || !driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Conductor no encontrado</p>
        <Link href="/fleet?tab=drivers" className="text-primary hover:underline mt-2 inline-block">
          Volver a Conductores
        </Link>
      </div>
    );
  }

  const driverName = driver.user?.name || 'Sin nombre';

  return (
    <div>
      <PageHeader
        title={`Editar ${driverName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Conductores', href: '/fleet?tab=drivers' },
          { label: driverName, href: `/fleet/drivers/${driverId}` },
          { label: 'Editar' },
        ]}
        backHref={`/fleet/drivers/${driverId}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Conductor */}
        <FormSection title="Información del Conductor">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-sm text-gray-600">
              <strong>Nombre:</strong> {driverName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {driver.user?.email || '-'}
            </p>
          </div>

          <FormFieldRow cols={2}>
            <FormField
              label="Teléfono"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="+593XXXXXXXXX"
              required
            />
            <FormField
              label="Contacto de Emergencia"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange('emergencyContact')}
              placeholder="Nombre y teléfono"
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Licencia de Conducir */}
        <FormSection title="Licencia de Conducir">
          <FormFieldRow cols={2}>
            <FormField
              label="Número de Licencia"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange('licenseNumber')}
              placeholder="Número de licencia"
              required
            />
            <FormField
              label="Fecha de Vencimiento"
              name="licenseExpiry"
              type="date"
              value={formData.licenseExpiry}
              onChange={handleChange('licenseExpiry')}
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Estado */}
        <FormSection title="Estado">
          <FormField
            label="Estado"
            name="isActive"
            type="select"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(val) => setFormData(prev => ({ ...prev, isActive: val === 'active' }))}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
            required
          />
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
