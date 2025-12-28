'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useStudentMutations, useInstitutionGrades } from '@/hooks';

/**
 * New Student Page
 * Connected to real Convex data
 */
export default function NewStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createStudent } = useStudentMutations();
  const { grades: institutionGrades } = useInstitutionGrades();

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

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth).getTime(),
        grade: formData.grade,
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        emergencyContact: formData.emergencyContact,
      });
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
            <FormField
              label="Email"
              name="parentEmail"
              type="email"
              value={formData.parentEmail}
              onChange={handleChange('parentEmail')}
              placeholder="correo@ejemplo.com"
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Estudiante"
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
