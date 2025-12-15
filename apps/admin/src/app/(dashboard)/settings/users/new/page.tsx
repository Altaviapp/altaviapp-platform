'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

const roleOptions = [
  { value: 'admin', label: 'Administrador - Acceso completo al sistema' },
  { value: 'driver', label: 'Conductor - Gestión de viajes y check-in' },
  { value: 'monitor', label: 'Monitor - Check-in y reporte de incidentes' },
  { value: 'parent', label: 'Padre - Solo lectura de sus estudiantes' },
];

/**
 * New User Page
 * Create a new system user
 */
export default function NewUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
    status: 'active',
    sendWelcomeEmail: true,
  });

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
        title="Nuevo Usuario"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Configuración', href: '/settings' },
          { label: 'Usuarios', href: '/settings/users' },
          { label: 'Nuevo Usuario' },
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

        {/* Credenciales */}
        <FormSection
          title="Credenciales de Acceso"
          description="Configura la contraseña inicial del usuario"
        >
          <FormFieldRow cols={2}>
            <FormField
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="Mínimo 8 caracteres"
              required
            />
            <FormField
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Repetir contraseña"
              required
            />
          </FormFieldRow>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="sendWelcomeEmail"
              checked={formData.sendWelcomeEmail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sendWelcomeEmail: e.target.checked }))
              }
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="sendWelcomeEmail" className="text-sm text-gray-700">
              Enviar correo de bienvenida con instrucciones de acceso
            </label>
          </div>
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
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Crear Usuario"
            isLoading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
