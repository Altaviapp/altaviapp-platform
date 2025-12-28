'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Route,
  FileText,
  AlertCircle,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  UserMinus,
  Car,
  AlertTriangle,
  Bell,
  Eye,
  Loader2,
} from 'lucide-react';
import { Badge, Card, CardContent, Modal, Tabs, TabsList, Tab, TabsPanel, Button, Textarea } from '@/components/core';
import { PageHeader, StatsGrid, type StatItem } from '@/components/shared';
import { LoadingState, EmptyState } from '@/components/core/states';
import {
  usePendingRequests,
  useReviewMutations,
  usePendingNovedades,
  useNovedadReviewMutations,
  useIncidents,
  useConvexAuth,
} from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Requests Page
 *
 * Manages novedades, permanent changes, and incidents.
 * Features: tabs, review modal, approve/reject actions.
 *
 * PRD Reference: Requests Module
 */

type TabType = 'novedades' | 'cambios' | 'incidentes';

const NOVEDAD_TYPES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  absence: { label: 'Ausencia', icon: UserMinus, color: 'text-red-600' },
  parent_pickup: { label: 'Recoge padre', icon: Car, color: 'text-blue-600' },
  stop_change: { label: 'Cambio de parada', icon: MapPin, color: 'text-purple-600' },
  early_pickup: { label: 'Salida temprana', icon: Clock, color: 'text-orange-600' },
  late_arrival: { label: 'Llegada tarde', icon: Clock, color: 'text-yellow-600' },
};

const REQUEST_TYPES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  schedule_change: { label: 'Cambio de horario', icon: CalendarDays, color: 'text-blue-600' },
  stop_change: { label: 'Cambio de parada permanente', icon: MapPin, color: 'text-purple-600' },
  route_change: { label: 'Cambio de ruta', icon: Route, color: 'text-orange-600' },
  service_suspension: { label: 'Suspensión de servicio', icon: RefreshCw, color: 'text-red-600' },
};

const INCIDENT_TYPES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  accident: { label: 'Accidente', icon: AlertTriangle, color: 'text-red-600' },
  breakdown: { label: 'Avería', icon: Car, color: 'text-orange-600' },
  behavior: { label: 'Comportamiento', icon: User, color: 'text-yellow-600' },
  emergency: { label: 'Emergencia', icon: AlertCircle, color: 'text-red-600' },
  other: { label: 'Otro', icon: FileText, color: 'text-gray-600' },
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'default' | 'danger' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  approved: { label: 'Aprobado', variant: 'success' },
  rejected: { label: 'Rechazado', variant: 'danger' },
  acknowledged: { label: 'Recibido', variant: 'info' },
  open: { label: 'Abierto', variant: 'warning' },
  investigating: { label: 'Investigando', variant: 'info' },
  resolved: { label: 'Resuelto', variant: 'success' },
  closed: { label: 'Cerrado', variant: 'default' },
};

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('novedades');
  const { isAuthenticated } = useConvexAuth();

  // Data hooks
  const { novedades, isLoading: loadingNovedades } = usePendingNovedades();
  const { approveNovedad, rejectNovedad, isReady: novedadReady } = useNovedadReviewMutations();
  const { requests, isLoading: loadingRequests } = usePendingRequests();
  const { approveRequest, rejectRequest, isReady: requestReady } = useReviewMutations();
  const { incidents, isLoading: loadingIncidents } = useIncidents({ status: 'open' });

  // Modal state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

  const isLoading = loadingNovedades || loadingRequests || loadingIncidents;

  // Stats
  const stats: StatItem[] = [
    { label: 'Novedades Pendientes', value: novedades.length, icon: Bell, color: 'info' },
    { label: 'Cambios Permanentes', value: requests.length, icon: RefreshCw, color: 'warning' },
    { label: 'Incidentes Abiertos', value: incidents.length, icon: AlertTriangle, color: 'danger' },
  ];

  const handleReviewNovedad = async (action: 'approve' | 'reject') => {
    if (!selectedItem || !novedadReady) return;

    setIsReviewing(true);
    setReviewAction(action);

    try {
      if (action === 'approve') {
        await approveNovedad(selectedItem._id, reviewNotes || undefined);
      } else {
        await rejectNovedad(selectedItem._id, reviewNotes || undefined);
      }
      setSelectedItem(null);
      setReviewNotes('');
    } catch (error: any) {
      alert(error.message || 'Error al procesar la novedad');
    } finally {
      setIsReviewing(false);
      setReviewAction(null);
    }
  };

  const handleReviewRequest = async (action: 'approve' | 'reject') => {
    if (!selectedItem || !requestReady) return;

    setIsReviewing(true);
    setReviewAction(action);

    try {
      if (action === 'approve') {
        await approveRequest(selectedItem._id, reviewNotes || undefined);
      } else {
        await rejectRequest(selectedItem._id, reviewNotes || undefined);
      }
      setSelectedItem(null);
      setReviewNotes('');
    } catch (error: any) {
      alert(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsReviewing(false);
      setReviewAction(null);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  };

  if (isLoading) {
    return <LoadingState message="Cargando solicitudes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestión de Solicitudes"
        subtitle="Revisa y aprueba novedades, cambios permanentes e incidentes"
      />

      {/* Stats */}
      <StatsGrid stats={stats} isLoading={isLoading} columns={3} />

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="border-b border-gray-200 px-4">
            <Tab value="novedades">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Novedades del Día</span>
                {novedades.length > 0 && (
                  <Badge variant="warning">{novedades.length}</Badge>
                )}
              </div>
            </Tab>
            <Tab value="cambios">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>Cambios Permanentes</span>
                {requests.length > 0 && (
                  <Badge variant="purple">{requests.length}</Badge>
                )}
              </div>
            </Tab>
            <Tab value="incidentes">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Incidentes</span>
                {incidents.length > 0 && (
                  <Badge variant="danger">{incidents.length}</Badge>
                )}
              </div>
            </Tab>
          </TabsList>

          {/* Novedades Tab */}
          <TabsPanel value="novedades">
            <CardContent className="p-0">
              {novedades.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No hay novedades pendientes"
                  description="Todas las novedades han sido procesadas"
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {novedades.map((novedad: any) => {
                    const typeConfig = NOVEDAD_TYPES[novedad.type] ?? { label: novedad.type, icon: FileText, color: 'text-gray-600' };
                    const TypeIcon = typeConfig.icon;

                    return (
                      <button
                        key={novedad._id}
                        onClick={() => {
                          setSelectedItem({ ...novedad, itemType: 'novedad' });
                          setReviewNotes('');
                        }}
                        className="w-full p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="p-3 rounded-lg bg-gray-50">
                          <TypeIcon className={cn('w-5 h-5', typeConfig.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{novedad.studentName}</h3>
                            <span className="text-xs text-gray-500">{novedad.studentGrade}</span>
                            <Badge variant={STATUS_CONFIG[novedad.status]?.variant ?? 'default'}>
                              {STATUS_CONFIG[novedad.status]?.label ?? novedad.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{typeConfig.label}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{novedad.reason}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {novedad.createdByName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Para: {new Date(novedad.date + 'T12:00:00').toLocaleDateString('es-EC', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeAgo(novedad.createdAt)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </TabsPanel>

          {/* Cambios Permanentes Tab */}
          <TabsPanel value="cambios">
            <CardContent className="p-0">
              {requests.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No hay solicitudes pendientes"
                  description="Todas las solicitudes de cambio han sido procesadas"
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {requests.map((request: any) => {
                    const typeConfig = REQUEST_TYPES[request.requestType] ?? { label: request.requestType, icon: FileText, color: 'text-gray-600' };
                    const TypeIcon = typeConfig.icon;

                    return (
                      <button
                        key={request._id}
                        onClick={() => {
                          setSelectedItem({ ...request, itemType: 'request' });
                          setReviewNotes('');
                        }}
                        className="w-full p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="p-3 rounded-lg bg-gray-50">
                          <TypeIcon className={cn('w-5 h-5', typeConfig.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{request.studentName}</h3>
                            <span className="text-xs text-gray-500">{request.studentGrade}</span>
                            <Badge variant="warning">Pendiente</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{typeConfig.label}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{request.reason}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {request.createdByName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatTimeAgo(request.createdAt)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </TabsPanel>

          {/* Incidentes Tab */}
          <TabsPanel value="incidentes">
            <CardContent className="p-0">
              {incidents.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No hay incidentes abiertos"
                  description="Todos los incidentes han sido resueltos"
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {incidents.map((incident: any) => {
                    const typeConfig = INCIDENT_TYPES[incident.type] ?? { label: incident.type, icon: AlertCircle, color: 'text-gray-600' };
                    const TypeIcon = typeConfig.icon;

                    return (
                      <Link
                        key={incident._id}
                        href={`/incidents/${incident._id}`}
                        className="w-full p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="p-3 rounded-lg bg-red-50">
                          <TypeIcon className={cn('w-5 h-5', typeConfig.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                            <Badge variant={STATUS_CONFIG[incident.status]?.variant ?? 'default'}>
                              {STATUS_CONFIG[incident.status]?.label ?? incident.status}
                            </Badge>
                            {(incident.severity === 'high' || incident.severity === 'critical') && (
                              <Badge variant="danger">
                                {incident.severity === 'critical' ? 'Crítico' : 'Alta prioridad'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{typeConfig.label}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{incident.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {incident.reportedByName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeAgo(incident._creationTime)}
                            </span>
                          </div>
                        </div>
                        <Eye className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </TabsPanel>
        </Tabs>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setReviewNotes('');
        }}
        title={selectedItem?.itemType === 'novedad' ? 'Revisar Novedad' : 'Revisar Solicitud'}
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Student Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedItem.studentName}</p>
                <p className="text-sm text-gray-500">{selectedItem.studentGrade}</p>
              </div>
            </div>

            {/* Type */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">
                {selectedItem.itemType === 'novedad' ? 'Tipo de novedad' : 'Tipo de solicitud'}
              </p>
              <p className="font-medium text-gray-900">
                {selectedItem.typeLabel || selectedItem.requestTypeLabel}
              </p>
            </div>

            {/* Date for novedades */}
            {selectedItem.itemType === 'novedad' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Fecha</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedItem.date + 'T12:00:00').toLocaleDateString('es-EC', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Aplica a</p>
                  <p className="font-medium text-gray-900">{selectedItem.routeTypeLabel}</p>
                </div>
              </div>
            )}

            {/* Dates for requests */}
            {selectedItem.itemType === 'request' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Fecha inicio</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedItem.effectiveFrom + 'T12:00:00').toLocaleDateString('es-EC', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {selectedItem.effectiveUntil && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Fecha fin</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedItem.effectiveUntil + 'T12:00:00').toLocaleDateString('es-EC', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Schedule days */}
            {selectedItem.scheduleDays && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600 mb-1">Nuevo horario</p>
                <p className="font-medium text-blue-900">{selectedItem.scheduleDays}</p>
              </div>
            )}

            {/* Reason */}
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Motivo</p>
              <p className="text-gray-900">{selectedItem.reason}</p>
            </div>

            {/* Requested by */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>Solicitado por: {selectedItem.createdByName}</span>
            </div>

            {/* Review Notes */}
            <Textarea
              label="Notas de revisión (opcional)"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Agregar notas sobre la decisión..."
              rows={3}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() =>
                  selectedItem.itemType === 'novedad'
                    ? handleReviewNovedad('reject')
                    : handleReviewRequest('reject')
                }
                disabled={isReviewing}
                isLoading={isReviewing && reviewAction === 'reject'}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rechazar
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-success hover:!bg-success/90"
                onClick={() =>
                  selectedItem.itemType === 'novedad'
                    ? handleReviewNovedad('approve')
                    : handleReviewRequest('approve')
                }
                disabled={isReviewing}
                isLoading={isReviewing && reviewAction === 'approve'}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprobar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
