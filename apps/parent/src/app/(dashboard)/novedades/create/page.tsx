'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserMinus,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useMyStudents, useNovedadesMutations } from '@/hooks';
import type { NovedadType, AffectedRouteType } from '@/hooks';
import { cn } from '@/lib/utils';
import { LoadingState, Card, CardContent, Button, Input, Textarea } from '@/components/core';
import { PageHeader } from '@/components/shared';

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

  // Get context from URL params
  const preselectedStudentId = searchParams.get('studentId');
  const preselectedDate = searchParams.get('date');
  const preselectedRouteType = searchParams.get('routeType') as AffectedRouteType | null;

  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedType, setSelectedType] = useState<NovedadType | ''>('');
  const [selectedRouteType, setSelectedRouteType] = useState<AffectedRouteType>('both');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Pre-fill form from URL params
  useEffect(() => {
    if (students.length > 0) {
      // Pre-select student if provided in URL
      if (preselectedStudentId && !selectedStudent) {
        const studentExists = students.some(s => s._id === preselectedStudentId);
        if (studentExists) {
          setSelectedStudent(preselectedStudentId);
        }
      }

      // Pre-fill date if provided
      if (preselectedDate && !date) {
        setDate(preselectedDate);
      }

      // Pre-fill route type if provided
      if (preselectedRouteType && ['pickup', 'dropoff', 'both'].includes(preselectedRouteType)) {
        setSelectedRouteType(preselectedRouteType);
      }
    }
  }, [preselectedStudentId, preselectedDate, preselectedRouteType, students, selectedStudent, date]);

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

      router.push('/inicio');
    } catch (err: any) {
      setError(err.message || 'Error al crear la novedad');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (studentsLoading) {
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
        {/* Student Selection */}
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
                  {selectedStudent === student._id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Novedad Type Selection */}
        <Card>
          <CardContent>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de novedad <span className="text-red-500">*</span>
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
          </CardContent>
        </Card>

        {/* Date and Route Type */}
        <Card>
          <CardContent className="space-y-4">
            <Input
              type="date"
              label="Fecha"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={selectedType === 'stop_change' ? minDateForStopChange : minDate}
              required
              hint={selectedType === 'stop_change' ? 'Los cambios de parada requieren mínimo 48 horas de anticipación' : undefined}
            />

            {/* Time input for early_pickup/late_arrival */}
            {(selectedType === 'early_pickup' || selectedType === 'late_arrival') && (
              <Input
                type="time"
                label="Hora"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
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
          </CardContent>
        </Card>

        {/* Reason */}
        <Card>
          <CardContent>
            <Textarea
              label="Motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe brevemente el motivo de la novedad..."
              rows={3}
              required
            />
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
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
            disabled={!isReady}
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
    <Suspense fallback={
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Nueva Novedad"
          subtitle="Reporta una ausencia o cambio para tu hijo"
          backHref="/novedades"
        />
        <LoadingState message="Cargando..." />
      </div>
    }>
      <CreateNovedadForm />
    </Suspense>
  );
}
