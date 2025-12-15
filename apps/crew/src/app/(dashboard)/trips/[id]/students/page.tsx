'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Search,
  CheckCircle,
  Clock,
  X,
  Phone,
  QrCode,
  AlertTriangle,
  MessageCircle,
  UserMinus,
  Car,
  MapPin,
  Loader2,
  Bell,
  Check,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useTripStudents,
  useTripStudentsSummary,
  useNovedadesForTrip,
  useNovedadesMutations,
  useConvexAuth,
} from '@/hooks';

// Status config for tripStudent status (from backend)
const tripStudentStatusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  scheduled: { label: 'Programado', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  absent: { label: 'Ausente', color: 'text-error', bg: 'bg-error/10', icon: UserMinus },
  parent_pickup: { label: 'Recoge padre', color: 'text-blue-600', bg: 'bg-blue-50', icon: Car },
  stop_changed: { label: 'Cambio parada', color: 'text-purple-600', bg: 'bg-purple-50', icon: MapPin },
};

// Check-in display status
const checkinStatusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Esperando', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  on_board: { label: 'A bordo', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
  delivered: { label: 'Entregado', color: 'text-info', bg: 'bg-info/10', icon: CheckCircle },
};

// Novedad type labels
const novedadTypeLabels: Record<string, string> = {
  absence: 'Ausencia',
  parent_pickup: 'Recoge padre',
  stop_change: 'Cambio de parada',
  early_pickup: 'Salida temprana',
  late_arrival: 'Llegada tarde',
};

// Mock fallback data for UI testing
const mockTripStudents = [
  { id: 1, name: 'Carlos Rodríguez', grade: '5to A', status: 'scheduled', stop: 'Av. 12 de Octubre', stopOrder: 3, checkedIn: false },
  { id: 2, name: 'María López', grade: '5to A', status: 'scheduled', stop: 'Av. 12 de Octubre', stopOrder: 3, checkedIn: false },
  { id: 3, name: 'Pedro Gómez', grade: '4to B', status: 'scheduled', stop: 'Av. América', stopOrder: 2, checkedIn: true, checkinTime: '06:42' },
  { id: 4, name: 'Sofía García', grade: '5to B', status: 'absent', stop: 'Av. América', stopOrder: 2, checkedIn: false, novedad: { type: 'absence', reason: 'Cita médica' } },
  { id: 5, name: 'Diego Torres', grade: '4to A', status: 'parent_pickup', stop: 'Av. Colón', stopOrder: 1, checkedIn: false, novedad: { type: 'parent_pickup', reason: 'Padre recoge hoy' } },
];

const mockTripInfo = {
  route: 'Centro - Escuela Altaviapp',
  currentStop: 2,
  totalStops: 5,
};

export default function TripStudentsPage() {
  const params = useParams();
  const tripId = params?.id as string ?? '';
  const { isAuthenticated } = useConvexAuth();

  // Real data hooks
  const { students: realStudents, isLoading: studentsLoading } = useTripStudents(isAuthenticated ? tripId : null);
  const { summary, isLoading: summaryLoading } = useTripStudentsSummary(isAuthenticated ? tripId : null);
  const { novedades, pendingCount, isLoading: novedadesLoading } = useNovedadesForTrip(isAuthenticated ? tripId : null);
  const { acknowledgeNovedad, isReady: mutationsReady } = useNovedadesMutations();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showNovedadesPanel, setShowNovedadesPanel] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  // Use real data if available, otherwise use mock for UI testing
  const isLoading = studentsLoading || summaryLoading;
  const students = isAuthenticated && realStudents.length > 0
    ? realStudents.map((s: any) => ({
        id: s._id,
        name: s.student ? `${s.student.firstName} ${s.student.lastName}` : 'Desconocido',
        grade: s.student?.grade || '',
        status: s.status,
        statusLabel: s.statusLabel,
        stop: s.stop?.name || 'Sin parada',
        stopOrder: s.stop?.order || 0,
        checkedIn: s.checkedIn,
        checkinTime: s.checkinTime ? new Date(s.checkinTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : null,
        novedad: s.novedad,
        originalStop: s.originalStop,
      }))
    : mockTripStudents;

  const stats = isAuthenticated && summary
    ? {
        total: summary.total,
        onBoard: summary.checkedIn,
        pending: summary.expectedToBoard - summary.checkedIn,
        absent: summary.absent,
        novedades: summary.absent + summary.parentPickup + summary.stopChanged,
      }
    : {
        total: mockTripStudents.length,
        onBoard: mockTripStudents.filter(s => s.checkedIn).length,
        pending: mockTripStudents.filter(s => s.status === 'scheduled' && !s.checkedIn).length,
        absent: mockTripStudents.filter(s => s.status === 'absent').length,
        novedades: mockTripStudents.filter(s => s.novedad).length,
      };

  // Group students by stop
  const studentsByStop = students.reduce((acc: any, student: any) => {
    const order = student.stopOrder || 0;
    if (!acc[order]) {
      acc[order] = { stop: student.stop, students: [] };
    }
    acc[order].students.push(student);
    return acc;
  }, {} as Record<number, { stop: string; students: any[] }>);

  // Handle acknowledge novedad
  const handleAcknowledge = async (novedadId: string) => {
    if (!mutationsReady) return;

    setAcknowledgingId(novedadId);
    try {
      await acknowledgeNovedad(novedadId as any);
    } catch (error: any) {
      console.error('Error acknowledging novedad:', error);
    } finally {
      setAcknowledgingId(null);
    }
  };

  // Default status for fallback
  const defaultStatus = { label: 'Desconocido', color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock };

  // Get display status for a student
  const getStudentDisplayStatus = (student: any): { label: string; color: string; bg: string; icon: React.ElementType } => {
    // If has novedad (absent, parent_pickup, stop_changed)
    if (student.status !== 'scheduled') {
      return tripStudentStatusConfig[student.status as keyof typeof tripStudentStatusConfig] ?? defaultStatus;
    }
    // If checked in
    if (student.checkedIn) {
      return checkinStatusConfig.on_board ?? defaultStatus;
    }
    // Pending
    return checkinStatusConfig.pending ?? defaultStatus;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/trips/${tripId}/active`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">Lista de Estudiantes</h1>
          <p className="text-sm text-gray-500">{mockTripInfo.route}</p>
        </div>
        {/* Novedades Bell */}
        {stats.novedades > 0 && (
          <button
            onClick={() => setShowNovedadesPanel(!showNovedadesPanel)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
              {stats.novedades}
            </span>
          </button>
        )}
      </div>

      {/* Novedades Panel (collapsible) */}
      {showNovedadesPanel && novedades.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Novedades del Viaje
            </h3>
            <button onClick={() => setShowNovedadesPanel(false)} className="text-amber-600 hover:text-amber-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {novedades.map((novedad: any) => (
              <div
                key={novedad._id}
                className="bg-white rounded-lg p-3 flex items-center gap-3 border border-amber-100"
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  novedad.status === 'acknowledged' ? 'bg-green-50' : 'bg-amber-100'
                )}>
                  {novedad.type === 'absence' && <UserMinus className="w-4 h-4 text-error" />}
                  {novedad.type === 'parent_pickup' && <Car className="w-4 h-4 text-blue-600" />}
                  {novedad.type === 'stop_change' && <MapPin className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {novedad.studentName}
                  </p>
                  <p className="text-xs text-gray-600">
                    {novedadTypeLabels[novedad.type]} - {novedad.reason}
                  </p>
                </div>
                {novedad.status === 'pending' && mutationsReady && (
                  <button
                    onClick={() => handleAcknowledge(novedad._id)}
                    disabled={acknowledgingId === novedad._id}
                    className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {acknowledgingId === novedad._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Acusar
                  </button>
                )}
                {novedad.status === 'acknowledged' && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Recibida
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-2 text-center">
          <p className="text-lg font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-success/10 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-success">{stats.onBoard}</p>
          <p className="text-xs text-success-dark">A bordo</p>
        </div>
        <div className="bg-warning/10 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-warning">{stats.pending}</p>
          <p className="text-xs text-warning-dark">Pendientes</p>
        </div>
        <div className="bg-error/10 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-error">{stats.absent}</p>
          <p className="text-xs text-error-dark">Ausentes</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Students by Stop */}
      {Object.entries(studentsByStop)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([stopOrder, data]: [string, any]) => {
          const isCurrentStop = Number(stopOrder) === mockTripInfo.currentStop;
          const isPastStop = Number(stopOrder) < mockTripInfo.currentStop;

          // Filter students by search
          const filteredStudents = data.students.filter((s: any) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredStudents.length === 0) return null;

          return (
            <div key={stopOrder} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Stop Header */}
              <div className={cn(
                'p-3 border-b',
                isCurrentStop ? 'bg-primary text-white' : isPastStop ? 'bg-gray-50' : 'bg-white'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      isCurrentStop ? 'bg-white text-primary' : isPastStop ? 'bg-success text-white' : 'bg-gray-200 text-gray-600'
                    )}>
                      {isPastStop ? '✓' : stopOrder}
                    </span>
                    <span className={cn('font-medium', isCurrentStop ? 'text-white' : 'text-gray-900')}>
                      {data.stop}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs',
                    isCurrentStop ? 'text-white/80' : 'text-gray-500'
                  )}>
                    {filteredStudents.length} estudiantes
                  </span>
                </div>
                {isCurrentStop && (
                  <p className="text-xs text-white/80 mt-1">Parada actual</p>
                )}
              </div>

              {/* Students */}
              <div className="divide-y divide-gray-100">
                {filteredStudents.map((student: any) => {
                  const displayStatus = getStudentDisplayStatus(student);
                  const StatusIcon = displayStatus.icon;
                  const hasNovedad = student.status !== 'scheduled';

                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', displayStatus.bg)}>
                        <StatusIcon className={cn('w-4 h-4', displayStatus.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'font-medium text-sm truncate',
                            hasNovedad && student.status === 'absent' ? 'text-gray-400 line-through' : 'text-gray-900'
                          )}>
                            {student.name}
                          </p>
                          {hasNovedad && (
                            <span className={cn(
                              'px-1.5 py-0.5 text-xs rounded',
                              displayStatus.bg,
                              displayStatus.color
                            )}>
                              {displayStatus.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{student.grade}</p>
                        {student.novedad?.reason && (
                          <p className="text-xs text-gray-400 italic truncate">
                            {student.novedad.reason}
                          </p>
                        )}
                        {student.originalStop && (
                          <p className="text-xs text-purple-600">
                            Parada original: {student.originalStop.name}
                          </p>
                        )}
                      </div>
                      {student.checkedIn && student.checkinTime && (
                        <span className="text-xs text-success font-medium">{student.checkinTime}</span>
                      )}
                      {student.status === 'scheduled' && !student.checkedIn && isCurrentStop && (
                        <span
                          className="px-2 py-1 bg-success text-white text-xs rounded hover:bg-success-dark transition-colors"
                        >
                          Check-in
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/checkin"
          className="bg-primary text-white rounded-xl p-4 flex items-center gap-3 hover:bg-primary/90 transition-colors"
        >
          <QrCode className="w-6 h-6" />
          <div>
            <p className="font-medium">Escanear QR</p>
            <p className="text-xs text-white/70">Check-in rapido</p>
          </div>
        </Link>
        <Link
          href={`/trips/${tripId}/incidents`}
          className="bg-warning text-white rounded-xl p-4 flex items-center gap-3 hover:bg-warning-dark transition-colors"
        >
          <AlertTriangle className="w-6 h-6" />
          <div>
            <p className="font-medium">Reportar</p>
            <p className="text-xs text-white/70">Incidente</p>
          </div>
        </Link>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center lg:items-center">
          <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">{selectedStudent.name}</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-500">{selectedStudent.grade}</p>
                  {(() => {
                    const displayStatus = getStudentDisplayStatus(selectedStudent);
                    return (
                      <span className={cn(
                        'inline-block px-2 py-1 rounded-full text-xs font-medium mt-1',
                        displayStatus.bg,
                        displayStatus.color
                      )}>
                        {displayStatus.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Novedad Info */}
              {selectedStudent.novedad && (
                <div className={cn(
                  'rounded-lg p-3',
                  selectedStudent.status === 'absent' ? 'bg-error/10 border border-error/20' :
                  selectedStudent.status === 'parent_pickup' ? 'bg-blue-50 border border-blue-200' :
                  'bg-purple-50 border border-purple-200'
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Info className={cn(
                      'w-4 h-4',
                      selectedStudent.status === 'absent' ? 'text-error' :
                      selectedStudent.status === 'parent_pickup' ? 'text-blue-600' : 'text-purple-600'
                    )} />
                    <p className={cn(
                      'text-sm font-medium',
                      selectedStudent.status === 'absent' ? 'text-error' :
                      selectedStudent.status === 'parent_pickup' ? 'text-blue-700' : 'text-purple-700'
                    )}>
                      {novedadTypeLabels[selectedStudent.novedad.type] || 'Novedad'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{selectedStudent.novedad.reason}</p>
                  {selectedStudent.originalStop && (
                    <p className="text-xs text-gray-600 mt-1">
                      Parada original: {selectedStudent.originalStop.name}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Parada</p>
                <p className="font-medium text-gray-900">{selectedStudent.stop}</p>
              </div>

              {/* Actions */}
              {selectedStudent.status === 'scheduled' && (
                <div className="flex gap-2">
                  {!selectedStudent.checkedIn && (
                    <button className="flex-1 py-3 bg-success text-white rounded-lg font-medium">
                      Registrar Check-in
                    </button>
                  )}
                  {selectedStudent.checkedIn && (
                    <button className="flex-1 py-3 bg-info text-white rounded-lg font-medium">
                      Registrar Check-out
                    </button>
                  )}
                  <button className="py-3 px-4 bg-warning/10 text-warning rounded-lg font-medium">
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
