'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Trash2, Phone, Mail, MapPin, Calendar, Car, CreditCard } from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';

// Mock driver data
const mockDrivers: Record<string, {
  id: string;
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  licenseNumber: string;
  licenseType: string;
  licenseIssueDate: string;
  licenseExpiry: string;
  status: 'active' | 'on_route' | 'available' | 'inactive';
  vehicle: { id: string; plate: string; model: string } | null;
  route: { id: string; name: string } | null;
  emergencyContact: { name: string; relation: string; phone: string } | null;
  createdAt: string;
}> = {
  '1': {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    cedula: '1234567890',
    birthDate: '15/05/1985',
    phone: '+593 99 123 4567',
    email: 'juan.perez@email.com',
    address: 'Av. Principal 123, Quito',
    licenseNumber: 'LIC-2020-12345',
    licenseType: 'Tipo D - Transporte de pasajeros',
    licenseIssueDate: '01/03/2020',
    licenseExpiry: '15/08/2026',
    status: 'on_route',
    vehicle: { id: '1', plate: 'ABC-1234', model: 'Toyota Coaster' },
    route: { id: '1', name: 'Ruta Centro' },
    emergencyContact: { name: 'María López', relation: 'Esposa', phone: '+593 98 765 4321' },
    createdAt: '10/01/2020',
  },
  '2': {
    id: '2',
    firstName: 'María',
    lastName: 'González',
    cedula: '0987654321',
    birthDate: '20/08/1990',
    phone: '+593 98 765 4321',
    email: 'maria.gonzalez@email.com',
    address: 'Calle Secundaria 456, Quito',
    licenseNumber: 'LIC-2019-67890',
    licenseType: 'Tipo D - Transporte de pasajeros',
    licenseIssueDate: '15/06/2019',
    licenseExpiry: '20/06/2025',
    status: 'on_route',
    vehicle: { id: '3', plate: 'DEF-9012', model: 'Hino Dutro' },
    route: { id: '2', name: 'Ruta Norte' },
    emergencyContact: { name: 'Carlos González', relation: 'Hermano', phone: '+593 97 111 2222' },
    createdAt: '15/06/2019',
  },
};

const statusConfig = {
  active: { label: 'Activo', status: 'active' as const },
  on_route: { label: 'En ruta', status: 'active' as const },
  available: { label: 'Disponible', status: 'pending' as const },
  inactive: { label: 'Inactivo', status: 'inactive' as const },
};

/**
 * Driver Detail Page
 */
export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const driverId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const driver = mockDrivers[driverId];

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Conductor no encontrado</p>
      </div>
    );
  }

  const statusInfo = statusConfig[driver.status];

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/fleet?tab=drivers');
  };

  return (
    <div>
      <PageHeader
        title={`${driver.firstName} ${driver.lastName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: 'Conductores', href: '/fleet?tab=drivers' },
          { label: `${driver.firstName} ${driver.lastName}` },
        ]}
        backHref="/fleet?tab=drivers"
        badge={<StatusBadge status={statusInfo.status} label={statusInfo.label} />}
        actions={[
          {
            label: 'Editar',
            href: `/fleet/drivers/${driver.id}/edit`,
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
            <DetailItem label="Nombres" value={driver.firstName} />
            <DetailItem label="Apellidos" value={driver.lastName} />
            <DetailItem label="Cédula" value={driver.cedula} />
            <DetailItem label="Fecha de Nacimiento" value={driver.birthDate} />
          </DetailGrid>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-900">{driver.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{driver.email || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dirección</p>
                <p className="text-sm font-medium text-gray-900 truncate">{driver.address || '-'}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Licencia de Conducir */}
        <DetailSection title="Licencia de Conducir">
          <DetailGrid cols={2}>
            <DetailItem label="Número de Licencia" value={driver.licenseNumber} />
            <DetailItem label="Tipo de Licencia" value={driver.licenseType} />
          </DetailGrid>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de Emisión</p>
                <p className="text-sm font-medium text-gray-900">{driver.licenseIssueDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de Vencimiento</p>
                <p className="text-sm font-medium text-gray-900">{driver.licenseExpiry}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Asignaciones */}
        <DetailSection title="Asignaciones">
          <DetailGrid cols={2}>
            <DetailItem
              label="Vehículo Asignado"
              value={
                driver.vehicle ? (
                  <a
                    href={`/fleet/vehicles/${driver.vehicle.id}`}
                    className="text-primary hover:underline"
                  >
                    {driver.vehicle.plate} - {driver.vehicle.model}
                  </a>
                ) : (
                  <span className="text-gray-400">Sin asignar</span>
                )
              }
            />
            <DetailItem
              label="Ruta Actual"
              value={
                driver.route ? (
                  <a
                    href={`/routes/${driver.route.id}`}
                    className="text-primary hover:underline"
                  >
                    {driver.route.name}
                  </a>
                ) : (
                  <span className="text-gray-400">Sin ruta</span>
                )
              }
            />
          </DetailGrid>
        </DetailSection>

        {/* Contacto de Emergencia */}
        {driver.emergencyContact && (
          <DetailSection title="Contacto de Emergencia">
            <DetailGrid cols={3}>
              <DetailItem label="Nombre" value={driver.emergencyContact.name} />
              <DetailItem label="Relación" value={driver.emergencyContact.relation} />
              <DetailItem label="Teléfono" value={driver.emergencyContact.phone} />
            </DetailGrid>
          </DetailSection>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-400 text-right">
          Registrado el {driver.createdAt}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Conductor"
        message={`¿Estás seguro de que deseas eliminar a ${driver.firstName} ${driver.lastName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
