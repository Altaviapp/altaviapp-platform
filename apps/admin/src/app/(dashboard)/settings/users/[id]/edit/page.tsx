'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useUser, useUserMutations } from '@/hooks';
import type { UserRole } from '@/hooks';

const roleOptions = [
  { value: 'admin', label: 'Administrador - Acceso completo al sistema' },
  { value: 'driver', label: 'Conductor - Gestión de viajes y check-in' },
  { value: 'monitor', label: 'Monitor - Check-in y reporte de incidentes' },
  { value: 'parent', label: 'Padre - Solo lectura de sus estudiantes' },
];

/**
 * Edit User Page
 * Connected to real Convex data
 */
export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, isLoading, notFound } = useUser(userId as any);
  const { updateUser } = useUserMutations();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '' as UserRole | '',
    isActive: true,
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        role: user.role || '',
        isActive: user.isActive !== false,
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando usuario...</span>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Usuario no encontrado</p>
        <Link href="/settings/users" className="text-primary hover:underline mt-2 inline-block">
          Volver a Usuarios
        </Link>
      </div>
    );
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateUser(userId as any, {
        name: formData.name,
        phone: formData.phone || undefined,
        role: formData.role as UserRole,
        isActive: formData.isActive,
      });
      router.push('/settings/users');
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el usuario');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/settings/users');
  };

  return (
    <div>
      <PageHeader
        title={`Editar Usuario: ${user.name || user.email}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Configuración', href: '/settings' },
          { label: 'Usuarios', href: '/settings/users' },
          { label: `Editar ${user.name || 'Usuario'}` },
        ]}
        backHref="/settings/users"
      />

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <FormSection title="Información Personal">
          <FormField
            label="Nombre Completo"
            name="name"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Ej: Juan Pérez"
            required
          />

          <FormFieldRow cols={2}>
            <FormField
              label="Correo Electrónico"
              name="email"
              type="email"
              value={user.email}
              onChange={() => {}}
              disabled
              hint="El correo no puede ser modificado"
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

        {/* Estado */}
        <FormSection title="Estado">
          <FormField
            label="Estado del Usuario"
            name="isActive"
            type="select"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(value) => setFormData((prev) => ({ ...prev, isActive: value === 'active' }))}
            options={[
              { value: 'active', label: 'Activo - Puede acceder al sistema' },
              { value: 'inactive', label: 'Inactivo - No puede acceder al sistema' },
            ]}
            required
          />

          {!formData.isActive && (
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
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
