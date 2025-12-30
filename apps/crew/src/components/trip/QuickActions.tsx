/**
 * QuickActions Component
 *
 * Row of 3 quick action buttons for active trip (incidente, relevo, detalles)
 */

import { AlertTriangle, RefreshCw, ClipboardList } from 'lucide-react';

export interface QuickActionsProps {
  /** Handler for incident button */
  onIncident?: () => void;
  /** Handler for relay mode button */
  onRelay?: () => void;
  /** Handler for details button */
  onDetails?: () => void;
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'warning';
}

function QuickActionButton({ icon, label, onClick, variant = 'default' }: QuickActionButtonProps) {
  const baseClasses = "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all";

  const variantClasses = {
    default: "bg-white border-gray-200 hover:border-primary hover:bg-primary/5 active:scale-95",
    warning: "bg-white border-gray-200 hover:border-warning hover:bg-warning/5 active:scale-95",
  };

  const iconVariantClasses = {
    default: "text-primary",
    warning: "text-warning",
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
 * Quick action buttons row for active trip
 */
export function QuickActions({
  onIncident,
  onRelay,
  onDetails,
}: QuickActionsProps) {
  return (
    <div className="flex gap-2 px-4">
      {/* Incident Report */}
      <QuickActionButton
        icon={<AlertTriangle className="w-5 h-5" />}
        label="Incidente"
        onClick={onIncident}
        variant="warning"
      />

      {/* Relay Mode */}
      <QuickActionButton
        icon={<RefreshCw className="w-5 h-5" />}
        label="Relevo"
        onClick={onRelay}
      />

      {/* Trip Details */}
      <QuickActionButton
        icon={<ClipboardList className="w-5 h-5" />}
        label="Detalles"
        onClick={onDetails}
      />
    </div>
  );
}
