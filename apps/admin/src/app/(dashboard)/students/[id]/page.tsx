'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Trash2, QrCode, Phone, Mail, MapPin, GraduationCap, Calendar, Loader2 } from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';
import Link from 'next/link';
import { useStudent, useStudentMutations, useStudentRouteAssignments } from '@/hooks';

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('es-EC');
}

/**
 * Student Detail Page
 * Connected to real Convex data
 */
export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { student, isLoading, notFound } = useStudent(studentId as any);
  const { deactivateStudent } = useStudentMutations();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { assignments } = useStudentRouteAssignments(studentId as any);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deactivateStudent(studentId as any);
      router.push('/students');
    } catch (error) {
      console.error('Error deactivating student:', error);
      setIsDeleting(false);
    }
  };

  const studentName = `${student.firstName} ${student.lastName}`;
  const activeAssignment = assignments.find(a => a.isActive);

  return (
    <div>
      <PageHeader
        title={studentName}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estudiantes', href: '/students' },
          { label: studentName },
        ]}
        backHref="/students"
        badge={
          <StatusBadge
            status={student.isActive ? 'active' : 'inactive'}
            label={student.isActive ? 'Activo' : 'Inactivo'}
          />
        }
        actions={[
          {
            label: 'Ver QR',
            href: `/students/${student._id}/qr`,
            icon: QrCode,
            variant: 'secondary',
          },
          {
            label: 'Editar',
            href: `/students/${student._id}/edit`,
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
                <DetailItem label="Fecha de Nacimiento" value={formatDate(student.dateOfBirth)} />
              </DetailGrid>
            </div>
          </div>
        </DetailSection>

        {/* Información Académica */}
        <DetailSection title="Información Académica">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Grado</p>
                <p className="text-sm font-medium text-gray-900">{student.grade || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <QrCode className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Código QR</p>
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                  {student.qrCode ? 'Generado' : 'Pendiente'}
                </p>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Contacto de Emergencia</p>
                <p className="text-sm font-medium text-gray-900">{student.emergencyContact || '-'}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Ruta Asignada */}
        <DetailSection title="Ruta de Transporte">
          {activeAssignment ? (
            <DetailItem
              label="Ruta Asignada"
              value={
                <Link href={`/routes/${activeAssignment.routeId}`} className="text-primary hover:underline">
                  Ver ruta asignada
                </Link>
              }
            />
          ) : (
            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg">
              Este estudiante no tiene ruta de transporte asignada
            </p>
          )}
        </DetailSection>

        {/* Padre/Tutor */}
        <DetailSection title="Padre/Tutor">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-3">
              <p className="font-medium text-gray-900">{student.parentName || '-'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {student.parentPhone || '-'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                {student.parentEmail || '-'}
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Metadata */}
        <div className="text-xs text-gray-400 text-right">
          Registrado el {formatDate(student.createdAt)}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Estudiante"
        message={`¿Estás seguro de que deseas eliminar a ${studentName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
