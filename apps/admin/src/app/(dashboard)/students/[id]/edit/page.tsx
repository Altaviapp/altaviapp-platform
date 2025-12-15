'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

const grades = [
  { value: '1ro', label: '1ro Básica' },
  { value: '2do', label: '2do Básica' },
  { value: '3ro', label: '3ro Básica' },
  { value: '4to', label: '4to Básica' },
  { value: '5to', label: '5to Básica' },
  { value: '6to', label: '6to Básica' },
];

const sections = [
  { value: 'A', label: 'Paralelo A' },
  { value: 'B', label: 'Paralelo B' },
  { value: 'C', label: 'Paralelo C' },
];

const genderOptions = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
];

const relationOptions = [
  { value: 'father', label: 'Padre' },
  { value: 'mother', label: 'Madre' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'other', label: 'Otro' },
];

interface Parent {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
}

// Mock data
const mockStudents: Record<string, {
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  gender: string;
  grade: string;
  section: string;
  enrollmentNumber: string;
  address: string;
  homePhone: string;
  status: string;
  parents: Parent[];
}> = {
  '1': {
    firstName: 'Juan',
    lastName: 'Pérez González',
    cedula: '1234567890',
    birthDate: '2015-03-15',
    gender: 'male',
    grade: '5to',
    section: 'B',
    enrollmentNumber: 'MAT-2024-001',
    address: 'Av. Principal 123, Sector Norte, Quito',
    homePhone: '+59322345678',
    status: 'active',
    parents: [
      { id: '1', name: 'Pedro Pérez Mora', relation: 'father', phone: '+593991234567', email: 'pedro.perez@email.com' },
      { id: '2', name: 'María González López', relation: 'mother', phone: '+593987654321', email: 'maria.gonzalez@email.com' },
    ],
  },
};

/**
 * Edit Student Page
 */
export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cedula: '',
    birthDate: '',
    gender: '',
    grade: '',
    section: '',
    enrollmentNumber: '',
    address: '',
    homePhone: '',
    status: 'active',
  });
  const [parents, setParents] = useState<Parent[]>([]);

  useEffect(() => {
    const student = mockStudents[studentId];
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        cedula: student.cedula,
        birthDate: student.birthDate,
        gender: student.gender,
        grade: student.grade,
        section: student.section,
        enrollmentNumber: student.enrollmentNumber,
        address: student.address,
        homePhone: student.homePhone,
        status: student.status,
      });
      setParents(student.parents);
    }
  }, [studentId]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleParentChange = (parentId: string, field: string) => (value: string) => {
    setParents((prev) =>
      prev.map((p) => (p.id === parentId ? { ...p, [field]: value } : p))
    );
  };

  const addParent = () => {
    setParents((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', relation: '', phone: '', email: '' },
    ]);
  };

  const removeParent = (parentId: string) => {
    if (parents.length > 1) {
      setParents((prev) => prev.filter((p) => p.id !== parentId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(`/students/${studentId}`);
  };

  const handleCancel = () => {
    router.push(`/students/${studentId}`);
  };

  if (!mockStudents[studentId]) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estudiante no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editar ${formData.firstName} ${formData.lastName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estudiantes', href: '/students' },
          { label: `${formData.firstName} ${formData.lastName}`, href: `/students/${studentId}` },
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

          <FormFieldRow cols={3}>
            <FormField
              label="Cédula/Pasaporte"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange('cedula')}
            />
            <FormField
              label="Fecha de Nacimiento"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange('birthDate')}
              required
            />
            <FormField
              label="Género"
              name="gender"
              type="select"
              value={formData.gender}
              onChange={handleChange('gender')}
              options={genderOptions}
            />
          </FormFieldRow>
        </FormSection>

        {/* Información Académica */}
        <FormSection title="Información Académica">
          <FormFieldRow cols={3}>
            <FormField
              label="Grado"
              name="grade"
              type="select"
              value={formData.grade}
              onChange={handleChange('grade')}
              options={grades}
              required
            />
            <FormField
              label="Salón/Paralelo"
              name="section"
              type="select"
              value={formData.section}
              onChange={handleChange('section')}
              options={sections}
              required
            />
            <FormField
              label="Número de Matrícula"
              name="enrollmentNumber"
              value={formData.enrollmentNumber}
              onChange={handleChange('enrollmentNumber')}
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
          />

          <FormField
            label="Teléfono de Casa"
            name="homePhone"
            type="tel"
            value={formData.homePhone}
            onChange={handleChange('homePhone')}
          />
        </FormSection>

        {/* Padres/Tutores */}
        <FormSection title="Padres/Tutores">
          {parents.map((parent, index) => (
            <div
              key={parent.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Padre/Tutor {index + 1}
                </span>
                {parents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParent(parent.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <FormFieldRow cols={2}>
                <FormField
                  label="Nombre Completo"
                  name={`parent-${parent.id}-name`}
                  value={parent.name}
                  onChange={handleParentChange(parent.id, 'name')}
                  required={index === 0}
                />
                <FormField
                  label="Relación"
                  name={`parent-${parent.id}-relation`}
                  type="select"
                  value={parent.relation}
                  onChange={handleParentChange(parent.id, 'relation')}
                  options={relationOptions}
                  required={index === 0}
                />
              </FormFieldRow>

              <FormFieldRow cols={2}>
                <FormField
                  label="Teléfono"
                  name={`parent-${parent.id}-phone`}
                  type="tel"
                  value={parent.phone}
                  onChange={handleParentChange(parent.id, 'phone')}
                  required={index === 0}
                />
                <FormField
                  label="Email"
                  name={`parent-${parent.id}-email`}
                  type="email"
                  value={parent.email}
                  onChange={handleParentChange(parent.id, 'email')}
                />
              </FormFieldRow>
            </div>
          ))}

          <button
            type="button"
            onClick={addParent}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary/80 border border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar otro padre/tutor
          </button>
        </FormSection>

        {/* Estado */}
        <FormSection title="Estado">
          <FormField
            label="Estado del Estudiante"
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
