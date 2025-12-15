'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Loader2, Bus, Smartphone, Satellite, Cloud } from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';
import { useVehicle, useVehicleMutations, useRoutes } from '@/hooks';

const statusConfig = {
  active: { label: 'Activo', status: 'active' as const },
  maintenance: { label: 'Mantenimiento', status: 'warning' as const },
  out_of_service: { label: 'Fuera de Servicio', status: 'inactive' as const },
};

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('es-EC');
}

/**
 * Vehicle Detail Page
 * Connected to real Convex data
 */
export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { vehicle, isLoading, notFound } = useVehicle(vehicleId as any);
  const { deactivateVehicle } = useVehicleMutations();
  const { routes } = useRoutes();

  // Find assigned route for this vehicle
  const assignedRoute = routes.find(r => r.vehicleId === vehicleId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando vehículo...</span>
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehículo no encontrado</p>
        <Link href="/fleet" className="text-primary hover:underline mt-2 inline-block">
          Volver a Flota
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[vehicle.status ?? 'active'] ?? statusConfig.active;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deactivateVehicle(vehicleId as any);
      router.push('/fleet');
    } catch (error) {
      console.error('Error deactivating vehicle:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Vehículo ${vehicle.licensePlate}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: vehicle.licensePlate },
        ]}
        backHref="/fleet"
        badge={<StatusBadge status={statusInfo.status} label={statusInfo.label} />}
        actions={[
          {
            label: 'Editar',
            href: `/fleet/vehicles/${vehicleId}/edit`,
            icon: Edit,
            variant: 'secondary',
          },
          {
            label: 'Eliminar',
            onClick: () => setShowDeleteDialog(true),
            icon: Trash2,
            variant: 'danger',
          },
        ]}
      />

      <div className="space-y-6">
        {/* Información General */}
        <DetailSection title="Información General">
          <DetailGrid cols={3}>
            <DetailItem label="Placa" value={vehicle.licensePlate} />
            <DetailItem label="Marca" value={vehicle.brand} />
            <DetailItem label="Modelo" value={vehicle.model} />
            <DetailItem label="Año" value={vehicle.year} />
            <DetailItem label="Color" value={vehicle.color} />
            <DetailItem label="Capacidad" value={`${vehicle.capacity} pasajeros`} />
          </DetailGrid>
        </DetailSection>

        {/* Estado */}
        <DetailSection title="Estado del Vehículo">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className={`p-3 rounded-lg ${statusInfo.status === 'active' ? 'bg-green-100' : statusInfo.status === 'warning' ? 'bg-amber-100' : 'bg-gray-100'}`}>
              <Bus className={`w-6 h-6 ${statusInfo.status === 'active' ? 'text-green-600' : statusInfo.status === 'warning' ? 'text-amber-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado Actual</p>
              <p className="text-lg font-medium text-gray-900">{statusInfo.label}</p>
            </div>
          </div>
        </DetailSection>

        {/* Asignaciones */}
        <DetailSection title="Asignaciones">
          <DetailGrid cols={2}>
            <DetailItem
              label="Ruta Asignada"
              value={
                assignedRoute ? (
                  <Link
                    href={`/routes/${assignedRoute._id}`}
                    className="text-primary hover:underline"
                  >
                    {assignedRoute.name}
                  </Link>
                ) : (
                  <span className="text-gray-400">Sin asignar</span>
                )
              }
            />
          </DetailGrid>
        </DetailSection>

        {/* GPS Configuration */}
        <DetailSection title="Configuración GPS">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {vehicle.gpsSourceType === 'mobile' || !vehicle.gpsSourceType ? (
                <>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">GPS Móvil</p>
                    <p className="text-sm text-gray-500">Tracking desde el celular del conductor</p>
                  </div>
                </>
              ) : vehicle.gpsSourceType === 'device' ? (
                <>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Satellite className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dispositivo GPS</p>
                    <p className="text-sm text-gray-500">GPS instalado en el vehículo</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Cloud className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">API Externa</p>
                    <p className="text-sm text-gray-500">Integración con servicio GPS externo</p>
                  </div>
                </>
              )}
            </div>

            {vehicle.gpsDeviceConfig && (
              <DetailGrid cols={2}>
                <DetailItem label="ID Dispositivo" value={vehicle.gpsDeviceConfig.deviceId || '-'} />
                <DetailItem label="Proveedor" value={vehicle.gpsDeviceConfig.provider || '-'} />
                <DetailItem
                  label="Fallback a Móvil"
                  value={vehicle.gpsDeviceConfig.fallbackToMobile ? 'Activado' : 'Desactivado'}
                />
              </DetailGrid>
            )}
          </div>
        </DetailSection>

        {/* Metadata */}
        <div className="text-xs text-gray-400 text-right">
          Creado el {formatDate(vehicle.createdAt)}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Vehículo"
        message={`¿Estás seguro de que deseas eliminar el vehículo ${vehicle.licensePlate}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
