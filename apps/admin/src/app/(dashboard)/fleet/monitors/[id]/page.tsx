'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Phone, Mail, MapPin, Loader2, Shield, Heart } from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';
import { useMonitor, useMonitorMutations, useRoutes } from '@/hooks';

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
 * Monitor Detail Page
 * Connected to real Convex data
 */
export default function MonitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const monitorId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { monitor, isLoading, notFound } = useMonitor(monitorId as any);
  const { deactivateMonitor } = useMonitorMutations();
  const { routes } = useRoutes();

  // Find assigned route
  const assignedRoute = routes.find(r => r.monitorId === monitorId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando monitor...</span>
      </div>
    );
  }

  if (notFound || !monitor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Monitor no encontrado</p>
        <Link href="/fleet?tab=monitors" className="text-primary hover:underline mt-2 inline-block">
          Volver a Monitores
        </Link>
      </div>
    );
  }

  const monitorStatus = monitor.isActive ? 'active' : 'inactive';
  const statusInfo = statusConfig[monitorStatus] ?? statusConfig.inactive;
  const monitorName = monitor.user?.name || 'Sin nombre';
  const monitorEmail = monitor.user?.email || '';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deactivateMonitor(monitorId as any);
      router.push('/fleet?tab=monitors');
    } catch (error) {
      console.error('Error deactivating monitor:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={monitorName}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Monitores', href: '/fleet?tab=monitors' },
          { label: monitorName },
        ]}
        backHref="/fleet?tab=monitors"
        badge={<StatusBadge status={statusInfo.status} label={statusInfo.label} />}
        actions={[
          {
            label: 'Editar',
            href: `/fleet/monitors/${monitorId}/edit`,
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
            <DetailItem label="Nombre Completo" value={monitorName} />
            <DetailItem label="Cédula" value={monitor.idNumber || '-'} />
            <DetailItem label="Email" value={monitorEmail || '-'} />
          </DetailGrid>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-900">{monitor.phone || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{monitorEmail || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Contacto Emergencia</p>
                <p className="text-sm font-medium text-gray-900 truncate">{monitor.emergencyContact || '-'}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Certificaciones */}
        <DetailSection title="Certificaciones">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${monitor.firstAidCertified ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Heart className={`w-5 h-5 ${monitor.firstAidCertified ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Primeros Auxilios</p>
                <p className="text-sm font-medium text-gray-900">
                  {monitor.firstAidCertified ? 'Certificado' : 'No certificado'}
                  {monitor.firstAidCertExpiry && ` (vence: ${formatDate(monitor.firstAidCertExpiry)})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${monitor.childCareCertified ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Shield className={`w-5 h-5 ${monitor.childCareCertified ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cuidado Infantil</p>
                <p className="text-sm font-medium text-gray-900">
                  {monitor.childCareCertified ? 'Certificado' : 'No certificado'}
                </p>
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
          Registrado el {formatDate(monitor.createdAt)}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Monitor"
        message={`¿Estás seguro de que deseas eliminar a ${monitorName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
