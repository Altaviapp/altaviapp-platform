'use client';

import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserMinus,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  Check,
  FileText,
  Upload,
  X,
  Paperclip,
  Calendar,
  Image as ImageIcon,
  File,
  User,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useMyStudents, useNovedadesMutations, useNovedadTypes, useEvidenceUpload } from '@/hooks';
import type { AffectedRouteType, NovedadCategory, DurationType } from '@/hooks';
import { cn } from '@/lib/utils';
import { LoadingState, Card, CardContent, Button, Input, Textarea } from '@/components/core';
import { PageHeader } from '@/components/shared';
import type { Id } from '../../../../../../../convex/_generated/dataModel';

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
const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-600' },
};

// Route type options
const routeTypes: { value: AffectedRouteType; label: string }[] = [
  { value: 'pickup', label: 'Solo ida (casa a colegio)' },
  { value: 'dropoff', label: 'Solo vuelta (colegio a casa)' },
  { value: 'both', label: 'Ida y vuelta' },
];

// Duration type labels
const DURATION_LABELS: Record<DurationType, string> = {
  single_day: 'Un día específico',
  date_range: 'Rango de fechas',
  permanent: 'Hasta nuevo aviso',
  recurring: 'Días recurrentes',
};

// Valid legacy types for backwards compatibility
const LEGACY_TYPES = ['absence', 'parent_pickup', 'stop_change', 'early_pickup', 'late_arrival'] as const;
type LegacyNovedadType = typeof LEGACY_TYPES[number];

// File type icons
const getFileIcon = (type: string): React.ElementType => {
  if (type.startsWith('image/')) return ImageIcon;
  return File;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function CreateNovedadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { students, isLoading: studentsLoading } = useMyStudents();
  const { createNovedad, isReady } = useNovedadesMutations();
  const { types: novedadTypes, isLoading: typesLoading } = useNovedadTypes();
  const { uploadEvidence } = useEvidenceUpload();

  // Get context from URL params
  const preselectedStudentId = searchParams.get('studentId');
  const preselectedDate = searchParams.get('date');
  const preselectedRouteType = searchParams.get('routeType') as AffectedRouteType | null;

  // Form state
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTypeId, setSelectedTypeId] = useState<Id<'novedadTypes'> | ''>('');
  const [selectedRouteType, setSelectedRouteType] = useState<AffectedRouteType>('both');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
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

  // Get pre-selected student info for context display
  const preselectedStudent = useMemo(() => {
    if (!preselectedStudentId || students.length === 0) return null;
    return students.find((s) => s._id === preselectedStudentId) ?? null;
  }, [preselectedStudentId, students]);

  // Check if we have pre-filled context
  const hasPrefilledContext = Boolean(preselectedStudentId || preselectedDate || preselectedRouteType);
  const isStudentLocked = Boolean(preselectedStudentId && preselectedStudent);
  const isRouteLocked = Boolean(preselectedRouteType && preselectedRouteType !== 'both');
  const isDateLocked = Boolean(preselectedDate);

  // Route type labels for context badges
  const routeTypeLabels: Record<AffectedRouteType, string> = {
    pickup: 'Recogida',
    dropoff: 'Entrega',
    both: 'Ambos',
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-EC', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Pre-fill form from URL params
  useEffect(() => {
    if (students.length > 0) {
      if (preselectedStudentId && !selectedStudent) {
        const studentExists = students.some((s) => s._id === preselectedStudentId);
        if (studentExists) {
          setSelectedStudent(preselectedStudentId);
        }
      }

      if (preselectedDate && !startDate) {
        setStartDate(preselectedDate);
      }

      if (preselectedRouteType && ['pickup', 'dropoff', 'both'].includes(preselectedRouteType)) {
        setSelectedRouteType(preselectedRouteType);
      }
    }
  }, [preselectedStudentId, preselectedDate, preselectedRouteType, students, selectedStudent, startDate]);

  // Calculate min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // For stop changes, min date is based on type config
  const getMinDate = (): string => {
    if (selectedType?.minAdvanceHours) {
      const minDate = new Date();
      minDate.setHours(minDate.getHours() + selectedType.minAdvanceHours);
      return minDate.toISOString().split('T')[0]!;
    }
    return minDate!;
  };

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

  // Check if time input is needed
  const needsTimeInput = (): boolean => {
    if (!selectedType) return false;
    return selectedType.category === 'time_change';
  };

  // Check if end date is needed
  const needsEndDate = (): boolean => {
    if (!selectedType) return false;
    return selectedType.durationType === 'date_range';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStudent || !selectedTypeId || !startDate) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (selectedType?.reasonRequired && !reason.trim()) {
      setError('Por favor indica el motivo');
      return;
    }

    if (needsTimeInput() && !time) {
      setError('Por favor indica la hora');
      return;
    }

    if (needsEndDate() && !endDate) {
      setError('Por favor indica la fecha de fin');
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
        studentId: selectedStudent as Id<'students'>,
        type: legacyType, // Only set if it's a valid legacy type
        typeId: selectedTypeId as Id<'novedadTypes'>,
        affectedRouteType: selectedRouteType,
        date: startDate, // Legacy field
        startDate,
        endDate: endDate || undefined,
        durationType: selectedType?.durationType as DurationType,
        time: time || undefined,
        reason: reason.trim(),
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

      router.push('/novedades');
    } catch (err: any) {
      setError(err.message || 'Error al crear la novedad');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  if (studentsLoading || typesLoading) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Nueva Novedad"
          subtitle="Reporta una ausencia o cambio para tu hijo"
          backHref="/novedades"
        />
        <LoadingState message="Cargando..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Nueva Novedad"
        subtitle="Reporta una ausencia o cambio para tu hijo"
        backHref="/novedades"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Context Banner - Shows when we have pre-filled data */}
        {hasPrefilledContext && (isStudentLocked || isDateLocked || isRouteLocked) && (
          <Card>
            <CardContent>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Reportando novedad para:
              </p>
              <div className="flex flex-wrap gap-2">
                {isStudentLocked && preselectedStudent && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {preselectedStudent.firstName} {preselectedStudent.lastName}
                    </span>
                  </div>
                )}
                {isDateLocked && preselectedDate && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateDisplay(preselectedDate)}</span>
                  </div>
                )}
                {isRouteLocked && preselectedRouteType && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm">
                    {preselectedRouteType === 'pickup' ? (
                      <ArrowRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowLeft className="w-3.5 h-3.5" />
                    )}
                    <span>{routeTypeLabels[preselectedRouteType]}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Selection - Hidden when locked */}
        {!isStudentLocked && (
          <Card>
            <CardContent>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecciona el estudiante <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {students.map((student) => (
                  <button
                    key={student._id}
                    type="button"
                    onClick={() => setSelectedStudent(student._id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left',
                      selectedStudent === student._id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      {student.firstName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{student.grade || 'Sin grado'}</p>
                    </div>
                    {selectedStudent === student._id && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Novedad Type Selection - Dynamic */}
        <Card>
          <CardContent>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de novedad <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {novedadTypes.map((type) => {
                const Icon = ICON_MAP[type.icon] ?? FileText;
                const colors = COLOR_CLASSES[type.color] ?? COLOR_CLASSES.gray!;
                return (
                  <button
                    key={type._id}
                    type="button"
                    onClick={() => {
                      setSelectedTypeId(type._id);
                      // Reset dates when switching types
                      setStartDate('');
                      setEndDate('');
                    }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                      selectedTypeId === type._id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', colors.bg)}>
                      <Icon className={cn('w-5 h-5', colors.text)} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{type.name}</span>
                    <span className="text-xs text-gray-500 text-center line-clamp-2">
                      {type.description}
                    </span>
                    {type.requiresApproval && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Requiere aprobación
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Date and Route Type */}
        {selectedType && (
          <Card>
            <CardContent className="space-y-4">
              {/* Duration type indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{DURATION_LABELS[selectedType.durationType as DurationType]}</span>
              </div>

              <Input
                type="date"
                label={needsEndDate() ? 'Fecha de inicio' : 'Fecha'}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={getMinDate()}
                required
                hint={
                  selectedType.minAdvanceHours
                    ? `Requiere mínimo ${selectedType.minAdvanceHours} horas de anticipación`
                    : undefined
                }
              />

              {/* End date for date ranges */}
              {needsEndDate() && (
                <Input
                  type="date"
                  label="Fecha de fin"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || getMinDate()}
                  required
                />
              )}

              {/* Time input for time_change types */}
              {needsTimeInput() && (
                <Input
                  type="time"
                  label="Hora"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              )}

              {/* Route Type Selection - Hidden when locked */}
              {!isRouteLocked && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aplica a</label>
                  <div className="space-y-2">
                    {routeTypes.map((rt) => (
                      <label
                        key={rt.value}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px]',
                          selectedRouteType === rt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <input
                          type="radio"
                          name="routeType"
                          value={rt.value}
                          checked={selectedRouteType === rt.value}
                          onChange={() => setSelectedRouteType(rt.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-900">{rt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reason */}
        {selectedType && (
          <Card>
            <CardContent>
              <Textarea
                label={`Motivo${selectedType.reasonRequired ? ' *' : ' (opcional)'}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe brevemente el motivo de la novedad..."
                rows={3}
                required={selectedType.reasonRequired}
              />
            </CardContent>
          </Card>
        )}

        {/* Evidence Upload */}
        {selectedType && (selectedType.evidenceRequired || selectedType.evidenceOptional) && (
          <Card>
            <CardContent>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Paperclip className="w-4 h-4 inline mr-1" />
                Evidencia{selectedType.evidenceRequired ? ' *' : ' (opcional)'}
              </label>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-2 mb-3">
                  {files.map((file, index) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
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
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Subir archivo (máx. {selectedType.maxEvidenceFiles ?? 5})
                    </span>
                  </button>
                </>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Formatos permitidos:{' '}
                {selectedType.allowedFileTypes?.join(', ') ?? 'imágenes, PDF'} (máx. 10MB por
                archivo)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 text-blue-700">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">{uploadProgress}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => router.push('/novedades')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={!isReady || !selectedTypeId}
          >
            Crear Novedad
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateNovedadPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pb-20">
          <PageHeader
            title="Nueva Novedad"
            subtitle="Reporta una ausencia o cambio para tu hijo"
            backHref="/novedades"
          />
          <LoadingState message="Cargando..." />
        </div>
      }
    >
      <CreateNovedadForm />
    </Suspense>
  );
}
