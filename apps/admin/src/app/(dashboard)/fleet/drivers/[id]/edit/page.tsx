'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

// Mock data
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

const mockDrivers: Record<string, {
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  licenseNumber: string;
  licenseType: string;
  licenseIssueDate: string;
  licenseExpiry: string;
  vehicleId: string;
  status: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
}> = {
  '1': {
    firstName: 'Juan',
    lastName: 'Pérez',
    cedula: '1234567890',
    birthDate: '1985-05-15',
    phone: '+593991234567',
    email: 'juan.perez@email.com',
    address: 'Av. Principal 123, Quito',
    licenseNumber: 'LIC-2020-12345',
    licenseType: 'D',
    licenseIssueDate: '2020-03-01',
    licenseExpiry: '2026-08-15',
    vehicleId: '1',
    status: 'active',
    emergencyContactName: 'María López',
    emergencyContactRelation: 'Esposa',
    emergencyContactPhone: '+593987654321',
  },
};

/**
 * Edit Driver Page
 */
export default function EditDriverPage() {
  const router = useRouter();
  const params = useParams();
  const driverId = params.id as string;

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

  useEffect(() => {
    const driver = mockDrivers[driverId];
    if (driver) {
      setFormData(driver);
    }
  }, [driverId]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(`/fleet/drivers/${driverId}`);
  };

  const handleCancel = () => {
    router.push(`/fleet/drivers/${driverId}`);
  };

  if (!mockDrivers[driverId]) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Conductor no encontrado</p>
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
          { label: 'Conductores', href: '/fleet?tab=drivers' },
          { label: `${formData.firstName} ${formData.lastName}`, href: `/fleet/drivers/${driverId}` },
          { label: 'Editar' },
        ]}
        backHref={`/fleet/drivers/${driverId}`}
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

        {/* Licencia de Conducir */}
        <FormSection title="Licencia de Conducir">
          <FormFieldRow cols={2}>
            <FormField
              label="Número de Licencia"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange('licenseNumber')}
              required
            />
            <FormField
              label="Tipo de Licencia"
              name="licenseType"
              type="select"
              value={formData.licenseType}
              onChange={handleChange('licenseType')}
              options={licenseTypes}
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
