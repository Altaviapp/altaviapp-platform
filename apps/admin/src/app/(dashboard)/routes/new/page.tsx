'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';

// Mock data
const mockVehicles = [
  { value: '1', label: 'ABC-1234 - Toyota Coaster (30 pasajeros)' },
  { value: '2', label: 'XYZ-5678 - Mitsubishi Rosa (25 pasajeros)' },
  { value: '3', label: 'DEF-9012 - Hino Dutro (35 pasajeros)' },
];

const mockDrivers = [
  { value: '1', label: 'Juan Pérez' },
  { value: '2', label: 'María González' },
  { value: '3', label: 'Carlos Ruiz' },
];

const routeTypes = [
  { value: 'ida', label: 'Ida (Recoger estudiantes)' },
  { value: 'retorno', label: 'Retorno (Dejar estudiantes)' },
  { value: 'ambas', label: 'Ambas (Ida y retorno)' },
];

const weekDays = [
  { id: 'monday', label: 'Lun' },
  { id: 'tuesday', label: 'Mar' },
  { id: 'wednesday', label: 'Mié' },
  { id: 'thursday', label: 'Jue' },
  { id: 'friday', label: 'Vie' },
  { id: 'saturday', label: 'Sáb' },
  { id: 'sunday', label: 'Dom' },
];

interface Stop {
  id: string;
  name: string;
  reference: string;
  latitude: string;
  longitude: string;
  estimatedTime: string;
  students: string;
}

/**
 * New Route Page
 * Based on ADMIN_WIREFRAMES.md Section 3.2
 */
export default function NewRoutePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    startTime: '',
    estimatedDuration: '',
    vehicleId: '',
    driverId: '',
    status: 'active',
  });

  const [operationDays, setOperationDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const [stops, setStops] = useState<Stop[]>([]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setOperationDays((prev) => ({ ...prev, [day]: !prev[day as keyof typeof prev] }));
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        reference: '',
        latitude: '',
        longitude: '',
        estimatedTime: '5',
        students: '0',
      },
    ]);
  };

  const removeStop = (stopId: string) => {
    setStops((prev) => prev.filter((s) => s.id !== stopId));
  };

  const updateStop = (stopId: string, field: string, value: string) => {
    setStops((prev) =>
      prev.map((s) => (s.id === stopId ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/routes');
  };

  const handleCancel = () => {
    router.push('/routes');
  };

  return (
    <div>
      <PageHeader
        title="Nueva Ruta"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rutas', href: '/routes' },
          { label: 'Nueva Ruta' },
        ]}
        backHref="/routes"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <FormSection title="Información Básica">
          <FormField
            label="Nombre de la Ruta"
            name="name"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Ej: Ruta Centro - Escuela A"
            required
          />

          <FormField
            label="Descripción"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Descripción de la ruta, zonas que cubre, etc."
          />

          <FormFieldRow cols={3}>
            <FormField
              label="Tipo de Ruta"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleChange('type')}
              options={routeTypes}
              placeholder="Seleccionar tipo"
              required
            />
            <FormField
              label="Hora de Inicio"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange('startTime')}
              required
            />
            <FormField
              label="Duración Estimada (min)"
              name="estimatedDuration"
              type="number"
              value={formData.estimatedDuration}
              onChange={handleChange('estimatedDuration')}
              placeholder="Ej: 45"
            />
          </FormFieldRow>
        </FormSection>

        {/* Asignaciones */}
        <FormSection title="Asignaciones">
          <FormFieldRow cols={2}>
            <FormField
              label="Vehículo Asignado"
              name="vehicleId"
              type="select"
              value={formData.vehicleId}
              onChange={handleChange('vehicleId')}
              options={mockVehicles}
              placeholder="Seleccionar vehículo"
              required
            />
            <FormField
              label="Conductor Asignado"
              name="driverId"
              type="select"
              value={formData.driverId}
              onChange={handleChange('driverId')}
              options={mockDrivers}
              placeholder="Seleccionar conductor"
              required
            />
          </FormFieldRow>
        </FormSection>

        {/* Paradas */}
        <FormSection
          title="Paradas (Orden de recorrido)"
          description="Agregue las paradas en el orden en que serán visitadas"
        >
          {stops.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay paradas configuradas</p>
              <p className="text-sm">Haga clic en el botón para agregar paradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {stop.name || 'Nueva Parada'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <FormFieldRow cols={2}>
                    <FormField
                      label="Nombre de la Parada"
                      name={`stop-${stop.id}-name`}
                      value={stop.name}
                      onChange={(value) => updateStop(stop.id, 'name', value)}
                      placeholder="Ej: Centro Comercial"
                      required
                    />
                    <FormField
                      label="Referencia"
                      name={`stop-${stop.id}-reference`}
                      value={stop.reference}
                      onChange={(value) => updateStop(stop.id, 'reference', value)}
                      placeholder="Ej: Frente al parque"
                    />
                  </FormFieldRow>

                  <FormFieldRow cols={4}>
                    <FormField
                      label="Latitud"
                      name={`stop-${stop.id}-lat`}
                      value={stop.latitude}
                      onChange={(value) => updateStop(stop.id, 'latitude', value)}
                      placeholder="-0.2298"
                    />
                    <FormField
                      label="Longitud"
                      name={`stop-${stop.id}-lng`}
                      value={stop.longitude}
                      onChange={(value) => updateStop(stop.id, 'longitude', value)}
                      placeholder="-78.5249"
                    />
                    <FormField
                      label="Tiempo (min)"
                      name={`stop-${stop.id}-time`}
                      type="number"
                      value={stop.estimatedTime}
                      onChange={(value) => updateStop(stop.id, 'estimatedTime', value)}
                    />
                    <FormField
                      label="Estudiantes"
                      name={`stop-${stop.id}-students`}
                      type="number"
                      value={stop.students}
                      onChange={(value) => updateStop(stop.id, 'students', value)}
                    />
                  </FormFieldRow>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addStop}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary/80 border border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Parada
          </button>
        </FormSection>

        {/* Configuración */}
        <FormSection title="Configuración">
          <FormField
            label="Estado"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange('status')}
            options={[
              { value: 'active', label: 'Activa' },
              { value: 'inactive', label: 'Inactiva' },
            ]}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Días de Operación *
            </label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    operationDays[day.id as keyof typeof operationDays]
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Ruta"
            isLoading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
