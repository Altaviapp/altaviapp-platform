'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useRoute, useRouteMutations, useVehicles, useDrivers, useMonitors } from '@/hooks';

const routeTypes = [
  { value: 'pickup', label: 'Recogida (Recoger estudiantes)' },
  { value: 'dropoff', label: 'Entrega (Dejar estudiantes)' },
];

interface StopFormData {
  id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  scheduledTime: string;
  order: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

/**
 * Edit Route Page
 * Connected to real Convex data
 */
export default function EditRoutePage() {
  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as 'pickup' | 'dropoff' | '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    vehicleId: '',
    driverId: '',
    monitorId: '',
    isActive: true,
  });
  const [stops, setStops] = useState<StopFormData[]>([]);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { route, isLoading, notFound } = useRoute(routeId as any);
  const { updateRoute, createStop, updateStop, deleteStop } = useRouteMutations();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { monitors } = useMonitors();

  // Build options for dropdowns
  const vehicleOptions = vehicles.map(v => ({
    value: v._id,
    label: `${v.licensePlate} - ${v.brand} ${v.model} (${v.capacity} pasajeros)`,
  }));

  const driverOptions = drivers.map(d => ({
    value: d._id,
    label: d.user?.name || 'Sin nombre',
  }));

  const monitorOptions = [
    { value: '', label: 'Sin monitor asignado' },
    ...monitors.map(m => ({
      value: m._id,
      label: m.user?.name || 'Sin nombre',
    })),
  ];

  // Load route data into form
  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name,
        type: route.type,
        scheduledStartTime: route.scheduledStartTime,
        scheduledEndTime: route.scheduledEndTime,
        vehicleId: route.vehicleId,
        driverId: route.driverId,
        monitorId: route.monitorId || '',
        isActive: route.isActive,
      });

      // Load stops
      if (route.stops) {
        setStops(route.stops.map(s => ({
          id: s._id,
          name: s.name,
          address: s.address,
          latitude: s.latitude.toString(),
          longitude: s.longitude.toString(),
          scheduledTime: s.scheduledTime,
          order: s.order,
        })));
      }
    }
  }, [route]);

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        scheduledTime: '',
        order: prev.length + 1,
        isNew: true,
      },
    ]);
  };

  const removeStop = (stopId: string) => {
    setStops((prev) =>
      prev.map((s) =>
        s.id === stopId ? { ...s, isDeleted: true } : s
      ).filter((s) => !s.isNew || !s.isDeleted)
    );
  };

  const updateStopField = (stopId: string, field: string, value: string | number) => {
    setStops((prev) =>
      prev.map((s) => (s.id === stopId ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Update route basic info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateRoute(routeId as any, {
        name: formData.name,
        type: formData.type as 'pickup' | 'dropoff',
        scheduledStartTime: formData.scheduledStartTime,
        scheduledEndTime: formData.scheduledEndTime,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vehicleId: formData.vehicleId as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        driverId: formData.driverId as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        monitorId: formData.monitorId ? (formData.monitorId as any) : undefined,
        isActive: formData.isActive,
      });

      // Handle stop changes
      for (const stop of stops) {
        if (stop.isDeleted && !stop.isNew) {
          // Delete existing stop
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await deleteStop(stop.id as any);
        } else if (stop.isNew && !stop.isDeleted) {
          // Create new stop
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await createStop(routeId as any, {
            name: stop.name,
            address: stop.address,
            latitude: parseFloat(stop.latitude) || 0,
            longitude: parseFloat(stop.longitude) || 0,
            scheduledTime: stop.scheduledTime,
            order: stop.order,
          });
        } else if (!stop.isNew && !stop.isDeleted) {
          // Update existing stop
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await updateStop(stop.id as any, {
            name: stop.name,
            address: stop.address,
            latitude: parseFloat(stop.latitude) || 0,
            longitude: parseFloat(stop.longitude) || 0,
            scheduledTime: stop.scheduledTime,
            order: stop.order,
          });
        }
      }

      router.push(`/routes/${routeId}`);
    } catch (err) {
      console.error('Error updating route:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la ruta');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/routes/${routeId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando ruta...</span>
      </div>
    );
  }

  if (notFound || !route) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ruta no encontrada</p>
        <Link href="/routes" className="text-primary hover:underline mt-2 inline-block">
          Volver a Rutas
        </Link>
      </div>
    );
  }

  const visibleStops = stops.filter(s => !s.isDeleted);

  return (
    <div>
      <PageHeader
        title={`Editar ${route.name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rutas', href: '/routes' },
          { label: route.name, href: `/routes/${routeId}` },
          { label: 'Editar' },
        ]}
        backHref={`/routes/${routeId}`}
      />

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <FormSection title="Información Básica">
          <FormField
            label="Nombre de la Ruta"
            name="name"
            value={formData.name}
            onChange={handleChange('name')}
            required
          />

          <FormFieldRow cols={3}>
            <FormField
              label="Tipo de Ruta"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleChange('type')}
              options={routeTypes}
              required
            />
            <FormField
              label="Hora de Inicio"
              name="scheduledStartTime"
              type="time"
              value={formData.scheduledStartTime}
              onChange={handleChange('scheduledStartTime')}
              required
            />
            <FormField
              label="Hora de Fin"
              name="scheduledEndTime"
              type="time"
              value={formData.scheduledEndTime}
              onChange={handleChange('scheduledEndTime')}
              required
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
              options={vehicleOptions}
              required
            />
            <FormField
              label="Conductor Asignado"
              name="driverId"
              type="select"
              value={formData.driverId}
              onChange={handleChange('driverId')}
              options={driverOptions}
              required
            />
          </FormFieldRow>

          <FormField
            label="Monitor (Opcional)"
            name="monitorId"
            type="select"
            value={formData.monitorId}
            onChange={handleChange('monitorId')}
            options={monitorOptions}
          />
        </FormSection>

        {/* Paradas */}
        <FormSection title="Paradas (Orden de recorrido)">
          {visibleStops.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay paradas configuradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleStops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {stop.name || 'Nueva Parada'}
                      </span>
                      {stop.isNew && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          Nueva
                        </span>
                      )}
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
                      label="Nombre"
                      name={`stop-${stop.id}-name`}
                      value={stop.name}
                      onChange={(value) => updateStopField(stop.id, 'name', value)}
                      required
                    />
                    <FormField
                      label="Dirección"
                      name={`stop-${stop.id}-address`}
                      value={stop.address}
                      onChange={(value) => updateStopField(stop.id, 'address', value)}
                      required
                    />
                  </FormFieldRow>

                  <FormFieldRow cols={3}>
                    <FormField
                      label="Latitud"
                      name={`stop-${stop.id}-lat`}
                      value={stop.latitude}
                      onChange={(value) => updateStopField(stop.id, 'latitude', value)}
                      placeholder="-0.2298"
                    />
                    <FormField
                      label="Longitud"
                      name={`stop-${stop.id}-lng`}
                      value={stop.longitude}
                      onChange={(value) => updateStopField(stop.id, 'longitude', value)}
                      placeholder="-78.5249"
                    />
                    <FormField
                      label="Hora Programada"
                      name={`stop-${stop.id}-time`}
                      type="time"
                      value={stop.scheduledTime}
                      onChange={(value) => updateStopField(stop.id, 'scheduledTime', value)}
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

        {/* Estado */}
        <FormSection title="Estado">
          <FormField
            label="Estado de la Ruta"
            name="isActive"
            type="select"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(val) => setFormData(prev => ({ ...prev, isActive: val === 'active' }))}
            options={[
              { value: 'active', label: 'Activa' },
              { value: 'inactive', label: 'Inactiva' },
            ]}
            required
          />
        </FormSection>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Cambios"
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
