'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Route,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  UserMinus,
  Car,
  AlertTriangle,
  Bell,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  usePendingRequests,
  useReviewMutations,
  usePendingNovedades,
  useNovedadReviewMutations,
  useIncidents,
  useConvexAuth,
} from '@/hooks';

// Tab types
type TabType = 'novedades' | 'cambios' | 'incidentes';

// Novedad type configs
const novedadTypeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  absence: { label: 'Ausencia', icon: UserMinus, color: 'text-red-600' },
  parent_pickup: { label: 'Recoge padre', icon: Car, color: 'text-blue-600' },
  stop_change: { label: 'Cambio de parada', icon: MapPin, color: 'text-purple-600' },
  early_pickup: { label: 'Salida temprana', icon: Clock, color: 'text-orange-600' },
  late_arrival: { label: 'Llegada tarde', icon: Clock, color: 'text-yellow-600' },
};

// Route change request type configs
const requestTypeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  schedule_change: { label: 'Cambio de horario', icon: CalendarDays, color: 'text-blue-600' },
  stop_change: { label: 'Cambio de parada permanente', icon: MapPin, color: 'text-purple-600' },
  route_change: { label: 'Cambio de ruta', icon: Route, color: 'text-orange-600' },
  service_suspension: { label: 'Suspension de servicio', icon: RefreshCw, color: 'text-red-600' },
};

// Incident type configs
const incidentTypeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  accident: { label: 'Accidente', icon: AlertTriangle, color: 'text-red-600' },
  breakdown: { label: 'Averia', icon: Car, color: 'text-orange-600' },
  behavior: { label: 'Comportamiento', icon: User, color: 'text-yellow-600' },
  emergency: { label: 'Emergencia', icon: AlertCircle, color: 'text-red-600' },
  other: { label: 'Otro', icon: FileText, color: 'text-gray-600' },
};

// Status configs
const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Aprobado', color: 'bg-success/20 text-success' },
  rejected: { label: 'Rechazado', color: 'bg-error/20 text-error' },
  acknowledged: { label: 'Recibido', color: 'bg-blue-100 text-blue-700' },
  open: { label: 'Abierto', color: 'bg-warning/20 text-warning' },
  investigating: { label: 'Investigando', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'Resuelto', color: 'bg-success/20 text-success' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-600' },
};

// Mock incidents for UI testing when not authenticated
const mockIncidents = [
  {
    _id: '1',
    type: 'behavior',
    severity: 'medium',
    title: 'Conducta inapropiada en el bus',
    description: 'Estudiante no respeta las normas de seguridad',
    status: 'open',
    reportedByName: 'Maria Gonzalez',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    _id: '2',
    type: 'breakdown',
    severity: 'high',
    title: 'Falla mecanica',
    description: 'Bus presenta problemas en el sistema de frenos',
    status: 'investigating',
    reportedByName: 'Juan Perez',
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
  },
];

// Mock novedades for UI testing
const mockNovedades = [
  {
    _id: '1',
    type: 'absence',
    studentName: 'Maria Garcia',
    studentGrade: '5to A',
    createdByName: 'Roberto Garcia',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    affectedRouteType: 'both',
    reason: 'Cita medica programada',
    status: 'pending',
    typeLabel: 'Ausencia',
    routeTypeLabel: 'Ambos servicios',
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
  },
  {
    _id: '2',
    type: 'parent_pickup',
    studentName: 'Carlos Rodriguez',
    studentGrade: '3ro B',
    createdByName: 'Ana Rodriguez',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    affectedRouteType: 'dropoff',
    reason: 'Recogeremos a Carlos para una actividad familiar',
    status: 'pending',
    typeLabel: 'Recoge padre',
    routeTypeLabel: 'Entrega',
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
  },
];

// Mock route change requests for UI testing
const mockRequests = [
  {
    _id: '1',
    studentName: 'Diego Torres',
    studentGrade: '4to A',
    createdByName: 'Paula Torres',
    requestType: 'schedule_change',
    requestTypeLabel: 'Cambio de horario',
    reason: 'Mi hijo solo asistira de lunes a jueves por actividades extracurriculares.',
    effectiveFrom: '2024-02-01',
    effectiveUntil: '2024-06-30',
    scheduleDays: 'Lun, Mar, Mie, Jue',
    status: 'pending',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
];

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('novedades');
  const { isAuthenticated, institutionId } = useConvexAuth();

  // Novedades data
  const { novedades: realNovedades, isLoading: loadingNovedades } = usePendingNovedades();
  const { approveNovedad, rejectNovedad, isReady: novedadReady } = useNovedadReviewMutations();

  // Route change requests data
  const { requests: realRequests, isLoading: loadingRequests } = usePendingRequests();
  const { approveRequest, rejectRequest, isReady: requestReady } = useReviewMutations();

  // Incidents data
  const { incidents: realIncidents, isLoading: loadingIncidents } = useIncidents({
    status: 'open',
  });

  // Use real data from Convex - no mock fallbacks
  const novedades = realNovedades;
  const requests = realRequests;
  const incidents = realIncidents || [];

  // Modal states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

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

  const isLoading = loadingNovedades || loadingRequests || loadingIncidents;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestion de Solicitudes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Revisa y aprueba novedades, cambios permanentes e incidentes
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{novedades.length}</p>
              <p className="text-sm text-gray-500">Novedades pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              <p className="text-sm text-gray-500">Cambios permanentes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
              <p className="text-sm text-gray-500">Incidentes abiertos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('novedades')}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'novedades'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Bell className="w-4 h-4" />
              Novedades del Dia
              {novedades.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-warning/20 text-warning rounded-full">
                  {novedades.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cambios')}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'cambios'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Cambios Permanentes
              {requests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('incidentes')}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'incidentes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              Incidentes
              {incidents.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  {incidents.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="divide-y divide-gray-100">
          {/* Novedades Tab */}
          {activeTab === 'novedades' && (
            <>
              {novedades.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay novedades pendientes
                  </h3>
                  <p className="text-gray-500">
                    Todas las novedades han sido procesadas.
                  </p>
                </div>
              ) : (
                novedades.map((novedad: any) => {
                  const typeConfig = novedadTypeLabels[novedad.type as keyof typeof novedadTypeLabels] ?? { label: novedad.type, icon: FileText, color: 'text-gray-600' };
                  const TypeIcon = typeConfig.icon;
                  const hoursAgo = Math.floor((Date.now() - novedad.createdAt) / (1000 * 60 * 60));

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
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            statusConfig[novedad.status]?.color || 'bg-gray-100 text-gray-600'
                          )}>
                            {statusConfig[novedad.status]?.label || novedad.status}
                          </span>
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
                            Hace {hoursAgo}h
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </>
          )}

          {/* Cambios Permanentes Tab */}
          {activeTab === 'cambios' && (
            <>
              {requests.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay solicitudes pendientes
                  </h3>
                  <p className="text-gray-500">
                    Todas las solicitudes de cambio han sido procesadas.
                  </p>
                </div>
              ) : (
                requests.map((request: any) => {
                  const typeConfig = requestTypeLabels[request.requestType as keyof typeof requestTypeLabels] ?? { label: request.requestType, icon: FileText, color: 'text-gray-600' };
                  const TypeIcon = typeConfig.icon;
                  const daysAgo = Math.floor((Date.now() - request.createdAt) / (1000 * 60 * 60 * 24));

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
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            'bg-warning/20 text-warning'
                          )}>
                            Pendiente
                          </span>
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
                            Hace {daysAgo} {daysAgo === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </>
          )}

          {/* Incidentes Tab */}
          {activeTab === 'incidentes' && (
            <>
              {incidents.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay incidentes abiertos
                  </h3>
                  <p className="text-gray-500">
                    Todos los incidentes han sido resueltos.
                  </p>
                </div>
              ) : (
                incidents.map((incident: any) => {
                  const typeConfig = incidentTypeLabels[incident.type as keyof typeof incidentTypeLabels] ?? { label: incident.type, icon: AlertCircle, color: 'text-gray-600' };
                  const TypeIcon = typeConfig.icon;
                  const hoursAgo = Math.floor((Date.now() - incident.createdAt) / (1000 * 60 * 60));

                  return (
                    <a
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
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            statusConfig[incident.status]?.color || 'bg-gray-100 text-gray-600'
                          )}>
                            {statusConfig[incident.status]?.label || incident.status}
                          </span>
                          {incident.severity === 'high' || incident.severity === 'critical' ? (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-error/20 text-error">
                              {incident.severity === 'critical' ? 'Critico' : 'Alta prioridad'}
                            </span>
                          ) : null}
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
                            Hace {hoursAgo}h
                          </span>
                        </div>
                      </div>
                      <Eye className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </a>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">
                {selectedItem.itemType === 'novedad' ? 'Revisar Novedad' : 'Revisar Solicitud'}
              </h3>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setReviewNotes('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
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

              {/* Schedule days for schedule changes */}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas de revision (opcional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Agregar notas sobre la decision..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => selectedItem.itemType === 'novedad' ? handleReviewNovedad('reject') : handleReviewRequest('reject')}
                  disabled={isReviewing}
                  className="flex-1 py-3 border border-error text-error rounded-lg font-medium hover:bg-error/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isReviewing && reviewAction === 'reject' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Rechazar
                </button>
                <button
                  onClick={() => selectedItem.itemType === 'novedad' ? handleReviewNovedad('approve') : handleReviewRequest('approve')}
                  disabled={isReviewing}
                  className="flex-1 py-3 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isReviewing && reviewAction === 'approve' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Aprobar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
