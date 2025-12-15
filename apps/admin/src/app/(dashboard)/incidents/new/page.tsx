'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

// Mock data for selects
const mockRoutes = [
  { value: '1', label: 'Ruta Centro - Escuela A' },
  { value: '2', label: 'Ruta Norte - Escuela B' },
  { value: '3', label: 'Ruta Sur - Escuela A' },
  { value: '4', label: 'Ruta Oeste - Escuela D' },
];

const mockTrips = [
  { value: '1', label: 'Viaje #1 - Ruta Centro (04/12/2024 07:00)' },
  { value: '2', label: 'Viaje #2 - Ruta Norte (04/12/2024 06:30)' },
  { value: '3', label: 'Viaje #3 - Ruta Sur (04/12/2024 06:45)' },
  { value: '4', label: 'Viaje #4 - Ruta Oeste (04/12/2024 07:15)' },
];

const mockDrivers = [
  { value: '1', label: 'Juan Pérez' },
  { value: '2', label: 'María González' },
  { value: '3', label: 'Carlos Ruiz' },
  { value: '4', label: 'Pedro Gómez' },
];

const mockMonitors = [
  { value: '1', label: 'Ana Torres' },
  { value: '2', label: 'Laura Sánchez' },
  { value: '3', label: 'Pedro Gómez' },
];

const mockVehicles = [
  { value: '1', label: 'ABC-1234 - Toyota Coaster' },
  { value: '2', label: 'DEF-9012 - Mitsubishi Rosa' },
  { value: '3', label: 'JKL-7890 - Hino Dutro' },
];

const mockStudents = [
  { value: '1', label: 'Juan Pérez González - 5to B' },
  { value: '2', label: 'Ana Torres Martínez - 4to C' },
  { value: '3', label: 'María García López - 4to B' },
  { value: '5', label: 'María García - 4to B' },
  { value: '8', label: 'Diego López - 6to A' },
];

const incidentTypes = [
  { value: 'delay', label: 'Retraso' },
  { value: 'student', label: 'Estudiante (ausencia, comportamiento)' },
  { value: 'medical', label: 'Médico / Emergencia' },
  { value: 'route', label: 'Ruta (calle cerrada, desvío)' },
  { value: 'accident', label: 'Accidente de tránsito' },
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
 */
function NewIncidentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId');

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    severity: 'medium',
    title: '',
    description: '',
    routeId: '',
    tripId: tripIdParam || '',
    driverId: '',
    monitorId: '',
    vehicleId: '',
    studentId: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: '',
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/incidents');
  };

  const handleCancel = () => {
    router.push('/incidents');
  };

  // Show student field only for certain incident types
  const showStudentField = ['student', 'medical'].includes(formData.type);

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

        {/* Asociaciones */}
        <FormSection
          title="Viaje / Ruta Relacionada"
          description="Asocia el incidente a un viaje o ruta específica (opcional)"
        >
          <FormFieldRow cols={2}>
            <FormField
              label="Viaje"
              name="tripId"
              type="select"
              value={formData.tripId}
              onChange={handleChange('tripId')}
              options={mockTrips}
              placeholder="Seleccionar viaje"
              hint="Si el incidente ocurrió durante un viaje activo"
            />
            <FormField
              label="Ruta"
              name="routeId"
              type="select"
              value={formData.routeId}
              onChange={handleChange('routeId')}
              options={mockRoutes}
              placeholder="Seleccionar ruta"
            />
          </FormFieldRow>
        </FormSection>

        {/* Personal y Vehículo */}
        <FormSection
          title="Personal Involucrado"
          description="Indica quiénes estaban presentes durante el incidente"
        >
          <FormFieldRow cols={3}>
            <FormField
              label="Conductor"
              name="driverId"
              type="select"
              value={formData.driverId}
              onChange={handleChange('driverId')}
              options={mockDrivers}
              placeholder="Seleccionar conductor"
            />
            <FormField
              label="Monitor"
              name="monitorId"
              type="select"
              value={formData.monitorId}
              onChange={handleChange('monitorId')}
              options={mockMonitors}
              placeholder="Seleccionar monitor"
            />
            <FormField
              label="Vehículo"
              name="vehicleId"
              type="select"
              value={formData.vehicleId}
              onChange={handleChange('vehicleId')}
              options={mockVehicles}
              placeholder="Seleccionar vehículo"
            />
          </FormFieldRow>

          {showStudentField && (
            <FormField
              label="Estudiante Afectado"
              name="studentId"
              type="select"
              value={formData.studentId}
              onChange={handleChange('studentId')}
              options={mockStudents}
              placeholder="Seleccionar estudiante"
              required={showStudentField}
            />
          )}
        </FormSection>

        {/* Notas Adicionales */}
        <FormSection
          title="Información Adicional"
          description="Cualquier nota o comentario relevante"
        >
          <FormField
            label="Notas"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Agrega cualquier información adicional que pueda ser útil..."
          />

          {/* Severity Warning */}
          {formData.severity === 'critical' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Has marcado este incidente como CRÍTICO
              </p>
              <p className="text-sm text-red-700 mt-1">
                Esto notificará inmediatamente a los administradores y padres involucrados.
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
        </FormSection>

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
