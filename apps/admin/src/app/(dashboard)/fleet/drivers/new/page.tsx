'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useDriverMutations, useVehicles, useUsers } from '@/hooks';

const licenseTypes = [
  { value: 'C', label: 'Tipo C - Vehículos livianos' },
  { value: 'D', label: 'Tipo D - Transporte de pasajeros' },
  { value: 'E', label: 'Tipo E - Vehículos pesados' },
];

/**
 * New Driver Page
 * Connected to real Convex data
 *
 * Note: Creating a driver requires selecting an existing user with role "driver"
 */
export default function NewDriverPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real hooks
  const { createDriver } = useDriverMutations();
  const { vehicles } = useVehicles();
  const { users } = useUsers({ role: 'driver' });

  // Build options
  const vehicleOptions = vehicles.map(v => ({
    value: v._id,
    label: `${v.licensePlate} - ${v.brand} ${v.model}`,
  }));

  // Users with driver role who don't have a driver profile yet
  const userOptions = users.map(u => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  }));

  const [formData, setFormData] = useState({
    userId: '',
    licenseNumber: '',
    licenseExpiry: '',
    phone: '',
    emergencyContact: '',
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.userId) {
      setError('Debe seleccionar un usuario');
      setIsSubmitting(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createDriver(formData.userId as any, {
        licenseNumber: formData.licenseNumber,
        licenseExpiry: new Date(formData.licenseExpiry).getTime(),
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
      });
      router.push('/fleet?tab=drivers');
    } catch (err) {
      console.error('Error creating driver:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el conductor');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/fleet?tab=drivers');
  };

  return (
    <div>
      <PageHeader
        title="Nuevo Conductor"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Conductores', href: '/fleet?tab=drivers' },
          { label: 'Nuevo Conductor' },
        ]}
        backHref="/fleet?tab=drivers"
      />

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Usuario */}
        <FormSection title="Usuario">
          <div className="p-4 bg-info/10 rounded-lg mb-4">
            <p className="text-sm text-info">
              Seleccione un usuario existente con rol de conductor para crear su perfil de conductor.
              El usuario debe haber sido creado previamente en la sección de Usuarios.
            </p>
          </div>
          <FormField
            label="Usuario"
            name="userId"
            type="select"
            value={formData.userId}
            onChange={handleChange('userId')}
            options={userOptions}
            placeholder="Seleccionar usuario"
            required
          />
        </FormSection>

        {/* Información de Contacto */}
        <FormSection title="Información de Contacto">
          <FormFieldRow cols={2}>
            <FormField
              label="Teléfono"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="+593XXXXXXXXX"
              hint="Formato: +593XXXXXXXXX"
              required
            />
            <FormField
              label="Contacto de Emergencia"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange('emergencyContact')}
              placeholder="Nombre y teléfono del contacto"
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

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Conductor"
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
