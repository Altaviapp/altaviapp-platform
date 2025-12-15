'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Copy, Users, Bus, Clock, ChevronLeft, ChevronRight, Map, Loader2, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRoutes } from '@/hooks';

// Type labels for route types
const typeLabels: Record<string, { label: string; color: string }> = {
  pickup: { label: 'Recogida', color: 'bg-blue-100 text-blue-700' },
  dropoff: { label: 'Entrega', color: 'bg-purple-100 text-purple-700' },
  ida: { label: 'Ida', color: 'bg-blue-100 text-blue-700' },
  retorno: { label: 'Retorno', color: 'bg-purple-100 text-purple-700' },
  ambas: { label: 'Ida/Retorno', color: 'bg-green-100 text-green-700' },
};

// ============================================
// MOCK DATA - Rutas con estudiantes optimizados por proximidad
// ============================================

// Estudiantes mock con coordenadas de hogar (simulando asignación por proximidad)
const mockStudents = [
  // Zona Norte - asignados a Ruta Norte
  { id: 's1', firstName: 'Sofía', lastName: 'González', grade: '5to A', lat: -0.1620, lng: -78.4780, stopId: 'n1', routeId: '1' },
  { id: 's2', firstName: 'Mateo', lastName: 'Pérez', grade: '6to B', lat: -0.1635, lng: -78.4765, stopId: 'n1', routeId: '1' },
  { id: 's3', firstName: 'Valentina', lastName: 'Torres', grade: '5to A', lat: -0.1680, lng: -78.4720, stopId: 'n2', routeId: '1' },
  { id: 's4', firstName: 'Sebastián', lastName: 'Morales', grade: '7mo A', lat: -0.1695, lng: -78.4710, stopId: 'n2', routeId: '1' },
  { id: 's5', firstName: 'Isabella', lastName: 'Ruiz', grade: '6to A', lat: -0.1750, lng: -78.4680, stopId: 'n3', routeId: '1' },
  { id: 's6', firstName: 'Daniel', lastName: 'Castro', grade: '5to B', lat: -0.1760, lng: -78.4670, stopId: 'n3', routeId: '1' },
  { id: 's7', firstName: 'Camila', lastName: 'Mendoza', grade: '8vo A', lat: -0.1800, lng: -78.4650, stopId: 'n4', routeId: '1' },
  { id: 's8', firstName: 'Nicolás', lastName: 'Vargas', grade: '7mo B', lat: -0.1810, lng: -78.4640, stopId: 'n4', routeId: '1' },
  { id: 's9', firstName: 'Luciana', lastName: 'Flores', grade: '6to A', lat: -0.1815, lng: -78.4635, stopId: 'n4', routeId: '1' },

  // Zona Sur - asignados a Ruta Sur
  { id: 's10', firstName: 'Emilio', lastName: 'Salazar', grade: '5to A', lat: -0.2700, lng: -78.5350, stopId: 's1', routeId: '2' },
  { id: 's11', firstName: 'Martina', lastName: 'Aguirre', grade: '6to B', lat: -0.2720, lng: -78.5340, stopId: 's1', routeId: '2' },
  { id: 's12', firstName: 'Lucas', lastName: 'Herrera', grade: '7mo A', lat: -0.2600, lng: -78.5280, stopId: 's2', routeId: '2' },
  { id: 's13', firstName: 'Victoria', lastName: 'Paredes', grade: '5to B', lat: -0.2610, lng: -78.5270, stopId: 's2', routeId: '2' },
  { id: 's14', firstName: 'Gabriel', lastName: 'Romero', grade: '8vo A', lat: -0.2450, lng: -78.5200, stopId: 's3', routeId: '2' },
  { id: 's15', firstName: 'Antonella', lastName: 'Silva', grade: '6to A', lat: -0.2460, lng: -78.5190, stopId: 's3', routeId: '2' },
  { id: 's16', firstName: 'Joaquín', lastName: 'Vega', grade: '7mo B', lat: -0.2300, lng: -78.5100, stopId: 's4', routeId: '2' },
];

// Paradas mock con coordenadas (orden optimizado por Google Directions API)
const mockStops = {
  // Ruta Norte - paradas optimizadas
  '1': [
    { id: 'n1', name: 'Residencial El Bosque', address: 'Av. El Inca y De los Shyris', lat: -0.1630, lng: -78.4770, order: 1, students: 2, scheduledTime: '06:35' },
    { id: 'n2', name: 'Parque La Carolina Norte', address: 'Av. Amazonas y República', lat: -0.1690, lng: -78.4715, order: 2, students: 2, scheduledTime: '06:45' },
    { id: 'n3', name: 'Centro Comercial Quicentro', address: 'Av. Naciones Unidas', lat: -0.1755, lng: -78.4675, order: 3, students: 2, scheduledTime: '06:55' },
    { id: 'n4', name: 'Plaza de las Américas', address: 'Av. América y Colón', lat: -0.1808, lng: -78.4643, order: 4, students: 3, scheduledTime: '07:05' },
    { id: 'n5', name: 'Escuela Central', address: 'Av. 10 de Agosto', lat: -0.1900, lng: -78.4950, order: 5, students: 0, scheduledTime: '07:20' },
  ],
  // Ruta Sur - paradas optimizadas
  '2': [
    { id: 's1', name: 'Terminal Quitumbe', address: 'Av. Mariscal Sucre', lat: -0.2710, lng: -78.5345, order: 1, students: 2, scheduledTime: '06:20' },
    { id: 's2', name: 'Estación Morán Valverde', address: 'Av. Morán Valverde', lat: -0.2605, lng: -78.5275, order: 2, students: 2, scheduledTime: '06:35' },
    { id: 's3', name: 'Centro Comercial El Recreo', address: 'Av. Pedro Vicente Maldonado', lat: -0.2455, lng: -78.5195, order: 3, students: 2, scheduledTime: '06:50' },
    { id: 's4', name: 'Parque Lineal Sur', address: 'Av. Napo', lat: -0.2300, lng: -78.5100, order: 4, students: 1, scheduledTime: '07:05' },
    { id: 's5', name: 'Escuela Central', address: 'Av. 10 de Agosto', lat: -0.1900, lng: -78.4950, order: 5, students: 0, scheduledTime: '07:30' },
  ],
};

// Rutas mock con datos completos
const mockRoutes = [
  {
    _id: '1',
    name: 'Ruta Norte - Escuela Central',
    type: 'pickup' as const,
    vehicleId: 'v1',
    vehiclePlate: 'ABC-1234',
    vehicleModel: 'Toyota Coaster',
    vehicleCapacity: 30,
    driverId: 'd1',
    driverName: 'Juan Pérez',
    driverPhone: '+593 99 123 4567',
    monitorId: 'm1',
    monitorName: 'Ana Torres',
    monitorPhone: '+593 98 765 4321',
    isActive: true,
    scheduledStartTime: '06:30',
    scheduledEndTime: '07:30',
    stopsCount: 5,
    studentsCount: 9,
    stops: mockStops['1'],
    students: mockStudents.filter(s => s.routeId === '1'),
  },
  {
    _id: '2',
    name: 'Ruta Sur - Escuela Central',
    type: 'pickup' as const,
    vehicleId: 'v2',
    vehiclePlate: 'XYZ-5678',
    vehicleModel: 'Hyundai County',
    vehicleCapacity: 25,
    driverId: 'd2',
    driverName: 'María González',
    driverPhone: '+593 99 234 5678',
    monitorId: null,
    monitorName: null,
    monitorPhone: null,
    isActive: true,
    scheduledStartTime: '06:15',
    scheduledEndTime: '07:30',
    stopsCount: 5,
    studentsCount: 7,
    stops: mockStops['2'],
    students: mockStudents.filter(s => s.routeId === '2'),
  },
];

export default function RoutesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Use real hook - will show loading state while connecting
  const { routes: realRoutes, isLoading, isEmpty } = useRoutes();

  // Use mock data when real data is empty (for testing)
  const allRoutes = useMemo(() => {
    if (isEmpty) return mockRoutes;
    return realRoutes;
  }, [realRoutes, isEmpty]);

  // Filter by status locally
  const routes = useMemo(() => {
    if (statusFilter === 'all') return allRoutes;
    return allRoutes.filter(r => r.isActive === (statusFilter === 'active'));
  }, [allRoutes, statusFilter]);

  // Filter routes based on search and type
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || route.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [routes, searchQuery, typeFilter]);

  // Calculate stats from data
  const stats = useMemo(() => {
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter(r => r.isActive).length;
    const vehiclesInRoute = new Set(routes.filter(r => r.vehicleId).map(r => r.vehicleId)).size;
    const studentsAssigned = routes.reduce((acc, r) => acc + (r.studentsCount || 0), 0);

    return [
      { label: 'Total Rutas', value: totalRoutes, icon: MapPin, color: 'bg-primary' },
      { label: 'Rutas Activas', value: activeRoutes, icon: Map, color: 'bg-success' },
      { label: 'Vehículos Asignados', value: vehiclesInRoute, icon: Bus, color: 'bg-info' },
      { label: 'Estudiantes Asignados', value: studentsAssigned, icon: Users, color: 'bg-warning' },
    ];
  }, [routes]);

  const handleRowClick = (routeId: string) => {
    router.push(`/routes/${routeId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Rutas</h1>
          <p className="text-gray-500">Administra las rutas de transporte escolar</p>
        </div>
        <Link
          href="/routes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Ruta
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.color)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar rutas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pickup', 'dropoff'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  typeFilter === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {type === 'all' ? 'Todas' : type === 'pickup' ? 'Recogida' : 'Entrega'}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-500">Cargando rutas...</span>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
            <p className="text-gray-500">No se encontraron rutas con los filtros actuales</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ruta</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Horario</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paradas</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estudiantes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vehículo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRoutes.map((route) => {
                    const defaultTypeInfo = { label: 'Ruta', color: 'bg-gray-100 text-gray-700' };
                    const typeInfo = typeLabels[route.type] ?? defaultTypeInfo;
                    return (
                      <tr
                        key={route._id}
                        onClick={() => handleRowClick(route._id)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{route.name}</p>
                              <p className="text-sm text-gray-500">
                                {route.driverName || 'Sin conductor'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-1 text-xs rounded-full', typeInfo.color)}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{route.scheduledStartTime} - {route.scheduledEndTime}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{route.stopsCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{route.studentsCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {route.vehicleId ? (
                            <div className="flex items-center gap-1">
                              <Bus className="w-4 h-4 text-gray-400" />
                              <span>{route.vehiclePlate || 'Asignado'}</span>
                            </div>
                          ) : (
                            <span className="text-warning">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'px-2 py-1 text-xs rounded-full',
                            route.isActive ? 'bg-success text-white' : 'bg-gray-400 text-white'
                          )}>
                            {route.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === route._id ? null : route._id);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreHorizontal className="w-5 h-5 text-gray-500" />
                            </button>
                            {openMenu === route._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <Link
                                  href={`/routes/${route._id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" /> Ver detalles
                                </Link>
                                <Link
                                  href={`/routes/${route._id}/edit`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" /> Editar
                                </Link>
                                <Link
                                  href={`/routes/${route._id}#stops`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <MapPin className="w-4 h-4" /> Ver paradas
                                </Link>
                                <Link
                                  href={`/routes/${route._id}#students`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Users className="w-4 h-4" /> Ver estudiantes
                                </Link>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Map className="w-4 h-4" /> Ver en mapa
                                </button>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" /> Duplicar
                                </button>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-error"
                                >
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
              <p className="text-sm text-gray-500">Mostrando {filteredRoutes.length} de {routes.length} rutas</p>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">Página 1 de 1</span>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Export mock data for use in detail page
export { mockRoutes, mockStudents, mockStops };
