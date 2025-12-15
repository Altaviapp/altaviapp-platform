'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  AlertTriangle, Clock, MapPin, User, Bus,
  CheckCircle, Edit, Trash2, Loader2,
  Car, Stethoscope, AlertCircle
} from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useIncident, useIncidentMutations } from '@/hooks';

const typeConfig: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bg: string }> = {
  accident: { label: 'Accidente', icon: Car, color: 'text-red-600', bg: 'bg-red-100' },
  breakdown: { label: 'Avería', icon: Bus, color: 'text-orange-600', bg: 'bg-orange-100' },
  behavior: { label: 'Comportamiento', icon: User, color: 'text-amber-600', bg: 'bg-amber-100' },
  emergency: { label: 'Emergencia', icon: Stethoscope, color: 'text-red-600', bg: 'bg-red-100' },
  other: { label: 'Otro', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const statusConfig: Record<string, { label: string; status: 'active' | 'inactive' | 'warning' | 'error' }> = {
  open: { label: 'Abierto', status: 'warning' },
  investigating: { label: 'Investigando', status: 'active' },
  resolved: { label: 'Resuelto', status: 'inactive' },
  closed: { label: 'Cerrado', status: 'inactive' },
};

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Baja', color: 'text-gray-700', bg: 'bg-gray-100' },
  medium: { label: 'Media', color: 'text-amber-700', bg: 'bg-amber-100' },
  high: { label: 'Alta', color: 'text-red-700', bg: 'bg-red-100' },
  critical: { label: 'Crítica', color: 'text-white', bg: 'bg-red-600' },
};

/**
 * Incident Detail Page
 * Connected to real Convex data
 */
export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string;

  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { incident, isLoading } = useIncident(incidentId as any);
  const { resolveIncident, updateIncident } = useIncidentMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando incidente...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Incidente no encontrado</p>
        <Link href="/incidents" className="text-primary hover:underline mt-2 inline-block">
          Volver a Incidentes
        </Link>
      </div>
    );
  }

  const defaultTypeInfo = { label: 'Otro', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
  const defaultStatusInfo = { label: 'Abierto', status: 'warning' as const };
  const defaultSeverityInfo = { label: 'Baja', color: 'text-gray-700', bg: 'bg-gray-100' };

  const typeInfo = typeConfig[incident.type] ?? defaultTypeInfo;
  const statusInfo = statusConfig[incident.status] ?? defaultStatusInfo;
  const severityInfo = severityConfig[incident.severity] ?? defaultSeverityInfo;
  const TypeIcon = typeInfo.icon;

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await resolveIncident(incidentId as any);
      setShowResolveDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Error resolving incident:', error);
    }
    setIsResolving(false);
  };

  const handleMarkInvestigating = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateIncident(incidentId as any, { status: 'investigating' });
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  // Format dates
  const createdDate = new Date(incident.createdAt);
  const formattedDate = createdDate.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = createdDate.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div>
      <PageHeader
        title={incident.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Incidentes', href: '/incidents' },
          { label: incident.title },
        ]}
        backHref="/incidents"
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={statusInfo.status}
              label={statusInfo.label}
            />
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', severityInfo.bg, severityInfo.color)}>
              Severidad: {severityInfo.label}
            </span>
          </div>
        }
        actions={
          incident.status !== 'resolved' && incident.status !== 'closed'
            ? [
                {
                  label: 'Resolver',
                  onClick: () => setShowResolveDialog(true),
                  icon: CheckCircle,
                  variant: 'primary',
                },
                ...(incident.status === 'open'
                  ? [
                      {
                        label: 'Investigando',
                        onClick: handleMarkInvestigating,
                        icon: AlertTriangle,
                        variant: 'secondary' as const,
                      },
                    ]
                  : []),
                {
                  label: 'Editar',
                  href: `/incidents/${incident._id}/edit`,
                  icon: Edit,
                  variant: 'secondary',
                },
              ]
            : []
        }
      />

      <div className="space-y-6">
        {/* Incident Type & Description */}
        <DetailSection title="Detalles del Incidente">
          <div className="flex items-start gap-4 mb-4">
            <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0', typeInfo.bg)}>
              <TypeIcon className={cn('w-6 h-6', typeInfo.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', typeInfo.bg, typeInfo.color)}>
                  {typeInfo.label}
                </span>
              </div>
              <p className="text-gray-700">{incident.description}</p>
            </div>
          </div>

          <DetailGrid cols={3}>
            <DetailItem label="Fecha" value={formattedDate} />
            <DetailItem label="Hora del Reporte" value={formattedTime} />
            <DetailItem label="Ubicación" value={incident.location || 'No especificada'} />
          </DetailGrid>
        </DetailSection>

        {/* Trip Info */}
        {incident.trip && (
          <DetailSection title="Viaje Relacionado">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Viaje</p>
                <Link href={`/trips/${incident.trip.id}`} className="font-medium text-gray-900 hover:text-primary">
                  {incident.trip.routeName || 'Viaje'} - {new Date(incident.trip.date).toLocaleDateString('es-EC')}
                </Link>
              </div>
            </div>
          </DetailSection>
        )}

        {/* Reporter Info */}
        <DetailSection title="Información del Reporte">
          <DetailGrid cols={2}>
            <DetailItem
              label="Reportado por"
              value={incident.reportedByName || 'Desconocido'}
            />
            <DetailItem label="Fecha/Hora del Reporte" value={`${formattedDate} - ${formattedTime}`} />
          </DetailGrid>
        </DetailSection>

        {/* Resolution (if resolved) */}
        {(incident.status === 'resolved' || incident.status === 'closed') && (
          <DetailSection title="Resolución">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
              <p className="text-green-800">Incidente marcado como {incident.status === 'resolved' ? 'resuelto' : 'cerrado'}</p>
            </div>
            <DetailGrid cols={2}>
              <DetailItem
                label="Última actualización"
                value={new Date(incident.updatedAt).toLocaleString('es-EC')}
              />
            </DetailGrid>
          </DetailSection>
        )}

        {/* Location Map (if coordinates available) */}
        {incident.latitude && incident.longitude && (
          <DetailSection title="Ubicación en el Mapa">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Coordenadas: {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
              </span>
              <a
                href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-primary text-sm hover:underline"
              >
                Ver en Google Maps
              </a>
            </div>
          </DetailSection>
        )}

        {/* Quick Actions */}
        {incident.status !== 'resolved' && incident.status !== 'closed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowResolveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Resolver Incidente
              </button>
              {incident.status === 'open' && (
                <button
                  onClick={handleMarkInvestigating}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Marcar como Investigando
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resolve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        onConfirm={handleResolve}
        title="Resolver Incidente"
        message="¿Confirmas que este incidente ha sido resuelto? Se marcará como completado."
        confirmLabel="Resolver"
        variant="info"
        isLoading={isResolving}
      />
    </div>
  );
}
