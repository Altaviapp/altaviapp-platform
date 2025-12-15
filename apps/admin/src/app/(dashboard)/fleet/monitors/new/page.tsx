'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useMonitorMutations, useRoutes, useUsers } from '@/hooks';

/**
 * New Monitor Page
 * Connected to real Convex data
 *
 * Note: Creating a monitor requires selecting an existing user with role "monitor"
 */
export default function NewMonitorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real hooks
  const { createMonitor } = useMonitorMutations();
  const { routes } = useRoutes();
  const { users } = useUsers({ role: 'monitor' });

  // Build options
  const routeOptions = routes.map(r => ({
    value: r._id,
    label: r.name,
  }));

  // Users with monitor role who don't have a monitor profile yet
  const userOptions = users.map(u => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  }));

  const [formData, setFormData] = useState({
    userId: '',
    idNumber: '',
    phone: '',
    emergencyContact: '',
    firstAidCertified: false,
    firstAidCertExpiry: '',
    childCareCertified: false,
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
      await createMonitor(formData.userId as any, {
        idNumber: formData.idNumber,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        firstAidCertified: formData.firstAidCertified,
        firstAidCertExpiry: formData.firstAidCertExpiry ? new Date(formData.firstAidCertExpiry).getTime() : undefined,
        childCareCertified: formData.childCareCertified,
      });
      router.push('/fleet?tab=monitors');
    } catch (err) {
      console.error('Error creating monitor:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el monitor');
      setIsSubmitting(false);
    }
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
              Seleccione un usuario existente con rol de monitor para crear su perfil.
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
              label="Cédula de Identidad"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange('idNumber')}
              placeholder="10 dígitos"
              hint="Ejemplo: 1234567890"
              required
            />
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
          </FormFieldRow>

          <FormField
            label="Contacto de Emergencia"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange('emergencyContact')}
            placeholder="Nombre y teléfono del contacto"
            required
          />
        </FormSection>

        {/* Certificaciones */}
        <FormSection title="Certificaciones">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="firstAidCertified"
                checked={formData.firstAidCertified}
                onChange={(e) => setFormData(prev => ({ ...prev, firstAidCertified: e.target.checked }))}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="firstAidCertified" className="text-sm">
                <span className="font-medium text-gray-900">Certificado en Primeros Auxilios</span>
              </label>
            </div>

            {formData.firstAidCertified && (
              <FormField
                label="Fecha de Vencimiento (Primeros Auxilios)"
                name="firstAidCertExpiry"
                type="date"
                value={formData.firstAidCertExpiry}
                onChange={handleChange('firstAidCertExpiry')}
              />
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="childCareCertified"
                checked={formData.childCareCertified}
                onChange={(e) => setFormData(prev => ({ ...prev, childCareCertified: e.target.checked }))}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="childCareCertified" className="text-sm">
                <span className="font-medium text-gray-900">Certificado en Cuidado Infantil</span>
              </label>
            </div>
          </div>
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Monitor"
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
