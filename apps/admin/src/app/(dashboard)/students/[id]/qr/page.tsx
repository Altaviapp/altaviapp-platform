'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Printer, Share2, Loader2, RefreshCw } from 'lucide-react';
import { PageHeader, DetailSection } from '@/components/shared';
import { useStudent, useStudentMutations } from '@/hooks';
import { useState } from 'react';

/**
 * Student QR Code Page
 * Connected to real Convex data
 */
export default function StudentQRPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { student, isLoading, notFound } = useStudent(studentId as any);
  const { regenerateQRCode } = useStudentMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando...</span>
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

  const handleDownload = () => {
    // In production, this would generate and download the actual QR code image
    console.log('Downloading QR code for student:', student._id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // In production, this would use the Web Share API
    if (navigator.share) {
      navigator.share({
        title: `QR Code - ${student.firstName} ${student.lastName}`,
        text: `Código QR de ${student.firstName} ${student.lastName}`,
      });
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await regenerateQRCode(studentId as any);
    } catch (error) {
      console.error('Error regenerating QR code:', error);
    }
    setIsRegenerating(false);
  };

  const studentName = `${student.firstName} ${student.lastName}`;

  return (
    <div>
      <PageHeader
        title={`Código QR - ${student.firstName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Estudiantes', href: '/students' },
          { label: studentName, href: `/students/${student._id}` },
          { label: 'Código QR' },
        ]}
        backHref={`/students/${student._id}`}
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
            {/* QR Code Placeholder - In production, render actual QR code from student.qrCode */}
            <div className="w-64 h-64 mx-auto bg-white border-2 border-gray-200 rounded-xl p-4 mb-4">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-5 gap-1 mx-auto w-40 h-40 p-2">
                    {/* Simulated QR pattern based on studentId for visual consistency */}
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          (student._id.charCodeAt(i % student._id.length) + i) % 2 === 0
                            ? 'bg-gray-900'
                            : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">{studentName}</h2>
              <p className="text-gray-500">{student.grade || '-'}</p>
              <p className="text-sm font-mono text-gray-400 truncate max-w-[250px] mx-auto">
                {student.qrCode ? 'QR Generado' : 'QR Pendiente'}
              </p>
            </div>

            {/* Regenerate Button */}
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary/80 border border-primary/30 rounded-lg hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerando...' : 'Regenerar QR'}
            </button>
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
          <strong>Importante:</strong> No comparta este código QR con personas no autorizadas. En caso de pérdida o compromiso del código, use el botón &quot;Regenerar QR&quot; para generar uno nuevo.
        </div>
      </div>
    </div>
  );
}
