'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Camera,
  Trash2,
  Save,
  AlertCircle,
  GraduationCap,
  CheckCircle,
  Upload,
} from 'lucide-react';
import { useStudentWithPhoto, useStudentMutations } from '@/hooks';
import type { Id } from '../../../../../../../../convex/_generated/dataModel';
import { LoadingState, Card, CardContent, Button, Input } from '@/components/core';
import { PageHeader } from '@/components/shared';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function StudentEditPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as Id<"students">;
  const { student, isLoading } = useStudentWithPhoto(studentId);
  const { updateStudent, uploadPhoto, deletePhoto } = useStudentMutations();

  // Form state
  const [emergencyContactSecondary, setEmergencyContactSecondary] = useState('');
  const [address, setAddress] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with student data
  useEffect(() => {
    if (student) {
      setEmergencyContactSecondary(student.emergencyContactSecondary || '');
      setAddress(student.address || '');
      setParentPhone(student.parentPhone || '');
      setPhotoPreview(student.photoUrl || null);
    }
  }, [student]);

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
      // Refresh will happen automatically via Convex subscription
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

  // Handle form save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateStudent(studentId, {
        emergencyContactSecondary: emergencyContactSecondary || undefined,
        address: address || undefined,
        parentPhone: parentPhone || undefined,
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
          {/* Photo Preview */}
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

            {/* Camera Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-md"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Actions */}
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

      {/* Student Info (Read Only) */}
      <Card>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">Información del Estudiante</h3>
        <p className="text-sm text-gray-500 mb-4">
          Esta información solo puede ser modificada por la institución
        </p>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Nombre completo</p>
            <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Grado</p>
            <p className="text-sm font-medium text-gray-900">{student.grade}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Editable Fields */}
      <Card>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">Información Editable</h3>

          <div className="space-y-4">
            <Input
              label="Dirección del Hogar"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ingrese la dirección completa"
            />

            <Input
              label="Teléfono del Padre/Madre"
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="+593XXXXXXXXX"
              hint="Formato: +593XXXXXXXXX"
            />

            <Input
              label="Contacto de Emergencia Secundario"
              type="text"
              value={emergencyContactSecondary}
              onChange={(e) => setEmergencyContactSecondary(e.target.value)}
              placeholder="Nombre y teléfono del contacto"
              hint="Ejemplo: María García - +593999123456"
            />
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
    </div>
  );
}
