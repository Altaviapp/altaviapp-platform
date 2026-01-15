/**
 * StopActionsCard Component
 *
 * Compact action buttons for stop: Llegué, Omitir, Navegar
 * Changes to CHECK IN button after arrival is confirmed.
 */

import { useState } from 'react';
import {
  CheckCircle2,
  SkipForward,
  Navigation,
  Camera,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export interface StopActionsCardProps {
  /** Stop ID */
  stopId: string;
  /** Whether the driver has arrived at the stop */
  isArrived: boolean;
  /** Handler for confirming arrival at stop */
  onArrived: () => Promise<void>;
  /** Handler for skipping the stop */
  onSkip: (reason?: string) => Promise<void>;
  /** Handler for navigate button */
  onNavigate: () => void;
  /** Handler for opening check-in modal */
  onCheckin: () => void;
  /** Whether actions are loading */
  isLoading?: boolean;
  /** Number of pending students at this stop */
  pendingStudentsCount?: number;
}

/**
 * Stop action buttons (Llegué, Omitir, Navegar) with check-in state
 */
export function StopActionsCard({
  stopId,
  isArrived,
  onArrived,
  onSkip,
  onNavigate,
  onCheckin,
  isLoading = false,
  pendingStudentsCount = 0,
}: StopActionsCardProps) {
  const [isArrivedLoading, setIsArrivedLoading] = useState(false);
  const [isSkipLoading, setIsSkipLoading] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const handleArrived = async () => {
    if (isLoading) return;
    setIsArrivedLoading(true);
    try {
      await onArrived();
    } finally {
      setIsArrivedLoading(false);
    }
  };

  const handleSkip = async () => {
    if (isLoading) return;
    setIsSkipLoading(true);
    try {
      await onSkip();
      setShowSkipConfirm(false);
    } finally {
      setIsSkipLoading(false);
    }
  };

  // Show CHECK IN state after arrival
  if (isArrived) {
    return (
      <div className="space-y-3">
        {/* Arrived indicator */}
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium px-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Has llegado a la parada</span>
        </div>

        {/* Big CHECK IN button */}
        <button
          onClick={onCheckin}
          disabled={isLoading}
          className="w-full py-4 px-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-lg"
        >
          <Camera className="w-6 h-6" />
          CHECK IN
        </button>
      </div>
    );
  }

  // Skip confirmation view
  if (showSkipConfirm) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              ¿Omitir esta parada?
            </p>
            {pendingStudentsCount > 0 && (
              <p className="text-xs text-amber-700 mt-1">
                {pendingStudentsCount} estudiante{pendingStudentsCount !== 1 ? 's' : ''} pendiente{pendingStudentsCount !== 1 ? 's' : ''} será{pendingStudentsCount !== 1 ? 'n' : ''} marcado{pendingStudentsCount !== 1 ? 's' : ''} como "no show"
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSkipConfirm(false)}
            disabled={isSkipLoading}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSkip}
            disabled={isSkipLoading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSkipLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Sí, omitir'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default state - 3 action buttons
  return (
    <div className="flex gap-2">
      {/* Llegué - Primary action */}
      <button
        onClick={handleArrived}
        disabled={isArrivedLoading || isLoading}
        className="flex-1 py-3.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
      >
        {isArrivedLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs">Llegué</span>
          </>
        )}
      </button>

      {/* Omitir */}
      <button
        onClick={() => setShowSkipConfirm(true)}
        disabled={isLoading}
        className="flex-1 py-3.5 px-3 bg-white border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 text-gray-700 font-semibold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
      >
        <SkipForward className="w-5 h-5" />
        <span className="text-xs">Omitir</span>
      </button>

      {/* Navegar */}
      <button
        onClick={onNavigate}
        disabled={isLoading}
        className="flex-1 py-3.5 px-3 bg-white border-2 border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-700 font-semibold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
      >
        <Navigation className="w-5 h-5" />
        <span className="text-xs">Navegar</span>
      </button>
    </div>
  );
}
