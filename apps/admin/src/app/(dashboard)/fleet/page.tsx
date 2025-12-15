'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Bus, Users, UserCheck, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Wrench, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVehicles, useDrivers, useMonitors } from '@/hooks';

const statusConfig = {
  active: { label: 'Activo', color: 'bg-success text-white' },
  maintenance: { label: 'Mantenimiento', color: 'bg-warning text-white' },
  out_of_service: { label: 'Fuera de servicio', color: 'bg-gray-400 text-white' },
  inactive: { label: 'Inactivo', color: 'bg-gray-400 text-white' },
  on_route: { label: 'En ruta', color: 'bg-success text-white' },
  available: { label: 'Disponible', color: 'bg-info text-white' },
};

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Real data from Convex
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { drivers, isLoading: driversLoading } = useDrivers();
  const { monitors, isLoading: monitorsLoading } = useMonitors();

  const tabs = [
    { id: 'vehicles', label: 'Vehículos', icon: Bus, count: vehicles.length },
    { id: 'drivers', label: 'Conductores', icon: UserCheck, count: drivers.length },
    { id: 'monitors', label: 'Monitores', icon: Users, count: monitors.length },
  ];

  // Filter data based on search
  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return vehicles;
    const query = searchQuery.toLowerCase();
    return vehicles.filter(v =>
      v.licensePlate?.toLowerCase().includes(query) ||
      v.brand?.toLowerCase().includes(query) ||
      v.model?.toLowerCase().includes(query)
    );
  }, [vehicles, searchQuery]);

  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return drivers;
    const query = searchQuery.toLowerCase();
    return drivers.filter(d =>
      d.user?.name?.toLowerCase().includes(query) ||
      d.phone?.toLowerCase().includes(query)
    );
  }, [drivers, searchQuery]);

  const filteredMonitors = useMemo(() => {
    if (!searchQuery) return monitors;
    const query = searchQuery.toLowerCase();
    return monitors.filter(m =>
      m.user?.name?.toLowerCase().includes(query) ||
      m.phone?.toLowerCase().includes(query)
    );
  }, [monitors, searchQuery]);

  const isLoading = activeTab === 'vehicles' ? vehiclesLoading : activeTab === 'drivers' ? driversLoading : monitorsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Flota</h1>
          <p className="text-gray-500">Administra vehículos, conductores y monitores</p>
        </div>
        <Link
          href={activeTab === 'vehicles' ? '/fleet/vehicles/new' : activeTab === 'drivers' ? '/fleet/drivers/new' : '/fleet/monitors/new'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'vehicles' ? 'Nuevo Vehículo' : activeTab === 'drivers' ? 'Nuevo Conductor' : 'Nuevo Monitor'}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
              <span className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab === 'vehicles' ? 'vehículos' : activeTab === 'drivers' ? 'conductores' : 'monitores'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="maintenance">Mantenimiento</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-500">Cargando datos...</span>
        </div>
      )}

      {/* Vehicles Table */}
      {!isLoading && activeTab === 'vehicles' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay vehículos</h3>
              <p className="text-gray-500 mb-4">Agrega vehículos para comenzar</p>
              <Link href="/fleet/vehicles/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
                <Plus className="w-5 h-5" /> Nuevo Vehículo
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Placa</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Modelo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Capacidad</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVehicles.map((vehicle) => {
                      const status = statusConfig[vehicle.status as keyof typeof statusConfig] || statusConfig.inactive;
                      return (
                        <tr key={vehicle._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{vehicle.licensePlate}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-sm text-gray-500">{vehicle.year}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{vehicle.capacity} pasajeros</td>
                          <td className="px-4 py-3">
                            <span className={cn('px-2 py-1 text-xs rounded-full', status.color)}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenu(openMenu === vehicle._id ? null : vehicle._id)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                <MoreHorizontal className="w-5 h-5 text-gray-500" />
                              </button>
                              {openMenu === vehicle._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <Link href={`/fleet/vehicles/${vehicle._id}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Ver detalles
                                  </Link>
                                  <Link href={`/fleet/vehicles/${vehicle._id}/edit`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                    <Edit className="w-4 h-4" /> Editar
                                  </Link>
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                    <Wrench className="w-4 h-4" /> Mantenimiento
                                  </button>
                                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-error">
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">Mostrando {filteredVehicles.length} de {vehicles.length}</p>
                <div className="flex gap-2">
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Drivers Table */}
      {!isLoading && activeTab === 'drivers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay conductores</h3>
              <p className="text-gray-500 mb-4">Agrega conductores para comenzar</p>
              <Link href="/fleet/drivers/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
                <Plus className="w-5 h-5" /> Nuevo Conductor
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Licencia</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDrivers.map((driver) => {
                    const isActive = driver.isActive !== false;
                    return (
                      <tr key={driver._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{driver.user?.name || 'Sin nombre'}</td>
                        <td className="px-4 py-3 text-gray-600">{driver.phone || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{driver.licenseNumber || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-1 text-xs rounded-full', isActive ? 'bg-success text-white' : 'bg-gray-400 text-white')}>
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === driver._id ? null : driver._id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreHorizontal className="w-5 h-5 text-gray-500" />
                            </button>
                            {openMenu === driver._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <Link href={`/fleet/drivers/${driver._id}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                  <Eye className="w-4 h-4" /> Ver detalles
                                </Link>
                                <Link href={`/fleet/drivers/${driver._id}/edit`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                  <Edit className="w-4 h-4" /> Editar
                                </Link>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-error">
                                  <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Monitors Table */}
      {!isLoading && activeTab === 'monitors' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredMonitors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay monitores</h3>
              <p className="text-gray-500 mb-4">Agrega monitores para comenzar</p>
              <Link href="/fleet/monitors/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
                <Plus className="w-5 h-5" /> Nuevo Monitor
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Certificaciones</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMonitors.map((monitor) => {
                    const isActive = monitor.isActive !== false;
                    return (
                      <tr key={monitor._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{monitor.user?.name || 'Sin nombre'}</td>
                        <td className="px-4 py-3 text-gray-600">{monitor.phone || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {monitor.firstAidCertified && <span className="text-success text-sm">Primeros auxilios</span>}
                          {monitor.childCareCertified && <span className="text-info text-sm ml-2">Cuidado infantil</span>}
                          {!monitor.firstAidCertified && !monitor.childCareCertified && '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-1 text-xs rounded-full', isActive ? 'bg-success text-white' : 'bg-gray-400 text-white')}>
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === monitor._id ? null : monitor._id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreHorizontal className="w-5 h-5 text-gray-500" />
                            </button>
                            {openMenu === monitor._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <Link href={`/fleet/monitors/${monitor._id}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                  <Eye className="w-4 h-4" /> Ver detalles
                                </Link>
                                <Link href={`/fleet/monitors/${monitor._id}/edit`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                  <Edit className="w-4 h-4" /> Editar
                                </Link>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-error">
                                  <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
