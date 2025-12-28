'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useStudent, useStudentMutations, useInstitutionGrades } from '@/hooks';
import { GoogleMapsProvider, LocationPicker } from '@altaviapp/maps';
import type { LatLng } from '@altaviapp/maps';

/**
 * Edit Student Page
 * Connected to real Convex data
 */
export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
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
    isActive: true,
  });
  const [homeLocation, setHomeLocation] = useState<{
    position: LatLng | undefined;
    address: string;
  }>({
    position: undefined,
    address: '',
  });

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { student, isLoading, notFound } = useStudent(studentId as any);
  const { updateStudent } = useStudentMutations();
  const { grades: institutionGrades } = useInstitutionGrades();

  // Convert grades array to select options
  const gradeOptions = useMemo(
    () => institutionGrades.map((g) => ({ value: g, label: g })),
    [institutionGrades]
  );

  // Load student data into form
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] ?? '' : '',
        grade: student.grade || '',
        address: student.address || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        parentEmail: student.parentEmail || '',
        emergencyContact: student.emergencyContact || '',
        isActive: student.isActive ?? true,
      });
      // Load home location if available
      if (student.homeLatitude && student.homeLongitude) {
        setHomeLocation({
          position: {
            lat: student.homeLatitude,
            lng: student.homeLongitude,
          },
          address: student.address || '',
        });
      }
    }
  }, [student]);

  // Handle location selection from LocationPicker
  const handleLocationSelect = useCallback((location: { position: LatLng; address: string }) => {
    setHomeLocation(location);
    // Also update the address field
    setFormData(prev => ({ ...prev, address: location.address }));
  }, []);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateStudent(studentId as any, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : undefined,
        grade: formData.grade,
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        emergencyContact: formData.emergencyContact,
        isActive: formData.isActive,
        // Include home location if set
        homeLatitude: homeLocation.position?.lat,
        homeLongitude: homeLocation.position?.lng,
      });
      router.push(`/students/${studentId}`);
    } catch (error) {
      console.error('Error updating student:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/students/${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando estudiante...</span>
      </div>
    );
  }

  if (notFound || !student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estudiante no encontrado</p>
        <Link href="/students" className="text-primary hover:underline mt-2 inline-block">
          Volver a Estudiantes
        </Link>
      </div>
    );
  }

  const studentName = `${formData.firstName} ${formData.lastName}`;

  return (
    <GoogleMapsProvider>
    <div>
      <PageHeader
        title={`Editar ${studentName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estudiantes', href: '/students' },
          { label: studentName, href: `/students/${studentId}` },
          { label: 'Editar' },
        ]}
        backHref={`/students/${studentId}`}
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
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Ubicación del Hogar */}
        <FormSection
          title="Ubicación del Hogar"
          description="La ubicación del hogar es necesaria para la optimización de rutas de transporte."
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-600">
              {homeLocation.position
                ? 'Ubicación configurada'
                : 'Sin ubicación configurada - Busca la dirección o haz clic en el mapa'}
            </span>
          </div>
          <LocationPicker
            initialPosition={homeLocation.position}
            initialAddress={homeLocation.address}
            onLocationSelect={handleLocationSelect}
            placeholder="Buscar dirección del hogar..."
            mapHeight="350px"
            helpText="Puedes buscar la dirección o hacer clic directamente en el mapa para seleccionar la ubicación."
          />
        </FormSection>

        {/* Información de Contacto */}
        <FormSection title="Información de Contacto">
          <FormField
            label="Contacto de Emergencia"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange('emergencyContact')}
            placeholder="Nombre y teléfono"
            required
          />
        </FormSection>

        {/* Padre/Tutor */}
        <FormSection title="Padre/Tutor">
          <FormField
            label="Nombre del Padre/Tutor"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange('parentName')}
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
              required
            />
            <FormField
              label="Email"
              name="parentEmail"
              type="email"
              value={formData.parentEmail}
              onChange={handleChange('parentEmail')}
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Estado */}
        <FormSection title="Estado">
          <FormField
            label="Estado del Estudiante"
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
    </GoogleMapsProvider>
  );
}
