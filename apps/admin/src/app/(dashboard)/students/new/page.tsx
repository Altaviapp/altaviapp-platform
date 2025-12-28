'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useStudentMutations, useInstitutionGrades, useParentEmailCheck } from '@/hooks';
import {
  Users,
  Mail,
  CheckCircle,
  Home,
  Loader2,
  UserPlus,
} from 'lucide-react';

/**
 * New Student Page
 * Connected to real Convex data with household detection and invitation support
 */
export default function NewStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendInvitation, setSendInvitation] = useState(true);
  const [debouncedEmail, setDebouncedEmail] = useState('');

  const { createStudentWithInvitation } = useStudentMutations();
  const { grades: institutionGrades } = useInstitutionGrades();

  // Debounced email check
  const { status: emailStatus, isChecking } = useParentEmailCheck(debouncedEmail);

  // Convert grades array to select options
  const gradeOptions = useMemo(
    () => institutionGrades.map((g) => ({ value: g, label: g })),
    [institutionGrades]
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
  });

  // Debounce email input for API check
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(formData.parentEmail);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.parentEmail]);

  // Auto-fill parent data if household exists
  useEffect(() => {
    if (emailStatus?.hasExistingHousehold && emailStatus.existingParentName) {
      // Only auto-fill if fields are empty
      setFormData((prev) => ({
        ...prev,
        parentName: prev.parentName || emailStatus.existingParentName || '',
        parentPhone: prev.parentPhone || emailStatus.existingParentPhone || '',
      }));
    }
  }, [emailStatus]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createStudentWithInvitation({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth).getTime(),
        grade: formData.grade,
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        emergencyContact: formData.emergencyContact,
        sendInvitation: sendInvitation && (emailStatus?.needsInvitation ?? false),
      });

      // Show success message based on result
      if (result.invitationSent) {
        // Could show a toast here
        console.log('Invitación enviada a', formData.parentEmail);
      }

      router.push('/students');
    } catch (err) {
      console.error('Error creating student:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el estudiante');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/students');
  };

  // Calculate what to show for email status
  const showHouseholdInfo = emailStatus?.valid && emailStatus.hasExistingHousehold;
  const showUserExists = emailStatus?.valid && emailStatus.userExists && !emailStatus.hasExistingHousehold;
  const showInvitationPending = emailStatus?.valid && emailStatus.invitationPending && !emailStatus.userExists;
  const showNeedsInvitation = emailStatus?.valid && emailStatus.needsInvitation;

  return (
    <div>
      <PageHeader
        title="Nuevo Estudiante"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estudiantes', href: '/students' },
          { label: 'Nuevo Estudiante' },
        ]}
        backHref="/students"
      />

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}

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
              label="Fecha de Nacimiento"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange('dateOfBirth')}
              required
            />
            <FormField
              label="Grado"
              name="grade"
              type="select"
              value={formData.grade}
              onChange={handleChange('grade')}
              options={gradeOptions}
              placeholder="Seleccionar grado"
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Información de Contacto */}
        <FormSection title="Información de Contacto">
          <FormField
            label="Dirección de Residencia"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={handleChange('address')}
            placeholder="Dirección completa del domicilio"
          />

          <FormField
            label="Contacto de Emergencia"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange('emergencyContact')}
            placeholder="Nombre y teléfono del contacto"
            required
          />
        </FormSection>

        {/* Padre/Tutor */}
        <FormSection
          title="Padre/Tutor"
          description="Información del padre o tutor principal"
        >
          {/* Email field with status indicator */}
          <div className="space-y-2">
            <FormField
              label="Email"
              name="parentEmail"
              type="email"
              value={formData.parentEmail}
              onChange={handleChange('parentEmail')}
              placeholder="correo@ejemplo.com"
              required
            />

            {/* Loading indicator while checking */}
            {isChecking && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando email...</span>
              </div>
            )}

            {/* Household detected */}
            {showHouseholdInfo && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary">Hogar existente detectado</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Este padre ya tiene {emailStatus.householdSize} estudiante
                      {emailStatus.householdSize !== 1 ? 's' : ''} registrado
                      {emailStatus.householdSize !== 1 ? 's' : ''}:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {emailStatus.householdStudents?.map((student) => (
                        <span
                          key={student.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-sm border border-gray-200"
                        >
                          <Users className="w-3 h-3 text-gray-400" />
                          {student.firstName} {student.lastName}
                          <span className="text-gray-400">({student.grade})</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-primary/80 mt-2">
                      El nuevo estudiante se agregará a este hogar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* User exists (no students yet in this institution) */}
            {showUserExists && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm text-success">
                    Este padre ya tiene cuenta registrada
                  </span>
                </div>
              </div>
            )}

            {/* Invitation pending */}
            {showInvitationPending && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Ya existe una invitación pendiente para este email
                  </span>
                </div>
              </div>
            )}
          </div>

          <FormField
            label="Nombre Completo"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange('parentName')}
            placeholder="Nombre del padre/tutor"
            required
          />

          <FormFieldRow cols={2}>
            <FormField
              label="Teléfono"
              name="parentPhone"
              type="tel"
              value={formData.parentPhone}
              onChange={handleChange('parentPhone')}
              placeholder="+593XXXXXXXXX"
              hint="WhatsApp para notificaciones"
              required
            />
            <div /> {/* Spacer for alignment */}
          </FormFieldRow>

          {/* Send invitation toggle - only show if needs invitation */}
          {showNeedsInvitation && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-900">
                      Enviar invitación al padre
                    </p>
                    <p className="text-sm text-yellow-700">
                      El padre recibirá un email para crear su cuenta
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendInvitation}
                    onChange={(e) => setSendInvitation(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">* Campos obligatorios</p>
            {showHouseholdInfo && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Home className="w-4 h-4" />
                <span>Se agregará al hogar existente</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <FormActions
              onCancel={handleCancel}
              submitLabel={
                isSubmitting
                  ? 'Guardando...'
                  : showHouseholdInfo
                  ? 'Agregar al Hogar'
                  : sendInvitation && showNeedsInvitation
                  ? 'Guardar y Enviar Invitación'
                  : 'Guardar Estudiante'
              }
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
