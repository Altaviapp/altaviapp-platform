'use client';

import { useRef, useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistPhotoUploadProps {
  onUpload: (file: File) => Promise<void>;
  currentPhoto?: string;
  onRemove?: () => void;
  className?: string;
}

/**
 * Componente para subir foto del checklist (opcional)
 *
 * Características:
 * - Input file con preview de imagen
 * - Botón de eliminar foto
 * - Feedback visual de carga
 */
export function ChecklistPhotoUpload({
  onUpload,
  currentPhoto,
  onRemove,
  className
}: ChecklistPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert('Error al subir la foto. Por favor intente nuevamente.');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-gray-700">
        Foto del vehículo (opcional)
      </label>

      {/* Preview de foto existente */}
      {currentPhoto ? (
        <div className="relative inline-block">
          <img
            src={currentPhoto}
            alt="Foto del vehículo"
            className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90 transition-colors shadow-md"
            aria-label="Eliminar foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Seleccionar foto"
          />

          {/* Upload button */}
          <button
            onClick={handleButtonClick}
            disabled={isUploading}
            className={cn(
              'w-full max-w-sm h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 transition-colors',
              isUploading
                ? 'border-gray-300 bg-gray-50 cursor-wait'
                : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5'
            )}
          >
            {isUploading ? (
              <>
                <Upload className="w-8 h-8 text-gray-400 animate-pulse" />
                <span className="text-sm text-gray-600">Subiendo foto...</span>
              </>
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Agregar foto del vehículo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG hasta 5MB
                  </p>
                </div>
              </>
            )}
          </button>
        </>
      )}

      <p className="text-xs text-gray-500">
        Esta foto es opcional y se puede agregar para documentar el estado del vehículo
      </p>
    </div>
  );
}
