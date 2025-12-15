'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, MapPin, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { FormSection, FormField, FormFieldRow, FormActions } from '@/components/forms';
import { useRouteMutations, useVehicles, useDrivers, useMonitors } from '@/hooks';

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
  googleMapsInput: string;
}

/**
 * Parse Google Maps URL or coordinates to extract lat/lng
 * Supports:
 * - https://maps.google.com/?q=-0.2298,-78.5249
 * - https://www.google.com/maps/place/.../@-0.2298,-78.5249,17z/...
 * - https://goo.gl/maps/... (will show message to use full URL)
 * - -0.2298, -78.5249 (plain coordinates)
 * - -0.2298,-78.5249 (no space)
 */
function parseGoogleMapsInput(input: string): { lat: string; lng: string; address?: string } | null {
  const trimmed = input.trim();

  // Try to extract from Google Maps URL with @ sign (most common format)
  // Example: https://www.google.com/maps/place/Quito/@-0.1806532,-78.4678382,17z/
  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return { lat: atMatch[1] || '', lng: atMatch[2] || '' };
  }

  // Try to extract from Google Maps URL with ?q= parameter
  // Example: https://maps.google.com/?q=-0.2298,-78.5249
  const qMatch = trimmed.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    return { lat: qMatch[1] || '', lng: qMatch[2] || '' };
  }

  // Try to extract from Google Maps URL with ll= parameter
  const llMatch = trimmed.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) {
    return { lat: llMatch[1] || '', lng: llMatch[2] || '' };
  }

  // Try plain coordinates (comma separated, with optional space)
  // Example: -0.2298, -78.5249 or -0.2298,-78.5249
  const coordMatch = trimmed.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return { lat: coordMatch[1] || '', lng: coordMatch[2] || '' };
  }

  // Try to extract from any URL with coordinates pattern
  const urlCoordMatch = trimmed.match(/(-?\d+\.\d{4,}),\s*(-?\d+\.\d{4,})/);
  if (urlCoordMatch) {
    return { lat: urlCoordMatch[1] || '', lng: urlCoordMatch[2] || '' };
  }

  return null;
}

/**
 * New Route Page
 * Connected to real Convex data
 */
export default function NewRoutePage() {
  const router = useRouter();
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
  });

  const [stops, setStops] = useState<StopFormData[]>([]);

  // Real data from Convex
  const { createRoute, createStop } = useRouteMutations();
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

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        scheduledTime: '',
        googleMapsInput: '',
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

  const handleGoogleMapsInput = (stopId: string, input: string) => {
    // Update the input field
    updateStop(stopId, 'googleMapsInput', input);

    // Try to parse coordinates
    const result = parseGoogleMapsInput(input);
    if (result) {
      setStops((prev) =>
        prev.map((s) =>
          s.id === stopId
            ? { ...s, latitude: result.lat, longitude: result.lng }
            : s
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create route
      const result = await createRoute({
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
      });

      // Create stops if any
      if (result.routeId && stops.length > 0) {
        for (let i = 0; i < stops.length; i++) {
          const stop = stops[i];
          if (!stop) continue;
          await createStop(result.routeId, {
            name: stop.name,
            address: stop.address,
            latitude: parseFloat(stop.latitude) || 0,
            longitude: parseFloat(stop.longitude) || 0,
            scheduledTime: stop.scheduledTime,
            order: i + 1,
          });
        }
      }

      router.push('/routes');
    } catch (err) {
      console.error('Error creating route:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la ruta');
      setIsSubmitting(false);
    }
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
            placeholder="Ej: Ruta Centro - Escuela A"
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
              placeholder="Seleccionar tipo"
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
              placeholder="Seleccionar vehículo"
              required
            />
            <FormField
              label="Conductor Asignado"
              name="driverId"
              type="select"
              value={formData.driverId}
              onChange={handleChange('driverId')}
              options={driverOptions}
              placeholder="Seleccionar conductor"
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
                      label="Dirección"
                      name={`stop-${stop.id}-address`}
                      value={stop.address}
                      onChange={(value) => updateStop(stop.id, 'address', value)}
                      placeholder="Ej: Av. Principal 123"
                      required
                    />
                  </FormFieldRow>

                  {/* Google Maps URL/Coordinates Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Pegar enlace de Google Maps o coordenadas
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={stop.googleMapsInput}
                        onChange={(e) => handleGoogleMapsInput(stop.id, e.target.value)}
                        placeholder="https://maps.google.com/... o -0.2298, -78.5249"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      {stop.latitude && stop.longitude && stop.googleMapsInput && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Copia el enlace de Google Maps o las coordenadas y pégalas aquí
                    </p>
                  </div>

                  <FormFieldRow cols={3}>
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
                      label="Hora Programada"
                      name={`stop-${stop.id}-time`}
                      type="time"
                      value={stop.scheduledTime}
                      onChange={(value) => updateStop(stop.id, 'scheduledTime', value)}
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

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">* Campos obligatorios</p>
          <FormActions
            onCancel={handleCancel}
            submitLabel="Guardar Ruta"
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
