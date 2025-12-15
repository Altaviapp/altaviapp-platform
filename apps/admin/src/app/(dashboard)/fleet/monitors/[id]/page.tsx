'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';

// Mock monitor data
const mockMonitors: Record<string, {
  id: string;
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'on_route' | 'available' | 'inactive';
  route: { id: string; name: string } | null;
  emergencyContact: { name: string; relation: string; phone: string } | null;
  createdAt: string;
}> = {
  '1': {
    id: '1',
    firstName: 'Laura',
    lastName: 'Sánchez',
    cedula: '1111222233',
    birthDate: '10/03/1992',
    phone: '+593 99 111 2222',
    email: 'laura.sanchez@email.com',
    address: 'Calle Los Pinos 45, Quito',
    status: 'on_route',
    route: { id: '1', name: 'Ruta Centro' },
    emergencyContact: { name: 'Pedro Sánchez', relation: 'Padre', phone: '+593 98 333 4444' },
    createdAt: '05/06/2023',
  },
  '2': {
    id: '2',
    firstName: 'Pedro',
    lastName: 'Gómez',
    cedula: '4444555566',
    birthDate: '25/11/1988',
    phone: '+593 98 333 4444',
    email: 'pedro.gomez@email.com',
    address: 'Av. Amazonas 789, Quito',
    status: 'on_route',
    route: { id: '2', name: 'Ruta Norte' },
    emergencyContact: { name: 'Ana Gómez', relation: 'Esposa', phone: '+593 97 555 6666' },
    createdAt: '12/02/2023',
  },
};

const statusConfig = {
  active: { label: 'Activo', status: 'active' as const },
  on_route: { label: 'En ruta', status: 'active' as const },
  available: { label: 'Disponible', status: 'pending' as const },
  inactive: { label: 'Inactivo', status: 'inactive' as const },
};

/**
 * Monitor Detail Page
 */
export default function MonitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const monitorId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const monitor = mockMonitors[monitorId];

  if (!monitor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Monitor no encontrado</p>
      </div>
    );
  }

  const statusInfo = statusConfig[monitor.status];

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/fleet?tab=monitors');
  };

  return (
    <div>
      <PageHeader
        title={`${monitor.firstName} ${monitor.lastName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Monitores', href: '/fleet?tab=monitors' },
          { label: `${monitor.firstName} ${monitor.lastName}` },
        ]}
        backHref="/fleet?tab=monitors"
        badge={<StatusBadge status={statusInfo.status} label={statusInfo.label} />}
        actions={[
          {
            label: 'Editar',
            href: `/fleet/monitors/${monitor.id}/edit`,
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
            <DetailItem label="Nombres" value={monitor.firstName} />
            <DetailItem label="Apellidos" value={monitor.lastName} />
            <DetailItem label="Cédula" value={monitor.cedula} />
            <DetailItem label="Fecha de Nacimiento" value={monitor.birthDate} />
          </DetailGrid>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-900">{monitor.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{monitor.email || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dirección</p>
                <p className="text-sm font-medium text-gray-900 truncate">{monitor.address || '-'}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Asignaciones */}
        <DetailSection title="Asignaciones">
          <DetailItem
            label="Ruta Asignada"
            value={
              monitor.route ? (
                <a
                  href={`/routes/${monitor.route.id}`}
                  className="text-primary hover:underline"
                >
                  {monitor.route.name}
                </a>
              ) : (
                <span className="text-gray-400">Sin ruta asignada</span>
              )
            }
          />
        </DetailSection>

        {/* Contacto de Emergencia */}
        {monitor.emergencyContact && (
          <DetailSection title="Contacto de Emergencia">
            <DetailGrid cols={3}>
              <DetailItem label="Nombre" value={monitor.emergencyContact.name} />
              <DetailItem label="Relación" value={monitor.emergencyContact.relation} />
              <DetailItem label="Teléfono" value={monitor.emergencyContact.phone} />
            </DetailGrid>
          </DetailSection>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-400 text-right">
          Registrado el {monitor.createdAt}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Monitor"
        message={`¿Estás seguro de que deseas eliminar a ${monitor.firstName} ${monitor.lastName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
