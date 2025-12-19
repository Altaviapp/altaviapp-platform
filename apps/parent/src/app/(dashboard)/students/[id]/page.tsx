'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  QrCode,
  Download,
  Printer,
  User,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentWithPhoto } from '@/hooks';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import QRCode from 'qrcode';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as Id<"students">;
  const { student, isLoading } = useStudentWithPhoto(studentId);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Generate QR code
  const generateQrCode = async () => {
    if (!student?.qrCode) return;
    setQrLoading(true);
    try {
      const url = await QRCode.toDataURL(student.qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#042940',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
    setQrLoading(false);
  };

  // Download QR code
  const downloadQrCode = async () => {
    if (!qrDataUrl || !student) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-${student.firstName}-${student.lastName}.png`;
    link.click();
  };

  // Print QR code
  const printQrCode = () => {
    if (!qrDataUrl || !student) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${student.firstName} ${student.lastName}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, sans-serif;
              }
              h1 { margin-bottom: 8px; }
              p { color: #666; margin-bottom: 24px; }
            </style>
          </head>
          <body>
            <h1>${student.firstName} ${student.lastName}</h1>
            <p>${student.grade}</p>
            <img src="${qrDataUrl}" width="256" height="256" />
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculate age
  const calculateAge = (birthTimestamp: number) => {
    const today = new Date();
    const birthDate = new Date(birthTimestamp);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Estudiante no encontrado</h2>
        <p className="text-gray-500 mb-4">No se pudo cargar la información del estudiante.</p>
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Detalle del Estudiante</h1>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar/Photo */}
          <div className="relative">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
            )}
            <Link
              href={`/students/${student._id}/edit`}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm"
            >
              <Camera className="w-4 h-4 text-white" />
            </Link>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-sm text-gray-600">{student.grade}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                student.isActive
                  ? 'bg-success/10 text-success'
                  : 'bg-gray-100 text-gray-500'
              )}>
                {student.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <Link
            href={`/students/${student._id}/edit`}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </Link>
        </div>

        {/* Personal Details */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Personal</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Edad</p>
              <p className="text-sm font-medium text-gray-900">{calculateAge(student.dateOfBirth)} años</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha de nacimiento</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(student.dateOfBirth)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Dirección</h3>
          </div>
          <Link
            href={`/students/${student._id}/location`}
            className="text-sm text-primary hover:underline"
          >
            Editar ubicación
          </Link>
        </div>
        <p className="text-sm text-gray-700">{student.address}</p>
        {student.homeLatitude && student.homeLongitude ? (
          <p className="text-xs text-success mt-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full" />
            Ubicación GPS configurada
          </p>
        ) : (
          <p className="text-xs text-warning mt-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-warning rounded-full" />
            Ubicación GPS pendiente
          </p>
        )}
      </div>

      {/* Contact Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Información de Contacto</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Padre/Madre</p>
              <p className="text-sm font-medium text-gray-900">{student.parentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Teléfono</p>
              <a href={`tel:${student.parentPhone}`} className="text-sm font-medium text-primary hover:underline">
                {student.parentPhone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Email</p>
              <a href={`mailto:${student.parentEmail}`} className="text-sm font-medium text-primary hover:underline">
                {student.parentEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Contactos de Emergencia</h3>
          </div>
          <Link
            href={`/students/${student._id}/edit`}
            className="text-sm text-primary hover:underline"
          >
            Editar
          </Link>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Contacto Principal</p>
            <p className="text-sm font-medium text-gray-900">{student.emergencyContact}</p>
          </div>

          {student.emergencyContactSecondary ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Contacto Secundario</p>
              <p className="text-sm font-medium text-gray-900">{student.emergencyContactSecondary}</p>
            </div>
          ) : (
            <div className="p-3 bg-warning/10 rounded-lg">
              <p className="text-xs text-warning">Sin contacto secundario configurado</p>
              <Link
                href={`/students/${student._id}/edit`}
                className="text-xs text-primary hover:underline"
              >
                Agregar contacto
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Código QR del Estudiante</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Este código QR se usa para check-in/check-out en el bus
        </p>

        {/* QR Code Display */}
        <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center mb-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
          ) : (
            <button
              onClick={generateQrCode}
              disabled={qrLoading}
              className="w-48 h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-primary transition-colors"
            >
              {qrLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : (
                <>
                  <QrCode className="w-12 h-12 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-500">Generar QR</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* QR Actions */}
        {qrDataUrl && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={downloadQrCode}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Descargar</span>
            </button>
            <button
              onClick={printQrCode}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Printer className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Imprimir</span>
            </button>
          </div>
        )}

        <div className="mt-4 p-3 bg-info/10 rounded-lg">
          <p className="text-xs text-info">
            <strong>Tip:</strong> Guarde el QR en su teléfono o imprímalo para que su hijo lo lleve en su mochila
          </p>
        </div>
      </div>

      {/* Timestamps */}
      <div className="text-xs text-gray-400 text-center py-2">
        <p>Creado: {formatDate(student.createdAt)}</p>
        <p>Actualizado: {formatDate(student.updatedAt)}</p>
      </div>
    </div>
  );
}
