'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

// Mock users data
const mockUsers: Record<string, {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}> = {
  '1': {
    id: '1',
    firstName: 'Admin',
    lastName: 'Principal',
    email: 'admin@escuela-altaviapp.ec',
    phone: '+593 99 111 2222',
    role: 'admin',
    status: 'active',
  },
  '2': {
    id: '2',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@escuela-altaviapp.ec',
    phone: '+593 99 123 4567',
    role: 'driver',
    status: 'active',
  },
  '3': {
    id: '3',
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@escuela-altaviapp.ec',
    phone: '+593 97 111 2222',
    role: 'driver',
    status: 'active',
  },
  '4': {
    id: '4',
    firstName: 'Ana',
    lastName: 'Torres',
    email: 'ana.torres@escuela-altaviapp.ec',
    phone: '+593 98 765 4321',
    role: 'monitor',
    status: 'active',
  },
};

const roleOptions = [
  { value: 'admin', label: 'Administrador - Acceso completo al sistema' },
  { value: 'driver', label: 'Conductor - Gestión de viajes y check-in' },
  { value: 'monitor', label: 'Monitor - Check-in y reporte de incidentes' },
  { value: 'parent', label: 'Padre - Solo lectura de sus estudiantes' },
];

/**
 * Edit User Page
 */
export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const user = mockUsers[userId];

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
    status: user?.status || 'active',
    newPassword: '',
    confirmPassword: '',
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Usuario no encontrado</p>
      </div>
    );
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/settings/users');
  };

  const handleCancel = () => {
    router.push('/settings/users');
  };

  return (
    <div>
      <PageHeader
        title={`Editar Usuario: ${user.firstName} ${user.lastName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Configuración', href: '/settings' },
          { label: 'Usuarios', href: '/settings/users' },
          { label: `Editar ${user.firstName}` },
        ]}
        backHref="/settings/users"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <FormSection title="Información Personal">
          <FormFieldRow cols={2}>
            <FormField
              label="Nombre"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              placeholder="Ej: Juan"
              required
            />
            <FormField
              label="Apellido"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              placeholder="Ej: Pérez"
              required
            />
          </FormFieldRow>

          <FormFieldRow cols={2}>
            <FormField
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="usuario@escuela.ec"
              required
            />
            <FormField
              label="Teléfono"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="+593 99 123 4567"
              hint="Formato Ecuador: +593XXXXXXXXX"
            />
          </FormFieldRow>
        </FormSection>

        {/* Rol y Permisos */}
        <FormSection
          title="Rol y Permisos"
          description="Define el nivel de acceso del usuario al sistema"
        >
          <FormField
            label="Rol del Usuario"
            name="role"
            type="select"
            value={formData.role}
            onChange={handleChange('role')}
            options={roleOptions}
            placeholder="Seleccionar rol"
            required
          />

          {formData.role && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">Permisos del rol seleccionado:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                {formData.role === 'admin' && (
                  <>
                    <li>• Acceso completo a todas las funciones</li>
                    <li>• Gestión de usuarios y configuración</li>
                    <li>• Reportes y estadísticas completas</li>
                    <li>• Gestión de flota, rutas y estudiantes</li>
                  </>
                )}
                {formData.role === 'driver' && (
                  <>
                    <li>• Ver viajes asignados</li>
                    <li>• Iniciar y finalizar viajes</li>
                    <li>• Realizar check-in de estudiantes</li>
                    <li>• Reportar incidentes</li>
                  </>
                )}
                {formData.role === 'monitor' && (
                  <>
                    <li>• Ver viajes asignados</li>
                    <li>• Realizar check-in de estudiantes</li>
                    <li>• Reportar incidentes</li>
                    <li>• Ver lista de estudiantes del viaje</li>
                  </>
                )}
                {formData.role === 'parent' && (
                  <>
                    <li>• Ver información de sus hijos</li>
                    <li>• Ver estado de viajes en tiempo real</li>
                    <li>• Recibir notificaciones</li>
                    <li>• Ver historial de viajes</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </FormSection>

        {/* Cambiar Contraseña */}
        <FormSection
          title="Cambiar Contraseña"
          description="Deja los campos en blanco para mantener la contraseña actual"
        >
          <FormFieldRow cols={2}>
            <FormField
              label="Nueva Contraseña"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              placeholder="Mínimo 8 caracteres"
            />
            <FormField
              label="Confirmar Nueva Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Repetir contraseña"
            />
          </FormFieldRow>
        </FormSection>

        {/* Estado */}
        <FormSection title="Estado">
          <FormField
            label="Estado del Usuario"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange('status')}
            options={[
              { value: 'active', label: 'Activo - Puede acceder al sistema' },
              { value: 'inactive', label: 'Inactivo - No puede acceder al sistema' },
            ]}
            required
          />

          {formData.status === 'inactive' && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> El usuario no podrá acceder al sistema mientras esté inactivo.
                Sus datos se mantendrán pero no podrá iniciar sesión.
              </p>
            </div>
          )}
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
