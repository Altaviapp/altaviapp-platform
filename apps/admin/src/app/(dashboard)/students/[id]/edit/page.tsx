'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, MapPin, QrCode, Download, Printer, Users, UserPlus, Mail, CheckCircle, X, AlertCircle } from 'lucide-react';
import QRCodeLib from 'qrcode';
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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Guardian invitation state
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { student, isLoading, notFound } = useStudent(studentId as any);
  const { updateStudent, inviteSecondaryGuardian } = useStudentMutations();
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

  // Handle guardian invitation
  const handleInviteGuardian = async () => {
    if (!guardianEmail.trim() || !guardianName.trim()) {
      setInviteResult({ success: false, message: 'Por favor complete todos los campos' });
      return;
    }

    setInviteLoading(true);
    setInviteResult(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await inviteSecondaryGuardian(studentId as any, guardianEmail, guardianName);
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

        {/* Tutores */}
        <FormSection
          title="Tutores"
          description="Gestiona los tutores que tienen acceso a la información del estudiante."
        >
          {/* Tutor Principal */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-gray-900">Tutor Principal</h4>
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">Principal</span>
            </div>

            <FormField
              label="Nombre del Tutor"
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
          </div>

          {/* Tutor Secundario */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900">Tutor Secundario</h4>
              </div>
            </div>

            {student.secondaryParentEmail ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.secondaryParentEmail}</p>
                    <p className="text-xs text-green-600">Tutor secundario configurado</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Secundario</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Agrega un segundo tutor (cónyuge, abuelo, etc.) para que también pueda ver la información y recibir notificaciones del estudiante.
                </p>
                <button
                  type="button"
                  onClick={() => setShowGuardianModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Invitar Tutor Secundario
                </button>
              </div>
            )}
          </div>
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

        {/* Código QR */}
        <FormSection
          title="Código QR del Estudiante"
          description="Este código QR se usa para check-in/check-out en el bus escolar."
        >
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-600">
              {student.qrCode ? 'Código QR generado' : 'Sin código QR - Se generará automáticamente'}
            </span>
          </div>

          {student.qrCode && (
            <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mb-4" />
              ) : (
                <button
                  type="button"
                  onClick={generateQrCode}
                  disabled={qrLoading}
                  className="w-48 h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-primary transition-colors mb-4"
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

              {qrDataUrl && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={downloadQrCode}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                  <button
                    type="button"
                    onClick={printQrCode}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> Descargue o imprima el código QR para que el estudiante lo lleve en su mochila o credencial.
            </p>
          </div>
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

      {/* Guardian Invitation Modal */}
      {showGuardianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowGuardianModal(false);
              setGuardianEmail('');
              setGuardianName('');
              setInviteResult(null);
            }}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <button
              onClick={() => {
                setShowGuardianModal(false);
                setGuardianEmail('');
                setGuardianName('');
                setInviteResult(null);
              }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Invitar Tutor Secundario</h3>
              <p className="text-sm text-gray-600 mt-1">
                El tutor recibirá un email con instrucciones para crear su cuenta y acceder a la información del estudiante.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Ej: María García"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="Ej: maria@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {inviteResult && (
              <div
                className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  inviteResult.success
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {inviteResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{inviteResult.message}</span>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowGuardianModal(false);
                  setGuardianEmail('');
                  setGuardianName('');
                  setInviteResult(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInviteGuardian}
                disabled={!guardianEmail.trim() || !guardianName.trim() || inviteLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Enviar Invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </GoogleMapsProvider>
  );
}
