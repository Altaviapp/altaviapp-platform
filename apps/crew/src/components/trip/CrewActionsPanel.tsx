/**
 * CrewActionsPanel Component
 *
 * Container for all Crew-specific actions during an active trip:
 * - Stop actions (Llegué, Omitir, Navegar / Check-in)
 * - Quick actions (Incidente, Relevo, Detalles)
 * - Finish trip button
 */

import { Flag, AlertTriangle, RefreshCw, ClipboardList } from 'lucide-react';
import { StopActionsCard } from './StopActionsCard';

export interface CrewActionsPanelProps {
  // Stop actions
  /** Current stop ID */
  stopId: string;
  /** Whether driver has arrived at current stop */
  isArrived: boolean;
  /** Handler for confirming arrival */
  onArrived: () => Promise<void>;
  /** Handler for skipping the stop */
  onSkip: (reason?: string) => Promise<void>;
  /** Handler for navigate button */
  onNavigate: () => void;
  /** Handler for opening check-in modal */
  onCheckin: () => void;
  /** Number of pending students at this stop */
  pendingStudentsCount?: number;

  // Quick actions
  /** Handler for incident report */
  onIncident: () => void;
  /** Handler for relay mode */
  onRelay: () => void;
  /** Handler for trip details */
  onDetails: () => void;

  // Finish
  /** Handler for finishing the trip */
  onFinish: () => void;

  /** Whether any action is loading */
  isLoading?: boolean;
  /** Whether trip can be finished (e.g., all stops completed) */
  canFinish?: boolean;
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'warning';
}

function QuickActionButton({ icon, label, onClick, variant = 'default' }: QuickActionButtonProps) {
  const baseClasses = "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all active:scale-95";

  const variantClasses = {
    default: "bg-white border-gray-200 hover:border-primary hover:bg-primary/5",
    warning: "bg-white border-gray-200 hover:border-amber-400 hover:bg-amber-50",
  };

  const iconVariantClasses = {
    default: "text-primary",
    warning: "text-amber-500",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <div className={`w-8 h-8 flex items-center justify-center ${iconVariantClasses[variant]}`}>
        {icon}
      </div>
      <span className="text-xs font-semibold text-gray-900 text-center">
        {label}
      </span>
    </button>
  );
}

/**
 * Crew actions panel with all trip controls
 */
export function CrewActionsPanel({
  stopId,
  isArrived,
  onArrived,
  onSkip,
  onNavigate,
  onCheckin,
  pendingStudentsCount = 0,
  onIncident,
  onRelay,
  onDetails,
  onFinish,
  isLoading = false,
  canFinish = true,
}: CrewActionsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Section 1: Stop Actions */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Acciones de parada
            </h3>
            <StopActionsCard
              stopId={stopId}
              isArrived={isArrived}
              onArrived={onArrived}
              onSkip={onSkip}
              onNavigate={onNavigate}
              onCheckin={onCheckin}
              isLoading={isLoading}
              pendingStudentsCount={pendingStudentsCount}
            />
          </section>

          {/* Section 2: Quick Actions */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Acciones rápidas
            </h3>
            <div className="flex gap-2">
              <QuickActionButton
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Incidente"
                onClick={onIncident}
                variant="warning"
              />
              <QuickActionButton
                icon={<RefreshCw className="w-5 h-5" />}
                label="Relevo"
                onClick={onRelay}
              />
              <QuickActionButton
                icon={<ClipboardList className="w-5 h-5" />}
                label="Detalles"
                onClick={onDetails}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Fixed bottom: Finish Trip button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <button
          onClick={onFinish}
          disabled={!canFinish || isLoading}
          className="w-full py-4 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Flag className="w-5 h-5" />
          FINALIZAR VIAJE
        </button>
      </div>
    </div>
  );
}
