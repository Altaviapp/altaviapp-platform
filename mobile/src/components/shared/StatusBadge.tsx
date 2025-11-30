import { Clock, Navigation, Check, X, Zap, Minus, Wrench, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TripStatus, Vehicle } from '@/types';

type Status = TripStatus | Vehicle['status'];

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

const statusConfig: Record<Status, StatusConfig> = {
  // Trip statuses
  scheduled: {
    label: 'Programado',
    icon: Clock,
    className: 'bg-info-light text-info-dark border-info',
  },
  in_progress: {
    label: 'En Ruta',
    icon: Navigation,
    className: 'bg-warning-light text-warning-dark border-warning',
  },
  completed: {
    label: 'Completado',
    icon: Check,
    className: 'bg-success-light text-success-dark border-success',
  },
  cancelled: {
    label: 'Cancelado',
    icon: X,
    className: 'bg-error-light text-error-dark border-error',
  },
  // Vehicle statuses
  active: {
    label: 'Disponible',
    icon: Zap,
    className: 'bg-success-light text-success-dark border-success',
  },
  inactive: {
    label: 'Inactivo',
    icon: Minus,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  maintenance: {
    label: 'Mantenimiento',
    icon: Wrench,
    className: 'bg-warning-light text-warning-dark border-warning',
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.label}</span>
    </span>
  );
}
