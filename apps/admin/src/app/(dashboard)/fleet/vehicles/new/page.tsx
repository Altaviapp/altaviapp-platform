'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useVehicleMutations, useDrivers, useRoutes } from '@/hooks';

/**
 * New Vehicle Page
 * Connected to real Convex data
 */
export default function NewVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real hooks
  const { createVehicle } = useVehicleMutations();
  const { drivers } = useDrivers();
  const { routes } = useRoutes();

  // Build dropdown options
  const driverOptions = drivers.map(d => ({
    value: d._id,
    label: d.user?.name || 'Sin nombre',
  }));

  const routeOptions = routes.map(r => ({
    value: r._id,
    label: r.name,
  }));

  // Form state
  const [formData, setFormData] = useState({
    licensePlate: '',
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
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createVehicle({
        licensePlate: formData.licensePlate,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year) || new Date().getFullYear(),
        color: formData.color,
        capacity: parseInt(formData.capacity) || 0,
      });
      router.push('/fleet');
    } catch (err) {
      console.error('Error creating vehicle:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el vehículo');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/fleet');
  };

  return (
    <div>
      <PageHeader
        title="Nuevo Vehículo"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Nuevo Vehículo' },
        ]}
        backHref="/fleet"
      />

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}

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
            />
            <FormField
              label="Última Revisión Técnica"
              name="lastInspection"
              type="date"
              value={formData.lastInspection}
              onChange={handleChange('lastInspection')}
            />
            <FormField
              label="Próxima Revisión Técnica"
              name="nextInspection"
              type="date"
              value={formData.nextInspection}
              onChange={handleChange('nextInspection')}
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
              { value: 'out_of_service', label: 'Fuera de servicio' },
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
              options={driverOptions}
              placeholder="Seleccionar conductor"
            />
            <FormField
              label="Ruta Asignada"
              name="routeId"
              type="select"
              value={formData.routeId}
              onChange={handleChange('routeId')}
              options={routeOptions}
              placeholder="Seleccionar ruta"
            />
          </FormFieldRow>
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
            submitLabel="Guardar Vehículo"
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
