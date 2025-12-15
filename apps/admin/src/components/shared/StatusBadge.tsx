import { cn } from '@/lib/utils';

type StatusType = 'active' | 'pending' | 'inactive' | 'completed' | 'error' | 'warning';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    defaultLabel: 'Activo',
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    defaultLabel: 'Pendiente',
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    defaultLabel: 'Inactivo',
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    defaultLabel: 'Completado',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    defaultLabel: 'Error',
  },
  warning: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    defaultLabel: 'Advertencia',
  },
};

/**
 * StatusBadge Component
 *
 * Based on ALTAVIAPP-UI-PATTERNS.md status indicators:
 * - Color-coded backgrounds
 * - Status dot indicator
 * - Configurable label
 */
export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label ?? config.defaultLabel;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {displayLabel}
    </span>
  );
}
