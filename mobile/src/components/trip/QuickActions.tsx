/**
 * QuickActions Component
 *
 * Grid of quick action buttons for active trip (check-in, lista, incidente, mensaje)
 */

import { Camera, ClipboardList, AlertTriangle, MessageSquare } from 'lucide-react';

export interface QuickActionsProps {
  /** Handler for check-in button */
  onCheckIn?: () => void;
  /** Handler for attendance list button */
  onAttendance?: () => void;
  /** Handler for incident button */
  onIncident?: () => void;
  /** Handler for message button */
  onMessage?: () => void;
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'warning';
}

function QuickActionButton({ icon, label, onClick, variant = 'default' }: QuickActionButtonProps) {
  const baseClasses = "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[100px]";

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
      <div className={`w-10 h-10 flex items-center justify-center ${iconVariantClasses[variant]}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-900 text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

/**
 * Quick action buttons grid for active trip
 */
export function QuickActions({
  onCheckIn,
  onAttendance,
  onIncident,
  onMessage,
}: QuickActionsProps) {
  return (
    <div className="bg-gray-50 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Acciones Rápidas
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Check-in */}
        <QuickActionButton
          icon={<Camera className="w-6 h-6" />}
          label="Check-in"
          onClick={onCheckIn}
        />

        {/* Attendance List */}
        <QuickActionButton
          icon={<ClipboardList className="w-6 h-6" />}
          label="Lista"
          onClick={onAttendance}
        />

        {/* Incident Report */}
        <QuickActionButton
          icon={<AlertTriangle className="w-6 h-6" />}
          label="Incidente"
          onClick={onIncident}
          variant="warning"
        />

        {/* Message */}
        <QuickActionButton
          icon={<MessageSquare className="w-6 h-6" />}
          label="Mensaje"
          onClick={onMessage}
        />
      </div>
    </div>
  );
}
