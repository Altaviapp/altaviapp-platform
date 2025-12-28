'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useInvitationMutations } from '@/hooks';
import { CheckCircle, Mail } from 'lucide-react';
import { PhoneInput } from '@altaviapp/ui';

/**
 * New Monitor Page - Simple invitation form
 *
 * Creates an invitation for a monitor with basic info.
 * The monitor profile is auto-created when the user accepts the invitation.
 * The monitor completes their professional info (ID, certificates) in the Crew app.
 */
export default function NewMonitorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');

  const { createInvitation } = useInvitationMutations();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.email) {
      setError('El email es obligatorio');
      setIsSubmitting(false);
      return;
    }

    try {
      await createInvitation({
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phone: formData.phone || undefined,
        role: 'monitor',
      });
      setInvitedEmail(formData.email);
      setSuccess(true);
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar la invitación');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/fleet?tab=monitors');
  };

  const handleInviteAnother = () => {
    setSuccess(false);
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    setInvitedEmail('');
  };

  // Success state
  if (success) {
    return (
      <div>
        <PageHeader
          title="Invitar Monitor"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Flota', href: '/fleet' },
            { label: 'Monitores', href: '/fleet?tab=monitors' },
            { label: 'Nuevo Monitor' },
          ]}
          backHref="/fleet?tab=monitors"
        />

        <div className="max-w-md mx-auto mt-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Invitación enviada!
            </h2>
            <p className="text-gray-600 mb-1">
              Se ha enviado un email a:
            </p>
            <p className="font-medium text-primary mb-4">
              {invitedEmail}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Cuando el monitor acepte la invitación y cree su cuenta, aparecerá automáticamente en la lista de monitores.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleInviteAnother}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Invitar otro
              </button>
              <button
                onClick={() => router.push('/fleet?tab=monitors')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ver monitores
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Invitar Monitor"
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Info banner */}
        <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm text-info">
              <p className="font-medium mb-1">¿Cómo funciona?</p>
              <ol className="list-decimal list-inside space-y-1 text-info/80">
                <li>Complete los datos básicos y envíe la invitación</li>
                <li>El monitor recibirá un email para crear su cuenta</li>
                <li>Al aceptar, aparecerá automáticamente en la lista</li>
                <li>El monitor completa su cédula y certificados en su perfil</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Datos Básicos */}
        <FormSection title="Datos del Monitor">
          <FormFieldRow cols={2}>
            <FormField
              label="Nombre"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              placeholder="Ej: María"
            />
            <FormField
              label="Apellido"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              placeholder="Ej: García"
            />
          </FormFieldRow>

          <FormFieldRow cols={2}>
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="monitor@ejemplo.com"
              hint="Se enviará la invitación a este email"
              required
            />
            <FormField
              label="Teléfono"
              name="phone"
              hint="Opcional - El monitor puede agregarlo después"
            >
              <PhoneInput
                value={formData.phone}
                onChange={handleChange('phone')}
                autoDetectCountry={true}
              />
            </FormField>
          </FormFieldRow>
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">
            El monitor completará su cédula y certificados desde la app móvil.
          </p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Enviar Invitación"
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
