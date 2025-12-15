'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useMonitor, useMonitorMutations, useRoutes } from '@/hooks';

/**
 * Edit Monitor Page
 * Connected to real Convex data
 */
export default function EditMonitorPage() {
  const router = useRouter();
  const params = useParams();
  const monitorId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    idNumber: '',
    phone: '',
    emergencyContact: '',
    firstAidCertified: false,
    firstAidCertExpiry: '',
    childCareCertified: false,
    isActive: true,
  });

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { monitor, isLoading, notFound } = useMonitor(monitorId as any);
  const { updateMonitor } = useMonitorMutations();
  const { routes } = useRoutes();

  // Build route options
  const routeOptions = routes.map(r => ({
    value: r._id,
    label: r.name,
  }));

  // Load monitor data into form
  useEffect(() => {
    if (monitor) {
      setFormData({
        idNumber: monitor.idNumber || '',
        phone: monitor.phone || '',
        emergencyContact: monitor.emergencyContact || '',
        firstAidCertified: monitor.firstAidCertified ?? false,
        firstAidCertExpiry: monitor.firstAidCertExpiry ? new Date(monitor.firstAidCertExpiry).toISOString().split('T')[0] ?? '' : '',
        childCareCertified: monitor.childCareCertified ?? false,
        isActive: monitor.isActive ?? true,
      });
    }
  }, [monitor]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateMonitor(monitorId as any, {
        idNumber: formData.idNumber,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        firstAidCertified: formData.firstAidCertified,
        firstAidCertExpiry: formData.firstAidCertExpiry ? new Date(formData.firstAidCertExpiry).getTime() : undefined,
        childCareCertified: formData.childCareCertified,
        isActive: formData.isActive,
      });
      router.push(`/fleet/monitors/${monitorId}`);
    } catch (error) {
      console.error('Error updating monitor:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/fleet/monitors/${monitorId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando monitor...</span>
      </div>
    );
  }

  if (notFound || !monitor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Monitor no encontrado</p>
        <Link href="/fleet?tab=monitors" className="text-primary hover:underline mt-2 inline-block">
          Volver a Monitores
        </Link>
      </div>
    );
  }

  const monitorName = monitor.user?.name || 'Sin nombre';

  return (
    <div>
      <PageHeader
        title={`Editar ${monitorName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Monitores', href: '/fleet?tab=monitors' },
          { label: monitorName, href: `/fleet/monitors/${monitorId}` },
          { label: 'Editar' },
        ]}
        backHref={`/fleet/monitors/${monitorId}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Monitor */}
        <FormSection title="Información del Monitor">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-sm text-gray-600">
              <strong>Nombre:</strong> {monitorName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {monitor.user?.email || '-'}
            </p>
          </div>

          <FormFieldRow cols={2}>
            <FormField
              label="Cédula de Identidad"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange('idNumber')}
              placeholder="10 dígitos"
              required
            />
            <FormField
              label="Teléfono"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="+593XXXXXXXXX"
              required
            />
          </FormFieldRow>

          <FormField
            label="Contacto de Emergencia"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange('emergencyContact')}
            placeholder="Nombre y teléfono"
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

        {/* Estado */}
        <FormSection title="Estado">
          <FormField
            label="Estado"
            name="isActive"
            type="select"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(val) => setFormData(prev => ({ ...prev, isActive: val === 'active' }))}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
            required
          />
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
