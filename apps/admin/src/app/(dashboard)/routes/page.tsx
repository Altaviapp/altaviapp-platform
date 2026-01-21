'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Users, Bus, Clock, GraduationCap, CheckCircle, Layers } from 'lucide-react';
import { Badge } from '@/components/core';
import { PageHeader, SearchFilter, DataTable, StatsGrid, type Column, type StatItem } from '@/components/shared';
import { useRoutes } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Routes Page
 *
 * Manages all transport routes for the institution.
 * Features: search, type filter, status filter.
 *
 * PRD Reference: Routes Module
 */

const ROUTE_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'pickup', label: 'Recogida' },
  { value: 'dropoff', label: 'Entrega' },
];

export default function RoutesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Real data from Convex
  const { routes: allRoutes, isLoading, isEmpty } = useRoutes();

  // Filter routes
  const filteredRoutes = useMemo(() => {
    return allRoutes.filter((route) => {
      const matchesSearch =
        !searchQuery ||
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.driverName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !typeFilter || route.type === typeFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && route.isActive) ||
        (statusFilter === 'inactive' && !route.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allRoutes, searchQuery, typeFilter, statusFilter]);

  // Calculate stats
  const stats: StatItem[] = useMemo(() => {
    const total = allRoutes.length;
    const active = allRoutes.filter((r) => r.isActive).length;
    const withVehicle = allRoutes.filter((r) => r.vehicleId).length;
    const totalStudents = allRoutes.reduce((acc, r) => acc + (r.studentsCount || 0), 0);

    return [
      { label: 'Total Rutas', value: total, icon: MapPin, color: 'default' },
      { label: 'Rutas Activas', value: active, icon: CheckCircle, color: 'success' },
      { label: 'Con Vehículo', value: withVehicle, icon: Bus, color: 'info' },
      { label: 'Estudiantes Asignados', value: totalStudents, icon: GraduationCap, color: 'warning' },
    ];
  }, [allRoutes]);

  // Table columns
  const columns: Column<(typeof allRoutes)[0]>[] = [
    {
      key: 'name',
      header: 'Ruta',
      render: (route) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{route.name}</p>
            <p className="text-sm text-gray-500">{route.driverName || 'Sin conductor'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (route) => (
        <Badge variant={route.type === 'pickup' ? 'info' : 'purple'}>
          {route.type === 'pickup' ? 'Recogida' : 'Entrega'}
        </Badge>
      ),
    },
    {
      key: 'schedule',
      header: 'Horario',
      render: (route) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{route.scheduledStartTime} - {route.scheduledEndTime}</span>
        </div>
      ),
    },
    {
      key: 'stops',
      header: 'Paradas',
      render: (route) => (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{route.stopsCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Estudiantes',
      render: (route) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{route.studentsCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehículo',
      render: (route) =>
        route.vehicleId ? (
          <div className="flex items-center gap-1 text-gray-600">
            <Bus className="w-4 h-4 text-gray-400" />
            <span>{route.vehiclePlate || 'Asignado'}</span>
          </div>
        ) : (
          <span className="text-yellow-600 text-sm">Sin asignar</span>
        ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (route) => (
        <Badge variant={route.isActive ? 'success' : 'default'}>
          {route.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestión de Rutas"
        subtitle="Administra las rutas de transporte escolar"
        actions={[
          {
            label: 'Creación Masiva',
            href: '/routes/bulk-create',
            icon: Layers,
            variant: 'secondary',
          },
          {
            label: 'Nueva Ruta',
            href: '/routes/new',
            icon: Plus,
            variant: 'primary',
          },
        ]}
      />

      {/* Stats */}
      <StatsGrid stats={stats} isLoading={isLoading} columns={4} />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <SearchFilter
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar por nombre, conductor..."
            filters={[
              {
                key: 'type',
                label: 'Todos los tipos',
                value: typeFilter,
                options: [
                  { value: 'pickup', label: 'Recogida' },
                  { value: 'dropoff', label: 'Entrega' },
                ],
              },
              {
                key: 'status',
                label: 'Todos los estados',
                value: statusFilter,
                options: [
                  { value: 'active', label: 'Activas' },
                  { value: 'inactive', label: 'Inactivas' },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === 'type') setTypeFilter(value);
              if (key === 'status') setStatusFilter(value);
            }}
            className="flex-1"
          />
        </div>
      </div>

      {/* Routes Table */}
      <DataTable
        columns={columns}
        data={filteredRoutes}
        isLoading={isLoading}
        keyExtractor={(r) => r._id}
        rowHref={(r) => `/routes/${r._id}`}
        emptyState={{
          icon: MapPin,
          title: isEmpty ? 'No hay rutas' : 'Sin resultados',
          description: isEmpty
            ? 'Crea tu primera ruta de transporte'
            : 'No se encontraron rutas con los filtros actuales',
          action: isEmpty
            ? { label: 'Nueva Ruta', href: '/routes/new' }
            : undefined,
        }}
      />
    </div>
  );
}
