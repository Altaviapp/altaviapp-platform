'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Trash2, QrCode, Phone, Mail, MapPin, GraduationCap, Calendar, Users } from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';
import Link from 'next/link';

// Mock student data
const mockStudents: Record<string, {
  id: string;
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
  status: 'active' | 'inactive';
  route: { id: string; name: string; stop: string } | null;
  parents: Array<{ id: string; name: string; relation: string; phone: string; email: string }>;
  qrCode: string;
  createdAt: string;
}> = {
  '1': {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez González',
    cedula: '1234567890',
    birthDate: '15/03/2015',
    gender: 'Masculino',
    grade: '5to',
    section: 'B',
    enrollmentNumber: 'MAT-2024-001',
    address: 'Av. Principal 123, Sector Norte, Quito',
    homePhone: '+593 2 234 5678',
    status: 'active',
    route: { id: '1', name: 'Ruta Centro', stop: 'Parada 1 - Centro Comercial' },
    parents: [
      { id: '1', name: 'Pedro Pérez Mora', relation: 'Padre', phone: '+593 99 123 4567', email: 'pedro.perez@email.com' },
      { id: '2', name: 'María González López', relation: 'Madre', phone: '+593 98 765 4321', email: 'maria.gonzalez@email.com' },
    ],
    qrCode: 'QR-STU-001-2024',
    createdAt: '10/01/2024',
  },
  '2': {
    id: '2',
    firstName: 'Ana',
    lastName: 'Torres Martínez',
    cedula: '0987654321',
    birthDate: '22/07/2016',
    gender: 'Femenino',
    grade: '4to',
    section: 'C',
    enrollmentNumber: 'MAT-2024-002',
    address: 'Calle Secundaria 456, Sector Sur, Quito',
    homePhone: '+593 2 345 6789',
    status: 'active',
    route: { id: '1', name: 'Ruta Centro', stop: 'Parada 1 - Centro Comercial' },
    parents: [
      { id: '3', name: 'Carmen Martínez Ruiz', relation: 'Madre', phone: '+593 97 111 2222', email: 'carmen.martinez@email.com' },
    ],
    qrCode: 'QR-STU-002-2024',
    createdAt: '15/01/2024',
  },
};

/**
 * Student Detail Page
 */
export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const student = mockStudents[studentId];

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estudiante no encontrado</p>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/students');
  };

  return (
    <div>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estudiantes', href: '/students' },
          { label: `${student.firstName} ${student.lastName}` },
        ]}
        backHref="/students"
        badge={
          <StatusBadge
            status={student.status === 'active' ? 'active' : 'inactive'}
            label={student.status === 'active' ? 'Activo' : 'Inactivo'}
          />
        }
        actions={[
          {
            label: 'Ver QR',
            href: `/students/${student.id}/qr`,
            icon: QrCode,
            variant: 'secondary',
          },
          {
            label: 'Editar',
            href: `/students/${student.id}/edit`,
            icon: Edit,
            variant: 'secondary',
          },
          {
            label: 'Eliminar',
            onClick: () => setShowDeleteDialog(true),
            icon: Trash2,
            variant: 'danger',
          },
        ]}
      />

      <div className="space-y-6">
        {/* Información Personal */}
        <DetailSection title="Información Personal">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-primary">
                {student.firstName[0]}{student.lastName[0]}
              </span>
            </div>
            <div className="flex-1">
              <DetailGrid cols={3}>
                <DetailItem label="Nombres" value={student.firstName} />
                <DetailItem label="Apellidos" value={student.lastName} />
                <DetailItem label="Cédula" value={student.cedula || '-'} />
                <DetailItem label="Fecha de Nacimiento" value={student.birthDate} />
                <DetailItem label="Género" value={student.gender} />
              </DetailGrid>
            </div>
          </div>
        </DetailSection>

        {/* Información Académica */}
        <DetailSection title="Información Académica">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Grado</p>
                <p className="text-sm font-medium text-gray-900">{student.grade} {student.section}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">N° Matrícula</p>
                <p className="text-sm font-medium text-gray-900">{student.enrollmentNumber || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <QrCode className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Código QR</p>
                <p className="text-sm font-medium text-gray-900">{student.qrCode}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Información de Contacto */}
        <DetailSection title="Información de Contacto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dirección</p>
                <p className="text-sm font-medium text-gray-900">{student.address || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono Casa</p>
                <p className="text-sm font-medium text-gray-900">{student.homePhone || '-'}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Ruta Asignada */}
        <DetailSection title="Ruta de Transporte">
          {student.route ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                label="Ruta Asignada"
                value={
                  <Link href={`/routes/${student.route.id}`} className="text-primary hover:underline">
                    {student.route.name}
                  </Link>
                }
              />
              <DetailItem label="Parada" value={student.route.stop} />
            </div>
          ) : (
            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg">
              Este estudiante no tiene ruta de transporte asignada
            </p>
          )}
        </DetailSection>

        {/* Padres/Tutores */}
        <DetailSection
          title="Padres/Tutores"
          actions={
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {student.parents.length} registrado{student.parents.length > 1 ? 's' : ''}
            </span>
          }
        >
          <div className="space-y-4" id="parents">
            {student.parents.map((parent) => (
              <div
                key={parent.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{parent.name}</p>
                    <p className="text-sm text-gray-500">{parent.relation}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {parent.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {parent.email || '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>

        {/* Metadata */}
        <div className="text-xs text-gray-400 text-right">
          Registrado el {student.createdAt}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Estudiante"
        message={`¿Estás seguro de que deseas eliminar a ${student.firstName} ${student.lastName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
