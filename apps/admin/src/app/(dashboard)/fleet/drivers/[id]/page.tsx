'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Phone, Mail, MapPin, Calendar, Car, CreditCard, Loader2 } from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';
import { useDriver, useDriverMutations, useVehicles, useRoutes } from '@/hooks';

const statusConfig = {
  active: { label: 'Activo', status: 'active' as const },
  on_route: { label: 'En ruta', status: 'active' as const },
  available: { label: 'Disponible', status: 'pending' as const },
  inactive: { label: 'Inactivo', status: 'inactive' as const },
};

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('es-EC');
}

/**
 * Driver Detail Page
 * Connected to real Convex data
 */
export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const driverId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { driver, isLoading, notFound } = useDriver(driverId as any);
  const { deactivateDriver } = useDriverMutations();
  const { vehicles } = useVehicles();
  const { routes } = useRoutes();

  // Find assigned route (drivers don't have vehicleId in schema)
  const assignedRoute = routes.find(r => r.driverId === driverId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando conductor...</span>
      </div>
    );
  }

  if (notFound || !driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Conductor no encontrado</p>
        <Link href="/fleet?tab=drivers" className="text-primary hover:underline mt-2 inline-block">
          Volver a Conductores
        </Link>
      </div>
    );
  }

  const driverStatus = driver.isActive ? 'active' : 'inactive';
  const statusInfo = statusConfig[driverStatus] ?? statusConfig.inactive;
  const driverName = driver.user?.name || 'Sin nombre';
  const driverEmail = driver.user?.email || '';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deactivateDriver(driverId as any);
      router.push('/fleet?tab=drivers');
    } catch (error) {
      console.error('Error deactivating driver:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={driverName}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Conductores', href: '/fleet?tab=drivers' },
          { label: driverName },
        ]}
        backHref="/fleet?tab=drivers"
        badge={<StatusBadge status={statusInfo.status} label={statusInfo.label} />}
        actions={[
          {
            label: 'Editar',
            href: `/fleet/drivers/${driverId}/edit`,
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
        {/* Información Personal */}
        <DetailSection title="Información Personal">
          <DetailGrid cols={3}>
            <DetailItem label="Nombre Completo" value={driverName} />
            <DetailItem label="Email" value={driverEmail || '-'} />
          </DetailGrid>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-900">{driver.phone || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{driverEmail || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Contacto Emergencia</p>
                <p className="text-sm font-medium text-gray-900 truncate">{driver.emergencyContact || '-'}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Licencia de Conducir */}
        <DetailSection title="Licencia de Conducir">
          <DetailGrid cols={2}>
            <DetailItem label="Número de Licencia" value={driver.licenseNumber || '-'} />
          </DetailGrid>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de Vencimiento</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(driver.licenseExpiry)}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Asignaciones */}
        <DetailSection title="Asignaciones">
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
                <span className="text-gray-400">Sin ruta asignada</span>
              )
            }
          />
        </DetailSection>

        {/* Metadata */}
        <div className="text-xs text-gray-400 text-right">
          Registrado el {formatDate(driver.createdAt)}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Conductor"
        message={`¿Estás seguro de que deseas eliminar a ${driverName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
