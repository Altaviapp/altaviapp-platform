'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  UserMinus,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { useMyStudents, useNovedadesMutations } from '@/hooks';
import type { NovedadType, AffectedRouteType } from '@/hooks';
import { cn } from '@/lib/utils';

// Novedad type options
const novedadTypes = [
  {
    value: 'absence' as NovedadType,
    label: 'Ausencia',
    description: 'Mi hijo no viajara en el bus',
    icon: UserMinus,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    value: 'parent_pickup' as NovedadType,
    label: 'Recoge padre',
    description: 'Recogere a mi hijo directamente',
    icon: Car,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    value: 'stop_change' as NovedadType,
    label: 'Cambio de parada',
    description: 'Parada diferente por este dia',
    icon: MapPin,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    value: 'early_pickup' as NovedadType,
    label: 'Salida temprana',
    description: 'Salida antes de la hora normal',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    value: 'late_arrival' as NovedadType,
    label: 'Llegada tarde',
    description: 'Llegara tarde al punto de recogida',
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

// Route type options
const routeTypes = [
  { value: 'pickup' as AffectedRouteType, label: 'Solo ida (casa a colegio)' },
  { value: 'dropoff' as AffectedRouteType, label: 'Solo vuelta (colegio a casa)' },
  { value: 'both' as AffectedRouteType, label: 'Ida y vuelta' },
];

function CreateNovedadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { students, isLoading: studentsLoading } = useMyStudents();
  const { createNovedad, isReady } = useNovedadesMutations();

  // Get studentId from URL if provided
  const preselectedStudentId = searchParams.get('studentId');

  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedType, setSelectedType] = useState<NovedadType | ''>('');
  const [selectedRouteType, setSelectedRouteType] = useState<AffectedRouteType>('both');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Pre-select student if provided in URL
  useEffect(() => {
    if (preselectedStudentId && students.length > 0 && !selectedStudent) {
      // Verify the student belongs to this parent
      const studentExists = students.some(s => s._id === preselectedStudentId);
      if (studentExists) {
        setSelectedStudent(preselectedStudentId);
      }
    }
  }, [preselectedStudentId, students, selectedStudent]);

  // Calculate min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // For stop changes, min date is 2 days from now
  const stopChangeMinDate = new Date();
  stopChangeMinDate.setDate(stopChangeMinDate.getDate() + 2);
  const minDateForStopChange = stopChangeMinDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStudent || !selectedType || !date || !reason.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    // Validate time for early_pickup/late_arrival
    if ((selectedType === 'early_pickup' || selectedType === 'late_arrival') && !time) {
      setError('Por favor indica la hora');
      return;
    }

    setIsSubmitting(true);

    try {
      await createNovedad({
        studentId: selectedStudent as any,
        type: selectedType,
        affectedRouteType: selectedRouteType,
        date,
        time: time || undefined,
        reason: reason.trim(),
      });

      router.push('/novedades');
    } catch (err: any) {
      setError(err.message || 'Error al crear la novedad');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/novedades"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Nueva Novedad</h1>
          <p className="text-sm text-gray-600 mt-1">
            Reporta una ausencia o cambio para tu hijo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona el estudiante *
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
                {selectedStudent === student._id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Novedad Type Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de novedad *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {novedadTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.value);
                    // Reset date if switching to/from stop_change
                    setDate('');
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                    selectedType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={cn('p-2 rounded-lg', type.bg)}>
                    <Icon className={cn('w-5 h-5', type.color)} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  <span className="text-xs text-gray-500 text-center">{type.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date and Route Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={selectedType === 'stop_change' ? minDateForStopChange : minDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            {selectedType === 'stop_change' && (
              <p className="text-xs text-amber-600 mt-1">
                Los cambios de parada requieren minimo 48 horas de anticipacion
              </p>
            )}
          </div>

          {/* Time input for early_pickup/late_arrival */}
          {(selectedType === 'early_pickup' || selectedType === 'late_arrival') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aplica a
            </label>
            <div className="space-y-2">
              {routeTypes.map((rt) => (
                <label
                  key={rt.value}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
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
        </div>

        {/* Reason */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe brevemente el motivo de la novedad..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/novedades"
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !isReady}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Crear Novedad'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateNovedadPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    }>
      <CreateNovedadForm />
    </Suspense>
  );
}
