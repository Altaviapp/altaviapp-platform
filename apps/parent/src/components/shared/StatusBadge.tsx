import { cn } from '@/lib/utils';

type StudentStatus = 'at_home' | 'in_transit' | 'at_school' | 'returning';

interface StatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

const statusConfig: Record<StudentStatus, { label: string; className: string }> = {
  at_home: {
    label: 'En casa',
    className: 'bg-gray-100 text-gray-700',
  },
  in_transit: {
    label: 'En camino',
    className: 'bg-blue-100 text-blue-700',
  },
  at_school: {
    label: 'En la escuela',
    className: 'bg-green-100 text-green-700',
  },
  returning: {
    label: 'Regresando',
    className: 'bg-orange-100 text-orange-700',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.at_home;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
