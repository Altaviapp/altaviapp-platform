'use client';

import { useState, useRef, useMemo } from 'react';
import {
  UserMinus,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Upload,
  X,
  Image as ImageIcon,
  File,
  User,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Modal, ModalFooter, Button, Textarea } from '@/components/core';
import { useNovedadesMutations, useNovedadTypes, useEvidenceUpload } from '@/hooks';
import type { AffectedRouteType, DurationType } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Id } from '../../../../../convex/_generated/dataModel';

// Valid legacy types for backwards compatibility
const LEGACY_TYPES = ['absence', 'parent_pickup', 'stop_change', 'early_pickup', 'late_arrival'] as const;
type LegacyNovedadType = typeof LEGACY_TYPES[number];

// Icon mapping for dynamic types
const ICON_MAP: Record<string, React.ElementType> = {
  UserMinus,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
};

// Color classes for dynamic types
const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

// Route type labels
const ROUTE_TYPE_LABELS: Record<AffectedRouteType, string> = {
  pickup: 'Recogida',
  dropoff: 'Entrega',
  both: 'Ambos',
};

// File helpers
const getFileIcon = (type: string): React.ElementType => {
  if (type.startsWith('image/')) return ImageIcon;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export interface NovedadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (novedadId: Id<'novedades'>) => void;
  // Pre-filled context (required)
  studentId: Id<'students'>;
  studentName: string;
  date: string; // YYYY-MM-DD
  routeType: 'pickup' | 'dropoff';
}

export function NovedadModal({
  isOpen,
  onClose,
  onSuccess,
  studentId,
  studentName,
  date,
  routeType,
}: NovedadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createNovedad, isReady } = useNovedadesMutations();
  const { types: novedadTypes, isLoading: typesLoading } = useNovedadTypes();
  const { uploadEvidence } = useEvidenceUpload();

  // Form state
  const [selectedTypeId, setSelectedTypeId] = useState<Id<'novedadTypes'> | ''>('');
  const [reason, setReason] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Get selected type configuration
  const selectedType = useMemo(() => {
    if (!selectedTypeId) return null;
    return novedadTypes.find((t) => t._id === selectedTypeId) ?? null;
  }, [selectedTypeId, novedadTypes]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const maxFiles = selectedType?.maxEvidenceFiles ?? 5;
    const allowedTypes = selectedType?.allowedFileTypes ?? ['image/*', 'application/pdf'];

    // Filter files by type
    const validFiles = selectedFiles.filter((file) => {
      return allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const category = type.replace('/*', '');
          return file.type.startsWith(category + '/');
        }
        return file.type === type;
      });
    });

    // Check file size (10MB max per file)
    const sizeFilteredFiles = validFiles.filter((file) => file.size <= 10 * 1024 * 1024);

    // Limit number of files
    const newFiles = [...files, ...sizeFilteredFiles].slice(0, maxFiles);
    setFiles(newFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a file
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset form when modal closes
  const handleClose = () => {
    setSelectedTypeId('');
    setReason('');
    setFiles([]);
    setError('');
    setUploadProgress('');
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (!selectedTypeId) {
      setError('Por favor selecciona el tipo de novedad');
      return;
    }

    if (selectedType?.reasonRequired && !reason.trim()) {
      setError('Por favor indica el motivo');
      return;
    }

    if (selectedType?.evidenceRequired && files.length === 0) {
      setError('Se requiere adjuntar evidencia');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine if the type code is a valid legacy type
      const legacyType = selectedType?.code && LEGACY_TYPES.includes(selectedType.code as LegacyNovedadType)
        ? (selectedType.code as LegacyNovedadType)
        : undefined;

      // Create the novedad
      const result = await createNovedad({
        studentId,
        type: legacyType,
        typeId: selectedTypeId as Id<'novedadTypes'>,
        affectedRouteType: routeType, // Use the pre-filled route type
        date,
        startDate: date,
        durationType: (selectedType?.durationType as DurationType) ?? 'single_day',
        reason: reason.trim() || 'Sin motivo especificado',
      });

      // Upload evidence files
      if (files.length > 0 && result.novedadId) {
        setUploadProgress('Subiendo archivos...');
        for (let i = 0; i < files.length; i++) {
          const file = files[i]!;
          setUploadProgress(`Subiendo archivo ${i + 1} de ${files.length}...`);
          await uploadEvidence(result.novedadId, file);
        }
      }

      // Success - reset and close
      handleClose();
      onSuccess?.(result.novedadId);
    } catch (err: any) {
      setError(err.message || 'Error al crear la novedad');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reportar Novedad"
      description="Reporta una ausencia o cambio para este viaje"
      size="lg"
    >
      {/* Context badges */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm">
          <User className="w-3.5 h-3.5" />
          <span className="font-medium">{studentName}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(date)}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
          {routeType === 'pickup' ? (
            <ArrowRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowLeft className="w-3.5 h-3.5" />
          )}
          <span>{ROUTE_TYPE_LABELS[routeType]}</span>
        </div>
      </div>

      {/* Novedad Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de novedad <span className="text-red-500">*</span>
        </label>
        {typesLoading ? (
          <div className="text-sm text-gray-500">Cargando tipos...</div>
        ) : (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {novedadTypes.map((type) => {
              const Icon = ICON_MAP[type.icon] ?? FileText;
              const colors = COLOR_CLASSES[type.color] ?? COLOR_CLASSES.gray!;
              const isSelected = selectedTypeId === type._id;
              return (
                <button
                  key={type._id}
                  type="button"
                  onClick={() => setSelectedTypeId(type._id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 transition-all text-left',
                    isSelected
                      ? 'bg-primary/5'
                      : 'hover:bg-gray-50'
                  )}
                >
                  {/* Radio indicator */}
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      isSelected ? 'border-primary' : 'border-gray-300'
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg flex-shrink-0', colors.bg)}>
                    <Icon className={cn('w-4 h-4', colors.text)} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900">{type.name}</span>
                    {type.requiresApproval && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                        Requiere aprobación
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Type Info Panel */}
      {selectedType && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
          {/* Description */}
          {selectedType.description && (
            <p className="text-sm text-gray-600 mb-3">{selectedType.description}</p>
          )}
          {/* Requirements badges */}
          <div className="flex flex-wrap gap-2">
            {selectedType.requiresApproval && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <Clock className="w-3 h-3" />
                Requiere aprobación
              </span>
            )}
            {selectedType.evidenceRequired && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <Upload className="w-3 h-3" />
                Evidencia requerida
              </span>
            )}
            {selectedType.reasonRequired && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                <FileText className="w-3 h-3" />
                Motivo requerido
              </span>
            )}
            {selectedType.durationType && selectedType.durationType !== 'single_day' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                <Calendar className="w-3 h-3" />
                {selectedType.durationType === 'permanent' ? 'Permanente' :
                 selectedType.durationType === 'date_range' ? 'Rango de fechas' :
                 selectedType.durationType === 'recurring' ? 'Recurrente' : 'Un día'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Reason */}
      {selectedType && (
        <div className="mb-4">
          <Textarea
            label={`Motivo${selectedType.reasonRequired ? ' *' : ' (opcional)'}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe brevemente el motivo..."
            rows={2}
          />
        </div>
      )}

      {/* Evidence Upload */}
      {selectedType && (selectedType.evidenceRequired || selectedType.evidenceOptional) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidencia{selectedType.evidenceRequired ? ' *' : ' (opcional)'}
          </label>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-1 mb-2">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm"
                  >
                    <FileIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="flex-1 truncate text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload button */}
          {files.length < (selectedType.maxEvidenceFiles ?? 5) && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={selectedType.allowedFileTypes?.join(',') ?? 'image/*,application/pdf'}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Subir archivo (máx. {selectedType.maxEvidenceFiles ?? 5})
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-blue-700 mb-4">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">{uploadProgress}</p>
        </div>
      )}

      {/* Footer */}
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!isReady || !selectedTypeId}
        >
          Crear Novedad
        </Button>
      </ModalFooter>
    </Modal>
  );
}
