'use client';

import { useParams } from 'next/navigation';
import { Download, Printer, Share2 } from 'lucide-react';
import { PageHeader, DetailSection } from '@/components/shared';

// Mock student data
const mockStudents: Record<string, {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  qrCode: string;
}> = {
  '1': {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez González',
    grade: '5to',
    section: 'B',
    qrCode: 'QR-STU-001-2024',
  },
  '2': {
    id: '2',
    firstName: 'Ana',
    lastName: 'Torres Martínez',
    grade: '4to',
    section: 'C',
    qrCode: 'QR-STU-002-2024',
  },
};

/**
 * Student QR Code Page
 * Displays and allows download of student QR code for check-in
 */
export default function StudentQRPage() {
  const params = useParams();
  const studentId = params.id as string;

  const student = mockStudents[studentId];

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estudiante no encontrado</p>
      </div>
    );
  }

  const handleDownload = () => {
    // In production, this would generate and download the actual QR code
    console.log('Downloading QR code for student:', student.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // In production, this would use the Web Share API
    console.log('Sharing QR code for student:', student.id);
  };

  return (
    <div>
      <PageHeader
        title={`Código QR - ${student.firstName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estudiantes', href: '/students' },
          { label: `${student.firstName} ${student.lastName}`, href: `/students/${student.id}` },
          { label: 'Código QR' },
        ]}
        backHref={`/students/${student.id}`}
        actions={[
          {
            label: 'Descargar',
            onClick: handleDownload,
            icon: Download,
            variant: 'primary',
          },
          {
            label: 'Imprimir',
            onClick: handlePrint,
            icon: Printer,
            variant: 'secondary',
          },
          {
            label: 'Compartir',
            onClick: handleShare,
            icon: Share2,
            variant: 'secondary',
          },
        ]}
      />

      <div className="max-w-lg mx-auto">
        <DetailSection title="Código QR del Estudiante">
          <div className="text-center">
            {/* QR Code Placeholder */}
            <div className="w-64 h-64 mx-auto bg-white border-2 border-gray-200 rounded-xl p-4 mb-4">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-5 gap-1 mx-auto w-40 h-40 p-2">
                    {/* Simulated QR pattern */}
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          Math.random() > 0.4 ? 'bg-gray-900' : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-500">
                {student.grade} {student.section}
              </p>
              <p className="text-sm font-mono text-gray-400">
                {student.qrCode}
              </p>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Instrucciones de Uso">
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>1.</strong> Este código QR es único para el estudiante y debe ser presentado al momento de abordar y descender del transporte escolar.
            </p>
            <p>
              <strong>2.</strong> El código puede ser escaneado desde un dispositivo impreso o desde la aplicación móvil del padre/tutor.
            </p>
            <p>
              <strong>3.</strong> Al escanear el código, se registrará automáticamente la hora y ubicación del check-in/check-out.
            </p>
            <p>
              <strong>4.</strong> Los padres recibirán una notificación cuando el estudiante sea registrado.
            </p>
          </div>
        </DetailSection>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>Importante:</strong> No comparta este código QR con personas no autorizadas. En caso de pérdida o compromiso del código, solicite uno nuevo al administrador.
        </div>
      </div>
    </div>
  );
}
