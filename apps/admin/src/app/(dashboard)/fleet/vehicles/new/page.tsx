'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

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

/**
 * New Vehicle Page
 * Based on ADMIN_WIREFRAMES.md Section 2.2
 */
export default function NewVehiclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
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
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to fleet page after save
    router.push('/fleet');
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
            isLoading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
