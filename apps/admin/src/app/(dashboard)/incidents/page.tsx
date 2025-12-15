'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Search, Eye, CheckCircle, Clock, Filter, ChevronLeft, ChevronRight, Car, Stethoscope, User, MapPin, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock incidents data
const incidents = [
  {
    id: 1,
    type: 'delay',
    title: 'Retraso por tráfico',
    description: 'Tráfico pesado en Av. América, retraso de 15 minutos',
    route: 'Ruta Centro',
    driver: 'Juan Pérez',
    reportedBy: 'Juan Pérez',
    reportedAt: '07:45',
    date: 'Hoy',
    status: 'resolved',
    severity: 'low',
  },
  {
    id: 2,
    type: 'student',
    title: 'Estudiante no se presentó',
    description: 'María García no se presentó en la parada acordada',
    route: 'Ruta Norte',
    driver: 'María González',
    reportedBy: 'Laura Sánchez',
    reportedAt: '06:55',
    date: 'Hoy',
    status: 'pending',
    severity: 'medium',
    studentName: 'María García',
  },
  {
    id: 3,
    type: 'medical',
    title: 'Estudiante con malestar',
    description: 'Estudiante reportó dolor de cabeza durante el viaje',
    route: 'Ruta Sur',
    driver: 'Carlos Ruiz',
    reportedBy: 'Pedro Gómez',
    reportedAt: '08:20',
    date: 'Hoy',
    status: 'in_progress',
    severity: 'high',
    studentName: 'Diego López',
  },
  {
    id: 4,
    type: 'route',
    title: 'Calle cerrada',
    description: 'Calle principal cerrada por obras, se tomó ruta alterna',
    route: 'Ruta Oeste',
    driver: 'Ana Torres',
    reportedBy: 'Ana Torres',
    reportedAt: '07:30',
    date: 'Ayer',
    status: 'resolved',
    severity: 'low',
  },
  {
    id: 5,
    type: 'accident',
    title: 'Incidente menor de tránsito',
    description: 'Roce menor con otro vehículo, sin heridos ni daños mayores',
    route: 'Ruta Centro',
    driver: 'Juan Pérez',
    reportedBy: 'Juan Pérez',
    reportedAt: '14:15',
    date: 'Ayer',
    status: 'resolved',
    severity: 'high',
  },
];

const typeConfig: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  delay: { label: 'Retraso', icon: Clock, color: 'bg-info' },
  student: { label: 'Estudiante', icon: User, color: 'bg-warning' },
  medical: { label: 'Médico', icon: Stethoscope, color: 'bg-error' },
  route: { label: 'Ruta', icon: MapPin, color: 'bg-purple-500' },
  accident: { label: 'Accidente', icon: Car, color: 'bg-error' },
  other: { label: 'Otro', icon: AlertCircle, color: 'bg-gray-500' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-warning text-white' },
  in_progress: { label: 'En Proceso', color: 'bg-info text-white' },
  resolved: { label: 'Resuelto', color: 'bg-success text-white' },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Media', color: 'bg-warning/20 text-warning' },
  high: { label: 'Alta', color: 'bg-error/20 text-error' },
  critical: { label: 'Crítica', color: 'bg-error text-white' },
};

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status === 'pending').length,
    inProgress: incidents.filter(i => i.status === 'in_progress').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Incidentes</h1>
          <p className="text-gray-500">Revisa y gestiona los incidentes reportados</p>
        </div>
        <Link
          href="/incidents/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Reportar Incidente
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Hoy</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-info flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">En Proceso</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-success flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resueltos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar incidentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'pending', 'in_progress', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {status === 'all' ? 'Todos' : statusConfig[status]?.label || status}
              </button>
            ))}
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">Todas las rutas</option>
            <option value="centro">Ruta Centro</option>
            <option value="norte">Ruta Norte</option>
            <option value="sur">Ruta Sur</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {incidents.map((incident) => {
            const type = typeConfig[incident.type] ?? typeConfig.other!;
            const status = statusConfig[incident.status] ?? statusConfig.pending!;
            const severity = severityConfig[incident.severity] ?? severityConfig.low!;
            const TypeIcon = type.icon;

            return (
              <div key={incident.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Icon & Type */}
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', type.color)}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 lg:w-64">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900">{incident.title}</h3>
                        <span className={cn('px-2 py-0.5 text-xs rounded-full', severity.color)}>
                          {severity.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{incident.description}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Ruta</p>
                      <p className="font-medium text-gray-900">{incident.route}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reportado por</p>
                      <p className="font-medium text-gray-900">{incident.reportedBy}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha/Hora</p>
                      <p className="font-medium text-gray-900">{incident.date} - {incident.reportedAt}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado</p>
                      <span className={cn('inline-block px-2 py-0.5 text-xs rounded-full', status.color)}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver</span>
                    </Link>
                    {incident.status !== 'resolved' && (
                      <button className="px-3 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolver</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">Mostrando 1-{incidents.length} de {incidents.length} incidentes</p>
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
      </div>
    </div>
  );
}
