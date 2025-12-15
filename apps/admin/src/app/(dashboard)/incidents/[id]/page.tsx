'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  AlertTriangle, Clock, MapPin, User, Bus, Phone, Mail,
  CheckCircle, Edit, Trash2, MessageSquare, Camera, FileText,
  Car, Stethoscope, AlertCircle
} from 'lucide-react';
import { PageHeader, StatusBadge, DetailSection, DetailItem, DetailGrid, ConfirmDialog } from '@/components/shared';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Mock incident data
const mockIncidents: Record<string, {
  id: string;
  type: 'delay' | 'student' | 'medical' | 'route' | 'accident' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  route: { id: string; name: string } | null;
  trip: { id: string; date: string } | null;
  driver: { id: string; name: string; phone: string } | null;
  monitor: { id: string; name: string; phone: string } | null;
  vehicle: { id: string; plate: string } | null;
  student: { id: string; name: string; grade: string } | null;
  reportedBy: { name: string; role: string };
  reportedAt: string;
  date: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  notes: string[];
  attachments: Array<{ id: string; name: string; type: 'image' | 'document' }>;
  timeline: Array<{ id: string; time: string; event: string; user: string }>;
}> = {
  '1': {
    id: '1',
    type: 'delay',
    title: 'Retraso por tráfico',
    description: 'Tráfico pesado en Av. América, retraso de 15 minutos. Se notificó a los padres del sector afectado.',
    status: 'resolved',
    severity: 'low',
    route: { id: '1', name: 'Ruta Centro' },
    trip: { id: '1', date: '04/12/2024' },
    driver: { id: '1', name: 'Juan Pérez', phone: '+593 99 123 4567' },
    monitor: { id: '1', name: 'Ana Torres', phone: '+593 98 765 4321' },
    vehicle: { id: '1', plate: 'ABC-1234' },
    student: null,
    reportedBy: { name: 'Juan Pérez', role: 'Conductor' },
    reportedAt: '07:45',
    date: '04/12/2024',
    location: 'Av. América y 10 de Agosto',
    coordinates: { lat: -0.2298, lng: -78.5249 },
    resolution: 'Se tomó ruta alterna por Av. República. Llegada con 8 minutos de retraso.',
    resolvedBy: 'Admin Sistema',
    resolvedAt: '08:30',
    notes: [
      'Tráfico causado por accidente en la vía principal',
      'Se notificó a 12 padres del retraso estimado',
    ],
    attachments: [],
    timeline: [
      { id: '1', time: '07:45', event: 'Incidente reportado', user: 'Juan Pérez' },
      { id: '2', time: '07:48', event: 'Notificación enviada a padres', user: 'Sistema' },
      { id: '3', time: '07:50', event: 'Ruta alterna activada', user: 'Juan Pérez' },
      { id: '4', time: '08:30', event: 'Incidente resuelto', user: 'Admin Sistema' },
    ],
  },
  '2': {
    id: '2',
    type: 'student',
    title: 'Estudiante no se presentó',
    description: 'María García no se presentó en la parada acordada. Se esperó 3 minutos adicionales. La madre confirmó que la estudiante está enferma.',
    status: 'pending',
    severity: 'medium',
    route: { id: '2', name: 'Ruta Norte' },
    trip: { id: '2', date: '04/12/2024' },
    driver: { id: '2', name: 'María González', phone: '+593 97 111 2222' },
    monitor: { id: '2', name: 'Laura Sánchez', phone: '+593 96 333 4444' },
    vehicle: { id: '2', plate: 'DEF-9012' },
    student: { id: '5', name: 'María García', grade: '4to B' },
    reportedBy: { name: 'Laura Sánchez', role: 'Monitor' },
    reportedAt: '06:55',
    date: '04/12/2024',
    location: 'Parada Parque Norte',
    coordinates: { lat: -0.2305, lng: -78.5240 },
    resolution: null,
    resolvedBy: null,
    resolvedAt: null,
    notes: [
      'Se intentó contactar a la madre 2 veces',
      'Madre confirmó enfermedad de la estudiante a las 07:15',
    ],
    attachments: [],
    timeline: [
      { id: '1', time: '06:55', event: 'Estudiante no presente en parada', user: 'Laura Sánchez' },
      { id: '2', time: '06:58', event: 'Esperados 3 minutos adicionales', user: 'María González' },
      { id: '3', time: '07:00', event: 'Intento de contacto #1 - sin respuesta', user: 'Laura Sánchez' },
      { id: '4', time: '07:05', event: 'Intento de contacto #2 - sin respuesta', user: 'Laura Sánchez' },
      { id: '5', time: '07:15', event: 'Madre confirma enfermedad', user: 'Sistema' },
    ],
  },
  '3': {
    id: '3',
    type: 'medical',
    title: 'Estudiante con malestar',
    description: 'Estudiante Diego López reportó dolor de cabeza intenso durante el viaje. Se detuvo el vehículo y se contactó a los padres.',
    status: 'in_progress',
    severity: 'high',
    route: { id: '3', name: 'Ruta Sur' },
    trip: { id: '3', date: '04/12/2024' },
    driver: { id: '3', name: 'Carlos Ruiz', phone: '+593 95 555 6666' },
    monitor: { id: '3', name: 'Pedro Gómez', phone: '+593 94 777 8888' },
    vehicle: { id: '3', plate: 'JKL-7890' },
    student: { id: '8', name: 'Diego López', grade: '6to A' },
    reportedBy: { name: 'Pedro Gómez', role: 'Monitor' },
    reportedAt: '08:20',
    date: '04/12/2024',
    location: 'Av. Principal cerca de la escuela',
    coordinates: { lat: -0.2315, lng: -78.5235 },
    resolution: null,
    resolvedBy: null,
    resolvedAt: null,
    notes: [
      'Estudiante estaba pálido y sudoroso',
      'Se ofreció agua al estudiante',
      'Padre en camino para recoger al estudiante',
    ],
    attachments: [
      { id: '1', name: 'foto_estudiante.jpg', type: 'image' },
    ],
    timeline: [
      { id: '1', time: '08:20', event: 'Estudiante reporta malestar', user: 'Pedro Gómez' },
      { id: '2', time: '08:22', event: 'Vehículo detenido en zona segura', user: 'Carlos Ruiz' },
      { id: '3', time: '08:25', event: 'Contacto con padre - en camino', user: 'Pedro Gómez' },
      { id: '4', time: '08:30', event: 'Notificación a administración', user: 'Sistema' },
    ],
  },
};

const typeConfig: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bg: string }> = {
  delay: { label: 'Retraso', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  student: { label: 'Estudiante', icon: User, color: 'text-amber-600', bg: 'bg-amber-100' },
  medical: { label: 'Médico', icon: Stethoscope, color: 'text-red-600', bg: 'bg-red-100' },
  route: { label: 'Ruta', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-100' },
  accident: { label: 'Accidente', icon: Car, color: 'text-red-600', bg: 'bg-red-100' },
  other: { label: 'Otro', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const statusConfig: Record<string, { label: string; status: 'active' | 'inactive' | 'warning' | 'error' }> = {
  pending: { label: 'Pendiente', status: 'warning' },
  in_progress: { label: 'En Proceso', status: 'active' },
  resolved: { label: 'Resuelto', status: 'inactive' },
};

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Baja', color: 'text-gray-700', bg: 'bg-gray-100' },
  medium: { label: 'Media', color: 'text-amber-700', bg: 'bg-amber-100' },
  high: { label: 'Alta', color: 'text-red-700', bg: 'bg-red-100' },
  critical: { label: 'Crítica', color: 'text-white', bg: 'bg-red-600' },
};

/**
 * Incident Detail Page
 */
export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const incident = mockIncidents[incidentId];

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Incidente no encontrado</p>
      </div>
    );
  }

  const defaultTypeInfo = { label: 'Otro', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
  const defaultStatusInfo = { label: 'Pendiente', status: 'warning' as const };
  const defaultSeverityInfo = { label: 'Baja', color: 'text-gray-700', bg: 'bg-gray-100' };

  const typeInfo = typeConfig[incident.type] ?? defaultTypeInfo;
  const statusInfo = statusConfig[incident.status] ?? defaultStatusInfo;
  const severityInfo = severityConfig[incident.severity] ?? defaultSeverityInfo;
  const TypeIcon = typeInfo.icon;

  const handleDelete = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/incidents');
  };

  const handleResolve = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowResolveDialog(false);
    setIsLoading(false);
    // In production, update the incident status
  };

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
          incident.status !== 'resolved'
            ? [
                {
                  label: 'Resolver',
                  onClick: () => setShowResolveDialog(true),
                  icon: CheckCircle,
                  variant: 'primary',
                },
                {
                  label: 'Editar',
                  href: `/incidents/${incident.id}/edit`,
                  icon: Edit,
                  variant: 'secondary',
                },
                {
                  label: 'Eliminar',
                  onClick: () => setShowDeleteDialog(true),
                  icon: Trash2,
                  variant: 'danger',
                },
              ]
            : [
                {
                  label: 'Ver Resolución',
                  onClick: () => {},
                  icon: FileText,
                  variant: 'secondary',
                },
              ]
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
            <DetailItem label="Fecha" value={incident.date} />
            <DetailItem label="Hora del Reporte" value={incident.reportedAt} />
            <DetailItem label="Ubicación" value={incident.location} />
          </DetailGrid>
        </DetailSection>

        {/* Related Entities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip & Route Info */}
          <DetailSection title="Viaje / Ruta">
            <div className="space-y-3">
              {incident.route && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Ruta</p>
                    <Link href={`/routes/${incident.route.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {incident.route.name}
                    </Link>
                  </div>
                </div>
              )}

              {incident.trip && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Viaje</p>
                    <Link href={`/trips/${incident.trip.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {incident.trip.date}
                    </Link>
                  </div>
                </div>
              )}

              {incident.vehicle && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Bus className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Vehículo</p>
                    <Link href={`/fleet/vehicles/${incident.vehicle.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {incident.vehicle.plate}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Crew & Student */}
          <DetailSection title="Personas Involucradas">
            <div className="space-y-3">
              {incident.driver && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Conductor</p>
                    <Link href={`/fleet/drivers/${incident.driver.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {incident.driver.name}
                    </Link>
                  </div>
                  <a href={`tel:${incident.driver.phone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              )}

              {incident.monitor && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Monitor</p>
                    <Link href={`/fleet/monitors/${incident.monitor.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {incident.monitor.name}
                    </Link>
                  </div>
                  <a href={`tel:${incident.monitor.phone}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              )}

              {incident.student && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <User className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Estudiante Afectado</p>
                    <Link href={`/students/${incident.student.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {incident.student.name}
                    </Link>
                    <p className="text-xs text-gray-500">{incident.student.grade}</p>
                  </div>
                </div>
              )}
            </div>
          </DetailSection>
        </div>

        {/* Reporter Info */}
        <DetailSection title="Información del Reporte">
          <DetailGrid cols={2}>
            <DetailItem
              label="Reportado por"
              value={`${incident.reportedBy.name} (${incident.reportedBy.role})`}
            />
            <DetailItem label="Fecha/Hora del Reporte" value={`${incident.date} - ${incident.reportedAt}`} />
          </DetailGrid>
        </DetailSection>

        {/* Resolution (if resolved) */}
        {incident.status === 'resolved' && incident.resolution && (
          <DetailSection title="Resolución">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
              <p className="text-green-800">{incident.resolution}</p>
            </div>
            <DetailGrid cols={2}>
              <DetailItem label="Resuelto por" value={incident.resolvedBy || '-'} />
              <DetailItem label="Fecha/Hora de Resolución" value={incident.resolvedAt || '-'} />
            </DetailGrid>
          </DetailSection>
        )}

        {/* Notes */}
        {incident.notes.length > 0 && (
          <DetailSection title="Notas">
            <ul className="space-y-2">
              {incident.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        {/* Attachments */}
        {incident.attachments.length > 0 && (
          <DetailSection title="Archivos Adjuntos">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {incident.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2"
                >
                  {attachment.type === 'image' ? (
                    <Camera className="w-5 h-5 text-gray-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 truncate">{attachment.name}</span>
                </div>
              ))}
            </div>
          </DetailSection>
        )}

        {/* Timeline */}
        <DetailSection title="Línea de Tiempo">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {incident.timeline.map((event, index) => (
                <div key={event.id} className="relative flex gap-4 pl-10">
                  <div className="absolute left-2.5 w-3 h-3 bg-white border-2 border-primary rounded-full" />
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{event.time}</span>
                      <span className="text-xs text-gray-500">• {event.user}</span>
                    </div>
                    <p className="text-sm text-gray-700">{event.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DetailSection>

        {/* Quick Actions */}
        {incident.status !== 'resolved' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm">
                <MessageSquare className="w-4 h-4" />
                Agregar Nota
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                <Camera className="w-4 h-4" />
                Agregar Foto
              </button>
              {incident.driver && (
                <a
                  href={`tel:${incident.driver.phone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Llamar Conductor
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Incidente"
        message={`¿Estás seguro de que deseas eliminar este incidente? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isLoading}
      />

      {/* Resolve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        onConfirm={handleResolve}
        title="Resolver Incidente"
        message="¿Confirmas que este incidente ha sido resuelto? Se marcará como completado."
        confirmLabel="Resolver"
        variant="info"
        isLoading={isLoading}
      />
    </div>
  );
}
