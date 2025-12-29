'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Bus, Users, UserCheck, Plus } from 'lucide-react';
import { Badge } from '@/components/core';
import { PageHeader, SearchFilter, DataTable, type Column } from '@/components/shared';
import { FleetTabs, type FleetTabId } from '@/components/modules/fleet';
import { InviteUserModal, type InviteRole } from '@/components/users/InviteUserModal';
import { VEHICLE_STATUS_CONFIG } from '@/lib/constants';
import { useVehicles, useDrivers, useMonitors } from '@/hooks';

/**
 * Fleet Management Page
 *
 * Manages vehicles, drivers, monitors, and GPS devices.
 * Uses tabbed interface with search and filtering.
 *
 * PRD Reference: Fleet Management Module
 */
export default function FleetPage() {
  const [activeTab, setActiveTab] = useState<FleetTabId>('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<InviteRole>('driver');

  // Real data from Convex
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { drivers, isLoading: driversLoading } = useDrivers();
  const { monitors, isLoading: monitorsLoading } = useMonitors();

  // Filter data based on search and status
  const filteredVehicles = useMemo(() => {
    let result = vehicles;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.licensePlate?.toLowerCase().includes(query) ||
          v.brand?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query)
      );
    }
    if (statusFilter) {
      result = result.filter((v) => v.status === statusFilter);
    }
    return result;
  }, [vehicles, searchQuery, statusFilter]);

  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return drivers;
    const query = searchQuery.toLowerCase();
    return drivers.filter(
      (d) =>
        d.user?.name?.toLowerCase().includes(query) ||
        d.phone?.toLowerCase().includes(query)
    );
  }, [drivers, searchQuery]);

  const filteredMonitors = useMemo(() => {
    if (!searchQuery) return monitors;
    const query = searchQuery.toLowerCase();
    return monitors.filter(
      (m) =>
        m.user?.name?.toLowerCase().includes(query) ||
        m.phone?.toLowerCase().includes(query)
    );
  }, [monitors, searchQuery]);

  // Get current loading state
  const isLoading =
    activeTab === 'vehicles'
      ? vehiclesLoading
      : activeTab === 'drivers'
        ? driversLoading
        : monitorsLoading;

  // Open invite modal with specific role
  const openInviteModal = (role: InviteRole) => {
    setInviteRole(role);
    setIsInviteModalOpen(true);
  };

  // Define table columns for each tab
  const vehicleColumns: Column<(typeof vehicles)[0]>[] = [
    {
      key: 'licensePlate',
      header: 'Placa',
      render: (v) => <span className="font-medium text-gray-900">{v.licensePlate}</span>,
    },
    {
      key: 'model',
      header: 'Modelo',
      render: (v) => (
        <div>
          <p className="text-gray-900">
            {v.brand} {v.model}
          </p>
          <p className="text-sm text-gray-500">{v.year}</p>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacidad',
      render: (v) => <span className="text-gray-600">{v.capacity} pasajeros</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (v) => {
        const config = VEHICLE_STATUS_CONFIG[v.status as keyof typeof VEHICLE_STATUS_CONFIG];
        const variant =
          v.status === 'active'
            ? 'success'
            : v.status === 'maintenance'
              ? 'warning'
              : 'danger';
        return <Badge variant={variant}>{config?.label || v.status}</Badge>;
      },
    },
  ];

  const driverColumns: Column<(typeof drivers)[0]>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (d) => (
        <span className="font-medium text-gray-900">{d.user?.name || 'Sin nombre'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (d) => <span className="text-gray-600">{d.phone || '-'}</span>,
    },
    {
      key: 'license',
      header: 'Licencia',
      render: (d) => (
        <span className="text-gray-600">
          {d.licenseNumber ? `${d.licenseType || ''} ${d.licenseNumber}` : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (d) => {
        const isActive = d.isActive !== false;
        return (
          <Badge variant={isActive ? 'success' : 'default'}>
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
  ];

  const monitorColumns: Column<(typeof monitors)[0]>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (m) => (
        <span className="font-medium text-gray-900">{m.user?.name || 'Sin nombre'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (m) => <span className="text-gray-600">{m.phone || '-'}</span>,
    },
    {
      key: 'certifications',
      header: 'Certificaciones',
      render: (m) => (
        <div className="flex gap-1 flex-wrap">
          {m.firstAidCertified && (
            <Badge variant="success" size="sm">
              Primeros auxilios
            </Badge>
          )}
          {m.childCareCertified && (
            <Badge variant="info" size="sm">
              Cuidado infantil
            </Badge>
          )}
          {!m.firstAidCertified && !m.childCareCertified && (
            <span className="text-gray-500">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (m) => {
        const isActive = m.isActive !== false;
        return (
          <Badge variant={isActive ? 'success' : 'default'}>
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
  ];

  // Get current action button config
  const getActionConfig = (): { label: string; href?: string; onClick?: () => void } => {
    switch (activeTab) {
      case 'vehicles':
        return { href: '/fleet/vehicles/new', label: 'Nuevo Vehículo' };
      case 'drivers':
        return { label: 'Invitar Conductor', onClick: () => openInviteModal('driver') };
      case 'monitors':
        return { label: 'Invitar Monitor', onClick: () => openInviteModal('monitor') };
      default:
        return { href: '/fleet/gps-devices', label: 'Configurar GPS' };
    }
  };

  const actionConfig = getActionConfig();

  // Get empty state config
  const getEmptyStateConfig = () => {
    switch (activeTab) {
      case 'vehicles':
        return {
          icon: Bus,
          title: 'No hay vehículos',
          description: 'Agrega vehículos para comenzar',
          action: { label: 'Nuevo Vehículo', href: '/fleet/vehicles/new' },
        };
      case 'drivers':
        return {
          icon: UserCheck,
          title: 'No hay conductores',
          description: 'Invita conductores para comenzar',
          action: { label: 'Invitar Conductor', onClick: () => openInviteModal('driver') },
        };
      case 'monitors':
        return {
          icon: Users,
          title: 'No hay monitores',
          description: 'Invita monitores para comenzar',
          action: { label: 'Invitar Monitor', onClick: () => openInviteModal('monitor') },
        };
      default:
        return {
          title: 'Sin datos',
          description: 'No hay datos disponibles',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestión de Flota"
        subtitle="Administra vehículos, conductores y monitores"
        actions={[
          {
            label: actionConfig.label,
            href: actionConfig.href,
            onClick: actionConfig.onClick,
            icon: Plus,
            variant: 'primary',
          },
        ]}
      />

      {/* Tabs */}
      <FleetTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        vehicleCount={vehicles.length}
        driverCount={drivers.length}
        monitorCount={monitors.length}
      />

      {/* Search & Filters */}
      <SearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Buscar ${activeTab === 'vehicles' ? 'vehículos' : activeTab === 'drivers' ? 'conductores' : 'monitores'}...`}
        filters={
          activeTab === 'vehicles'
            ? [
                {
                  key: 'status',
                  label: 'Todos los estados',
                  value: statusFilter,
                  options: [
                    { value: 'active', label: 'Activo' },
                    { value: 'maintenance', label: 'Mantenimiento' },
                    { value: 'out_of_service', label: 'Fuera de servicio' },
                  ],
                },
              ]
            : []
        }
        onFilterChange={(key, value) => {
          if (key === 'status') setStatusFilter(value);
        }}
      />

      {/* Tables */}
      {activeTab === 'vehicles' && (
        <DataTable
          columns={vehicleColumns}
          data={filteredVehicles}
          isLoading={isLoading}
          keyExtractor={(v) => v._id}
          rowHref={(v) => `/fleet/vehicles/${v._id}`}
          emptyState={getEmptyStateConfig()}
        />
      )}

      {activeTab === 'drivers' && (
        <DataTable
          columns={driverColumns}
          data={filteredDrivers}
          isLoading={isLoading}
          keyExtractor={(d) => d._id}
          rowHref={(d) => `/fleet/drivers/${d._id}`}
          emptyState={getEmptyStateConfig()}
        />
      )}

      {activeTab === 'monitors' && (
        <DataTable
          columns={monitorColumns}
          data={filteredMonitors}
          isLoading={isLoading}
          keyExtractor={(m) => m._id}
          rowHref={(m) => `/fleet/monitors/${m._id}`}
          emptyState={getEmptyStateConfig()}
        />
      )}

      {activeTab === 'gps-devices' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">
            Configuración de dispositivos GPS disponible en{' '}
            <Link href="/fleet/gps-devices" className="text-primary hover:underline">
              /fleet/gps-devices
            </Link>
          </p>
        </div>
      )}

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        defaultRole={inviteRole}
        hideRoleSelector
      />
    </div>
  );
}
