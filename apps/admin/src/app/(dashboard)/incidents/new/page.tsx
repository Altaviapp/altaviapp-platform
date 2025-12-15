'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useIncidentMutations, useTrips } from '@/hooks';
import type { IncidentType, IncidentSeverity } from '@/hooks';

const incidentTypes = [
  { value: 'accident', label: 'Accidente de tránsito' },
  { value: 'breakdown', label: 'Avería del vehículo' },
  { value: 'behavior', label: 'Comportamiento de estudiante' },
  { value: 'emergency', label: 'Emergencia médica' },
  { value: 'other', label: 'Otro' },
];

const severityLevels = [
  { value: 'low', label: 'Baja - Informativo' },
  { value: 'medium', label: 'Media - Requiere atención' },
  { value: 'high', label: 'Alta - Urgente' },
  { value: 'critical', label: 'Crítica - Emergencia' },
];

/**
 * New Incident Form - Inner component that uses useSearchParams
 * Connected to real Convex data
 */
function NewIncidentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real data from Convex
  const { trips } = useTrips();
  const { reportIncident } = useIncidentMutations();

  // Format trips for dropdown
  const tripOptions = trips.map((trip) => ({
    value: trip._id,
    label: `${trip.routeName || 'Viaje'} - ${new Date(trip.scheduledDate).toLocaleDateString('es-EC')}`,
  }));

  const [formData, setFormData] = useState({
    type: '' as IncidentType | '',
    severity: 'medium' as IncidentSeverity,
    title: '',
    description: '',
    tripId: tripIdParam || '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type) {
      setError('Por favor selecciona un tipo de incidente');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await reportIncident({
        type: formData.type as IncidentType,
        severity: formData.severity,
        title: formData.title,
        description: formData.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tripId: formData.tripId ? (formData.tripId as any) : undefined,
        location: formData.location || undefined,
      });
      router.push('/incidents');
    } catch (err) {
      console.error('Error creating incident:', err);
      setError(err instanceof Error ? err.message : 'Error al reportar el incidente');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/incidents');
  };

  return (
    <div>
      <PageHeader
        title="Reportar Incidente"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Incidentes', href: '/incidents' },
          { label: 'Nuevo Incidente' },
        ]}
        backHref="/incidents"
      />

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo y Severidad */}
        <FormSection
          title="Clasificación del Incidente"
          description="Selecciona el tipo y nivel de severidad del incidente"
        >
          <FormFieldRow cols={2}>
            <FormField
              label="Tipo de Incidente"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleChange('type')}
              options={incidentTypes}
              placeholder="Seleccionar tipo"
              required
            />
            <FormField
              label="Severidad"
              name="severity"
              type="select"
              value={formData.severity}
              onChange={handleChange('severity')}
              options={severityLevels}
              required
            />
          </FormFieldRow>

          <FormField
            label="Título del Incidente"
            name="title"
            value={formData.title}
            onChange={handleChange('title')}
            placeholder="Ej: Retraso por tráfico en Av. Principal"
            required
          />

          <FormField
            label="Descripción Detallada"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Describe lo que ocurrió con el mayor detalle posible..."
            required
          />
        </FormSection>

        {/* Ubicación y Tiempo */}
        <FormSection
          title="Ubicación y Tiempo"
          description="Indica cuándo y dónde ocurrió el incidente"
        >
          <FormFieldRow cols={3}>
            <FormField
              label="Fecha"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange('date')}
              required
            />
            <FormField
              label="Hora"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange('time')}
              required
            />
            <FormField
              label="Ubicación"
              name="location"
              value={formData.location}
              onChange={handleChange('location')}
              placeholder="Ej: Av. 10 de Agosto y Colón"
            />
          </FormFieldRow>
        </FormSection>

        {/* Viaje Relacionado */}
        <FormSection
          title="Viaje Relacionado"
          description="Asocia el incidente a un viaje específico (opcional)"
        >
          <FormField
            label="Viaje"
            name="tripId"
            type="select"
            value={formData.tripId}
            onChange={handleChange('tripId')}
            options={tripOptions}
            placeholder="Seleccionar viaje (opcional)"
            hint="Si el incidente ocurrió durante un viaje activo"
          />
        </FormSection>

        {/* Severity Warning */}
        {formData.severity === 'critical' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Has marcado este incidente como CRÍTICO
            </p>
            <p className="text-sm text-red-700 mt-1">
              Esto notificará inmediatamente a los administradores.
              Asegúrate de que la severidad es correcta antes de enviar.
            </p>
          </div>
        )}

        {formData.severity === 'high' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ Incidente de alta severidad
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Los incidentes de alta severidad requieren atención urgente y serán priorizados.
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Reportar Incidente"
            isLoading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}

/**
 * New Incident Page - Wrapper with Suspense for useSearchParams
 */
export default function NewIncidentPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8">Cargando formulario...</div>}>
      <NewIncidentForm />
    </Suspense>
  );
}
