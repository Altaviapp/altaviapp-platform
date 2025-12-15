'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

// Mock data for dropdowns
const mockRoutes = [
  { value: '1', label: 'Ruta Centro' },
  { value: '2', label: 'Ruta Norte' },
  { value: '3', label: 'Ruta Sur' },
];

/**
 * New Monitor Page
 * Monitors assist drivers with student check-ins
 */
export default function NewMonitorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cedula: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    routeId: '',
    status: 'active',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/fleet?tab=monitors');
  };

  const handleCancel = () => {
    router.push('/fleet?tab=monitors');
  };

  return (
    <div>
      <PageHeader
        title="Nuevo Monitor"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Monitores', href: '/fleet?tab=monitors' },
          { label: 'Nuevo Monitor' },
        ]}
        backHref="/fleet?tab=monitors"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <FormSection title="Información Personal">
          <FormFieldRow cols={2}>
            <FormField
              label="Nombres"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              placeholder="Nombres completos"
              required
            />
            <FormField
              label="Apellidos"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              placeholder="Apellidos completos"
              required
            />
          </FormFieldRow>

          <FormFieldRow cols={2}>
            <FormField
              label="Cédula de Identidad"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange('cedula')}
              placeholder="10 dígitos"
              hint="Ejemplo: 1234567890"
              required
            />
            <FormField
              label="Fecha de Nacimiento"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange('birthDate')}
              required
            />
          </FormFieldRow>

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
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="correo@ejemplo.com"
            />
          </FormFieldRow>

          <FormField
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={handleChange('address')}
            placeholder="Dirección completa"
          />
        </FormSection>

        {/* Asignaciones */}
        <FormSection title="Asignaciones">
          <FormFieldRow cols={2}>
            <FormField
              label="Ruta Asignada"
              name="routeId"
              type="select"
              value={formData.routeId}
              onChange={handleChange('routeId')}
              options={mockRoutes}
              placeholder="Seleccionar ruta"
            />
            <FormField
              label="Estado"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange('status')}
              options={[
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
              ]}
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Contacto de Emergencia */}
        <FormSection title="Contacto de Emergencia">
          <FormFieldRow cols={2}>
            <FormField
              label="Nombre Completo"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange('emergencyContactName')}
              placeholder="Nombre del contacto"
            />
            <FormField
              label="Relación"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={handleChange('emergencyContactRelation')}
              placeholder="Ej: Esposa, Hermano"
            />
          </FormFieldRow>

          <FormField
            label="Teléfono"
            name="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={handleChange('emergencyContactPhone')}
            placeholder="+593XXXXXXXXX"
          />
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Monitor"
            isLoading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
