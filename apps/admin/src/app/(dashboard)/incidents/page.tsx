'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Search, Eye, CheckCircle, Clock, ChevronLeft, ChevronRight, Car, Stethoscope, User, MapPin, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIncidents } from '@/hooks';

const typeConfig: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  accident: { label: 'Accidente', icon: Car, color: 'bg-error' },
  breakdown: { label: 'Avería', icon: AlertCircle, color: 'bg-warning' },
  behavior: { label: 'Comportamiento', icon: User, color: 'bg-purple-500' },
  emergency: { label: 'Emergencia', icon: Stethoscope, color: 'bg-error' },
  delay: { label: 'Retraso', icon: Clock, color: 'bg-info' },
  route: { label: 'Ruta', icon: MapPin, color: 'bg-purple-500' },
  other: { label: 'Otro', icon: AlertCircle, color: 'bg-gray-500' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Abierto', color: 'bg-warning text-white' },
  investigating: { label: 'En Proceso', color: 'bg-info text-white' },
  resolved: { label: 'Resuelto', color: 'bg-success text-white' },
  closed: { label: 'Cerrado', color: 'bg-gray-400 text-white' },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Media', color: 'bg-warning/20 text-warning' },
  high: { label: 'Alta', color: 'bg-error/20 text-error' },
  critical: { label: 'Crítica', color: 'bg-error text-white' },
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Hoy';
  if (isYesterday) return 'Ayer';
  return date.toLocaleDateString('es-EC');
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Real data from Convex
  const { incidents, isLoading } = useIncidents();

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const matchesSearch = !searchQuery ||
        incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.type?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [incidents, searchQuery, statusFilter]);

  // Calculate stats from real data
  const stats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    inProgress: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  }), [incidents]);

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
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats.open}</p>
              <p className="text-sm text-gray-500">Abiertos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-info flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats.inProgress}</p>
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
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats.resolved}</p>
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
            {['all', 'open', 'investigating', 'resolved'].map((status) => (
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
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-500">Cargando incidentes...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay incidentes</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'No se encontraron incidentes con los filtros actuales'
                : 'No se han reportado incidentes'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {filteredIncidents.map((incident) => {
                const type = typeConfig[incident.type ?? 'other'] ?? typeConfig.other;
                const status = statusConfig[incident.status ?? 'open'] ?? statusConfig.open;
                const severity = severityConfig[incident.severity ?? 'low'] ?? severityConfig.low;
                const TypeIcon = type?.icon ?? AlertCircle;

                return (
                  <div key={incident._id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Icon & Type */}
                      <div className="flex items-start gap-3">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', type?.color ?? 'bg-gray-500')}>
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 lg:w-64">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-900">{type?.label ?? 'Otro'}</h3>
                            <span className={cn('px-2 py-0.5 text-xs rounded-full', severity?.color ?? 'bg-gray-100 text-gray-700')}>
                              {severity?.label ?? 'Desconocido'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{incident.description || 'Sin descripción'}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Fecha/Hora</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(incident._creationTime)} - {formatTime(incident._creationTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Estado</p>
                          <span className={cn('inline-block px-2 py-0.5 text-xs rounded-full', status?.color ?? 'bg-gray-400 text-white')}>
                            {status?.label ?? 'Desconocido'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/incidents/${incident._id}`}
                          className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
                        </Link>
                        {incident.status !== 'resolved' && incident.status !== 'closed' && (
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
              <p className="text-sm text-gray-500">Mostrando {filteredIncidents.length} de {incidents.length} incidentes</p>
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
