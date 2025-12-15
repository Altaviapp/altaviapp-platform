'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Trash2, Wrench, Calendar, Shield, FileText } from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';

// Mock vehicle data
const mockVehicles: Record<string, {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  registrationNumber: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  lastInspection: string;
  nextInspection: string;
  driver: { id: string; name: string } | null;
  route: { id: string; name: string } | null;
  notes: string;
  createdAt: string;
}> = {
  '1': {
    id: '1',
    plate: 'ABC-1234',
    brand: 'Toyota',
    model: 'Coaster',
    year: 2022,
    color: 'Blanco',
    capacity: 30,
    status: 'active',
    registrationNumber: 'REG-2022-001234',
    insurancePolicy: 'POL-123456789',
    insuranceExpiry: '15/08/2025',
    lastInspection: '01/10/2024',
    nextInspection: '01/04/2025',
    driver: { id: '1', name: 'Juan Pérez' },
    route: { id: '1', name: 'Ruta Centro' },
    notes: 'Vehículo en excelente estado. Última revisión sin novedades.',
    createdAt: '15/03/2022',
  },
  '2': {
    id: '2',
    plate: 'XYZ-5678',
    brand: 'Mitsubishi',
    model: 'Rosa',
    year: 2021,
    color: 'Amarillo',
    capacity: 25,
    status: 'maintenance',
    registrationNumber: 'REG-2021-005678',
    insurancePolicy: 'POL-987654321',
    insuranceExpiry: '20/06/2025',
    lastInspection: '15/09/2024',
    nextInspection: '15/03/2025',
    driver: null,
    route: null,
    notes: 'En mantenimiento: cambio de frenos programado.',
    createdAt: '10/01/2021',
  },
};

const statusConfig = {
  active: { label: 'Activo', status: 'active' as const },
  maintenance: { label: 'Mantenimiento', status: 'warning' as const },
  inactive: { label: 'Inactivo', status: 'inactive' as const },
};

/**
 * Vehicle Detail Page
 * Based on ADMIN_WIREFRAMES.md detail page patterns
 */
export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get vehicle data (mock)
  const vehicle = mockVehicles[vehicleId];

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehículo no encontrado</p>
      </div>
    );
  }

  const statusInfo = statusConfig[vehicle.status];

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/fleet');
  };

  return (
    <div>
      <PageHeader
        title={`Vehículo ${vehicle.plate}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Flota', href: '/fleet' },
          { label: vehicle.plate },
        ]}
        backHref="/fleet"
        badge={<StatusBadge status={statusInfo.status} label={statusInfo.label} />}
        actions={[
          {
            label: 'Editar',
            href: `/fleet/vehicles/${vehicle.id}/edit`,
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
            <DetailItem label="Placa" value={vehicle.plate} />
            <DetailItem label="Marca" value={vehicle.brand} />
            <DetailItem label="Modelo" value={vehicle.model} />
            <DetailItem label="Año" value={vehicle.year} />
            <DetailItem label="Color" value={vehicle.color} />
            <DetailItem label="Capacidad" value={`${vehicle.capacity} pasajeros`} />
          </DetailGrid>
        </DetailSection>

        {/* Documentación */}
        <DetailSection
          title="Documentación"
          actions={
            <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Ver documentos
            </button>
          }
        >
          <DetailGrid cols={2}>
            <DetailItem label="Número de Registro" value={vehicle.registrationNumber} />
            <DetailItem label="Póliza de Seguro" value={vehicle.insurancePolicy} />
          </DetailGrid>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Vencimiento Seguro</p>
                <p className="text-sm font-medium text-gray-900">{vehicle.insuranceExpiry}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Última Revisión</p>
                <p className="text-sm font-medium text-gray-900">{vehicle.lastInspection}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Próxima Revisión</p>
                <p className="text-sm font-medium text-gray-900">{vehicle.nextInspection}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Asignaciones */}
        <DetailSection title="Asignaciones">
          <DetailGrid cols={2}>
            <DetailItem
              label="Conductor Asignado"
              value={
                vehicle.driver ? (
                  <a
                    href={`/fleet/drivers/${vehicle.driver.id}`}
                    className="text-primary hover:underline"
                  >
                    {vehicle.driver.name}
                  </a>
                ) : (
                  <span className="text-gray-400">Sin asignar</span>
                )
              }
            />
            <DetailItem
              label="Ruta Asignada"
              value={
                vehicle.route ? (
                  <a
                    href={`/routes/${vehicle.route.id}`}
                    className="text-primary hover:underline"
                  >
                    {vehicle.route.name}
                  </a>
                ) : (
                  <span className="text-gray-400">Sin asignar</span>
                )
              }
            />
          </DetailGrid>
        </DetailSection>

        {/* Notas */}
        {vehicle.notes && (
          <DetailSection title="Notas">
            <p className="text-sm text-gray-600">{vehicle.notes}</p>
          </DetailSection>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-400 text-right">
          Creado el {vehicle.createdAt}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Vehículo"
        message={`¿Estás seguro de que deseas eliminar el vehículo ${vehicle.plate}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
