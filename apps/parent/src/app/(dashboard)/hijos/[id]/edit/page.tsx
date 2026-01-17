'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Camera,
  Trash2,
  Save,
  AlertCircle,
  GraduationCap,
  CheckCircle,
  Upload,
  MapPin,
  Users,
  UserPlus,
  Mail,
  X,
  Loader2,
  User,
  Phone,
} from 'lucide-react';
import { useStudentWithPhoto, useStudentMutations, useInstitutionGrades } from '@/hooks';
import type { Id } from '../../../../../../../../convex/_generated/dataModel';
import { LoadingState, Card, CardContent, Button, Input, Select } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { GoogleMapsProvider, LocationPicker } from '@altaviapp/maps';
import type { LatLng } from '@altaviapp/maps';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function StudentEditPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as Id<"students">;
  const { student, isLoading } = useStudentWithPhoto(studentId);
  const { updateStudent, uploadPhoto, deletePhoto, inviteSecondaryGuardian } = useStudentMutations();
  const { grades: institutionGrades } = useInstitutionGrades();

  // Form state
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
    emergencyContactSecondary: '',
  });
  const [homeLocation, setHomeLocation] = useState<{
    position: LatLng | undefined;
    address: string;
  }>({
    position: undefined,
    address: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Guardian invitation state
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert grades array to select options
  const gradeOptions = useMemo(
    () => institutionGrades.map((g) => ({ value: g, label: g })),
    [institutionGrades]
  );

  // Initialize form with student data
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
        emergencyContactSecondary: student.emergencyContactSecondary || '',
      });
      setPhotoPreview(student.photoUrl || null);
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
    setFormData(prev => ({ ...prev, address: location.address }));
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WebP');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    setIsUploadingPhoto(true);
    setError(null);

    try {
      await uploadPhoto(studentId, selectedFile);
      setSuccess('Foto actualizada correctamente');
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle photo deletion
  const handlePhotoDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar la foto?')) return;

    setIsDeletingPhoto(true);
    setError(null);

    try {
      await deletePhoto(studentId);
      setPhotoPreview(null);
      setSuccess('Foto eliminada correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la foto');
    } finally {
      setIsDeletingPhoto(false);
    }
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

  // Handle form save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateStudent(studentId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : undefined,
        grade: formData.grade,
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        emergencyContact: formData.emergencyContact,
        emergencyContactSecondary: formData.emergencyContactSecondary || undefined,
        homeLatitude: homeLocation.position?.lat,
        homeLongitude: homeLocation.position?.lng,
      });
      setSuccess('Información actualizada correctamente');
      setTimeout(() => {
        router.push(`/hijos/${studentId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-24">
        <PageHeader
          title="Editar Información"
          subtitle="Cargando..."
          backHref={`/hijos/${studentId}`}
        />
        <LoadingState message="Cargando información..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4 pb-24">
        <PageHeader
          title="Editar Información"
          backHref="/hijos"
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Estudiante no encontrado</h2>
          <Button variant="secondary" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <GoogleMapsProvider>
      <div className="space-y-4 pb-24">
        <PageHeader
          title="Editar Información"
          subtitle={`${student.firstName} ${student.lastName}`}
          backHref={`/hijos/${studentId}`}
        />

        {/* Status Messages */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <p className="text-sm text-success">{success}</p>
          </div>
        )}

        {/* Photo Section */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Foto de Perfil
            </h3>

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-gray-100">
                    <GraduationCap className="w-16 h-16 text-primary" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-md"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                {selectedFile ? (
                  <Button
                    onClick={handlePhotoUpload}
                    isLoading={isUploadingPhoto}
                    leftIcon={Upload}
                    size="sm"
                  >
                    Subir Foto
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={Camera}
                    size="sm"
                  >
                    {photoPreview ? 'Cambiar' : 'Agregar'} Foto
                  </Button>
                )}

                {student.photoUrl && (
                  <Button
                    variant="danger"
                    onClick={handlePhotoDelete}
                    isLoading={isDeletingPhoto}
                    leftIcon={Trash2}
                    size="sm"
                  >
                    Eliminar
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Máximo 5MB. Formatos: JPG, PNG, WebP
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información Personal
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombres"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  required
                />
                <Input
                  label="Apellidos"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange('dateOfBirth')}
                  required
                />
                <Select
                  label="Grado"
                  value={formData.grade}
                  onChange={handleChange('grade')}
                  options={gradeOptions}
                  placeholder="Seleccione un grado"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Home Location */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Ubicación del Hogar
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              La ubicación del hogar es necesaria para la optimización de rutas de transporte.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${homeLocation.position ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-sm text-gray-600">
                {homeLocation.position
                  ? 'Ubicación configurada'
                  : 'Sin ubicación - Busca la dirección o haz clic en el mapa'}
              </span>
            </div>

            <LocationPicker
              initialPosition={homeLocation.position}
              initialAddress={homeLocation.address}
              onLocationSelect={handleLocationSelect}
              placeholder="Buscar dirección del hogar..."
              mapHeight="300px"
              helpText="Puedes buscar la dirección o hacer clic directamente en el mapa."
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Información de Contacto
            </h3>

            <div className="space-y-4">
              <Input
                label="Contacto de Emergencia Principal"
                type="text"
                value={formData.emergencyContact}
                onChange={handleChange('emergencyContact')}
                placeholder="Nombre y teléfono"
                hint="Ejemplo: María García - +593999123456"
                required
              />

              <Input
                label="Contacto de Emergencia Secundario"
                type="text"
                value={formData.emergencyContactSecondary}
                onChange={handleChange('emergencyContactSecondary')}
                placeholder="Nombre y teléfono del contacto"
                hint="Ejemplo: Juan Pérez - +593999654321"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tutors Section */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Tutores
            </h3>

            {/* Primary Guardian */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">Principal</span>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nombre del Tutor"
                  type="text"
                  value={formData.parentName}
                  onChange={handleChange('parentName')}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={handleChange('parentPhone')}
                    placeholder="+593XXXXXXXXX"
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.parentEmail}
                    onChange={handleChange('parentEmail')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Secondary Guardian */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700">Tutor Secundario</span>
              </div>

              {student.secondaryParentEmail ? (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.secondaryParentEmail}</p>
                      <p className="text-xs text-success">Tutor secundario configurado</p>
                    </div>
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-success/20 text-success rounded-full">Secundario</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Agrega un segundo tutor (cónyuge, abuelo, etc.) para que también pueda ver la información y recibir notificaciones.
                  </p>
                  <Button
                    onClick={() => setShowGuardianModal(true)}
                    leftIcon={UserPlus}
                    className="w-full"
                  >
                    Invitar Tutor Secundario
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button (Fixed at bottom) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:relative lg:border-0 lg:bg-transparent lg:p-0">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={Save}
            className="w-full"
          >
            Guardar Cambios
          </Button>
        </div>

        {/* Guardian Invitation Modal */}
        {showGuardianModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Invitar Tutor Secundario</h3>
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
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    inviteResult.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
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
      </div>
    </GoogleMapsProvider>
  );
}
