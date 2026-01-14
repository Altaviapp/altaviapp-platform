/**
 * NextStopCard Component
 *
 * Displays next stop information with students list, distance, ETA, navigation,
 * and individual check-in buttons per student.
 * Includes stop actions: Llegué, Omitir, Notas
 */

import { useState } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Users,
  Camera,
  CheckCircle,
  AlertCircle,
  User,
  CheckCircle2,
  SkipForward,
  MessageSquare,
  Lock,
  Loader2,
} from 'lucide-react';
import { formatDistance } from '@/lib/utils/tripCalculations';
import { cn } from '@/lib/utils';

/** Minimal stop info needed for the card */
interface StopInfo {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface StudentWithStatus {
  _id: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'checked_in' | 'checked_out' | 'absent' | 'parent_pickup';
  novedad?: { typeCategory: string } | null;
}

export interface NextStopCardProps {
  /** Next stop details */
  stop: StopInfo;
  /** Stop number in sequence */
  stopNumber: number;
  /** Distance to stop in kilometers */
  distanceKm: number;
  /** Estimated time of arrival string */
  eta: string;
  /** Students at this stop with status */
  students?: StudentWithStatus[];
  /** Route type (pickup or dropoff) */
  routeType?: 'pickup' | 'dropoff';
  /** Whether the stop has been marked as arrived */
  isArrived?: boolean;
  /** Handler for navigate button click */
  onNavigate?: () => void;
  /** Handler for student check-in */
  onCheckin?: (studentId: string) => void;
  /** Handler for confirming arrival at stop */
  onArrived?: () => Promise<void>;
  /** Handler for skipping the stop */
  onSkip?: (reason?: string) => Promise<void>;
  /** Handler for adding a note */
  onAddNote?: (note: string) => Promise<void>;
}

// Status configuration
const statusConfig = {
  pending: { icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-100', label: 'Pendiente' },
  checked_in: { icon: CheckCircle, color: 'text-primary', bgColor: 'bg-primary/10', label: 'A bordo' },
  checked_out: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10', label: 'Entregado' },
  absent: { icon: AlertCircle, color: 'text-error', bgColor: 'bg-error/10', label: 'Ausente' },
  parent_pickup: { icon: User, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Recoge padre' },
};

/**
 * Card displaying next stop information with check-in functionality
 */
export function NextStopCard({
  stop,
  stopNumber,
  distanceKm,
  eta,
  students = [],
  routeType = 'pickup',
  isArrived = false,
  onNavigate,
  onCheckin,
  onArrived,
  onSkip,
  onAddNote,
}: NextStopCardProps) {
  const [isArrivedLoading, setIsArrivedLoading] = useState(false);
  const [isSkipLoading, setIsSkipLoading] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isNoteLoading, setIsNoteLoading] = useState(false);

  // Filter out absent and parent_pickup students for check-in
  const checkableStudents = students.filter(
    (s) => s.status !== 'absent' && s.status !== 'parent_pickup'
  );
  const nonCheckableStudents = students.filter(
    (s) => s.status === 'absent' || s.status === 'parent_pickup'
  );

  // Count pending students (not yet checked in)
  const pendingCount = checkableStudents.filter((s) => s.status === 'pending').length;

  const handleArrived = async () => {
    if (!onArrived) return;
    setIsArrivedLoading(true);
    try {
      await onArrived();
    } finally {
      setIsArrivedLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!onSkip) return;
    setIsSkipLoading(true);
    try {
      await onSkip();
      setShowSkipConfirm(false);
    } finally {
      setIsSkipLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!onAddNote || !noteText.trim()) return;
    setIsNoteLoading(true);
    try {
      await onAddNote(noteText.trim());
      setNoteText('');
      setShowNotes(false);
    } finally {
      setIsNoteLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-primary/20 rounded-xl p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Stop Number Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">
              PARADA {stopNumber}
            </span>
            {isArrived && (
              <CheckCircle className="w-4 h-4 text-success" />
            )}
          </div>

          {/* Stop Name */}
          <h3 className="text-base font-bold text-gray-900 mb-0.5">
            {stop.name}
          </h3>

          {/* Address */}
          <p className="text-sm text-gray-600 line-clamp-1">
            {stop.address}
          </p>
        </div>

        {/* Navigate Button */}
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="flex-shrink-0 w-11 h-11 bg-primary hover:bg-primary/90 rounded-lg flex items-center justify-center transition-colors shadow-sm"
            aria-label="Navegar"
          >
            <Navigation className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Distance & ETA */}
      <div className="flex gap-3 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{formatDistance(distanceKm)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{eta}</span>
        </div>
      </div>

      {/* Arrival Actions - Only show if not yet arrived */}
      {!isArrived && onArrived && (
        <div className="border-t border-gray-200 pt-3 space-y-2">
          {/* Llegué a la parada button */}
          <button
            onClick={handleArrived}
            disabled={isArrivedLoading}
            className="w-full py-3 px-4 bg-success hover:bg-success/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isArrivedLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Llegué a la parada
              </>
            )}
          </button>

          {/* Secondary actions row */}
          <div className="flex gap-2">
            {/* Skip stop */}
            {onSkip && !showSkipConfirm && (
              <button
                onClick={() => setShowSkipConfirm(true)}
                className="flex-1 py-2 px-3 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Omitir parada
              </button>
            )}

            {/* Add note */}
            {onAddNote && !showNotes && (
              <button
                onClick={() => setShowNotes(true)}
                className="flex-1 py-2 px-3 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Agregar nota
              </button>
            )}
          </div>

          {/* Skip confirmation */}
          {showSkipConfirm && (
            <div className="bg-amber-50 rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    ¿Omitir esta parada?
                  </p>
                  {pendingCount > 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      {pendingCount} estudiante{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} será{pendingCount !== 1 ? 'n' : ''} marcado{pendingCount !== 1 ? 's' : ''} como "no show"
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSkip}
                  disabled={isSkipLoading}
                  className="flex-1 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isSkipLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Sí, omitir'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notes textarea */}
          {showNotes && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>Solo visible para coordinadores</span>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ej: Portón cerrado, esperé 2 min..."
                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNotes(false);
                    setNoteText('');
                  }}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={isNoteLoading || !noteText.trim()}
                  className="flex-1 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isNoteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Guardar nota'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Arrived indicator */}
      {isArrived && (
        <div className="flex items-center gap-2 text-success text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Has llegado a esta parada</span>
        </div>
      )}

      {/* Students List with Check-in */}
      {students.length > 0 && (
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Users className="w-4 h-4 text-gray-600" />
              <span>Estudiantes ({students.length})</span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {/* Checkable students */}
            {checkableStudents.map((student) => {
              const config = statusConfig[student.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const isCheckable = student.status === 'pending' ||
                (routeType === 'dropoff' && student.status === 'checked_in');

              return (
                <div
                  key={student._id}
                  className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded-lg"
                >
                  {/* Status Icon */}
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', config.bgColor)}>
                    <StatusIcon className={cn('w-3 h-3', config.color)} />
                  </div>

                  {/* Name */}
                  <span className="flex-1 text-sm text-gray-900 truncate">
                    {student.firstName} {student.lastName}
                  </span>

                  {/* Check-in Button */}
                  {isCheckable && onCheckin ? (
                    <button
                      onClick={() => onCheckin(student._id)}
                      className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-medium rounded hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Check-in</span>
                    </button>
                  ) : (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
                      {config.label}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Non-checkable students (absent, parent pickup) */}
            {nonCheckableStudents.map((student) => {
              const config = statusConfig[student.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div
                  key={student._id}
                  className="flex items-center gap-2 py-1.5 px-2 bg-gray-50/50 rounded-lg opacity-60"
                >
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', config.bgColor)}>
                    <StatusIcon className={cn('w-3 h-3', config.color)} />
                  </div>
                  <span className="flex-1 text-sm text-gray-500 truncate line-through">
                    {student.firstName} {student.lastName}
                  </span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
