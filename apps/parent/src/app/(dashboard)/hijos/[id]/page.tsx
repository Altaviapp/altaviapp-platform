'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Edit,
  QrCode,
  Download,
  Printer,
  User,
  AlertCircle,
  Camera,
  Clock,
  ChevronRight,
  UserPlus,
  Users,
  CheckCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentWithPhoto, useStudentMutations } from '@/hooks';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import QRCode from 'qrcode';
import { LoadingState, Card, CardContent, Button, Input, Badge } from '@/components/core';
import { PageHeader } from '@/components/shared';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as Id<"students">;
  const { student, isLoading } = useStudentWithPhoto(studentId);
  const { inviteSecondaryGuardian } = useStudentMutations();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Secondary guardian invitation state
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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

  // Handle guardian invitation
  const handleInviteGuardian = async () => {
    if (!guardianEmail.trim() || !guardianName.trim()) {
      setInviteResult({ success: false, message: 'Por favor complete todos los campos' });
      return;
    }

    setInviteLoading(true);
    setInviteResult(null);

    try {
      const result = await inviteSecondaryGuardian(studentId, guardianEmail, guardianName);
      setInviteResult({
        success: true,
        message: result.message,
      });
      // Reset form after success
      setTimeout(() => {
        setShowGuardianModal(false);
        setGuardianEmail('');
        setGuardianName('');
        setInviteResult(null);
      }, 2000);
    } catch (error) {
      console.error('Error inviting guardian:', error);
      setInviteResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error al enviar invitación',
      });
    } finally {
      setInviteLoading(false);
    }
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
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Detalle del Estudiante"
          subtitle="Cargando..."
          backHref="/hijos"
        />
        <LoadingState message="Cargando información..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Detalle del Estudiante"
          backHref="/hijos"
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Estudiante no encontrado</h2>
          <p className="text-gray-500 mb-4">No se pudo cargar la información del estudiante.</p>
          <Button variant="secondary" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Detalle del Estudiante"
        subtitle={`${student.firstName} ${student.lastName}`}
        backHref="/hijos"
      />

      {/* Student Info Card */}
      <Card>
        <CardContent>
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
              href={`/hijos/${student._id}/edit`}
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
              <Badge variant={student.isActive ? 'success' : 'default'}>
                {student.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          {/* Edit Button */}
          <Link
            href={`/hijos/${student._id}/edit`}
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
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Link
        href={`/hijos/${student._id}/historial`}
        className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Historial</p>
              <p className="text-xs text-gray-500">Ver viajes</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Link>

      {/* Address Card */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Dirección</h3>
            </div>
            <Link
              href={`/hijos/${student._id}/location`}
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
        </CardContent>
      </Card>

      {/* Contact Info Card */}
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Emergency Contacts Card */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Contactos de Emergencia</h3>
            </div>
            <Link
              href={`/hijos/${student._id}/edit`}
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
                  href={`/hijos/${student._id}/edit`}
                  className="text-xs text-primary hover:underline"
                >
                  Agregar contacto
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Guardian Card */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Segundo Tutor</h3>
            </div>
          </div>

          {student.secondaryParentEmail ? (
            <div className="p-3 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{student.secondaryParentEmail}</p>
                  <p className="text-xs text-success">Segundo tutor configurado</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Agrega un segundo tutor (cónyuge, abuelo, etc.) para que también pueda ver la información y recibir notificaciones.
              </p>
              <Button
                onClick={() => setShowGuardianModal(true)}
                leftIcon={UserPlus}
                className="w-full"
              >
                Invitar Segundo Tutor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guardian Invitation Modal */}
      {showGuardianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Invitar Segundo Tutor</h3>
              <button
                onClick={() => {
                  setShowGuardianModal(false);
                  setGuardianEmail('');
                  setGuardianName('');
                  setInviteResult(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              El segundo tutor recibirá un email con instrucciones para crear su cuenta y acceder a la información de {student.firstName}.
            </p>

            <div className="space-y-3">
              <Input
                label="Nombre completo"
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Ej: María García"
              />
              <Input
                label="Email"
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="Ej: maria@email.com"
              />
            </div>

            {inviteResult && (
              <div
                className={cn(
                  'p-3 rounded-lg flex items-center gap-2',
                  inviteResult.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                )}
              >
                {inviteResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{inviteResult.message}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowGuardianModal(false);
                  setGuardianEmail('');
                  setGuardianName('');
                  setInviteResult(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInviteGuardian}
                disabled={!guardianEmail.trim() || !guardianName.trim()}
                isLoading={inviteLoading}
                leftIcon={Mail}
                className="flex-1"
              >
                Enviar Invitación
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Card */}
      <Card>
        <CardContent>
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
              <Button
                variant="secondary"
                onClick={downloadQrCode}
                leftIcon={Download}
              >
                Descargar
              </Button>
              <Button
                variant="secondary"
                onClick={printQrCode}
                leftIcon={Printer}
              >
                Imprimir
              </Button>
            </div>
          )}

          <div className="mt-4 p-3 bg-info/10 rounded-lg">
            <p className="text-xs text-info">
              <strong>Tip:</strong> Guarde el QR en su teléfono o imprímalo para que su hijo lo lleve en su mochila
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <div className="text-xs text-gray-400 text-center py-2">
        <p>Creado: {formatDate(student.createdAt)}</p>
        <p>Actualizado: {formatDate(student.updatedAt)}</p>
      </div>
    </div>
  );
}
