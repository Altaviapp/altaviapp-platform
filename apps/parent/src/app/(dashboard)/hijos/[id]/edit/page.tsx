'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Camera,
  Trash2,
  Save,
  AlertCircle,
  GraduationCap,
  CheckCircle,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudentWithPhoto, useStudentMutations } from '@/hooks';
import type { Id } from '../../../../../../../../convex/_generated/dataModel';

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
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Editar Información</h1>
      </div>

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
      <div className="bg-white rounded-xl border border-gray-200 p-4">
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
              <button
                onClick={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                  'bg-primary text-white hover:bg-primary/90 transition-colors',
                  isUploadingPhoto && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Subir Foto
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Camera className="w-4 h-4" />
                {photoPreview ? 'Cambiar' : 'Agregar'} Foto
              </button>
            )}

            {student.photoUrl && (
              <button
                onClick={handlePhotoDelete}
                disabled={isDeletingPhoto}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                  'bg-error/10 text-error hover:bg-error/20 transition-colors',
                  isDeletingPhoto && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isDeletingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Eliminar
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Máximo 5MB. Formatos: JPG, PNG, WebP
          </p>
        </div>
      </div>

      {/* Student Info (Read Only) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
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
      </div>

      {/* Editable Fields */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Información Editable</h3>

        <div className="space-y-4">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección del Hogar
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ingrese la dirección completa"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Parent Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono del Padre/Madre
            </label>
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="+593XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Formato: +593XXXXXXXXX</p>
          </div>

          {/* Emergency Contact Secondary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contacto de Emergencia Secundario
            </label>
            <input
              type="text"
              value={emergencyContactSecondary}
              onChange={(e) => setEmergencyContactSecondary(e.target.value)}
              placeholder="Nombre y teléfono del contacto"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ejemplo: María García - +593999123456
            </p>
          </div>
        </div>
      </div>

      {/* Save Button (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:relative lg:border-0 lg:bg-transparent lg:p-0">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium',
            'bg-primary text-white hover:bg-primary/90 transition-colors',
            isSaving && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
