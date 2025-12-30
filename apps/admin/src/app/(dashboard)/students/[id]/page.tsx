'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Trash2, QrCode, Phone, Mail, MapPin, GraduationCap, Calendar, Loader2, Bus, Clock, ChevronRight, Download, Printer, X } from 'lucide-react';
import QRCodeLib from 'qrcode';
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
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

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

  // QR Code functions
  const generateQrCode = async () => {
    if (!student?.qrCode) return;
    setQrLoading(true);
    try {
      const url = await QRCodeLib.toDataURL(student.qrCode, {
        width: 256,
        margin: 2,
        color: { dark: '#042940', light: '#FFFFFF' },
      });
      setQrDataUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
    setQrLoading(false);
  };

  const downloadQrCode = () => {
    if (!qrDataUrl || !student) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-${student.firstName}-${student.lastName}.png`;
    link.click();
  };

  const printQrCode = () => {
    if (!qrDataUrl || !student) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>QR - ${student.firstName} ${student.lastName}</title></head>
          <body style="display:flex;flex-direction:column;align-items:center;padding:40px;">
            <h2>${student.firstName} ${student.lastName}</h2>
            <p>${student.grade}</p>
            <img src="${qrDataUrl}" style="width:256px;height:256px;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleOpenQRModal = () => {
    setShowQRModal(true);
    if (!qrDataUrl && student?.qrCode) {
      generateQrCode();
    }
  };

  // Get all active assignments, grouped by route type
  const activeAssignments = assignments.filter(a => a.isActive);
  const pickupAssignments = activeAssignments.filter(a => a.route?.type === 'pickup');
  const dropoffAssignments = activeAssignments.filter(a => a.route?.type === 'dropoff');

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

            {student.qrCode ? (
              <button
                onClick={handleOpenQRModal}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
              >
                <div className="p-2 bg-green-100 rounded-lg">
                  <QrCode className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Código QR</p>
                  <p className="text-sm font-medium text-gray-900">Ver QR</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <QrCode className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Código QR</p>
                  <p className="text-sm font-medium text-amber-600">Pendiente</p>
                </div>
              </div>
            )}
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

        {/* Rutas Asignadas */}
        <DetailSection title="Rutas de Transporte">
          {activeAssignments.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg">
              Este estudiante no tiene rutas de transporte asignadas
            </p>
          ) : (
            <div className="space-y-4">
              {/* Rutas de Recogida */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-blue-500" />
                  Recogida (Mañana)
                </h4>
                {pickupAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500 pl-6">Sin ruta de recogida asignada</p>
                ) : (
                  <div className="space-y-2">
                    {pickupAssignments.map((assignment) => (
                      <div key={assignment._id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bus className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/routes/${assignment.routeId}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                          >
                            {assignment.route?.name || 'Ruta sin nombre'}
                          </Link>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Parada: {assignment.stop?.name} • {assignment.stop?.scheduledTime || '--:--'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rutas de Entrega */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-green-500" />
                  Entrega (Tarde)
                </h4>
                {dropoffAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500 pl-6">Sin ruta de entrega asignada</p>
                ) : (
                  <div className="space-y-2">
                    {dropoffAssignments.map((assignment) => (
                      <div key={assignment._id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Bus className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/routes/${assignment.routeId}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                          >
                            {assignment.route?.name || 'Ruta sin nombre'}
                          </Link>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Parada: {assignment.stop?.name} • {assignment.stop?.scheduledTime || '--:--'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Warning if multiple routes of same type */}
              {(pickupAssignments.length > 1 || dropoffAssignments.length > 1) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    ⚠️ Este estudiante tiene múltiples rutas del mismo tipo asignadas.
                    Esto podría causar conflictos de horario.
                  </p>
                </div>
              )}
            </div>
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

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowQRModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Código QR</h3>
              <p className="text-sm text-gray-500">{studentName}</p>
              <p className="text-xs text-gray-400">{student.grade}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center mb-6">
              {qrLoading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                  <QrCode className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={downloadQrCode}
                disabled={!qrDataUrl}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={printQrCode}
                disabled={!qrDataUrl}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> Este código QR se usa para check-in/check-out en el bus escolar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
