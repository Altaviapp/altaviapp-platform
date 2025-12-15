'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

// Mock data for dropdowns
const mockVehicles = [
  { value: '1', label: 'ABC-1234 - Toyota Coaster' },
  { value: '2', label: 'XYZ-5678 - Mitsubishi Rosa' },
  { value: '3', label: 'DEF-9012 - Hino Dutro' },
];

const licenseTypes = [
  { value: 'C', label: 'Tipo C - Vehículos livianos' },
  { value: 'D', label: 'Tipo D - Transporte de pasajeros' },
  { value: 'E', label: 'Tipo E - Vehículos pesados' },
];

/**
 * New Driver Page
 * Based on ADMIN_WIREFRAMES.md Section 2.4
 */
export default function NewDriverPage() {
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
    licenseNumber: '',
    licenseType: '',
    licenseIssueDate: '',
    licenseExpiry: '',
    vehicleId: '',
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
    router.push('/fleet?tab=drivers');
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
              label="Tipo de Licencia"
              name="licenseType"
              type="select"
              value={formData.licenseType}
              onChange={handleChange('licenseType')}
              options={licenseTypes}
              placeholder="Seleccionar tipo"
              required
            />
          </FormFieldRow>

          <FormFieldRow cols={2}>
            <FormField
              label="Fecha de Emisión"
              name="licenseIssueDate"
              type="date"
              value={formData.licenseIssueDate}
              onChange={handleChange('licenseIssueDate')}
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

        {/* Asignaciones */}
        <FormSection title="Asignaciones">
          <FormFieldRow cols={2}>
            <FormField
              label="Vehículo Asignado"
              name="vehicleId"
              type="select"
              value={formData.vehicleId}
              onChange={handleChange('vehicleId')}
              options={mockVehicles}
              placeholder="Seleccionar vehículo"
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
            submitLabel="Guardar Conductor"
            isLoading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
