'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

// Mock data
const mockRoutes = [
  { value: '1', label: 'Ruta Centro' },
  { value: '2', label: 'Ruta Norte' },
  { value: '3', label: 'Ruta Sur' },
];

const mockMonitors: Record<string, {
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  routeId: string;
  status: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
}> = {
  '1': {
    firstName: 'Laura',
    lastName: 'Sánchez',
    cedula: '1111222233',
    birthDate: '1992-03-10',
    phone: '+593991112222',
    email: 'laura.sanchez@email.com',
    address: 'Calle Los Pinos 45, Quito',
    routeId: '1',
    status: 'active',
    emergencyContactName: 'Pedro Sánchez',
    emergencyContactRelation: 'Padre',
    emergencyContactPhone: '+593983334444',
  },
};

/**
 * Edit Monitor Page
 */
export default function EditMonitorPage() {
  const router = useRouter();
  const params = useParams();
  const monitorId = params.id as string;

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

  useEffect(() => {
    const monitor = mockMonitors[monitorId];
    if (monitor) {
      setFormData(monitor);
    }
  }, [monitorId]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(`/fleet/monitors/${monitorId}`);
  };

  const handleCancel = () => {
    router.push(`/fleet/monitors/${monitorId}`);
  };

  if (!mockMonitors[monitorId]) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Monitor no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editar ${formData.firstName} ${formData.lastName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Monitores', href: '/fleet?tab=monitors' },
          { label: `${formData.firstName} ${formData.lastName}`, href: `/fleet/monitors/${monitorId}` },
          { label: 'Editar' },
        ]}
        backHref={`/fleet/monitors/${monitorId}`}
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
              required
            />
            <FormField
              label="Apellidos"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              required
            />
          </FormFieldRow>

          <FormFieldRow cols={2}>
            <FormField
              label="Cédula de Identidad"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange('cedula')}
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
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
            />
          </FormFieldRow>

          <FormField
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={handleChange('address')}
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
            />
            <FormField
              label="Relación"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={handleChange('emergencyContactRelation')}
            />
          </FormFieldRow>

          <FormField
            label="Teléfono"
            name="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={handleChange('emergencyContactPhone')}
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
