'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bus, Users, UserCheck, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock vehicles data
const vehicles = [
  { id: 1, plate: 'ABC-1234', model: 'Toyota Coaster', year: 2022, capacity: 30, status: 'active', driver: 'Juan Pérez', route: 'Ruta Centro' },
  { id: 2, plate: 'XYZ-5678', model: 'Mitsubishi Rosa', year: 2021, capacity: 25, status: 'maintenance', driver: null, route: null },
  { id: 3, plate: 'DEF-9012', model: 'Hino Dutro', year: 2023, capacity: 35, status: 'active', driver: 'María González', route: 'Ruta Norte' },
  { id: 4, plate: 'GHI-3456', model: 'Toyota Coaster', year: 2020, capacity: 30, status: 'inactive', driver: null, route: null },
  { id: 5, plate: 'JKL-7890', model: 'Hyundai County', year: 2022, capacity: 28, status: 'active', driver: 'Carlos Ruiz', route: 'Ruta Sur' },
];

// Mock drivers data
const drivers = [
  { id: 1, name: 'Juan Pérez', cedula: '1234567890', phone: '+593 99 123 4567', vehicle: 'ABC-1234', status: 'on_route', licenseExpiry: '15/08/2026' },
  { id: 2, name: 'María González', cedula: '0987654321', phone: '+593 98 765 4321', vehicle: 'DEF-9012', status: 'on_route', licenseExpiry: '20/06/2025' },
  { id: 3, name: 'Carlos Ruiz', cedula: '1122334455', phone: '+593 97 555 6666', vehicle: 'JKL-7890', status: 'available', licenseExpiry: '10/12/2025' },
  { id: 4, name: 'Ana Torres', cedula: '5544332211', phone: '+593 96 888 9999', vehicle: null, status: 'inactive', licenseExpiry: '01/03/2024' },
];

// Mock monitors data
const monitors = [
  { id: 1, name: 'Laura Sánchez', cedula: '1111222233', phone: '+593 99 111 2222', route: 'Ruta Centro', status: 'on_route' },
  { id: 2, name: 'Pedro Gómez', cedula: '4444555566', phone: '+593 98 333 4444', route: 'Ruta Norte', status: 'on_route' },
  { id: 3, name: 'Sofía Mora', cedula: '7777888899', phone: '+593 97 555 6666', route: null, status: 'available' },
];

const tabs = [
  { id: 'vehicles', label: 'Vehículos', icon: Bus, count: vehicles.length },
  { id: 'drivers', label: 'Conductores', icon: UserCheck, count: drivers.length },
  { id: 'monitors', label: 'Monitores', icon: Users, count: monitors.length },
];

const statusConfig = {
  active: { label: 'Activo', color: 'bg-success text-white' },
  maintenance: { label: 'Mantenimiento', color: 'bg-warning text-white' },
  inactive: { label: 'Inactivo', color: 'bg-gray-400 text-white' },
  on_route: { label: 'En ruta', color: 'bg-success text-white' },
  available: { label: 'Disponible', color: 'bg-info text-white' },
};

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<number | null>(null);

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

      {/* Vehicles Table */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Placa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Modelo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Capacidad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Conductor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ruta</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.map((vehicle) => {
                  const status = statusConfig[vehicle.status as keyof typeof statusConfig];
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{vehicle.plate}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-900">{vehicle.model}</p>
                          <p className="text-sm text-gray-500">{vehicle.year}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{vehicle.capacity} pasajeros</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 text-xs rounded-full', status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{vehicle.driver || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{vehicle.route || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === vehicle.id ? null : vehicle.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>
                          {openMenu === vehicle.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <Link href={`/fleet/vehicles/${vehicle.id}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Ver detalles
                              </Link>
                              <Link href={`/fleet/vehicles/${vehicle.id}/edit`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
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
            <p className="text-sm text-gray-500">Mostrando 1-{vehicles.length} de {vehicles.length}</p>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drivers Table */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cédula</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vehículo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Venc. Licencia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drivers.map((driver) => {
                  const status = statusConfig[driver.status as keyof typeof statusConfig];
                  return (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{driver.name}</td>
                      <td className="px-4 py-3 text-gray-600">{driver.cedula}</td>
                      <td className="px-4 py-3 text-gray-600">{driver.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{driver.vehicle || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{driver.licenseExpiry}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 text-xs rounded-full', status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === driver.id + 100 ? null : driver.id + 100)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>
                          {openMenu === driver.id + 100 && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <Link href={`/fleet/drivers/${driver.id}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Ver detalles
                              </Link>
                              <Link href={`/fleet/drivers/${driver.id}/edit`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
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
        </div>
      )}

      {/* Monitors Table */}
      {activeTab === 'monitors' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cédula</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ruta Asignada</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monitors.map((monitor) => {
                  const status = statusConfig[monitor.status as keyof typeof statusConfig];
                  return (
                    <tr key={monitor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{monitor.name}</td>
                      <td className="px-4 py-3 text-gray-600">{monitor.cedula}</td>
                      <td className="px-4 py-3 text-gray-600">{monitor.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{monitor.route || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 text-xs rounded-full', status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === monitor.id + 200 ? null : monitor.id + 200)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>
                          {openMenu === monitor.id + 200 && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <Link href={`/fleet/monitors/${monitor.id}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Ver detalles
                              </Link>
                              <Link href={`/fleet/monitors/${monitor.id}/edit`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
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
        </div>
      )}
    </div>
  );
}
