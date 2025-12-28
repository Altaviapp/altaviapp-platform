'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Eye,
  CheckCircle,
  Clock,
  Car,
  Stethoscope,
  User,
  MapPin,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Badge, Card, CardHeader, CardContent } from '@/components/core';
import { PageHeader, SearchFilter, StatsGrid, type StatItem } from '@/components/shared';
import { LoadingState, EmptyState } from '@/components/core/states';
import { useIncidents, useIncidentMutations } from '@/hooks';
import { formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Incidents Page
 *
 * Manages all reported incidents.
 * Features: search, status filter, type icons, severity badges.
 *
 * PRD Reference: Incidents Module
 */

const TYPE_CONFIG: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  accident: { label: 'Accidente', icon: Car, color: 'bg-error' },
  breakdown: { label: 'Avería', icon: AlertCircle, color: 'bg-warning' },
  behavior: { label: 'Comportamiento', icon: User, color: 'bg-purple-500' },
  emergency: { label: 'Emergencia', icon: Stethoscope, color: 'bg-error' },
  delay: { label: 'Retraso', icon: Clock, color: 'bg-info' },
  route: { label: 'Ruta', icon: MapPin, color: 'bg-purple-500' },
  other: { label: 'Otro', icon: AlertCircle, color: 'bg-gray-500' },
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'default' }> = {
  open: { label: 'Abierto', variant: 'warning' },
  investigating: { label: 'En Proceso', variant: 'info' },
  resolved: { label: 'Resuelto', variant: 'success' },
  closed: { label: 'Cerrado', variant: 'default' },
};

const SEVERITY_CONFIG: Record<string, { label: string; variant: 'default' | 'warning' | 'danger' }> = {
  low: { label: 'Baja', variant: 'default' },
  medium: { label: 'Media', variant: 'warning' },
  high: { label: 'Alta', variant: 'danger' },
  critical: { label: 'Crítica', variant: 'danger' },
};

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'open', label: 'Abiertos' },
  { value: 'investigating', label: 'En Proceso' },
  { value: 'resolved', label: 'Resueltos' },
];

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Real data from Convex
  const { incidents, isLoading, isEmpty } = useIncidents();
  const { resolveIncident } = useIncidentMutations();

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        !searchQuery ||
        incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || incident.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [incidents, searchQuery, statusFilter]);

  // Calculate stats
  const stats: StatItem[] = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === 'open').length;
    const investigating = incidents.filter((i) => i.status === 'investigating').length;
    const resolved = incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

    return [
      { label: 'Total', value: total, icon: AlertTriangle, color: 'default' },
      { label: 'Abiertos', value: open, icon: Clock, color: 'warning' },
      { label: 'En Proceso', value: investigating, icon: AlertCircle, color: 'info' },
      { label: 'Resueltos', value: resolved, icon: CheckCircle, color: 'success' },
    ];
  }, [incidents]);

  const handleResolve = async (incidentId: string) => {
    try {
      await resolveIncident(incidentId as any);
    } catch (error) {
      console.error('Error resolving incident:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestión de Incidentes"
        subtitle="Revisa y gestiona los incidentes reportados"
        actions={[
          {
            label: 'Reportar Incidente',
            href: '/incidents/new',
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
            searchPlaceholder="Buscar incidentes..."
            filters={[
              {
                key: 'status',
                label: 'Todos los estados',
                value: statusFilter,
                options: [
                  { value: 'open', label: 'Abiertos' },
                  { value: 'investigating', label: 'En Proceso' },
                  { value: 'resolved', label: 'Resueltos' },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === 'status') setStatusFilter(value);
            }}
            className="flex-1"
          />

          {/* Quick Status Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  statusFilter === status.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState message="Cargando incidentes..." />
          ) : filteredIncidents.length === 0 ? (
            <EmptyState
              icon={isEmpty ? AlertTriangle : CheckCircle}
              title={isEmpty ? 'No hay incidentes' : 'Sin resultados'}
              description={
                isEmpty
                  ? 'No se han reportado incidentes'
                  : 'No se encontraron incidentes con los filtros actuales'
              }
              action={isEmpty ? { label: 'Reportar Incidente', href: '/incidents/new' } : undefined}
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredIncidents.map((incident) => {
                const typeInfo = TYPE_CONFIG[incident.type ?? 'other'] ?? TYPE_CONFIG.other!;
                const statusInfo = STATUS_CONFIG[incident.status ?? 'open'] ?? STATUS_CONFIG.open!;
                const severityInfo = SEVERITY_CONFIG[incident.severity ?? 'low'] ?? SEVERITY_CONFIG.low!;
                const TypeIcon = typeInfo.icon;

                return (
                  <div key={incident._id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Icon & Type */}
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            typeInfo!.color
                          )}
                        >
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 lg:w-64">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-900">{typeInfo!.label}</h3>
                            <Badge variant={severityInfo!.variant}>{severityInfo!.label}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {incident.title || incident.description || 'Sin descripción'}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Fecha/Hora</p>
                          <p className="font-medium text-gray-900">
                            {formatTimeAgo(incident._creationTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Estado</p>
                          <Badge variant={statusInfo!.variant}>{statusInfo!.label}</Badge>
                        </div>
                        {incident.location && (
                          <div>
                            <p className="text-gray-500">Ubicación</p>
                            <p className="font-medium text-gray-900">{incident.location}</p>
                          </div>
                        )}
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
                          <button
                            onClick={() => handleResolve(incident._id)}
                            className="px-3 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-1"
                          >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
